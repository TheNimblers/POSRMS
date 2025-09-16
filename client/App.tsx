import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Order from "./pages/Order";
import Login from "./pages/Login";
import Waiter from "./pages/Waiter";
import Kitchen from "./pages/Kitchen";
import Bar from "./pages/Bar";
import Manager from "./pages/Manager";
import Admin from "./pages/Admin";
import TeamLogin from "./pages/team/Login";
import TeamDashboard from "./pages/team/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Customer Flow */}
            <Route path="/order" element={<Order />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />

            {/* Staff Dashboards */}
            <Route path="/waiter" element={<Waiter />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/bar" element={<Bar />} />

            {/* Management Dashboards */}
            <Route path="/manager" element={<Manager />} />
            <Route path="/admin" element={<Admin />} />

            {/* POSRMS Team (SaaS) */}
            <Route path="/team/login" element={<TeamLogin />} />
            <Route path="/team" element={<TeamDashboard />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
