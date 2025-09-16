import PlaceholderPage from "@/components/PlaceholderPage";

export default function Waiter() {
  return (
    <PlaceholderPage
      title="Waiter Dashboard"
      description="Real-time dashboard for waiters to manage tables, track orders, and respond to customer requests. Includes notifications and order management tools."
      expectedFeatures={[
        "Active tables overview with statuses",
        "Claim/assign tables",
        "Add manual orders for any table",
        "Update order statuses (Preparing → Served → Paid)",
        "Real-time notifications",
        "New table activation alerts",
        "Call Waiter request notifications",
        "Payment request alerts",
        "Order history for each table",
        "Quick actions for common tasks"
      ]}
    />
  );
}
