import { Button } from "@/components/ui/button";
import { Shield, QrCode, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

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
            <div className="inline-flex items-center rounded-full border bg-white/60 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow-sm mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-orange-600" /> Live
              customer demo available
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              Run your restaurant on one platform
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-xl">
              QR ordering, real‑time kitchen, waiter alerts, payments, and
              analytics—integrated and lightning fast.
            </p>
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
            <div className="mt-6 flex items-center text-sm text-gray-500 gap-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4" /> Scan-free link:
                /order?token=QR-T1
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Shield className="h-4 w-4" /> Role-based dashboards
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-lg p-4">
              <div className="aspect-video rounded-xl overflow-hidden border bg-white">
                <img
                  src="/demos/customer.svg"
                  alt="Customer preview"
                  className="w-full h-auto"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-gray-500">Avg Order</div>
                  <div className="font-semibold">$24.80</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-gray-500">Active Tables</div>
                  <div className="font-semibold">12</div>
                </div>
                <div className="rounded-md border p-3">
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
