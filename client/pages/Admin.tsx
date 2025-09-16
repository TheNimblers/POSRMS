import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  Database,
  Lock,
  Globe,
  Bell,
  Archive,
  UserPlus,
  Key,
  Monitor,
  Wifi,
  HardDrive,
} from "lucide-react";
import { useAuth, hasPermission } from "@/contexts/AuthContext";

// Mock admin data - in real app this would come from API
const mockSystemStats = {
  totalUsers: 25,
  activeUsers: 18,
  totalOrders: 1456,
  systemUptime: "99.8%",
  storageUsed: "2.4 GB",
  dailyActiveUsers: 15,
  errorRate: "0.02%",
};

const mockManagers = [
  {
    id: 1,
    username: "manager1",
    name: "Alice Johnson",
    email: "alice@restaurant.com",
    status: "active",
    lastLogin: "2024-01-15T20:15:00Z",
  },
  {
    id: 2,
    username: "manager2",
    name: "Bob Wilson",
    email: "bob@restaurant.com",
    status: "active",
    lastLogin: "2024-01-15T19:30:00Z",
  },
  {
    id: 3,
    username: "manager3",
    name: "Carol Davis",
    email: "carol@restaurant.com",
    status: "inactive",
    lastLogin: "2024-01-10T15:45:00Z",
  },
];

const mockSystemSettings = {
  restaurantName: "Demo Restaurant",
  timezone: "America/New_York",
  currency: "USD",
  taxRate: 8.5,
  serviceCharge: 15.0,
  autoBackup: true,
  notifications: true,
  maintenanceMode: false,
  allowGuestOrders: true,
  maxTableCapacity: 12,
  orderTimeout: 30,
};

const mockAuditLogs = [
  {
    id: 1,
    action: "User Login",
    user: "manager1",
    timestamp: "2024-01-15T20:15:00Z",
    details: "Successful login from 192.168.1.100",
  },
  {
    id: 2,
    action: "Menu Updated",
    user: "manager2",
    timestamp: "2024-01-15T19:30:00Z",
    details: "Added new item: Truffle Pasta",
  },
  {
    id: 3,
    action: "Staff Added",
    user: "admin1",
    timestamp: "2024-01-15T18:45:00Z",
    details: "Added waiter: John Doe",
  },
  {
    id: 4,
    action: "Settings Changed",
    user: "admin1",
    timestamp: "2024-01-15T17:20:00Z",
    details: "Updated tax rate to 8.5%",
  },
];

