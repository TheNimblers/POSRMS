import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
  expectedFeatures?: string[];
}

export default function PlaceholderPage({ title, description, expectedFeatures }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-2xl font-bold text-gray-900">🍽️ POSRMS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Restaurant Login</Button>
              </Link>
              <Link to="/team/login">
                <Button size="sm">POSRMS Owner Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Construction className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              {title}
            </CardTitle>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          </CardHeader>
          <CardContent>
            {expectedFeatures && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Features:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  {expectedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <p className="text-gray-500">
                This page is currently under development. Continue prompting to have me implement the specific functionality for this section.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <Button>
                  Request Implementation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
