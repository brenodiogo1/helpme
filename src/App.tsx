import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";
import Zoeken from "@/pages/Zoeken";
import SchoonmakerProfiel from "@/pages/SchoonmakerProfiel";
import Boeken from "@/pages/Boeken";
import Bevestiging from "@/pages/Bevestiging";
import VoorSchoonmakers from "@/pages/VoorSchoonmakers";
import Login from "@/pages/Login";
import Registreren from "@/pages/Registreren";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import SchoonmakersBeheren from "@/pages/admin/SchoonmakersBeheren";
import BoekingenBeheren from "@/pages/admin/BoekingenBeheren";
import SchoonmakerForm from "@/pages/admin/SchoonmakerForm";
import CleanerLayout from "@/pages/cleaner/CleanerLayout";
import CleanerDashboard from "@/pages/cleaner/CleanerDashboard";
import MijnBoekingen from "@/pages/cleaner/MijnBoekingen";
import CleanerProfiel from "@/pages/cleaner/CleanerProfiel";
import CustomerLayout from "@/pages/customer/CustomerLayout";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import CustomerBookings from "@/pages/customer/CustomerBookings";
import CustomerProfile from "@/pages/customer/CustomerProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/zoeken" element={<Zoeken />} />
            <Route path="/schoonmaker/:id" element={<SchoonmakerProfiel />} />
            <Route path="/boeken/:id" element={<Boeken />} />
            <Route path="/bevestiging" element={<Bevestiging />} />
            <Route path="/voor-schoonmakers" element={<VoorSchoonmakers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registreren" element={<Registreren />} />
          </Route>

          {/* Cleaner Dashboard Routes */}
          <Route path="/dashboard" element={<CleanerLayout />}>
            <Route index element={<CleanerDashboard />} />
            <Route path="boekingen" element={<MijnBoekingen />} />
            <Route path="profiel" element={<CleanerProfiel />} />
          </Route>

          {/* Customer Account Routes */}
          <Route path="/account" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="boekingen" element={<CustomerBookings />} />
            <Route path="profiel" element={<CustomerProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="schoonmakers" element={<SchoonmakersBeheren />} />
            <Route path="schoonmakers/nieuw" element={<SchoonmakerForm />} />
            <Route path="schoonmakers/bewerken/:id" element={<SchoonmakerForm />} />
            <Route path="boekingen" element={<BoekingenBeheren />} />
          </Route>

          {/* Catch-all Route */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;