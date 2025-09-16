import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Plus,
  User,
  LogOut,
  Coffee,
  Utensils,
  CreditCard,
} from "lucide-react";
import { useAuth, hasPermission } from "@/contexts/AuthContext";

// Mock data - in real app this would come from API
const mockTables = [
  {
    id: 1,
    number: "T1",
    status: "active",
    customerCount: 4,
    assignedWaiter: "waiter1",
    sessionStart: "2024-01-15T19:30:00Z",
    currentOrder: {
      items: ["Grilled Salmon", "Beef Tenderloin", "House Wine"],
      total: 65.0,
      status: "preparing",
    },
    notifications: ["new_order"],
    lastActivity: "2024-01-15T20:15:00Z",
  },
  {
    id: 2,
    number: "T2",
    status: "waiting_payment",
    customerCount: 2,
    assignedWaiter: "waiter1",
    sessionStart: "2024-01-15T19:00:00Z",
    currentOrder: {
      items: ["Caesar Salad", "Craft Beer"],
      total: 21.0,
      status: "served",
    },
    notifications: ["payment_requested"],
    lastActivity: "2024-01-15T20:45:00Z",
  },
  {
    id: 3,
    number: "T3",
    status: "available",
    customerCount: 0,
    assignedWaiter: null,
    sessionStart: null,
    currentOrder: null,
    notifications: [],
    lastActivity: null,
  },
  {
    id: 4,
    number: "T4",
    status: "needs_attention",
    customerCount: 3,
    assignedWaiter: "waiter2",
    sessionStart: "2024-01-15T20:00:00Z",
    currentOrder: {
      items: ["Truffle Pasta", "Signature Cocktail"],
      total: 40.5,
      status: "preparing",
    },
    notifications: ["call_waiter"],
    lastActivity: "2024-01-15T20:30:00Z",
  },
  {
    id: 5,
    number: "T5",
    status: "active",
    customerCount: 6,
    assignedWaiter: null,
    sessionStart: "2024-01-15T19:45:00Z",
    currentOrder: {
      items: ["Today's Special", "House Wine", "Caesar Salad"],
      total: 48.5,
      status: "new",
    },
    notifications: ["new_table"],
    lastActivity: "2024-01-15T19:45:00Z",
  },
];

type TableStatus =
  | "available"
  | "active"
  | "waiting_payment"
  | "needs_attention";
