import PlaceholderPage from "@/components/PlaceholderPage";

export default function Kitchen() {
  return (
    <PlaceholderPage
      title="Kitchen Display System"
      description="Dedicated kitchen interface showing only food orders from active sessions. Streamlined for efficient food preparation workflow."
      expectedFeatures={[
        "Food orders only (filtered from drinks)",
        "Order preparation tracking",
        "Status control: Preparing → Ready",
        "Order priority display",
        "Timer integration for cooking times",
        "Table number and order details",
        "Real-time order updates",
        "Order queue management",
        "Special instructions display",
        "Estimated completion times"
      ]}
    />
  );
}
