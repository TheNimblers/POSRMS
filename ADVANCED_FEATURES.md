# Advanced Supabase Features for POSRMS

This guide covers the advanced features implemented for POSRMS using Supabase.

## ✅ Completed Features

### 1. Complete API Routes (Orders, Tables, Menu)

All API endpoints have been created and registered in the server:

#### Orders Routes

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders (with filters: table_id, status, session_id)
- `GET /api/orders/:orderId` - Get single order
- `PUT /api/orders/:orderId/status` - Update order status
- `DELETE /api/orders/:orderId` - Delete order (admin only)
- `GET /api/orders/analytics` - Get order analytics
- `POST /api/sessions/:sessionId/pay` - Mark session as paid

#### Tables Routes

- `GET /api/tables` - Get all restaurant tables
- `GET /api/tables/:tableId` - Get single table
- `POST /api/tables` - Create new table (manager only)
- `PUT /api/tables/:tableId` - Update table (manager only)
- `PUT /api/tables/:tableId/assign` - Assign waiter to table
- `POST /api/tables/:tableId/qr` - Generate QR code
- `DELETE /api/tables/:tableId` - Delete table (admin only)
- `GET /api/tables/qr-codes` - Get all QR codes for tables

#### Menu Routes

- `GET /api/menu` - Get restaurant menu
- `GET /api/menu/public` - Get public menu (QR code access, no auth)
- `GET /api/menu/:itemId` - Get single menu item
- `POST /api/menu` - Create menu item (manager only)
- `PUT /api/menu/:itemId` - Update menu item (manager only)
- `PUT /api/menu/:itemId/toggle` - Toggle item availability
- `DELETE /api/menu/:itemId` - Delete menu item (admin only)
- `GET /api/menu/categories` - Get menu categories

### 2. Row-Level Security (RLS) Policies

RLS policies have been created for multi-tenant support. To enable them:

1. Go to your Supabase dashboard
2. Open **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/rls-policies.sql`
5. Click **Run**

**What RLS does:**

- Ensures staff can only see data from their restaurant
- Prevents kitchen staff from seeing other restaurants' orders
- Restricts managers to only manage their own restaurant
- Protects data across different restaurants on the same system

**Important Note:** Current RLS policies use `auth.uid()` which works with Supabase Auth. Since POSRMS uses custom JWT, you may need to:

**Option A: Switch to Supabase Auth (Recommended)**

- Use Supabase's built-in authentication instead of custom JWT
- Policies will work automatically
- Better security and easier integration

**Option B: Configure Custom JWT Claims**

- Update your JWT to include `sub` claim matching the staff user ID
- Configure Supabase to recognize these claims
- Update RLS policies to use custom JWT claims

### 3. Real-Time Subscriptions for Notifications

Real-time subscriptions allow instant notifications for:

- Kitchen staff when orders need preparation
- Waiters when tables become available
- Managers when sessions close
- Staff when menu items become unavailable

#### Implementation Files

**Frontend:**

- `client/lib/realtimeSubscriptions.ts` - Real-time subscription utilities

#### Available Subscriptions

```typescript
import {
  subscribeToOrderUpdates,
  subscribeToTableUpdates,
  subscribeToSessionUpdates,
  subscribeToMenuUpdates,
} from "@/lib/realtimeSubscriptions";

// Subscribe to order updates for a restaurant
const orderSub = subscribeToOrderUpdates(restaurantId, (event) => {
  console.log("Order update:", event);
  // Trigger notification
});

// Subscribe to table updates
const tableSub = subscribeToTableUpdates(restaurantId, (event) => {
  console.log("Table update:", event);
});

// Subscribe to session updates
const sessionSub = subscribeToSessionUpdates(restaurantId, (event) => {
  console.log("Session update:", event);
});

// Subscribe to menu updates
const menuSub = subscribeToMenuUpdates(restaurantId, (event) => {
  console.log("Menu update:", event);
});
```

#### Hook-like Functions

For easier integration in React components:

```typescript
// In Kitchen component
import { useKitchenSubscription } from "@/lib/realtimeSubscriptions";

function KitchenView({ restaurantId }) {
  const orderSub = useKitchenSubscription(restaurantId);

  // Automatically handles notifications when orders change status

  return <div>Kitchen view</div>;
}

// In Waiter component
import { useWaiterSubscription } from "@/lib/realtimeSubscriptions";

