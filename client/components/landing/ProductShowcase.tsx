import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Clock,
  ChefHat,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const demoMenu = [
  {
    category: "Appetizers",
    items: [
      {
        name: "Calamari Fritti",
        price: 12.5,
        desc: "Crispy squid, marinara, lemon aioli",
      },
      {
        name: "Truffle Fries",
        price: 9.0,
        desc: "Golden fries, truffle oil, parmesan",
      },
      {
        name: "Bruschetta",
        price: 8.5,
        desc: "Tomato, basil, garlic, olive oil",
      },
    ],
  },
  {
    category: "Main Courses",
    items: [
      {
        name: "Spicy Burger",
        price: 16.5,
        desc: "Smoked chili, cheddar, house sauce",
      },
      {
        name: "Grilled Salmon",
        price: 18.0,
        desc: "Lemon butter, seasonal vegetables",
      },
      {
        name: "Pasta Carbonara",
        price: 14.5,
        desc: "Pecorino, guanciale, egg yolk",
      },
      {
        name: "Classic Cheeseburger",
        price: 14.0,
        desc: "Prime beef, cheddar, pickles, ketchup",
      },
    ],
  },
  {
    category: "Desserts",
    items: [
      {
        name: "Tiramisu",
        price: 7.5,
        desc: "Mascarpone, espresso, cocoa",
      },
      {
        name: "Chocolate Lava Cake",
        price: 8.0,
        desc: "Warm chocolate, vanilla ice cream",
      },
      {
        name: "Panna Cotta",
        price: 7.0,
        desc: "Vanilla, berry coulis",
      },
    ],
  },
  {
    category: "Beverages",
    items: [
      {
        name: "Iced Latte",
        price: 5.0,
        desc: "Espresso, milk, ice",
      },
      {
        name: "Mango Shake",
        price: 6.5,
        desc: "Fresh mango, yogurt, honey",
      },
      {
        name: "Premium Wine",
        price: 12.0,
        desc: "Italian Pinot Grigio",
      },
    ],
  },
];

const waiterTables = [
  {
    table: "T1",
    status: "Ready to serve",
    guests: 2,
    items: [
      { name: "Grilled Salmon", qty: 1 },
      { name: "Spicy Burger", qty: 1 },
    ],
  },
  {
    table: "T3",
    status: "Awaiting dessert",
    guests: 3,
    items: [
      { name: "Tiramisu", qty: 2 },
      { name: "Chocolate Cake", qty: 1 },
    ],
  },
  {
    table: "T5",
    status: "Awaiting drinks",
    guests: 4,
    items: [
      { name: "Mango Shake", qty: 2 },
      { name: "Iced Latte", qty: 2 },
    ],
  },
  {
    table: "T7",
    status: "Placing order",
    guests: 2,
    items: [{ name: "Calamari Fritti", qty: 2 }],
  },
];

const topItems = [
  { name: "Spicy Burger", sales: 156, revenue: 2574 },
  { name: "Grilled Salmon", sales: 98, revenue: 1764 },
  { name: "Truffle Fries", sales: 234, revenue: 2106 },
  { name: "Iced Latte", sales: 201, revenue: 1005 },
  { name: "Pasta Carbonara", sales: 142, revenue: 2059 },
];

