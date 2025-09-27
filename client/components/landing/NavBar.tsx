import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-[color:var(--primary-foreground)]/6 backdrop-blur border-b border-[hsl(var(--border))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/posrms-logo.svg" alt="POSRMS" className="h-8 w-8" />
            <span className="text-2xl font-bold text-[hsl(var(--primary))]">POSRMS</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#features" className="hover:text-gray-900">
              Features
            </a>
            <a href="#product" className="hover:text-gray-900">
              Product
            </a>
            <a href="#pricing" className="hover:text-gray-900">
              Pricing
            </a>
            <a href="#testimonials" className="hover:text-gray-900">
              Stories
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/order?token=QR-T1">
              <Button variant="secondary">Customer Demo</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Restaurant Login</Button>
            </Link>
            <Link to="/team/login">
              <Button>POS RMS Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
