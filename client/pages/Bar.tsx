import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  LogOut,
  Timer,
  RotateCcw,
  Wine,
  Beaker,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock drink orders data - in real app this would come from API
const mockDrinkOrders = [
  {
    id: 1,
    orderNumber: "ORD-001",
    tableNumber: "T1",
    items: [
      {
        name: "House Wine Red",
        quantity: 2,
        notes: "Room temperature",
        category: "wine",
      },
      {
        name: "Craft Beer IPA",
        quantity: 1,
        notes: "Extra cold",
        category: "beer",
      },
    ],
    status: "new",
    orderTime: "2024-01-15T20:15:00Z",
    priority: "normal",
    waiter: "waiter1",
    estimatedTime: 5,
    customerCount: 4,
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    tableNumber: "T2",
    items: [
      {
        name: "Signature Cocktail",
        quantity: 2,
        notes: "Extra ice, lime garnish",
        category: "cocktail",
      },
      {
        name: "Sparkling Water",
        quantity: 1,
        notes: "",
        category: "non-alcoholic",
      },
    ],
    status: "preparing",
    orderTime: "2024-01-15T20:05:00Z",
    priority: "high",
    waiter: "waiter1",
    estimatedTime: 8,
    customerCount: 2,
    startTime: "2024-01-15T20:08:00Z",
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    tableNumber: "T5",
    items: [
      {
        name: "House Wine White",
        quantity: 3,
        notes: "Well chilled",
        category: "wine",
      },
      {
        name: "Fresh Orange Juice",
        quantity: 2,
        notes: "No pulp",
        category: "non-alcoholic",
      },
    ],
    status: "preparing",
    orderTime: "2024-01-15T19:45:00Z",
    priority: "normal",
    waiter: "waiter2",
    estimatedTime: 6,
    customerCount: 6,
    startTime: "2024-01-15T19:50:00Z",
  },
  {
    id: 4,
    orderNumber: "ORD-004",
    tableNumber: "T3",
    items: [
      {
        name: "Whiskey Sour",
        quantity: 1,
        notes: "Double whiskey",
        category: "cocktail",
      },
    ],
    status: "ready",
    orderTime: "2024-01-15T19:30:00Z",
    priority: "normal",
    waiter: "waiter1",
    estimatedTime: 7,
    customerCount: 3,
    startTime: "2024-01-15T19:35:00Z",
    readyTime: "2024-01-15T19:42:00Z",
  },
  {
    id: 5,
    orderNumber: "ORD-005",
    tableNumber: "T4",
    items: [
      {
        name: "Mojito",
        quantity: 2,
        notes: "Extra mint",
        category: "cocktail",
      },
      { name: "Corona", quantity: 2, notes: "With lime", category: "beer" },
    ],
    status: "new",
    orderTime: "2024-01-15T20:20:00Z",
    priority: "urgent",
    waiter: "waiter2",
    estimatedTime: 6,
    customerCount: 4,
  },
];

