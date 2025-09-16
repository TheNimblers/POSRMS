import PlaceholderPage from "@/components/PlaceholderPage";

export default function Login() {
  return (
    <PlaceholderPage
      title="Restaurant Staff Login"
      description="Login portal for waiters, managers, and administrators to access their respective dashboards and manage restaurant operations."
      expectedFeatures={[
        "Staff authentication system",
        "Role-based login (Waiter/Manager/Admin)",
        "Secure password handling",
        "Remember me functionality",
        "Password reset option",
        "Auto-redirect to appropriate dashboard",
        "Guest waiter account creation",
        "Session management"
      ]}
    />
  );
}