type OrderStatus = "new" | "preparing" | "ready" | "served" | "paid";

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case "available":
      return "bg-gray-100 text-gray-800";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "waiting_payment":
      return "bg-yellow-100 text-yellow-800";
    case "needs_attention":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "new":
      return "bg-purple-100 text-purple-800";
    case "preparing":
      return "bg-orange-100 text-orange-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "served":
      return "bg-blue-100 text-blue-800";
    case "paid":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Waiter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState(mockTables);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("my-tables");

  // Redirect if not logged in or wrong role
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "waiter" && !hasPermission(user, "view_tables")) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // Filter tables based on current view
  const myTables = tables.filter(
    (table) => table.assignedWaiter === user?.username,
  );
  const unassignedTables = tables.filter(
    (table) => table.status === "active" && !table.assignedWaiter,
  );
  const allActiveTables = tables.filter(
    (table) => table.status !== "available",
  );

  // Get notifications count
  const notificationCount = myTables.reduce(
    (count, table) => count + table.notifications.length,
    0,
  );

  const claimTable = (tableId: number) => {
    setTables(
      tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              assignedWaiter: user?.username || "",
              notifications: table.notifications.filter(
                (n) => n !== "new_table",
              ),
            }
          : table,
      ),
    );
  };

  const updateOrderStatus = (tableId: number, newStatus: OrderStatus) => {
    setTables(
      tables.map((table) =>
        table.id === tableId && table.currentOrder
          ? {
              ...table,
              currentOrder: { ...table.currentOrder, status: newStatus },
              status: newStatus === "served" ? "waiting_payment" : table.status,
            }
          : table,
      ),
    );
  };

  const handleNotification = (tableId: number, notification: string) => {
    setTables(
      tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              notifications: table.notifications.filter(
                (n) => n !== notification,
              ),
              status: notification === "call_waiter" ? "active" : table.status,
            }
          : table,
      ),
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMinutes = Math.floor(
      (now.getTime() - past.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;
    }
  };

  const TableCard = ({ table }: { table: any }) => (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedTable === table.id ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={() =>
        setSelectedTable(selectedTable === table.id ? null : table.id)
      }
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg">{table.number}</h3>
            {table.notifications.length > 0 && (
              <div className="flex space-x-1">
                {table.notifications.includes("new_table") && (
                  <Badge variant="destructive" className="text-xs">
                    New
                  </Badge>
                )}
                {table.notifications.includes("call_waiter") && (
                  <Badge variant="destructive" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Call
                  </Badge>
                )}
                {table.notifications.includes("payment_requested") && (
                  <Badge variant="destructive" className="text-xs">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Pay
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Badge className={getStatusColor(table.status)}>
            {table.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="space-y-2">
          {table.customerCount > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {table.customerCount} guests
            </div>
          )}

          {table.sessionStart && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              Started {formatTime(table.sessionStart)}
            </div>
          )}

          {table.assignedWaiter && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              {table.assignedWaiter === user?.username
                ? "You"
                : table.assignedWaiter}
            </div>
          )}

          {table.currentOrder && (
            <div className="mt-3 p-2 bg-gray-50 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Current Order</span>
                <Badge
                  className={getOrderStatusColor(table.currentOrder.status)}
                >
                  {table.currentOrder.status}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                {table.currentOrder.items.join(", ")}
              </div>
              <div className="text-sm font-bold mt-1">
                ${table.currentOrder.total.toFixed(2)}
              </div>
            </div>
          )}

          {table.lastActivity && (
            <div className="text-xs text-gray-500">
              Last activity: {getTimeSince(table.lastActivity)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {selectedTable === table.id && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {!table.assignedWaiter && table.status === "active" && (
                <Button size="sm" onClick={() => claimTable(table.id)}>
                  Claim Table
                </Button>
              )}

              {table.notifications.includes("call_waiter") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNotification(table.id, "call_waiter")}
                >
                  Respond to Call
                </Button>
              )}

              {table.notifications.includes("payment_requested") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleNotification(table.id, "payment_requested")
                  }
                >
                  Process Payment
                </Button>
              )}

              {table.currentOrder &&
                table.assignedWaiter === user?.username && (
                  <div className="flex space-x-2">
                    {table.currentOrder.status === "ready" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(table.id, "served")}
                      >
                        Mark Served
                      </Button>
                    )}
                    {table.currentOrder.status === "served" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(table.id, "paid")}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                )}

              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Add Order
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return null; // Loading or redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                🍽️ POSRMS
              </span>
              <Badge className="ml-4 bg-blue-100 text-blue-800">
                Waiter Dashboard
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {notificationCount > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-red-500" />
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-red-500">
                    {notificationCount}
                  </Badge>
                </div>
              )}

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
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Tables</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myTables.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Needs Attention
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notificationCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Unassigned
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {unassignedTables.length}
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
                    Today's Sales
                  </p>
                  <p className="text-2xl font-bold text-gray-900">$428</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-tables">
              My Tables ({myTables.length})
            </TabsTrigger>
            <TabsTrigger value="unassigned">
              Unassigned ({unassignedTables.length})
            </TabsTrigger>
            <TabsTrigger value="all-tables">
              All Active ({allActiveTables.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-tables" className="mt-6">
            {myTables.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tables assigned
                  </h3>
                  <p className="text-gray-600">
                    Check the unassigned tab to claim new tables.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTables.map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unassigned" className="mt-6">
            {unassignedTables.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    All tables assigned
                  </h3>
                  <p className="text-gray-600">
                    Great job! All active tables have been claimed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unassignedTables.map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all-tables" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allActiveTables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