export default function ProductShowcase() {
  return (
    <section id="product" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Explore the product
          </h2>
          <p className="text-gray-600">
            Switch between panels to preview the experience for each role —
            Customer, Waiter, Kitchen, and Manager.
          </p>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <Tabs defaultValue="customer" className="w-full">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <TabsList className="bg-[hsl(var(--muted))] rounded-md p-1 flex gap-2 overflow-x-auto no-scrollbar">
                  <TabsTrigger
                    value="customer"
                    className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
                  >
                    Customer
                  </TabsTrigger>
                  <TabsTrigger
                    value="waiter"
                    className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
                  >
                    Waiter
                  </TabsTrigger>
                  <TabsTrigger
                    value="kitchen"
                    className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
                  >
                    Kitchen
                  </TabsTrigger>
                  <TabsTrigger
                    value="manager"
                    className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
                  >
                    Manager
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]"
                  >
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="customer" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Table 5 - Party of 2
                        </h3>
                        <p className="text-sm text-gray-500">
                          Order placed: 2:15 PM
                        </p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-orange-600" />
                    </div>

                    <div className="bg-white rounded-lg p-4 space-y-3 border border-orange-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-medium">
                            Grilled Salmon
                          </span>
                          <span className="text-sm text-gray-600">Qty: 1</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-medium">
                            Spicy Burger
                          </span>
                          <span className="text-sm text-gray-600">Qty: 1</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-medium">
                            Truffle Fries
                          </span>
                          <span className="text-sm text-gray-600">Qty: 2</span>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-orange-600">$48.50</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium">
                        ✓ Order Placed
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium">
                        💳 Request Bill
                      </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        💡 <strong>Tip:</strong> Scan the table QR code to view
                        the full menu and place additional orders anytime!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Menu</div>
                      <div className="max-h-72 overflow-auto pr-1 space-y-4">
                        {demoMenu.map((cat) => (
                          <div key={cat.category}>
                            <div className="text-xs uppercase tracking-wide text-gray-500">
                              {cat.category}
                            </div>
                            <ul className="mt-1 space-y-2">
                              {cat.items.map((it) => (
                                <li
                                  key={it.name}
                                  className="flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {it.name}
                                    </div>
                                    {it.desc ? (
                                      <div className="text-xs text-gray-500">
                                        {it.desc}
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold">
                                      ${it.price.toFixed(2)}
                                    </div>
                                    <Button size="sm" variant="outline">
                                      Add
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">
                        Top Sellers Today
                      </div>
                      <ul className="text-sm space-y-2">
                        {topItems.slice(0, 4).map((t, idx) => (
                          <li key={t.name} className="flex justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                #{idx + 1} {t.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {t.sales} sold
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-orange-600">
                              ${t.revenue}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="waiter" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Open Tables - Manage Service
                    </h3>

                    <div className="grid gap-3">
                      {/* Table T1 */}
                      <div className="bg-white rounded-lg border-l-4 border-green-500 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Table 1
                            </h4>
                            <p className="text-sm text-gray-600">
                              2 guests • 45 min
                            </p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            ✓ Ready to Serve
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Salmon + Burger ready from kitchen
                        </p>
                      </div>

                      {/* Table T3 */}
                      <div className="bg-white rounded-lg border-l-4 border-yellow-500 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Table 3
                            </h4>
                            <p className="text-sm text-gray-600">
                              3 guests • 28 min
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                            🕐 Waiting Drinks
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          2x Iced Latte, 1x Mango Shake pending
                        </p>
                      </div>

                      {/* Table T5 */}
                      <div className="bg-white rounded-lg border-l-4 border-orange-500 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Table 5
                            </h4>
                            <p className="text-sm text-gray-600">
                              4 guests • 15 min
                            </p>
                          </div>
                          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                            🍽️ Eating
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Dessert order ready soon
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium">
                        📋 New Order
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-sm font-medium">
                        🧾 Split Bill
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium">
                        ✓ Complete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Open Tables</div>
                      <ul className="text-sm text-gray-600 space-y-3">
                        {waiterTables.map((t) => (
                          <li key={t.table}>
                            <div className="flex justify-between font-medium text-gray-900">
                              {" "}
                              <span>
                                {t.table} • {t.guests} guests
                              </span>{" "}
                              <span>{t.status}</span>
                            </div>
                            <ul className="mt-1 text-xs text-gray-600 space-y-1">
                              {t.items.map((it) => (
                                <li
                                  key={it.name}
                                  className="flex justify-between"
                                >
                                  {" "}
                                  <span>
                                    {it.qty}x {it.name}
                                  </span>{" "}
                                  <span></span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kitchen" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-gradient-to-br from-red-50 to-orange-50 p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-red-600" />
                      Order Queue
                    </h3>

                    <div className="grid gap-3">
                      {/* Pending Order */}
                      <div className="bg-white rounded-lg border-l-4 border-red-500 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Order #2847 - Table 1
                            </h4>
                            <p className="text-sm text-gray-600">
                              📍 Station A
                            </p>
                          </div>
                          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded animate-pulse">
                            🔴 PENDING
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded p-2 text-sm">
                          <p className="font-medium">Grilled Salmon - 1x</p>
                          <p className="text-gray-600">
                            Lemon butter, vegetables
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Est. ready: 8 min
                        </p>
                      </div>

                      {/* Preparing Order */}
                      <div className="bg-white rounded-lg border-l-4 border-yellow-500 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Order #2846 - Table 3
                            </h4>
                            <p className="text-sm text-gray-600">
                              📍 Station B
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                            🟡 PREPARING
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded p-2 space-y-1 text-sm">
                          <p className="font-medium">Spicy Burger - 2x</p>
                          <p className="font-medium">Truffle Fries - 1x</p>
                          <p className="text-gray-600">
                            Special: Extra spicy sauce
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-yellow-500 h-2 rounded-full w-2/3"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Est. ready: 3 min
                        </p>
                      </div>

                      {/* Ready Order */}
                      <div className="bg-white rounded-lg border-l-4 border-green-500 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Order #2845 - Table 5
                            </h4>
                            <p className="text-sm text-gray-600">
                              📍 Pass
                            </p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            ✓ READY
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded p-2 text-sm">
                          <p className="font-medium">Pasta Carbonara - 1x</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Waiting: 2 min
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium">
                        ✓ Mark Ready
                      </button>
                      <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 text-sm font-medium">
                        🔔 Notify
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Queue Status
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pending</span>
                          <span className="font-semibold text-red-600">6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Preparing</span>
                          <span className="font-semibold text-yellow-600">4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ready</span>
                          <span className="font-semibold text-green-600">3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Avg Prep Time</div>
                      <div className="text-3xl font-bold text-orange-600">
                        12 min
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Within target
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manager" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <img
                    src="/demos/manager.svg"
                    alt="Manager demo"
                    className="w-full h-96 object-cover rounded-md"
                  />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">
                        Today's Performance
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm space-y-2">
                        <div>
                          <div className="text-gray-500">Revenue</div>
                          <div className="font-semibold text-lg">$4,240</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Orders</div>
                          <div className="font-semibold text-lg">187</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg Bill</div>
                          <div className="font-semibold text-lg">$22.68</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Covers</div>
                          <div className="font-semibold text-lg">34</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Status</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tables Open</span>
                          <span className="font-semibold">8/12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Staff On Duty</span>
                          <span className="font-semibold">6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Efficiency</span>
                          <span className="font-semibold text-green-600">
                            92%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <img
                    src="/demos/analytics.svg"
                    alt="Analytics"
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Live Dashboard</div>
                      <p className="text-sm text-gray-600">
                        Real-time sales, conversion and table throughput. Filter
                        by day, service, or item.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">
                        Revenue by Category
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Main Courses</span>
                          <span className="font-semibold">$1,980</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Appetizers</span>
                          <span className="font-semibold">$892</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Beverages</span>
                          <span className="font-semibold">$654</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Desserts</span>
                          <span className="font-semibold">$410</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Peak Hours</div>
                      <p className="text-sm text-gray-600">
                        Lunch: 12:30 - 2:15 PM
                        <br />
                        Dinner: 7:00 - 9:45 PM
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
