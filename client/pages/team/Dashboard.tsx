import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Calendar,
  Bell,
  Shield,
  Palette,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock SaaS data - in real app this would come from API
const mockRestaurants = [
  {
    id: 1,
    name: "Bella Vista Restaurant",
    admin: "admin1@bellavista.com",
    subscription: "yearly",
    status: "active",
    monthlyRevenue: 12450.5,
    tablesCount: 24,
    staffCount: 15,
    lastActivity: "2024-01-15T20:30:00Z",
    createdDate: "2023-06-15T00:00:00Z",
  },
  {
    id: 2,
    name: "Downtown Bistro",
    admin: "manager@downtown.com",
    subscription: "monthly",
    status: "active",
    monthlyRevenue: 8750.25,
    tablesCount: 18,
    staffCount: 12,
    lastActivity: "2024-01-15T19:45:00Z",
    createdDate: "2023-09-22T00:00:00Z",
  },
  {
    id: 3,
    name: "Coastal Cafe",
    admin: "admin@coastal.com",
    subscription: "trial",
    status: "trial",
    monthlyRevenue: 3200.0,
    tablesCount: 8,
    staffCount: 6,
    lastActivity: "2024-01-15T18:20:00Z",
    createdDate: "2024-01-10T00:00:00Z",
  },
  {
    id: 4,
    name: "Urban Grill",
    admin: "contact@urbangrill.com",
    subscription: "monthly",
    status: "suspended",
    monthlyRevenue: 0,
    tablesCount: 16,
    staffCount: 10,
    lastActivity: "2024-01-10T12:00:00Z",
    createdDate: "2023-11-08T00:00:00Z",
  },
];

const mockPlatformStats = {
  totalRestaurants: 247,
  activeRestaurants: 198,
  trialRestaurants: 23,
  suspendedRestaurants: 26,
  totalRevenue: 485750.5,
  monthlyRecurringRevenue: 89450.25,
  totalUsers: 1823,
  activeUsers: 1567,
  supportTickets: 12,
  systemUptime: 99.97,
};

const mockSubscriptionPlans = [
  {
    id: "trial",
    name: "Trial",
    price: 0,
    duration: "14 days",
    features: ["Up to 5 tables", "Basic features", "Email support"],
    customers: 23,
    revenue: 0,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 99,
    duration: "per month",
    features: ["Unlimited tables", "All features", "Priority support"],
    customers: 156,
    revenue: 15444,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 990,
    duration: "per year",
    features: ["Everything in Monthly", "White-label", "Dedicated support"],
    customers: 68,
    revenue: 67320,
  },
];

const mockAnalytics = {
  newSignups: [
    { date: "2024-01-01", count: 5 },
    { date: "2024-01-02", count: 8 },
    { date: "2024-01-03", count: 12 },
    { date: "2024-01-04", count: 7 },
    { date: "2024-01-05", count: 15 },
  ],
  churnRate: 2.3,
  averageRevenuePerUser: 127.5,
  customerLifetimeValue: 1485.0,
};

