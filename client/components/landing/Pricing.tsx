import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 bg-gray-50">
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
                <div className="text-4xl font-bold text-orange-600 mt-2">Free</div>
                <div className="text-gray-600">14 days</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">• Up to 5 tables</li>
                <li className="flex items-center">• Basic menu</li>
                <li className="flex items-center">• 2 staff accounts</li>
                <li className="flex items-center">• Email support</li>
              </ul>
              <Link to="/login"><Button className="w-full mt-6">Start Free Trial</Button></Link>
            </CardContent>
          </Card>

          <Card className="relative border-2 border-orange-500">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500">Most Popular</Badge>
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-2xl font-bold">Monthly</div>
                <div className="text-4xl font-bold text-orange-600 mt-2">$99</div>
                <div className="text-gray-600">per month</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">• Unlimited tables</li>
                <li className="flex items-center">• Advanced analytics</li>
                <li className="flex items-center">• Unlimited staff</li>
                <li className="flex items-center">• Priority support</li>
              </ul>
              <Link to="/login"><Button className="w-full mt-6">Get Started</Button></Link>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-2xl font-bold">Yearly</div>
                <div className="text-4xl font-bold text-orange-600 mt-2">$990</div>
                <div className="text-gray-600">per year</div>
                <Badge variant="secondary" className="mt-2">Save 17%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">• Everything in Monthly</li>
                <li className="flex items-center">• White‑label option</li>
                <li className="flex items-center">• Custom integrations</li>
                <li className="flex items-center">• Dedicated support</li>
              </ul>
              <Link to="/login"><Button className="w-full mt-6" variant="outline">Choose Yearly</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
