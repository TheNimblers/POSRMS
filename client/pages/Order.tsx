import PlaceholderPage from "@/components/PlaceholderPage";

export default function Order() {
  return (
    <PlaceholderPage
      title="Customer Ordering System"
      description="Scan QR code to access live menu, place orders, and interact with restaurant staff. This is the customer-facing interface accessed via QR codes on tables."
      expectedFeatures={[
        "Live categorized menu (food, drinks, specials)",
        "Currency toggle (€/$)",
        "Add to cart with live total",
        "Special offers display",
        "Place orders (food/drink)",
        "Add more items to active session",
        "Call Waiter button",
        "Request Payment button",
        "Leave Rating & Review",
        "Real-time order status updates"
      ]}
    />
  );
}
