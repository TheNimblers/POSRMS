import React from "react";

export default function Gallery() {
  return (
    <section className="py-12 bg-gradient-to-b from-[hsl(var(--secondary))] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border-2 border-[hsl(var(--primary))] shadow-lg p-6 bg-white">
          <h3 className="text-xl font-semibold text-[hsl(var(--primary))] mb-4 text-center">
            Product photos & maps
          </h3>
          <div className="max-w-4xl mx-auto">
            <img
              src="/demos/journey.svg"
              alt="Customer journey"
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
            <div className="mt-4 text-gray-700 leading-relaxed">
              <p className="mb-2">
                The customer journey visual shows how POSRMS connects every role
                from discovery to payment:
              </p>
              <ol className="list-decimal ml-6 space-y-2 text-sm">
                <li>
                  <strong>Scan</strong> — Customer scans a QR code or opens the
                  shared link and sees the menu instantly.
                </li>
                <li>
                  <strong>Order</strong> — Customer selects items, customises
                  options and places the order in-app.
                </li>
                <li>
                  <strong>Notify Waiter</strong> — The system notifies the
                  assigned waiter with table and order details.
                </li>
                <li>
                  <strong>Kitchen</strong> — Orders are routed to kitchen
                  stations in real-time for preparation.
                </li>
                <li>
                  <strong>Bar</strong> — Beverage items are routed to the bar
                  workflow so drinks are prepared in parallel.
                </li>
                <li>
                  <strong>Manager</strong> — Manager sees order completion and
                  revenue details in live analytics.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
