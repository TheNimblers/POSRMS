import { useState, useEffect } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Users,
  QrCode,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  ChefHat,
  Coffee,
  Star,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useAuth, hasPermission } from "@/contexts/AuthContext";

// Mock data - in real app this would come from API
const mockTables = [
  { id: 1, number: "T1", capacity: 4, status: "active", qrCode: "QR-T1" },
  { id: 2, number: "T2", capacity: 2, status: "available", qrCode: "QR-T2" },
  { id: 3, number: "T3", capacity: 6, status: "maintenance", qrCode: "QR-T3" },
  { id: 4, number: "T4", capacity: 4, status: "active", qrCode: "QR-T4" },
  { id: 5, number: "T5", capacity: 8, status: "available", qrCode: "QR-T5" },
];

const mockStaff = [
  {
    id: 1,
    username: "waiter1",
    role: "waiter",
    name: "John Doe",
    status: "active",
    shift: "Evening",
  },
  {
    id: 2,
    username: "waiter2",
    role: "waiter",
    name: "Jane Smith",
    status: "active",
    shift: "Day",
  },
  {
    id: 3,
    username: "kitchen1",
    role: "kitchen",
    name: "Mike Johnson",
    status: "active",
    shift: "Evening",
  },
  {
    id: 4,
    username: "bar1",
    role: "bar",
    name: "Sarah Wilson",
    status: "off-duty",
    shift: "Day",
  },
];

const mockOrderHistory = [
  {
    id: 1,
    orderNumber: "ORD-001",
    table: "T1",
    items: ["Grilled Salmon", "House Wine"],
    total: 33.0,
    waiter: "waiter1",
    timestamp: "2024-01-15T20:15:00Z",
    status: "completed",
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    table: "T2",
    items: ["Beef Tenderloin", "Caesar Salad"],
    total: 46.5,
    waiter: "waiter2",
    timestamp: "2024-01-15T19:30:00Z",
    status: "completed",
  },
];

const mockAnalytics = {
  todayRevenue: 1250.5,
  weekRevenue: 8750.25,
  monthRevenue: 35240.75,
  todayOrders: 45,
  weekOrders: 312,
  monthOrders: 1456,
  avgOrderValue: 27.8,
  tableUtilization: 78,
  bestSellingItems: [
    { name: "Grilled Salmon", quantity: 23, revenue: 563.5 },
    { name: "Beef Tenderloin", quantity: 18, revenue: 576.0 },
    { name: "Caesar Salad", quantity: 31, revenue: 449.5 },
  ],
};

export default function Manager() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [tables, setTables] = useState(mockTables);
  const [staff, setStaff] = useState(mockStaff);

  // Redirect if not logged in or wrong role
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "manager" && !hasPermission(user, "manage_menu")) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const generateQRCode = (tableId: number) => {
    alert(
      `QR Code generated for Table ${tables.find((t) => t.id === tableId)?.number}`,
    );
  };

  const downloadAllQRCodes = () => {
    alert("All QR codes downloaded successfully!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">
                Manager Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.username}
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
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Today's Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(mockAnalytics.todayRevenue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Orders Today
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockAnalytics.todayOrders}
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
                        Active Staff
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {staff.filter((s) => s.status === "active").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Table Utilization
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockAnalytics.tableUtilization}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={downloadAllQRCodes}
                    className="h-20 flex-col space-y-2"
                  >
                    <QrCode className="h-6 w-6" />
                    <span>Download QR Codes</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Users className="h-6 w-6" />
                    <span>Add Staff</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => setAddOpen(true)}
                  >
                    <Plus className="h-6 w-6" />
                    <span>Add Menu Item</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Table Management</h2>
              <div className="space-x-2">
                <Button onClick={downloadAllQRCodes}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All QR Codes
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <Card key={table.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Table {table.number}</CardTitle>
                      <Badge
                        className={
                          table.status === "active"
                            ? "bg-green-100 text-green-800"
                            : table.status === "available"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {table.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">
                          {table.capacity} guests
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">QR Code:</span>
                        <span className="font-medium">{table.qrCode}</span>
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button
                          size="sm"
                          onClick={() => generateQRCode(table.id)}
                          className="flex-1"
                        >
                          <QrCode className="h-3 w-3 mr-1" />
                          Generate QR
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                {item.special && (
                                  <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Special
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                item.available
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleMenuItemAvailability(item.id)
                              }
                            >
                              {item.available ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleMenuItemSpecial(item.id)}
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
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

          {/* Staff Tab */}
          <TabsContent value="staff" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Staff Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge
                        className={
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium">{member.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <Badge variant="outline">
                          {member.role === "waiter" && (
                            <Users className="h-3 w-3 mr-1" />
                          )}
                          {member.role === "kitchen" && (
                            <ChefHat className="h-3 w-3 mr-1" />
                          )}
                          {member.role === "bar" && (
                            <Coffee className="h-3 w-3 mr-1" />
                          )}
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shift:</span>
                        <span className="font-medium">{member.shift}</span>
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Order History (Last 30 Days)
              </h2>
              <div className="space-x-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Table
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Waiter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockOrderHistory.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.table}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {order.items.join(", ")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.waiter}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(order.timestamp)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.todayRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.weekRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.monthRevenue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today:</span>
                      <span className="font-bold">
                        {mockAnalytics.todayOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week:</span>
                      <span className="font-bold">
                        {mockAnalytics.weekOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Order Value:</span>
                      <span className="font-bold">
                        {formatCurrency(mockAnalytics.avgOrderValue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Best Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAnalytics.bestSellingItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            {item.quantity} sold
                          </div>
                        </div>
                        <div className="text-sm font-bold">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Add Menu Item Dialog */}
      <AddMenuItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        item={newItem}
        onChange={setNewItem}
        onSubmit={() => {
          const id = Math.max(0, ...menuItems.map((m) => m.id)) + 1;
          setMenuItems([{ id, ...newItem }, ...menuItems]);
          setNewItem({
            name: "",
            category: "Main",
            price: 0,
            available: true,
            special: false,
          });
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function AddMenuItemDialog({
  open,
  onOpenChange,
  item,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: {
    name: string;
    category: string;
    price: number;
    available: boolean;
    special: boolean;
  };
  onChange: (v: any) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={item.name}
              onChange={(e) => onChange({ ...item, name: e.target.value })}
              placeholder="Item name"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={item.category}
              onChange={(e) => onChange({ ...item, category: e.target.value })}
              placeholder="e.g. Main, Starter, Drinks"
            />
          </div>
          <div className="space-y-2">
            <Label>Price (USD)</Label>
            <Input
              type="number"
              step="0.01"
              value={item.price}
              onChange={(e) =>
                onChange({ ...item, price: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={item.available}
                onCheckedChange={(v) => onChange({ ...item, available: v })}
              />
              <Label>Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={item.special}
                onCheckedChange={(v) => onChange({ ...item, special: v })}
              />
              <Label>Special</Label>
            </div>
          </div>
          <div className="pt-2">
            <Button
              className="w-full"
              disabled={!item.name || !item.category || item.price <= 0}
              onClick={onSubmit}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