function WaiterView({ restaurantId }) {
  const { tableUpdates, sessionUpdates } = useWaiterSubscription(restaurantId);

  // Automatically handles notifications for tables and sessions

  return <div>Waiter view</div>;
}
```

#### Notification Features

- **Automatic Sound:** Plays a notification sound when important events occur
- **Real-time Updates:** Uses Supabase Realtime for instant notifications
- **Customizable:** Easy to add custom logic for different events

#### Unsubscribe

Always unsubscribe when components unmount:

```typescript
import { unsubscribeFromChannel } from "@/lib/realtimeSubscriptions";

useEffect(() => {
  const subscription = subscribeToOrderUpdates(restaurantId, callback);

  return () => {
    unsubscribeFromChannel(subscription);
  };
}, [restaurantId]);
```

## Architecture Overview

```
Frontend (React)
  │
  ├─ HTTP Requests ──→ Express Server
  │                       │
  │                       └─ Supabase Auth
  │                       └─ Supabase Database (PostgreSQL)
  │                       └─ Supabase RLS Policies
  │
  └─ WebSocket (Realtime) ──→ Supabase Realtime
                                  │
                                  └─ Order Updates
                                  └─ Table Updates
                                  └─ Session Updates
                                  └─ Menu Updates
```

## Database Schema

### Tables

- **restaurants** - Restaurant details
- **staff** - User accounts (waiter, kitchen, bar, manager, admin, team)
- **tables** - Restaurant tables/seats
- **menu_items** - Menu items/dishes
- **sessions** - Customer dining sessions
- **orders** - Food/drink orders

### Relationships

```
restaurants (1) ──→ (many) staff
restaurants (1) ──→ (many) tables
restaurants (1) ──→ (many) menu_items
restaurants (1) ──→ (many) sessions

tables (1) ──→ (many) sessions
tables (1) ──→ (many) orders

menu_items (1) ──→ (many) orders

sessions (1) ──→ (many) orders

staff (1) ──→ (many) orders (ordered_by)
```

## Security

### Multi-Tenant Isolation

- Each restaurant's data is completely isolated
- Staff can only access their own restaurant
- RLS policies enforce this at the database level
- No accidental data leaks between restaurants

### Authentication

- Custom JWT tokens for fast authentication
- No external auth provider required
- Suitable for restaurant staff (simple login with username/password)

### Permissions

Staff roles with granular permissions:

- **Waiter**: View tables, manage orders, update order status
- **Kitchen**: View food orders, update food status
- **Bar**: View drink orders, update drink status
- **Manager**: Full restaurant management
- **Admin**: Full system access
- **Team**: Platform management (POSRMS team only)

## Configuration

### Environment Variables Required

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
```

## Deployment Considerations

### Before Going to Production

1. **Enable RLS in Production**
   - Run the RLS policies SQL
   - Test that users can only see their restaurant's data

2. **Configure Real-time Realtime**
   - Test real-time subscriptions work correctly
   - Monitor WebSocket connections

3. **Set up Backups**
   - Configure Supabase automated backups
   - Test backup restoration

4. **Monitor Performance**
   - Use Supabase dashboard to monitor query performance
   - Optimize slow queries if needed

5. **Security Audit**
   - Review RLS policies
   - Audit API endpoints
   - Test with multiple staff accounts

## Troubleshooting

### Real-time Subscriptions Not Working

1. Check that Realtime is enabled in Supabase dashboard
2. Verify the channel name matches table name
3. Check browser console for connection errors
4. Ensure staff member has permission to see the data

### RLS Policies Blocking Access

1. Verify the user's restaurant_id is set correctly
2. Check that RLS policies are enabled on tables
3. Use Supabase dashboard to test policies
4. Consider temporarily disabling RLS for debugging

### Performance Issues

1. Check if indexes are created (they should be from schema.sql)
2. Monitor active connections in Supabase dashboard
3. Review slow queries in query logs
4. Consider caching frequently accessed data

## Next Steps

1. **Implement UI Components** - Create React components that use these API endpoints
2. **Add More Notifications** - Implement in-app toast notifications
3. **Performance Optimization** - Add caching, pagination, and search
4. **Mobile App** - Extend to mobile platforms with React Native
5. **Analytics Dashboard** - Build analytics features using order data
6. **Payment Integration** - Add Stripe for payment processing

## Support

For issues:

- Check Supabase documentation: https://supabase.com/docs
- Review API logs in Supabase dashboard
- Check browser console for frontend errors
- Use WebSocket debugger for real-time issues
