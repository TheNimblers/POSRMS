import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Details() {
  return (
    <section id="details" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Why POSRMS & How We Help
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            A single platform to manage ordering, staff routing, kitchen prep,
            payments and reporting — designed for modern restaurants.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Reduce errors</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Digital orders go straight to kitchen and bar — no handwritten
                  tickets.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Faster service</h3>
                <p className="text-sm text-gray-600 mt-1">
                  QR ordering and instant staff alerts shorten table turnaround.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Unified payments</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track and confirm payments from any POS or device.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold">Actionable analytics</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Real-time dashboards for revenue, top items, and staff
                  efficiency.
                </p>
              </div>
            </div>

            <div className="mt-4 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold">How we fix it</h3>
              <ol className="text-sm text-gray-600 list-decimal pl-5 mt-2 space-y-2">
                <li>
                  Implement QR ordering to capture customer orders directly to
                  the system.
                </li>
                <li>
                  Route orders to waiter, kitchen, and bar via WebSocket
                  notifications.
                </li>
                <li>Centralize payments, receipts, and manager reporting.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="font-semibold mb-2">Automated reports</div>
                <p className="text-sm text-gray-600">
                  Daily and weekly summary PDFs, exportable CSVs, and scheduled
                  email reports for managers and accountants.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="font-semibold mb-2">Integrations</div>
                <p className="text-sm text-gray-600">
                  Connect payments, accounting, delivery platforms and hardware:
                  Stripe, Xero, local printers and kitchen displays.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="font-semibold mb-2">API & Webhooks</div>
                <p className="text-sm text-gray-600">
                  Secure API endpoints and webhook events so you can integrate
                  POSRMS with your stack.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border-2 border-[hsl(var(--primary))] shadow-lg p-6 bg-white">
          <h3 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4 text-center">
            Customer Journey — step by step
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">1. Scan</h4>
              <p className="text-sm text-gray-600">
                Customer scans a QR or clicks a link and arrives at a fast,
                mobile-first menu — no app required.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">2. Order</h4>
              <p className="text-sm text-gray-600">
                Select items, apply modifiers, split or add notes, then submit
                the order directly from the table.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">3. Notify Waiter</h4>
              <p className="text-sm text-gray-600">
                Waiter receives a notification with table number and order
                summary; accepts or assigns the order.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">4. Kitchen</h4>
              <p className="text-sm text-gray-600">
                Order routed to kitchen stations in real-time, prioritized and
                tagged for prep speed and allergens.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">5. Bar</h4>
              <p className="text-sm text-gray-600">
                Beverages are routed to the bar so drinks and mains can be made
                concurrently for faster service.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">6. Manager</h4>
              <p className="text-sm text-gray-600">
                Manager sees completed orders, payments, and live revenue;
                exportable reports and alerts available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
