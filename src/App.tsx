
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VendorRegistration from "./pages/VendorRegistration";
import VendorAuth from "./pages/VendorAuth";
import VendorProfile from "./pages/VendorProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AnalyticsReporting from "./pages/AnalyticsReporting";
import AuditNotifications from "./pages/AuditNotifications";
import PublicVendorDirectory from "./pages/PublicVendorDirectory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vendor-registration" element={<VendorRegistration />} />
          <Route path="/vendor-auth" element={<VendorAuth />} />
          <Route path="/vendor-profile" element={<VendorProfile />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/analytics-reporting" element={<AnalyticsReporting />} />
          <Route path="/audit-notifications" element={<AuditNotifications />} />
          <Route path="/vendors-directory" element={<PublicVendorDirectory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
