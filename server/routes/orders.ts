import { RequestHandler } from "express";
import { db } from "../database";
import { z } from 'zod';
import { ApiResponse, Order, OrderItem, Session } from "@shared/database";
import { webSocketManager } from "../websocket";

// Validation schemas
const createOrderSchema = z.object({
  sessionId: z.string().uuid('Valid session ID is required'),
  items: z.array(z.object({
    menuItemId: z.string().uuid('Valid menu item ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    notes: z.string().optional()
  })).min(1, 'At least one item is required'),
  notes: z.string().optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['new', 'preparing', 'ready', 'served', 'paid', 'cancelled'])
});

const updateOrderItemStatusSchema = z.object({
  itemId: z.string().uuid('Valid item ID is required'),
  status: z.enum(['pending', 'preparing', 'ready', 'served'])
});

// Create new order
export const handleCreateOrder: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const restaurantId = (req as any).user?.restaurantId;
    const data = createOrderSchema.parse(req.body);

    // Verify session exists and is active
    const session = db.queryOne(
      'SELECT * FROM sessions WHERE id = ? AND restaurant_id = ? AND status = ?',
      [data.sessionId, restaurantId, 'active']
    ) as Session | undefined;

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or inactive'
      } as ApiResponse);
    }

    // Get menu items and calculate total
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];
    let hasFood = false;
    let hasDrinks = false;

    for (const item of data.items) {
      const menuItem = db.queryOne(
        'SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ? AND available = true',
        [item.menuItemId, restaurantId]
      ) as any;

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: `Menu item not found: ${item.menuItemId}`
        } as ApiResponse);
      }

      const price = menuItem.price_usd; // Default to USD for now
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      const orderItem: OrderItem = {
        id: db.generateId(),
        menu_item_id: item.menuItemId,
        name: menuItem.name,
        quantity: item.quantity,
        price: price,
        category: menuItem.category,
        notes: item.notes,
        status: 'pending'
      };

      orderItems.push(orderItem);

      // Determine order type
      if (['starter', 'main', 'dessert', 'special'].includes(menuItem.category)) {
        hasFood = true;
      } else {
        hasDrinks = true;
      }
    }

    // Determine order type
    const orderType = hasFood && hasDrinks ? 'mixed' : hasFood ? 'food' : 'drink';

    // Create order
    const orderId = db.generateId();
    const orderNumber = db.generateOrderNumber();

    db.execute(`
      INSERT INTO orders (
        id, order_number, session_id, restaurant_id, table_id, items,
        status, type, total_amount, notes, waiter_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, orderNumber, data.sessionId, restaurantId, session.table_id,
      JSON.stringify(orderItems), 'new', orderType, totalAmount,
      data.notes || null, userId
    ]);

    // Update session total
    db.execute(
      'UPDATE sessions SET total_amount = total_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [totalAmount, data.sessionId]
    );

    // Get created order
    const newOrder = db.queryOne(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    ) as Order;

    // Parse items from JSON
    newOrder.items = JSON.parse(newOrder.items as any);

    // Send WebSocket notifications
    webSocketManager.notifyOrderPlaced({
      orderId,
      orderNumber,
      tableId: session.table_id,
      tableNumber: `T${session.table_id}`,
      items: orderItems,
      total: totalAmount,
      type: orderType
    }, restaurantId);

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Create order error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.errors[0].message
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

// Get orders (with filters)
export const handleGetOrders: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const userRole = (req as any).user?.role;
    
    const {
      status,
      type,
      tableId,
      waiterId,
      limit = '50',
      offset = '0'
    } = req.query;

    let whereConditions = ['restaurant_id = ?'];
    let params: any[] = [restaurantId];

    // Role-based filtering
    if (userRole === 'kitchen') {
      whereConditions.push("(type = 'food' OR type = 'mixed')");
    } else if (userRole === 'bar') {
      whereConditions.push("(type = 'drink' OR type = 'mixed')");
    }

    // Apply filters
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (type) {
      whereConditions.push('type = ?');
      params.push(type);
    }

    if (tableId) {
      whereConditions.push('table_id = ?');
      params.push(parseInt(tableId as string));
    }

    if (waiterId) {
      whereConditions.push('waiter_id = ?');
      params.push(waiterId);
    }

    const whereClause = whereConditions.join(' AND ');
    
    // Get orders
    const orders = db.query(`
      SELECT o.*, t.number as table_number
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit as string), parseInt(offset as string)]);

    // Parse items from JSON
    orders.forEach((order: any) => {
      order.items = JSON.parse(order.items || '[]');
    });

    // Get total count
    const totalResult = db.queryOne(
      `SELECT COUNT(*) as count FROM orders WHERE ${whereClause}`,
      params
    ) as { count: number };

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: totalResult.count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: totalResult.count > parseInt(offset as string) + parseInt(limit as string)
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

