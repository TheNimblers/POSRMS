import PlaceholderPage from "@/components/PlaceholderPage";

export default function Admin() {
  return (
    <PlaceholderPage
      title="Admin Dashboard"
      description="Full administrative access with manager capabilities plus advanced system controls, analytics, and restaurant-wide settings."
      expectedFeatures={[
        "Full access to all Manager features",
        "Add/Remove Managers",
        "Export QR codes in bulk",
        "Advanced analytics with custom filters",
        "Today/Week/Month performance reports",
        "Staff performance detailed reports",
        "Restaurant-wide settings management",
        "System configuration controls",
        "User role management",
        "Security and audit logs",
        "Backup and restore options",
        "Integration settings"
      ]}
    />
  );
}