type OrderStatus = "new" | "preparing" | "ready" | "served";
type Priority = "low" | "normal" | "high" | "urgent";

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "preparing":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "ready":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "served":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-800";
    case "normal":
      return "bg-gray-100 text-gray-800";
    case "high":
      return "bg-yellow-100 text-yellow-800";
    case "urgent":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "wine":
      return Wine;
    case "beer":
      return Beaker;
    case "cocktail":
      return Coffee;
    case "non-alcoholic":
      return Coffee;
    default:
      return Coffee;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "wine":
      return "bg-purple-100 text-purple-800";
    case "beer":
      return "bg-yellow-100 text-yellow-800";
    case "cocktail":
      return "bg-pink-100 text-pink-800";
    case "non-alcoholic":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Bar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(mockDrinkOrders);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if not logged in or wrong role
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (
      user.role !== "bar" &&
      user.role !== "admin" &&
      user.role !== "manager"
    ) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const updateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders(
      orders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus };

          if (newStatus === "preparing" && !order.startTime) {
            updatedOrder.startTime = new Date().toISOString();
          } else if (newStatus === "ready" && !order.readyTime) {
            updatedOrder.readyTime = new Date().toISOString();
          }

          return updatedOrder;
        }
        return order;
      }),
    );
  };

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = currentTime;
    const diffMinutes = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60),
    );
    return diffMinutes;
  };

  const getOrderAge = (orderTime: string) => {
    const start = new Date(orderTime);
    const now = currentTime;
    const diffMinutes = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60),
    );
    return diffMinutes;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter and sort orders
  const activeOrders = orders.filter((order) => order.status !== "served");
  const newOrders = activeOrders.filter((order) => order.status === "new");
  const preparingOrders = activeOrders.filter(
    (order) => order.status === "preparing",
  );
  const readyOrders = activeOrders.filter((order) => order.status === "ready");

  const OrderCard = ({ order }: { order: any }) => {
    const orderAge = getOrderAge(order.orderTime);
    const isOverdue = orderAge > order.estimatedTime;
    const preparingTime = order.startTime ? getElapsedTime(order.startTime) : 0;

    return (
      <Card
        className={`${getStatusColor(order.status)} border-2 ${isOverdue ? "shadow-lg ring-2 ring-red-300" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold">
                {order.orderNumber}
              </CardTitle>
              <p className="text-sm opacity-75">
                Table {order.tableNumber} • {order.customerCount} guests
              </p>
            </div>
            <div className="text-right">
              <Badge className={getPriorityColor(order.priority)}>
                {order.priority}
              </Badge>
              <div className="text-xs mt-1 opacity-75">
                {formatTime(order.orderTime)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Order Items */}
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => {
                const CategoryIcon = getCategoryIcon(item.category);
                return (
                  <div key={index} className="bg-white/50 rounded p-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <CategoryIcon className="h-4 w-4 mr-2 opacity-60" />
                          <span className="font-medium">
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-600 mt-1 ml-6">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ml-2 ${getCategoryColor(item.category)}`}
                      >
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timing Information */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span
                    className={
                      orderAge > order.estimatedTime
                        ? "text-red-600 font-bold"
                        : ""
                    }
                  >
                    {orderAge}m
                  </span>
                  <span className="text-gray-500 ml-1">
                    / {order.estimatedTime}m
                  </span>
                </div>

                {order.startTime && order.status === "preparing" && (
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-1" />
                    <span>Making: {preparingTime}m</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-600">{order.waiter}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              {order.status === "new" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "preparing")}
                  className="flex-1"
                >
                  Start Making
                </Button>
              )}

              {order.status === "preparing" && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "ready")}
                  className="flex-1"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark Ready
                </Button>
              )}

              {order.status === "ready" && (
                <div className="flex space-x-2 w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                    className="flex-1"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "served")}
                    className="flex-1"
                  >
                    Served
                  </Button>
                </div>
              )}
            </div>

            {/* Overdue Warning */}
            {isOverdue && (
              <div className="flex items-center text-red-600 text-sm bg-red-50 p-2 rounded">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-medium">
                  Order overdue by {orderAge - order.estimatedTime} minutes
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return null; // Loading or redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-cyan-400 mr-3" />
              <span className="text-2xl font-bold">Bar Display System</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>

              <div className="text-sm text-gray-300">
                Bar Staff: {user.username}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-white/20 text-white hover:bg-white/10"
              >
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
          <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-300" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-200">
                    New Orders
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {newOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-800/50 backdrop-blur-sm border-amber-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Coffee className="h-8 w-8 text-amber-300" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-amber-200">
                    Preparing
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {preparingOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-800/50 backdrop-blur-sm border-emerald-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emerald-300" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-emerald-200">Ready</p>
                  <p className="text-2xl font-bold text-white">
                    {readyOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-gray-300" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-200">
                    Total Active
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {activeOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-300 flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              New Orders ({newOrders.length})
            </h2>
            <div className="space-y-4">
              {newOrders.length === 0 ? (
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No new drink orders</p>
                  </CardContent>
                </Card>
              ) : (
                newOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-amber-300 flex items-center">
              <Coffee className="h-6 w-6 mr-2" />
              Preparing ({preparingOrders.length})
            </h2>
            <div className="space-y-4">
              {preparingOrders.length === 0 ? (
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-8 text-center">
                    <Coffee className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No drinks in preparation</p>
                  </CardContent>
                </Card>
              ) : (
                preparingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-emerald-300 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Ready for Service ({readyOrders.length})
            </h2>
            <div className="space-y-4">
              {readyOrders.length === 0 ? (
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No drinks ready</p>
                  </CardContent>
                </Card>
              ) : (
                readyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