const mockPerformanceMetrics = {
  responseTime: "245ms",
  throughput: "1.2k requests/min",
  errorRate: "0.02%",
  cpuUsage: "34%",
  memoryUsage: "67%",
  diskUsage: "45%",
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [managers, setManagers] = useState(mockManagers);
  const [systemSettings, setSystemSettings] = useState(mockSystemSettings);

  // Redirect if not logged in or wrong role
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin" && !hasPermission(user, "full_access")) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const toggleManagerStatus = (managerId: number) => {
    setManagers(
      managers.map((manager) =>
        manager.id === managerId
          ? {
              ...manager,
              status: manager.status === "active" ? "inactive" : "active",
            }
          : manager,
      ),
    );
  };

  const updateSystemSetting = (key: string, value: any) => {
    setSystemSettings({ ...systemSettings, [key]: value });
  };

  const exportData = (type: string) => {
    alert(`${type} data exported successfully!`);
  };

  const performBackup = () => {
    alert("System backup initiated successfully!");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">
                Admin Panel
              </span>
              <Badge className="ml-4 bg-red-100 text-red-800">
                Full Access
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                System Administrator: {user.username}
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockSystemStats.totalUsers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Monitor className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        System Uptime
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockSystemStats.systemUptime}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockSystemStats.totalOrders.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <HardDrive className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Storage Used
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockSystemStats.storageUsed}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">
                        {mockPerformanceMetrics.responseTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPU Usage:</span>
                      <span className="font-medium">
                        {mockPerformanceMetrics.cpuUsage}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Memory Usage:</span>
                      <span className="font-medium">
                        {mockPerformanceMetrics.memoryUsage}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error Rate:</span>
                      <span className="font-medium text-green-600">
                        {mockPerformanceMetrics.errorRate}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={performBackup}
                      className="h-16 flex-col space-y-1"
                    >
                      <Archive className="h-5 w-5" />
                      <span className="text-sm">Backup Now</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col space-y-1"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span className="text-sm">Add Manager</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col space-y-1"
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-sm">Export Data</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col space-y-1"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="text-sm">System Config</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Managers Tab */}
          <TabsContent value="managers" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manager Management</h2>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Manager
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Manager
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {managers.map((manager) => (
                        <tr key={manager.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {manager.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{manager.username}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {manager.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                manager.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {manager.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(manager.lastLogin)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleManagerStatus(manager.id)}
                            >
                              {manager.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Key className="h-3 w-3" />
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Advanced Analytics</h2>
              <div className="space-x-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom Date Range
                </Button>
                <Button onClick={() => exportData("Analytics")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-bold text-green-600">+15.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Month:</span>
                      <span className="font-bold">$32,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">YTD Growth:</span>
                      <span className="font-bold text-green-600">+23.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Top Waiter:</span>
                      <span className="font-bold">waiter1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Orders/Day:</span>
                      <span className="font-bold">28.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Rating:</span>
                      <span className="font-bold text-yellow-600">4.8/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Hour:</span>
                      <span className="font-bold">7-8 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table Turnover:</span>
                      <span className="font-bold">2.3x/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Order Time:</span>
                      <span className="font-bold">18 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="restaurantName">Restaurant Name</Label>
                    <Input
                      id="restaurantName"
                      value={systemSettings.restaurantName}
                      onChange={(e) =>
                        updateSystemSetting("restaurantName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={systemSettings.timezone}
                      onChange={(e) =>
                        updateSystemSetting("timezone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={systemSettings.currency}
                      onChange={(e) =>
                        updateSystemSetting("currency", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={systemSettings.taxRate}
                      onChange={(e) =>
                        updateSystemSetting(
                          "taxRate",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoBackup">Auto Backup</Label>
                    <input
                      type="checkbox"
                      id="autoBackup"
                      checked={systemSettings.autoBackup}
                      onChange={(e) =>
                        updateSystemSetting("autoBackup", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">System Notifications</Label>
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={systemSettings.notifications}
                      onChange={(e) =>
                        updateSystemSetting("notifications", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) =>
                        updateSystemSetting("maintenanceMode", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderTimeout">
                      Order Timeout (minutes)
                    </Label>
                    <Input
                      id="orderTimeout"
                      type="number"
                      value={systemSettings.orderTimeout}
                      onChange={(e) =>
                        updateSystemSetting(
                          "orderTimeout",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Badge className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Session Timeout</Label>
                    <span className="text-sm text-gray-600">24 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Password Requirements</Label>
                    <Badge className="bg-blue-100 text-blue-800">Strong</Badge>
                  </div>
                  <Button className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Reset All Passwords
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wifi className="h-5 w-5 mr-2" />
                    Network Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>SSL Certificate</Label>
                    <Badge className="bg-green-100 text-green-800">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Firewall Status</Label>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Failed Login Attempts</Label>
                    <span className="text-sm text-gray-600">3 (last 24h)</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Scan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Archive className="h-5 w-5 mr-2" />
                    Backup Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Last Backup</Label>
                    <span className="text-sm text-gray-600">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Backup Frequency</Label>
                    <span className="text-sm text-gray-600">Every 6 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Storage Used</Label>
                    <span className="text-sm text-gray-600">1.2 GB</span>
                  </div>
                  <Button onClick={performBackup} className="w-full">
                    <Archive className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Data Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => exportData("Orders")}
                    variant="outline"
                    className="w-full"
                  >
                    Export Order Data
                  </Button>
                  <Button
                    onClick={() => exportData("Users")}
                    variant="outline"
                    className="w-full"
                  >
                    Export User Data
                  </Button>
                  <Button
                    onClick={() => exportData("Analytics")}
                    variant="outline"
                    className="w-full"
                  >
                    Export Analytics
                  </Button>
                  <Button onClick={() => exportData("All")} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Audit Logs</h2>
              <Button onClick={() => exportData("Logs")}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockAuditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(log.timestamp)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
