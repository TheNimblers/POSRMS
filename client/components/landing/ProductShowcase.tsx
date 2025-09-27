import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const demoMenu = [
  {
    category: "Burgers",
    items: [
      { name: "Spicy Burger", price: 12.5, desc: "Smoked chili, cheddar, house sauce" },
      { name: "Classic Cheeseburger", price: 11.0, desc: "Beef, cheddar, pickles, ketchup" },
      { name: "Veggie Stack", price: 10.0, desc: "Grilled portobello, avocado, aioli" },
    ],
  },
];

const waiterTables = [
  { table: "T1", status: "Awaiting drinks", guests: 2, items: [{ name: "Mango Shake", qty: 2 }] },
  { table: "T3", status: "Serve mains", guests: 3, items: [{ name: "Spicy Burger", qty: 2 }, { name: "Caesar Salad", qty: 1 }] },
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
          <h2 className="text-3xl font-bold text-gray-900">Explore the product</h2>
          <p className="text-gray-600">Switch between panels to preview the experience for every role — customer, waiter, kitchen, manager and integrations.</p>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <Tabs defaultValue="customer" className="w-full">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <TabsList className="bg-[hsl(var(--muted))] rounded-md p-1 flex gap-2 overflow-x-auto no-scrollbar">
                  <TabsTrigger value="customer" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Customer</TabsTrigger>
                  <TabsTrigger value="waiter" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Waiter</TabsTrigger>
                  <TabsTrigger value="kitchen" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Kitchen</TabsTrigger>
                  <TabsTrigger value="manager" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Manager</TabsTrigger>
                  <TabsTrigger value="journey" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Customer Journey</TabsTrigger>
                  <TabsTrigger value="why" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Why POSRMS</TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Analytics</TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Reports</TabsTrigger>
                  <TabsTrigger value="integrations" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">Integrations</TabsTrigger>
                </TabsList>
              </div>

              <div className="hidden">
                <Link to="/order?token=QR-T1">
                  <Button size="sm">Open Customer Demo</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" variant="outline">Open Staff Demo</Button>
                </Link>
              </div>
            </div>

            <TabsContent value="customer" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <img src="/demos/customer.svg" alt="Customer demo" className="w-full h-96 object-cover rounded-md" />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Menu</div>
                      <div className="max-h-72 overflow-auto pr-1 space-y-4">
                        {demoMenu.map((cat) => (
                          <div key={cat.category}>
                            <div className="text-xs uppercase tracking-wide text-gray-500">{cat.category}</div>
                            <ul className="mt-1 space-y-2">
                              {cat.items.map((it) => (
                                <li key={it.name} className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{it.name}</div>
                                    {it.desc ? <div className="text-xs text-gray-500">{it.desc}</div> : null}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold">${it.price.toFixed(2)}</div>
                                    <Button size="sm" variant="outline">Add</Button>
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
                  <img src="/demos/waiter.svg" alt="Waiter demo" className="w-full h-96 object-cover rounded-md" />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Open Tables</div>
                      <ul className="text-sm text-gray-600 space-y-3">
                        {waiterTables.map((t) => (
                          <li key={t.table}>
                            <div className="flex justify-between font-medium text-gray-900"> <span>{t.table} • {t.guests} guests</span> <span>{t.status}</span></div>
                            <ul className="mt-1 text-xs text-gray-600 space-y-1">
                              {t.items.map((it) => (
                                <li key={it.name} className="flex justify-between"> <span>{it.qty}x {it.name}</span> <span></span></li>
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
                  <img src="/demos/kitchen.svg" alt="Kitchen demo" className="w-full h-96 object-cover rounded-md" />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Capacity</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><div className="text-gray-500">Stations</div><div className="font-semibold">4</div></div>
                        <div><div className="text-gray-500">Active</div><div className="font-semibold">3</div></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manager" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <iframe src="/manager" title="Manager demo" className="w-full h-96 border-0 rounded-md" />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Today</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><div className="text-gray-500">Revenue</div><div className="font-semibold">$1,980</div></div>
                        <div><div className="text-gray-500">Orders</div><div className="font-semibold">124</div></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="journey" className="mt-6">
              <div className="grid lg:grid-cols-6 gap-4 items-center text-center">
                <div className="col-span-6 lg:col-span-5 lg:col-start-2">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="flex flex-col items-center gap-2">
                      <img src="/demos/qr-scan.svg" alt="scan" className="h-24 w-24 rounded-lg shadow-md" />
                      <div className="font-semibold text-[hsl(var(--primary))]">Scan</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">Customer scans QR and opens the menu</div>
                    </div>

                    <div className="hidden md:block text-[hsl(var(--primary))] font-bold text-2xl">→</div>

                    <div className="flex flex-col items-center gap-2">
                      <img src="/demos/customer.svg" alt="order" className="h-24 w-24 rounded-lg shadow-md" />
                      <div className="font-semibold text-[hsl(var(--primary))]">Order</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">Customer selects items and submits the order</div>
                    </div>

                    <div className="hidden md:block text-[hsl(var(--primary))] font-bold text-2xl">→</div>

                    <div className="flex flex-col items-center gap-2">
                      <img src="/demos/waiter.svg" alt="waiter" className="h-24 w-24 rounded-lg shadow-md" />
                      <div className="font-semibold text-[hsl(var(--primary))]">Notify Waiter</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">Waiter sees table order and delivers drinks</div>
                    </div>

                    <div className="hidden md:block text-[hsl(var(--primary))] font-bold text-2xl">→</div>

                    <div className="flex flex-col items-center gap-2">
                      <img src="/demos/kitchen.svg" alt="kitchen" className="h-24 w-24 rounded-lg shadow-md" />
                      <div className="font-semibold text-[hsl(var(--primary))]">Kitchen</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">Kitchen prepares mains, bar prepares drinks</div>
                    </div>

                    <div className="hidden md:block text-[hsl(var(--primary))] font-bold text-2xl">→</div>

                    <div className="flex flex-col items-center gap-2">
                      <img src="/demos/bar.svg" alt="bar" className="h-24 w-24 rounded-lg shadow-md" />
                      <div className="font-semibold text-[hsl(var(--primary))]">Bar</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">Bar handles beverage orders</div>
                    </div>

                    <div className="hidden md:block text-[hsl(var(--primary))] font-bold text-2xl">→</div>

                    <div className="flex flex-col items-center gap-2">
                      <img src="/demos/manager.svg" alt="manager" className="h-24 w-24 rounded-lg shadow-md" />
                      <div className="font-semibold text-[hsl(var(--primary))]">Manager</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">Manager sees sales and order completion in analytics</div>
                    </div>

                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="why" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white p-6">
                  <h3 className="text-xl font-semibold">Why choose POSRMS?</h3>
                  <p className="text-sm text-gray-600 mt-2">We solve the common restaurant problems: slow order routing, misplaced tickets, fragmented payments, and lack of clear analytics. POSRMS unifies customer ordering, waiter routing, kitchen prep, bar fulfillment and manager reporting into a single real-time platform.</p>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">Reduce errors</div>
                      <div className="text-xs text-gray-500">Digital orders go straight to kitchen and bar ��� no handwritten tickets.</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">Faster service</div>
                      <div className="text-xs text-gray-500">QR ordering and instant staff alerts shorten table turnaround.</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">Unified payments</div>
                      <div className="text-xs text-gray-500">Track and confirm payments from any POS or device.</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">Actionable analytics</div>
                      <div className="text-xs text-gray-500">Real-time dashboards for revenue, top items, and staff efficiency.</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">How we fix it</div>
                      <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-2">
                        <li>Implement QR ordering to capture customer orders directly to the system.</li>
                        <li>Route orders to waiter, kitchen, and bar via WebSocket notifications.</li>
                        <li>Centralize payments, receipts, and manager reporting.</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white">
                  <img src="/demos/analytics.svg" alt="Analytics" className="w-full h-auto" />
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Live Dashboard</div>
                      <p className="text-sm text-gray-600">Real-time sales, conversion and table throughput. Filter by day, service, or item.</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Top Items</div>
                      <ul className="text-sm text-gray-600">
                        {topItems.map((t) => (
                          <li key={t.name} className="flex justify-between"> <span>{t.name}</span> <span className="font-semibold">{t.sales}</span> </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">Automated reports</h3>
                    <p className="text-sm text-gray-600 mt-2">Daily and weekly summary PDFs, exportable CSVs, and scheduled email reports for managers and accountants.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Custom Exports</div>
                      <p className="text-sm text-gray-600">Generate detailed exports for reconciliation and payroll.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-white p-6">
                  <h3 className="text-xl font-semibold">Integrations</h3>
                  <p className="text-sm text-gray-600 mt-2">Connect payments, accounting, delivery platforms and hardware: Stripe, Xero, local printers and kitchen displays.</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <img src="/demos/pos-photo1.svg" alt="integration 1" className="h-20 w-full object-cover rounded-md shadow-sm" />
                    <img src="/demos/pos-photo2.svg" alt="integration 2" className="h-20 w-full object-cover rounded-md shadow-sm" />
                    <img src="/demos/manager.svg" alt="integration 3" className="h-20 w-full object-cover rounded-md shadow-sm" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">API & Webhooks</div>
                      <p className="text-sm text-gray-600">Secure API endpoints and webhook events so you can integrate POSRMS with your stack.</p>
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
