import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

// WebSocket event types
export type WebSocketEventType =
  | "table_activated"
  | "call_waiter"
  | "payment_requested"
  | "order_placed"
  | "order_status_updated"
  | "kitchen_order"
  | "bar_order"
  | "staff_notification"
  | "table_status_changed"
  | "menu_updated"
  | "user_joined"
  | "user_left";

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
  userId?: string;
  restaurantId?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  send: (event: Omit<WebSocketEvent, "timestamp">) => void;
  subscribe: (
    eventType: WebSocketEventType,
    callback: (data: any) => void,
  ) => () => void;
  notifications: WebSocketEvent[];
  clearNotifications: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketEvent[]>([]);
  const [eventSubscribers, setEventSubscribers] = useState<
    Map<WebSocketEventType, Set<(data: any) => void>>
  >(new Map());
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem("posrms_notifications_enabled");
    return stored ? stored === "true" : true;
  });

  // Use a ref for the socket so updates don't trigger re-renders or effect dependency churn
  const socketRef = useRef<WebSocket | null>(null);
  const demoTimeoutsRef = useRef<number[]>([]);

  const send = useCallback(
    (event: Omit<WebSocketEvent, "timestamp">) => {
      const socket = socketRef.current;
      if (socket && isConnected) {
        const fullEvent: WebSocketEvent = {
          ...event,
          timestamp: new Date().toISOString(),
          userId: user?.id,
          restaurantId: user?.restaurantId,
        };

        const message = JSON.stringify(fullEvent);
        try {
          socket.send(message);
          // For demo purposes, also log the event
          console.log("WebSocket event sent:", fullEvent);
        } catch (err) {
          console.warn("WebSocket send failed:", err);
        }
      } else {
        console.warn("WebSocket not connected, event not sent:", event);
      }
    },
    [isConnected, user],
  );

  const subscribe = useCallback(
    (eventType: WebSocketEventType, callback: (data: any) => void) => {
      setEventSubscribers((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(eventType)) {
          newMap.set(eventType, new Set());
        }
        newMap.get(eventType)!.add(callback);
        return newMap;
      });

      // Return unsubscribe function
      return () => {
        setEventSubscribers((prev) => {
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
    },
    [],
  );

  const handleMessage = useCallback(
    (event: WebSocketEvent) => {
      // Add to notifications if relevant for current user
      if (notificationsEnabled && shouldShowNotification(event, user)) {
        setNotifications((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 notifications
      }

      // Trigger subscribed callbacks
      const subscribers = eventSubscribers.get(event.type);
      if (subscribers) {
        subscribers.forEach((callback) => callback(event.data));
      }
    },
    [eventSubscribers, user],
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulate demo events for development
  const simulateDemoEvents = useCallback(() => {
    if (!user) return;
    if (!notificationsEnabled) return;

    const demoEvents = [
      {
        type: "table_activated" as WebSocketEventType,
        data: { tableId: 5, tableNumber: "T5", customerCount: 4 },
        delay: 3000,
      },
      {
        type: "call_waiter" as WebSocketEventType,
        data: {
          tableId: 2,
          tableNumber: "T2",
          message: "Customer needs assistance",
        },
        delay: 8000,
      },
      {
        type: "order_placed" as WebSocketEventType,
        data: {
          orderId: "ORD-999",
          tableId: 3,
          tableNumber: "T3",
          items: ["Grilled Salmon", "House Wine"],
          total: 33.0,
          type: "food",
        },
        delay: 12000,
      },
      {
        type: "payment_requested" as WebSocketEventType,
        data: { tableId: 1, tableNumber: "T1", amount: 65.5 },
        delay: 18000,
      },
    ];

    // Clear any previous scheduled demo events
    demoTimeoutsRef.current.forEach((id) => clearTimeout(id));
    demoTimeoutsRef.current = [];

    demoEvents.forEach((event) => {
      const id = window.setTimeout(() => {
        const fullEvent: WebSocketEvent = {
          ...event,
          timestamp: new Date().toISOString(),
          restaurantId: user.restaurantId,
        } as WebSocketEvent;
        handleMessage(fullEvent);
      }, event.delay);
      demoTimeoutsRef.current.push(id);
    });
  }, [user, handleMessage]);

  // Manage connection lifecycle when user identity changes
  useEffect(() => {
    if (user && !socketRef.current) {
      try {
        // Build WS URL from current origin
        const loc = window.location;
        const protocol = loc.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${protocol}://${loc.host}/ws?userId=${encodeURIComponent(
          user.id,
        )}&role=${encodeURIComponent(user.role)}&restaurantId=${encodeURIComponent(
          user.restaurantId || "",
        )}`;
        const realSocket = new WebSocket(wsUrl);

        realSocket.onopen = () => {
          socketRef.current = realSocket;
          setIsConnected(true);
          const joinEvent: WebSocketEvent = {
            type: "user_joined",
            data: { userId: user.id, role: user.role, restaurantId: user.restaurantId },
            timestamp: new Date().toISOString(),
          };
          handleMessage(joinEvent);
          simulateDemoEvents();
        };

        realSocket.onmessage = (msg) => {
          try {
            const event = JSON.parse(msg.data as string) as WebSocketEvent;
            handleMessage(event);
          } catch (e) {
            console.warn("Invalid WS message", e);
          }
        };

        realSocket.onclose = () => {
          setIsConnected(false);
        };

        realSocket.onerror = () => {
          // Fall back to mock socket if WS fails
          const mockSocket = {
            send: (data: string) => console.log("Mock WebSocket send:", data),
            close: () => console.log("Mock WebSocket closed"),
            readyState: 1,
          } as unknown as WebSocket;
          socketRef.current = mockSocket;
          setIsConnected(true);
          simulateDemoEvents();
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        setIsConnected(false);
      }
    }

    // Cleanup runs when user changes or component unmounts
    return () => {
      demoTimeoutsRef.current.forEach((id) => clearTimeout(id));
      demoTimeoutsRef.current = [];
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user?.id, notificationsEnabled]);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem("posrms_notifications_enabled", String(enabled));
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        send,
        subscribe,
        notifications,
        clearNotifications,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

// Helper function to determine if notification should be shown to current user
function shouldShowNotification(event: WebSocketEvent, user: any): boolean {
  if (!user) return false;

  switch (event.type) {
    case "table_activated":
    case "call_waiter":
    case "payment_requested":
      return (
        user.role === "waiter" ||
        user.role === "manager" ||
        user.role === "admin"
      );

    case "kitchen_order":
      return (
        user.role === "kitchen" ||
        user.role === "manager" ||
        user.role === "admin"
      );

    case "bar_order":
      return (
        user.role === "bar" || user.role === "manager" || user.role === "admin"
      );

    case "order_placed":
      return (
        user.role === "waiter" ||
        user.role === "kitchen" ||
        user.role === "bar" ||
        user.role === "manager" ||
        user.role === "admin"
      );

    case "staff_notification":
      return true; // All staff get general notifications

    case "menu_updated":
      return (
        user.role === "waiter" || user.role === "kitchen" || user.role === "bar"
      );

    default:
      return false;
  }
}

// Hook for specific event subscriptions
export function useWebSocketEvent(
  eventType: WebSocketEventType,
  callback: (data: any) => void,
) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(eventType, callback);
    return unsubscribe;
  }, [eventType, callback, subscribe]);
}
