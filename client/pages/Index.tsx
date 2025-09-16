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
  Clock, 
  CreditCard, 
  Star, 
  Zap,
  Shield,
  Globe,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="flex items-center space-x-2">
                <img src="/posrms-logo.svg" alt="POSRMS" className="h-8 w-8" />
                <span className="text-2xl font-bold text-gray-900">POSRMS</span>
              </span>
            </div>
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
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              POSRMS – Smart Point of Sale &
              <span className="text-blue-600"> Restaurant Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionize your restaurant operations with our complete solution: 
              QR code ordering, real-time kitchen displays, waiter management, 
              analytics dashboard, and seamless customer experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/order?token=QR-T1">
                <Button size="lg" className="text-lg px-8 py-4">
                  Try Customer Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  Staff Demo Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How POSRMS Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From QR code scanning to analytics, streamline every aspect of your restaurant
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Customer Scans QR</h3>
              <p className="text-gray-600">Customers scan table QR codes to access live digital menu</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Live Menu & Ordering</h3>
              <p className="text-gray-600">Real-time menu with prices, specials, and instant ordering</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Waiter Management</h3>
              <p className="text-gray-600">Staff receive notifications and manage table assignments</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Kitchen Display</h3>
              <p className="text-gray-600">Orders appear instantly on kitchen and bar displays</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">5. Seamless Payment</h3>
              <p className="text-gray-600">Integrated payment processing and split bill options</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">6. Analytics Dashboard</h3>
              <p className="text-gray-600">Real-time insights, sales analytics, and performance reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Restaurant Solution</h2>
            <p className="text-lg text-gray-600">
              Every role in your restaurant gets the tools they need to succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-600" />
                  Customer Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• QR code menu access</li>
                  <li>• Live ordering & cart</li>
                  <li>• Call waiter functionality</li>
                  <li>• Payment requests</li>
                  <li>• Rating & reviews</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-green-600" />
                  Waiter Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Active table overview</li>
                  <li>• Order status tracking</li>
                  <li>• Manual order entry</li>
                  <li>• Real-time notifications</li>
                  <li>• Table assignments</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="h-6 w-6 mr-2 text-red-600" />
                  Kitchen & Bar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Separate food/drink displays</li>
                  <li>• Order preparation tracking</li>
                  <li>• Ready notifications</li>
                  <li>• Priority ordering</li>
                  <li>• Kitchen timer integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-purple-600" />
                  Manager Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Menu management</li>
                  <li>• Staff administration</li>
                  <li>• Table & QR generation</li>
                  <li>• Sales analytics</li>
                  <li>• Order history</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-yellow-600" />
                  Admin Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Full system access</li>
                  <li>• Manager management</li>
                  <li>• Advanced analytics</li>
                  <li>• Staff performance</li>
                  <li>• System settings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-6 w-6 mr-2 text-indigo-600" />
                  POSRMS SaaS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Multi-restaurant management</li>
                  <li>• Subscription billing</li>
                  <li>• White-label support</li>
                  <li>• Central analytics</li>
                  <li>• Restaurant onboarding</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Choose the plan that fits your restaurant's needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold">Trial</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">Free</div>
                  <div className="text-gray-600">14 days</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Up to 5 tables</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Basic menu management</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />2 staff accounts</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Email support</li>
                </ul>
                <Button className="w-full mt-6">Start Free Trial</Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-500">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold">Monthly</div>
                  <div className="text-4xl font-bold text-blue-600 mt-2">$99</div>
                  <div className="text-gray-600">per month</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Unlimited tables</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Advanced analytics</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Unlimited staff</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Priority support</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Payment processing</li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
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
                <ul className="space-y-3">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Everything in Monthly</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />White-label option</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Custom integrations</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Dedicated support</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-600 mr-2" />Training included</li>
                </ul>
                <Button className="w-full mt-6" variant="outline">Choose Yearly</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Demo Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50/60 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Experience the Customer Panel</h2>
              <p className="text-gray-600 mb-6">Open the demo menu, add items to cart, call a waiter, and request payment. All actions update staff panels in real-time.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/order?token=QR-T1">
                  <Button size="lg">Open Customer Demo</Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">Open Staff Demo</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">Tip: Share this link on mobile to simulate scanning a table QR: <span className="font-mono">/order?token=QR-T1</span></p>
            </div>
            <div>
              <div className="rounded-xl border bg-white shadow-sm p-4">
                <div className="h-56 bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-16 w-16 text-blue-600" />
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold">Customer Ordering</h3>
                  <p className="text-sm text-gray-600">Beautiful, responsive menu with live pricing, currency switch, and cart.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See POSRMS in Action</h2>
            <p className="text-lg text-gray-600">
              Experience the power of our restaurant management system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <Smartphone className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Customer Menu</h3>
                <p className="text-gray-600">Interactive QR code menu with live pricing and instant ordering</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-green-100 to-green-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Waiter Dashboard</h3>
                <p className="text-gray-600">Real-time table management and order tracking interface</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Comprehensive insights and performance metrics</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real-time Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Features</h2>
            <p className="text-lg text-gray-600">
              Keep your restaurant running smoothly with instant updates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Live Notifications</h3>
                <p className="text-gray-600 text-sm">Instant alerts for new orders, table requests, and payments</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Order Sync</h3>
                <p className="text-gray-600 text-sm">Real-time order status updates across all devices</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Offline Support</h3>
                <p className="text-gray-600 text-sm">Orders cached locally and synced when connection returns</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-gray-600 text-sm">Integrated with Stripe, PayPal, and Mollie for safe transactions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 text-2xl font-bold mb-4">
                <img src="/posrms-logo.svg" alt="POSRMS" className="h-7 w-7" />
                <span>POSRMS</span>
              </div>
              <p className="text-gray-400 mb-4">
                The complete restaurant management solution for modern establishments.
              </p>
              <div className="flex space-x-4">
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

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 POSRMS. All rights reserved.</p>
            <p className="text-gray-400 mt-4 md:mt-0">
              Built for restaurants, by restaurant experts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