// Get single order
export const handleGetOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    const order = db.queryOne(`
      SELECT o.*, t.number as table_number, s.waiter_id as session_waiter_id
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN sessions s ON o.session_id = s.id
      WHERE o.id = ? AND o.restaurant_id = ?
    `, [orderId, restaurantId]) as any;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      } as ApiResponse);
    }

    // Parse items from JSON
    order.items = JSON.parse(order.items || '[]');

    res.json({
      success: true,
      data: order
    } as ApiResponse);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

// Update order status
export const handleUpdateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;
    const { status } = updateOrderStatusSchema.parse(req.body);

    // Get current order
    const order = db.queryOne(
      'SELECT * FROM orders WHERE id = ? AND restaurant_id = ?',
      [orderId, restaurantId]
    ) as Order | undefined;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      } as ApiResponse);
    }

    // Update order status
    db.execute(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, orderId]
    );

    // Get updated order
    const updatedOrder = db.queryOne(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    ) as Order;

    updatedOrder.items = JSON.parse(updatedOrder.items as any);

    // Send WebSocket notification
    webSocketManager.notifyOrderStatusUpdate({
      orderId,
      orderNumber: order.order_number,
      tableId: order.table_id,
      status,
      type: order.type
    }, restaurantId);

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update order status error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.errors[0].message
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

// Get order analytics
export const handleGetOrderAnalytics: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const { 
      period = 'today',
      startDate,
      endDate
    } = req.query;

    let dateFilter = '';
    let params = [restaurantId];

    // Set date filter based on period
    if (period === 'today') {
      dateFilter = "AND DATE(created_at) = DATE('now')";
    } else if (period === 'week') {
      dateFilter = "AND created_at >= DATE('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= DATE('now', '-30 days')";
    } else if (startDate && endDate) {
      dateFilter = "AND DATE(created_at) BETWEEN ? AND ?";
      params.push(startDate as string, endDate as string);
    }

    // Get basic analytics
    const analytics = db.queryOne(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders 
      WHERE restaurant_id = ? ${dateFilter}
    `, params) as any;

    // Get orders by hour (for today)
    const ordersByHour = db.query(`
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as count,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE restaurant_id = ? ${dateFilter}
      GROUP BY strftime('%H', created_at)
      ORDER BY hour
    `, params);

    // Get popular items
    const popularItems = db.query(`
      SELECT 
        JSON_EXTRACT(item.value, '$.name') as name,
        SUM(JSON_EXTRACT(item.value, '$.quantity')) as quantity,
        SUM(JSON_EXTRACT(item.value, '$.price') * JSON_EXTRACT(item.value, '$.quantity')) as revenue
      FROM orders,
           JSON_EACH(orders.items) as item
      WHERE restaurant_id = ? ${dateFilter}
      GROUP BY JSON_EXTRACT(item.value, '$.name')
      ORDER BY quantity DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        summary: analytics,
        ordersByHour,
        popularItems
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};

// Delete order (admin only)
export const handleDeleteOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    // Check if order exists
    const order = db.queryOne(
      'SELECT * FROM orders WHERE id = ? AND restaurant_id = ?',
      [orderId, restaurantId]
    ) as Order | undefined;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      } as ApiResponse);
    }

    // Delete order
    db.execute('DELETE FROM orders WHERE id = ?', [orderId]);

    // Update session total (subtract order amount)
    db.execute(
      'UPDATE sessions SET total_amount = total_amount - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [order.total_amount, order.session_id]
    );

    res.json({
      success: true,
      message: 'Order deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
};
