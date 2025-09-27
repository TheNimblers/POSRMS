import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-emerald-900">
            POS RMS Pricing Packages
          </h2>
          <p className="mt-3 text-lg text-emerald-700 max-w-2xl mx-auto">
            All plans include the lowest transaction fee in the Netherlands at just
            <span className="font-semibold"> 1.9%</span>. Choose the plan that
            fits your restaurant — scale anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Feast */}
          <Card className="relative shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-xl font-semibold text-emerald-800">Starter Feast</div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2">€0</div>
                <div className="text-sm text-emerald-700">14-day full experience</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-emerald-700">
                <li>• Up to 5 tables</li>
                <li>• Basic analytics dashboard</li>
                <li>• 2 staff accounts</li>
                <li>• Email support</li>
              </ul>
              <Link to="/login">
                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Growth Grill - Most Popular */}
          <Card className="relative border-2 border-emerald-500 shadow-2xl">
            <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white">
              Most Popular — Best Value
            </Badge>
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-xl font-semibold text-emerald-900">Growth Grill</div>
                <div className="text-3xl font-extrabold text-emerald-700 mt-2">€199</div>
                <div className="text-sm text-emerald-600">per month</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-emerald-700">
                <li>• 35 Tables included (additional €3.50 / table)</li>
                <li>• Advanced analytics with live sales & top items</li>
                <li>• Unlimited staff accounts</li>
                <li>• Priority phone & email support</li>
                <li>• Real-time kitchen & waiter alerts</li>
              </ul>
              <Link to="/login">
                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white">Get Growth Grill</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise Empire */}
          <Card className="relative shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-xl font-semibold text-emerald-800">Enterprise Empire</div>
                <div className="text-3xl font-extrabold text-emerald-700 mt-2">€1,990</div>
                <div className="text-sm text-emerald-600">per year — save €398</div>
                <div className="text-xs text-emerald-500 mt-1">(50 Tables included, additional €2.90 / table)</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-emerald-700">
                <li>• Everything in Growth Grill</li>
                <li>• White-label option (own branding)</li>
                <li>• Custom integrations & dedicated account manager</li>
                <li>• Best value for chains & high-volume restaurants</li>
              </ul>
              <Link to="/login">
                <Button className="w-full mt-6" variant="outline">Contact Sales</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center text-emerald-700">
          <h3 className="text-lg font-semibold">Why Choose POS RMS?</h3>
          <p className="max-w-3xl mx-auto mt-2">
            All-Inclusive Pricing, Lowest Fees (1.9%), Powerful Analytics, and Simple
            Scaling — upgrade or downgrade anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