function NotificationsBell() {
  const ws = useWebSocket();
  const count = ws.notifications.length;
  const latest = useMemo(() => ws.notifications.slice(0, 10), [ws.notifications]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative">
          <Bell className="h-6 w-6 text-gray-600" />
          {count > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-red-500">
              {count}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <button
            className="text-xs text-blue-600"
            onClick={() => ws.clearNotifications()}
          >
            Mark all as read
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {latest.length === 0 ? (
          <div className="p-3 text-sm text-gray-500">No notifications</div>
        ) : (
          latest.map((n, i) => (
            <DropdownMenuItem key={i} className="flex flex-col items-start">
              <div className="text-sm font-medium">{n.type}</div>
              <div className="text-xs text-gray-600">
                {n.data?.message || JSON.stringify(n.data)}
              </div>
              <div className="text-[10px] text-gray-400">
                {new Date(n.timestamp).toLocaleTimeString()}
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs flex items-center justify-between">
          <span>Enable notifications</span>
          <input
            type="checkbox"
            checked={ws.notificationsEnabled}
            onChange={(e) => ws.setNotificationsEnabled(e.target.checked)}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TeamDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [restaurants, setRestaurants] = useState(mockRestaurants);

  // Redirect if not logged in or wrong role
  useEffect(() => {
    if (!user) {
      navigate("/team/login");
      return;
    }
    if (user.role !== "team") {
      navigate("/team/login");
      return;
    }
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case "yearly":
        return "bg-purple-100 text-purple-800";
      case "monthly":
        return "bg-orange-100 text-orange-800";
      case "trial":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const addRestaurant = () => {
    alert("Add Restaurant functionality would open a form here");
  };

  const suspendRestaurant = (restaurantId: number) => {
    setRestaurants(
      restaurants.map((restaurant) =>
        restaurant.id === restaurantId
          ? {
              ...restaurant,
              status:
                restaurant.status === "suspended" ? "active" : "suspended",
            }
          : restaurant,
      ),
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">
                POSRMS SaaS Dashboard
              </span>
              <Badge className="ml-4 bg-blue-100 text-blue-800">
                Platform Admin
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationsBell />

              <div className="text-sm text-gray-600">
                POSRMS Team: {user.username}
              </div>

              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Restaurants
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockPlatformStats.totalRestaurants}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Monthly Recurring Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          mockPlatformStats.monthlyRecurringRevenue,
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Active Users
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockPlatformStats.activeUsers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        System Uptime
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockPlatformStats.systemUptime}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-bold text-green-600">
                        {mockPlatformStats.activeRestaurants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial:</span>
                      <span className="font-bold text-blue-600">
                        {mockPlatformStats.trialRestaurants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Suspended:</span>
                      <span className="font-bold text-red-600">
                        {mockPlatformStats.suspendedRestaurants}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-bold">
                        {formatCurrency(mockPlatformStats.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg per Restaurant:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.averageRevenuePerUser)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer LTV:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.customerLifetimeValue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Support Tickets:</span>
                      <span className="font-bold text-orange-600">
                        {mockPlatformStats.supportTickets}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Churn Rate:</span>
                      <span className="font-bold text-red-600">
                        {mockAnalytics.churnRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">System Status:</span>
                      <Badge className="bg-green-100 text-green-800">
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Restaurant Management</h2>
              <Button onClick={addRestaurant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Restaurant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {restaurants.map((restaurant) => (
                        <tr key={restaurant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {restaurant.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {restaurant.tablesCount} tables •{" "}
                                {restaurant.staffCount} staff
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {restaurant.admin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={getSubscriptionColor(
                                restaurant.subscription,
                              )}
                            >
                              {restaurant.subscription}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={getStatusColor(restaurant.status)}
                            >
                              {restaurant.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(restaurant.monthlyRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => suspendRestaurant(restaurant.id)}
                            >
                              {restaurant.status === "suspended"
                                ? "Activate"
                                : "Suspend"}
                            </Button>
                            <Button size="sm" variant="outline">
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {mockSubscriptionPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.id === "yearly" && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-3xl font-bold">
                      {formatCurrency(plan.price)}
                      <span className="text-sm font-normal text-gray-600 ml-1">
                        {plan.duration}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm">Features:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Customers:</span>
                          <span className="font-bold">{plan.customers}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Monthly Revenue:
                          </span>
                          <span className="font-bold">
                            {formatCurrency(plan.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Platform Analytics</h2>
              <div className="space-x-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom Range
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        New Signups (7d)
                      </p>
                      <p className="text-2xl font-bold text-gray-900">47</p>
                      <p className="text-xs text-green-600">
                        +12% from last week
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ARPU</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(mockAnalytics.averageRevenuePerUser)}
                      </p>
                      <p className="text-xs text-blue-600">+5.2% MoM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Churn Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockAnalytics.churnRate}%
                      </p>
                      <p className="text-xs text-red-600">+0.3% MoM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Crown className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">LTV</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(mockAnalytics.customerLifetimeValue)}
                      </p>
                      <p className="text-xs text-green-600">+8.7% MoM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Urgent Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">3</div>
                  <p className="text-sm text-gray-600">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                    Open Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    9
                  </div>
                  <p className="text-sm text-gray-600">Awaiting response</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Resolved Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    15
                  </div>
                  <p className="text-sm text-gray-600">
                    Average resolution: 2.3h
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    White-Label Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input id="brandName" defaultValue="POSRMS" />
                  </div>
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      defaultValue="#3B82F6"
                      type="color"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input id="logoUrl" placeholder="https://..." />
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Platform Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Trial Duration</Label>
                    <Input className="w-20" defaultValue={14} type="number" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-scaling</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Maintenance Mode</Label>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <Button variant="outline" className="w-full">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
