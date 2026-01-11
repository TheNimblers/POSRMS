import { supabase } from "./supabase";

/**
 * Subscribe to real-time order updates for kitchen staff
 * Notifies when orders change status (pending -> confirmed -> preparing -> ready)
 */
export function subscribeToOrderUpdates(
  restaurantId: string,
  callback: (event: any) => void,
) {
  const subscription = supabase
    .channel(`restaurant-orders-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `session_id=in.(SELECT id FROM sessions WHERE restaurant_id=eq.${restaurantId})`,
      },
      (payload) => {
        console.log("Order update:", payload);
        callback(payload);
      },
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to table status changes for waiters
 * Notifies when tables become available or need service
 */
export function subscribeToTableUpdates(
  restaurantId: string,
  callback: (event: any) => void,
) {
  const subscription = supabase
    .channel(`restaurant-tables-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tables",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        console.log("Table update:", payload);
        callback(payload);
      },
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to session status changes
 * Notifies when customers finish ordering or request payment
 */
export function subscribeToSessionUpdates(
  restaurantId: string,
  callback: (event: any) => void,
) {
  const subscription = supabase
    .channel(`restaurant-sessions-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sessions",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        console.log("Session update:", payload);
        callback(payload);
      },
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to menu item availability changes
 * Notifies when items become available or unavailable
 */
export function subscribeToMenuUpdates(
  restaurantId: string,
  callback: (event: any) => void,
) {
  const subscription = supabase
    .channel(`restaurant-menu-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "menu_items",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        console.log("Menu update:", payload);
        callback(payload);
      },
    )
    .subscribe();

  return subscription;
}

/**
 * Unsubscribe from a real-time channel
 */
export async function unsubscribeFromChannel(channel: any) {
  if (channel) {
    await supabase.removeChannel(channel);
  }
}

/**
 * Send a broadcast event (for notifications that aren't database changes)
 */
export function broadcastNotification(
  channelName: string,
  event: string,
  data: any,
) {
  const channel = supabase.channel(channelName);

  channel.send({
    type: "broadcast",
    event,
    payload: data,
  });
}

/**
 * Subscribe to broadcast notifications
 */
export function subscribeToBroadcast(
  channelName: string,
  eventName: string,
  callback: (payload: any) => void,
) {
  const subscription = supabase
    .channel(channelName)
    .on(
      "broadcast",
      {
        event: eventName,
      },
      (payload) => {
        console.log("Broadcast notification:", payload);
        callback(payload);
      },
    )
    .subscribe();

  return subscription;
}

/**
 * Hook-like function for subscribing to kitchen orders
 * Used in kitchen/bar staff views
 */
export function useKitchenSubscription(restaurantId: string) {
  const orderUpdates = subscribeToOrderUpdates(restaurantId, (event) => {
    // Handle order updates - trigger notifications
    if (event.new?.status === "preparing") {
      console.log(`Order ${event.new.id} is being prepared`);
      // Play notification sound
      playNotificationSound();
    } else if (event.new?.status === "ready") {
      console.log(`Order ${event.new.id} is ready for pickup`);
      playNotificationSound();
    }
  });

  return orderUpdates;
}

/**
 * Hook-like function for subscribing to waiter notifications
 * Used in waiter views
 */
export function useWaiterSubscription(restaurantId: string) {
  const tableUpdates = subscribeToTableUpdates(restaurantId, (event) => {
    if (event.new?.status === "active") {
      console.log(`Table ${event.new.number} is now active`);
    }
  });

  const sessionUpdates = subscribeToSessionUpdates(restaurantId, (event) => {
    if (event.new?.status === "closed") {
      console.log(`Table ${event.new.table_id} session closed`);
      playNotificationSound();
    }
  });

  return { tableUpdates, sessionUpdates };
}

/**
 * Play a notification sound
 */
function playNotificationSound() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Hz
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn("Could not play notification sound:", error);
  }
}

/**
 * Batch unsubscribe from multiple channels
 */
export async function unsubscribeAll(subscriptions: any[]) {
  for (const subscription of subscriptions) {
    await unsubscribeFromChannel(subscription);
  }
}
