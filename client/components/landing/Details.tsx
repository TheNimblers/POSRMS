import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Details() {
  return (
    <section id="details" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Why POSRMS & How We Help</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">A single platform to manage ordering, staff routing, kitchen prep, payments and reporting — designed for modern restaurants.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Reduce errors</h3>
                <p className="text-sm text-gray-600 mt-1">Digital orders go straight to kitchen and bar — no handwritten tickets.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Faster service</h3>
                <p className="text-sm text-gray-600 mt-1">QR ordering and instant staff alerts shorten table turnaround.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Unified payments</h3>
                <p className="text-sm text-gray-600 mt-1">Track and confirm payments from any POS or device.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Actionable analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Real-time dashboards for revenue, top items, and staff efficiency.</p>
              </div>
            </div>

            <div className="mt-4 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold">How we fix it</h3>
              <ol className="text-sm text-gray-600 list-decimal pl-5 mt-2 space-y-2">
                <li>Implement QR ordering to capture customer orders directly to the system.</li>
                <li>Route orders to waiter, kitchen, and bar via WebSocket notifications.</li>
                <li>Centralize payments, receipts, and manager reporting.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="font-semibold mb-2">Automated reports</div>
                <p className="text-sm text-gray-600">Daily and weekly summary PDFs, exportable CSVs, and scheduled email reports for managers and accountants.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="font-semibold mb-2">Integrations</div>
                <p className="text-sm text-gray-600">Connect payments, accounting, delivery platforms and hardware: Stripe, Xero, local printers and kitchen displays.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="font-semibold mb-2">API & Webhooks</div>
                <p className="text-sm text-gray-600">Secure API endpoints and webhook events so you can integrate POSRMS with your stack.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border-2 border-[hsl(var(--primary))] shadow-lg p-6 bg-white">
          <h3 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4 text-center">Customer Journey Snapshot</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <img src="/demos/qr-scan.svg" alt="QR scan" className="w-40 rounded-lg shadow-sm" />
            <img src="/demos/customer.svg" alt="Customer ordering" className="w-40 rounded-lg shadow-sm" />
            <img src="/demos/waiter.svg" alt="Waiter" className="w-40 rounded-lg shadow-sm" />
            <img src="/demos/kitchen.svg" alt="Kitchen" className="w-40 rounded-lg shadow-sm" />
            <img src="/demos/bar.svg" alt="Bar" className="w-40 rounded-lg shadow-sm" />
            <img src="/demos/manager.svg" alt="Manager" className="w-40 rounded-lg shadow-sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
