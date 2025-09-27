import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-[hsl(var(--primary-foreground))] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-2xl font-bold mb-4">
              <img src="/posrms-logo.svg" alt="POSRMS" className="h-7 w-7" />
              <span className="text-[hsl(var(--primary-foreground))]">
                POSRMS
              </span>
            </div>
            <p className="text-[hsl(var(--primary-foreground))] mb-4 opacity-90">
              The complete restaurant management solution for modern
              establishments.
            </p>
            <div className="flex space-x-3">
              <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm">Contact</button>
              <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm">Docs</button>
              <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm">Support</button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#product" className="hover:text-white">
                  Demo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--primary-foreground))]/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="opacity-90">© 2024 POSRMS. All rights reserved.</p>
          <p className="mt-4 md:mt-0 opacity-80">
            Built for restaurants, by restaurant experts.
          </p>
        </div>
      </div>
    </footer>
  );
}
