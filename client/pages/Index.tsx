import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  ChefHat,
  BarChart3,
  Smartphone,
  QrCode,
  CreditCard,
  Star,
  Zap,
  Shield,
  Globe,
  Check,
  Sparkles,
  LayoutGrid,
  Timer,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/posrms-logo.svg" alt="POSRMS" className="h-8 w-8" />
              <span className="text-2xl font-bold text-gray-900">POSRMS</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/order?token=QR-T1">
                <Button variant="secondary">Customer Demo</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Restaurant Login</Button>
              </Link>
              <Link to="/team/login">
                <Button>POSRMS Owner Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border bg-white/60 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow-sm mb-4">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> Live customer demo available
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                Modern Restaurant OS
              </h1>
              <p className="mt-5 text-lg text-gray-600 max-w-xl">
                QR ordering, real‑time kitchen, waiter alerts, payments, and analytics — beautifully integrated and lightning fast.
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
                <div className="flex items-center gap-2"><QrCode className="h-4 w-4" /> Scan-free link: /order?token=QR-T1</div>
                <div className="hidden sm:flex items-center gap-2"><Shield className="h-4 w-4" /> Role-based dashboards</div>
              </div>
            </div>
            <div>
              <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-lg p-4">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
                  <Smartphone className="h-20 w-20 text-blue-600" />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <Card className="border-l-4 border-l-blue-500"><CardContent className="p-3 text-sm">Customer Menu</CardContent></Card>
                  <Card className="border-l-4 border-l-green-500"><CardContent className="p-3 text-sm">Waiter</CardContent></Card>
                  <Card className="border-l-4 border-l-purple-500"><CardContent className="p-3 text-sm">Manager</CardContent></Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">All-in-one, real-time platform</h2>
            <p className="text-gray-600 mt-2">Built for speed, reliability, and delightful UX</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3"><LayoutGrid className="h-5 w-5" /></div>
                <h3 className="font-semibold">Unified Dashboards</h3>
                <p className="text-sm text-gray-600 mt-1">Customer, Waiter, Kitchen, Bar, Manager — all streamlined.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-3"><Timer className="h-5 w-5" /></div>
                <h3 className="font-semibold">Instant Updates</h3>
                <p className="text-sm text-gray-600 mt-1">WebSocket-powered notifications for orders, tables, and payments.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3"><CreditCard className="h-5 w-5" /></div>
                <h3 className="font-semibold">Seamless Payments</h3>
                <p className="text-sm text-gray-600 mt-1">Request and confirm payments with a tap, track bill in real-time.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3"><Receipt className="h-5 w-5" /></div>
                <h3 className="font-semibold">Analytics & Insights</h3>
                <p className="text-sm text-gray-600 mt-1">Live sales, top items, utilization — right on your dashboard.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Demo CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="text-sm text-gray-500 mb-2">Live demo</div>
              <h3 className="text-2xl font-bold mb-2">Experience the Customer Panel</h3>
              <p className="text-gray-600">Open the demo, add items, call a waiter, and request payment. Your bill updates in real-time until staff marks it paid.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/order?token=QR-T1"><Button>Open Customer Demo</Button></Link>
                <Link to="/login"><Button variant="outline">Open Staff Demo</Button></Link>
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h4 className="font-semibold mb-2">Roles supported</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Waiter</div>
                <div className="flex items-center gap-2"><ChefHat className="h-4 w-4 text-red-600" /> Kitchen</div>
                <div className="flex items-center gap-2"><CoffeeIcon /> Bar</div>
                <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-600" /> Manager</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="text-gray-600">Start with a free trial — upgrade anytime</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold">Trial</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">Free</div>
                  <div className="text-gray-600">14 days</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Up to 5 tables</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Basic menu</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />2 staff accounts</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Email support</li>
                </ul>
                <Link to="/login"><Button className="w-full mt-6">Start Free Trial</Button></Link>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-500">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">Most Popular</Badge>
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold">Monthly</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">$99</div>
                  <div className="text-gray-600">per month</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Unlimited tables</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Advanced analytics</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Unlimited staff</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Priority support</li>
                </ul>
                <Link to="/login"><Button className="w-full mt-6">Get Started</Button></Link>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold">Yearly</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">$990</div>
                  <div className="text-gray-600">per year</div>
                  <Badge variant="secondary" className="mt-2">Save 17%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Everything in Monthly</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />White‑label option</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Custom integrations</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Dedicated support</li>
                </ul>
                <Link to="/login"><Button className="w-full mt-6" variant="outline">Choose Yearly</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Loved by modern restaurants</h2>
            <p className="text-gray-600">Fast setup, intuitive workflows, real results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6 text-gray-700">
                “POSRMS cut our order wait-times by 30% and boosted table turns.”
                <div className="mt-3 text-sm text-gray-500">— Coastal Bistro</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6 text-gray-700">
                “Staff learned it in a day. The customer menu is gorgeous on mobile.”
                <div className="mt-3 text-sm text-gray-500">— Urban Grill</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6 text-gray-700">
                “Finally, a single system that connects customers, waiters, and kitchen.”
                <div className="mt-3 text-sm text-gray-500">— Golden Spoon</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 text-2xl font-bold mb-4">
                <img src="/posrms-logo.svg" alt="POSRMS" className="h-7 w-7" />
                <span>POSRMS</span>
              </div>
              <p className="text-gray-400 mb-4">The complete restaurant management solution for modern establishments.</p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">Contact</Button>
                <Button variant="outline" size="sm">Docs</Button>
                <Button variant="outline" size="sm">Support</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 POSRMS. All rights reserved.</p>
            <p className="text-gray-400 mt-4 md:mt-0">Built for restaurants, by restaurant experts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CoffeeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600"><path d="M3 8h14a4 4 0 010 8h-1a6 6 0 01-12 0V8z" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8V6a3 3 0 013-3h3" stroke="currentColor" strokeWidth="1.5"/></svg>
  );
}
