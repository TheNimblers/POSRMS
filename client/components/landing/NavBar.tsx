import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/branding";

export default function NavBar() {
  return (
    <nav className="bg-[color:var(--primary-foreground)]/6 backdrop-blur border-b border-[hsl(var(--border))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src={LOGO_URL} alt="POSRMS" className="h-10 w-10 rounded-md" />
            <span className="text-lg font-bold text-[hsl(var(--accent))]">
              POSRMS
            </span>
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
            <a href="#product">
              <Button size="sm" variant="secondary">
                Product
              </Button>
            </a>

            <Link to="/login">
              <Button size="sm" variant="outline">
                Staff
              </Button>
            </Link>

            <Link to="/team/login">
              <Button size="sm">Admin</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
