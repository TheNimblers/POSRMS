import React from "react";
import { ArrowRight, Sparkles, Server, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-[hsl(var(--accent))]/25 to-[hsl(var(--primary))]/18 blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[hsl(var(--primary))]/18 to-[hsl(var(--accent))]/16 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              Run your restaurant on one platform — faster, smarter, simpler
            </h1>

            <p className="mt-5 text-lg text-gray-700 max-w-xl">
              POSRMS brings QR ordering, live kitchen updates, staff routing,
              secure payments, and actionable analytics all in a single elegant
              system. Reduce errors, speed service, and increase revenue with an
              enterprise-grade POS built for restaurants.
            </p>

            <ul className="mt-6 space-y-2 text-gray-600 max-w-xl">
              <li className="flex items-start gap-3">
                <Server className="h-5 w-5 text-[hsl(var(--primary))] mt-1" />
                <span>
                  <strong>Reliable real-time</strong> updates across customer,
                  kitchen and waitstaff dashboards.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <BarChart2 className="h-5 w-5 text-[hsl(var(--accent))] mt-1" />
                <span>
                  <strong>Instant insights</strong> — sales, popular items and
                  table throughput at a glance.
                </span>
              </li>
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/order?token=QR-T1">
                <Button size="lg" className="text-lg px-8">
                  Try Customer Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Staff Demo Login
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-lg p-4">
              <div className="aspect-video rounded-xl overflow-hidden border bg-white grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="col-span-1 p-4 flex items-center justify-center bg-[hsl(var(--muted))]">
                  <img
                    src="/demos/qr-scan.svg"
                    alt="QR scan demo"
                    className="w-full h-auto rounded-md shadow-md"
                  />
                </div>
                <div className="col-span-1 p-4 flex flex-col gap-2">
                  <img
                    src="/demos/customer.svg"
                    alt="Customer ordering"
                    className="w-full h-14 object-cover rounded-md shadow-sm"
                  />
                  <img
                    src="/demos/waiter.svg"
                    alt="Waiter view"
                    className="w-full h-14 object-cover rounded-md shadow-sm"
                  />
                  <img
                    src="/demos/kitchen.svg"
                    alt="Kitchen panel"
                    className="w-full h-14 object-cover rounded-md shadow-sm"
                  />
                  <img
                    src="/demos/bar.svg"
                    alt="Bar panel"
                    className="w-full h-14 object-cover rounded-md shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="rounded-md border p-3 text-center">
                  <div className="text-xs text-gray-500">Avg Order</div>
                  <div className="font-semibold">$24.80</div>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <div className="text-xs text-gray-500">Active Tables</div>
                  <div className="font-semibold">12</div>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <div className="text-xs text-gray-500">Requests</div>
                  <div className="font-semibold">3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
