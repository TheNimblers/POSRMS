import React from "react";
import { LayoutGrid, Timer, CreditCard, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Benefits() {
  const items = [
    {
      icon: LayoutGrid,
      title: "Unified Dashboards",
      desc: "Customer, Waiter, Kitchen, Bar, Manager—streamlined into one platform.",
      bg: "bg-[hsl(var(--primary))]",
      fg: "text-[hsl(var(--primary-foreground))]",
    },
    {
      icon: Timer,
      title: "Instant Updates",
      desc: "WebSocket-powered notifications for orders, tables, and payments.",
      bg: "bg-[hsl(var(--accent))]",
      fg: "text-[hsl(var(--accent-foreground))]",
    },
    {
      icon: CreditCard,
      title: "Seamless Payments",
      desc: "Request and confirm payments with a tap, track bill in real time.",
      bg: "bg-[hsl(var(--primary))]",
      fg: "text-[hsl(var(--primary-foreground))]",
    },
    {
      icon: Receipt,
      title: "Analytics & Insights",
      desc: "Live sales, top items, and utilization—right on your dashboard.",
      bg: "bg-[hsl(var(--accent))]",
      fg: "text-[hsl(var(--accent-foreground))]",
    },
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">All-in-one, real-time platform</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Built for speed, reliability and delightful UX — POSRMS gives you the control to run service, payments and reporting without the overhead.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc, bg, fg }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${bg} ${fg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
