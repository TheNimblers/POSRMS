import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const demoMenu = [
  {
    category: "Burgers",
    items: [
      {
        name: "Spicy Burger",
        price: 12.5,
        desc: "Smoked chili, cheddar, house sauce",
      },
      {
        name: "Classic Cheeseburger",
        price: 11.0,
        desc: "Beef, cheddar, pickles, ketchup",
      },
      {
        name: "Veggie Stack",
        price: 10.0,
        desc: "Grilled portobello, avocado, aioli",
      },
    ],
  },
];

const waiterTables = [
  {
    table: "T1",
    status: "Awaiting drinks",
    guests: 2,
    items: [{ name: "Mango Shake", qty: 2 }],
  },
  {
    table: "T3",
    status: "Serve mains",
    guests: 3,
    items: [
      { name: "Spicy Burger", qty: 2 },
      { name: "Caesar Salad", qty: 1 },
    ],
  },
];

const topItems = [
  { name: "Spicy Burger", sales: 128, revenue: 1600 },
  { name: "Truffle Fries", sales: 210, revenue: 1260 },
  { name: "Iced Latte", sales: 180, revenue: 720 },
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
            Switch between panels to preview the experience
          </p>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <Tabs defaultValue="customer" className="w-full">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabsList className="bg-[hsl(var(--muted))] rounded-md p-1 flex gap-2">
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
              </TabsList>
              <div className="flex gap-2">
                <Link to="/order?token=QR-T1">
                  <Button size="sm">Open Customer Demo</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" variant="outline">
                    Open Staff Demo
                  </Button>
                </Link>
              </div>
            </div>

            <TabsContent value="customer" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <img
                    src="/demos/customer.svg"
                    alt="Customer demo"
                    className="w-full h-auto"
                  />
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
                      <div className="font-semibold mb-2">Top Items</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {topItems.map((t) => (
                          <li key={t.name} className="flex justify-between">
                            <span>{t.name}</span>
                            <span>{t.sales}</span>
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
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <img
                    src="/demos/waiter.svg"
                    alt="Waiter demo"
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Open Tables</div>
                      <ul className="text-sm text-gray-600 space-y-3">
                        {waiterTables.map((t) => (
                          <li key={t.table}>
                            <div className="flex justify-between font-medium text-gray-900">
                              <span>
                                {t.table} • {t.guests} guests
                              </span>
                              <span>{t.status}</span>
                            </div>
                            <ul className="mt-1 text-xs text-gray-600 space-y-1">
                              {t.items.map((it) => (
                                <li
                                  key={it.name}
                                  className="flex justify-between"
                                >
                                  <span>
                                    {it.qty}x {it.name}
                                  </span>
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
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <img
                    src="/demos/kitchen.svg"
                    alt="Kitchen demo"
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Capacity</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500">Stations</div>
                          <div className="font-semibold">4</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Active</div>
                          <div className="font-semibold">3</div>
                        </div>
                      </div>
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
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Today</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500">Revenue</div>
                          <div className="font-semibold">$1,980</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Orders</div>
                          <div className="font-semibold">124</div>
                        </div>
                      </div>
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
