import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, Timer, CreditCard, Receipt } from "lucide-react";

export default function Benefits() {
  const items = [
    {
      icon: LayoutGrid,
      title: "Unified Dashboards",
      desc: "Customer, Waiter, Kitchen, Bar, Manager—streamlined into one platform.",
      color: "bg-orange-100 text-orange-700",
    },
    {
      icon: Timer,
      title: "Instant Updates",
      desc: "WebSocket-powered notifications for orders, tables, and payments.",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: CreditCard,
      title: "Seamless Payments",
      desc: "Request and confirm payments with a tap, track bill in real time.",
      color: "bg-purple-100 text-purple-700",
    },
    {
      icon: Receipt,
      title: "Analytics & Insights",
      desc: "Live sales, top items, and utilization—right on your dashboard.",
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">All-in-one, real-time platform</h2>
          <p className="text-gray-600 mt-2">Built for speed, reliability, and delightful UX</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc, color }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
