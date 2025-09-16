import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

// WebSocket event types
export type WebSocketEventType = 
  | 'table_activated'
  | 'call_waiter'
  | 'payment_requested'
  | 'order_placed'
  | 'order_status_updated'
  | 'kitchen_order'
  | 'bar_order'
  | 'staff_notification'
  | 'table_status_changed'
  | 'menu_updated'
  | 'user_joined'
  | 'user_left';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
  userId?: string;
  restaurantId?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  send: (event: Omit<WebSocketEvent, 'timestamp'>) => void;
  subscribe: (eventType: WebSocketEventType, callback: (data: any) => void) => () => void;
  notifications: WebSocketEvent[];
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketEvent[]>([]);
  const [eventSubscribers, setEventSubscribers] = useState<Map<WebSocketEventType, Set<(data: any) => void>>>(new Map());

  // Mock WebSocket URL - in production this would be your actual WebSocket server
  const WS_URL = 'ws://localhost:8080/ws';

  const connect = useCallback(() => {
    if (!user) return;

    try {
      // For demo purposes, we'll simulate WebSocket connection
      // In production, this would connect to your actual WebSocket server
      const mockSocket = {
        send: (data: string) => {
          console.log('Mock WebSocket send:', data);
        },
        close: () => {
          console.log('Mock WebSocket closed');
        },
        readyState: 1 // OPEN
      } as WebSocket;

      setSocket(mockSocket);
      setIsConnected(true);

      // Simulate connection success
      console.log('WebSocket connected for user:', user.username);

      // Send join event
      const joinEvent: WebSocketEvent = {
        type: 'user_joined',
        data: { userId: user.id, role: user.role, restaurantId: user.restaurantId },
        timestamp: new Date().toISOString()
      };

      // Simulate receiving events (for demo)
      simulateDemoEvents();

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
    }
  }, [user]);

  const disconnect = useCallback(() => {
    if (socket) {
      const leaveEvent: WebSocketEvent = {
        type: 'user_left',
        data: { userId: user?.id, role: user?.role },
        timestamp: new Date().toISOString()
      };

      // Send leave event before disconnecting
      send(leaveEvent);
      
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket, user]);

  const send = useCallback((event: Omit<WebSocketEvent, 'timestamp'>) => {
    if (socket && isConnected) {
      const fullEvent: WebSocketEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        restaurantId: user?.restaurantId
      };

      const message = JSON.stringify(fullEvent);
      socket.send(message);

      // For demo purposes, also log the event
      console.log('WebSocket event sent:', fullEvent);
    } else {
      console.warn('WebSocket not connected, event not sent:', event);
    }
  }, [socket, isConnected, user]);

  const subscribe = useCallback((eventType: WebSocketEventType, callback: (data: any) => void) => {
    setEventSubscribers(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(eventType)) {
        newMap.set(eventType, new Set());
      }
      newMap.get(eventType)!.add(callback);
      return newMap;
    });

    // Return unsubscribe function
    return () => {
      setEventSubscribers(prev => {
        const newMap = new Map(prev);
        if (newMap.has(eventType)) {
          newMap.get(eventType)!.delete(callback);
          if (newMap.get(eventType)!.size === 0) {
            newMap.delete(eventType);
          }
        }
        return newMap;
      });
    };
  }, []);

  const handleMessage = useCallback((event: WebSocketEvent) => {
    // Add to notifications if relevant for current user
    if (shouldShowNotification(event, user)) {
      setNotifications(prev => [event, ...prev].slice(0, 50)); // Keep last 50 notifications
    }

    // Trigger subscribed callbacks
    const subscribers = eventSubscribers.get(event.type);
    if (subscribers) {
      subscribers.forEach(callback => callback(event.data));
    }
  }, [eventSubscribers, user]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulate demo events for development
  const simulateDemoEvents = useCallback(() => {
    if (!user) return;

    const demoEvents = [
      {
        type: 'table_activated' as WebSocketEventType,
        data: { tableId: 5, tableNumber: 'T5', customerCount: 4 },
        delay: 3000
      },
      {
        type: 'call_waiter' as WebSocketEventType,
        data: { tableId: 2, tableNumber: 'T2', message: 'Customer needs assistance' },
        delay: 8000
      },
      {
        type: 'order_placed' as WebSocketEventType,
        data: { 
          orderId: 'ORD-999', 
          tableId: 3, 
          tableNumber: 'T3',
          items: ['Grilled Salmon', 'House Wine'],
          total: 33.00,
          type: 'food'
        },
        delay: 12000
      },
      {
        type: 'payment_requested' as WebSocketEventType,
        data: { tableId: 1, tableNumber: 'T1', amount: 65.50 },
        delay: 18000
      }
    ];

    demoEvents.forEach(event => {
      setTimeout(() => {
        const fullEvent: WebSocketEvent = {
          ...event,
          timestamp: new Date().toISOString(),
          restaurantId: user.restaurantId
        };
        handleMessage(fullEvent);
      }, event.delay);
    });
  }, [user, handleMessage]);

  // Connect when user logs in
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      send,
      subscribe,
      notifications,
      clearNotifications
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Helper function to determine if notification should be shown to current user
function shouldShowNotification(event: WebSocketEvent, user: any): boolean {
  if (!user) return false;

  switch (event.type) {
    case 'table_activated':
    case 'call_waiter':
    case 'payment_requested':
      return user.role === 'waiter' || user.role === 'manager' || user.role === 'admin';
    
    case 'kitchen_order':
      return user.role === 'kitchen' || user.role === 'manager' || user.role === 'admin';
    
    case 'bar_order':
      return user.role === 'bar' || user.role === 'manager' || user.role === 'admin';
    
    case 'order_placed':
      return user.role === 'waiter' || user.role === 'kitchen' || user.role === 'bar' || user.role === 'manager' || user.role === 'admin';
    
    case 'staff_notification':
      return true; // All staff get general notifications
    
    case 'menu_updated':
      return user.role === 'waiter' || user.role === 'kitchen' || user.role === 'bar';
    
    default:
      return false;
  }
}

// Hook for specific event subscriptions
export function useWebSocketEvent(eventType: WebSocketEventType, callback: (data: any) => void) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(eventType, callback);
    return unsubscribe;
  }, [eventType, callback, subscribe]);
}
