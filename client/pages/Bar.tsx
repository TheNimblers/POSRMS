import PlaceholderPage from "@/components/PlaceholderPage";

export default function Bar() {
  return (
    <PlaceholderPage
      title="Bar Display System"
      description="Dedicated bar interface showing only drink orders. Optimized for beverage preparation and service workflow."
      expectedFeatures={[
        "Drink orders only (filtered from food)",
        "Beverage preparation tracking",
        "Status control: Preparing → Ready",
        "Order priority display",
        "Cocktail recipe integration",
        "Table number and order details",
        "Real-time order updates",
        "Drink queue management",
        "Special drink instructions",
        "Inventory alerts for low stock"
      ]}
    />
  );
}
