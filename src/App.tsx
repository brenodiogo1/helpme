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
import RegistrerenKlant from "@/pages/RegistrerenKlant";
import RegistrerenSchoonmaker from "@/pages/RegistrerenSchoonmaker";
import CustomersBeheren from "./pages/admin/CustomersBeheren";
import SubscriptionsBeheren from "./pages/admin/SubscriptionsBeheren";
import AdminSettings from "./pages/admin/AdminSettings";
import CleanerAvailability from "./pages/cleaner/CleanerAvailability";
import CleanerEarnings from "./pages/cleaner/CleanerEarnings";
import CleanerSubscription from "./pages/cleaner/CleanerSubscription";
import CleanerSettings from "./pages/cleaner/CleanerSettings";
import CustomerPayment from "./pages/customer/CustomerPayment";
import CustomerAddresses from "./pages/customer/CustomerAddresses";
import CustomerSettings from "./pages/customer/CustomerSettings";
import FavoriteCleaners from "./pages/customer/FavoriteCleaners";
import MyReviews from "./pages/cleaner/MyReviews";
import OverOns from "./pages/legal/OverOns";
import Pers from "./pages/legal/Pers";
import Carriere from "./pages/legal/Carriere";
import Prijzen from "./pages/legal/Prijzen";
import FAQ from "./pages/legal/FAQ";
import SchoonmakerFAQ from "./pages/legal/SchoonmakerFAQ";
import AlgemeneVoorwaarden from "./pages/legal/AlgemeneVoorwaarden";
import Privacybeleid from "./pages/legal/Privacybeleid";
import Cookiebeleid from "./pages/legal/Cookiebeleid";
import PayoutSettings from "./pages/cleaner/PayoutSettings";
import PayoutsBeheren from "./pages/admin/PayoutsBeheren";
import CleanerChat from "./pages/cleaner/CleanerChat";
import CustomerChat from "./pages/customer/CustomerChat";
import AdminChat from "./pages/admin/AdminChat";
import CleanerProvider from "./pages/cleaner/CleanerProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useEffect } from "react";
import MijnTaken from "./pages/cleaner/MijnTaken";
// import QuickBooking from "./pages/admin/QuickBooking"; // Remover importação se não for mais usada aqui

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.log("VITE_GOOGLE_MAPS_API_KEY is set.");
    }
    if (import.meta.env.VITE_SUPABASE_URL) {
      console.log("VITE_SUPABASE_URL is set.");
    }
    if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log("VITE_SUPABASE_ANON_KEY is set.");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SettingsProvider>
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
                <Route path="/registreren/klant" element={<RegistrerenKlant />} />
                <Route path="/registreren/schoonmaker" element={<RegistrerenSchoonmaker />} />
                {/* Legal Pages */}
                <Route path="/over-ons" element={<OverOns />} />
                <Route path="/pers" element={<Pers />} />
                <Route path="/carriere" element={<Carriere />} />
                <Route path="/prijzen" element={<Prijzen />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/schoonmaker-faq" element={<SchoonmakerFAQ />} />
                <Route path="/algemene-voorwaarden" element={<AlgemeneVoorwaarden />} />
                <Route path="/privacybeleid" element={<Privacybeleid />} />
                <Route path="/cookiebeleid" element={<Cookiebeleid />} />
              </Route>

              {/* Cleaner Dashboard Routes */}
              <Route path="/dashboard" element={<CleanerLayout />}>
                <Route index element={<CleanerDashboard />} />
                <Route path="taken" element={<MijnTaken />} />
                <Route path="boekingen" element={<MijnBoekingen />} />
                <Route path="profiel" element={<CleanerProfiel />} />
                <Route path="beschikbaarheid" element={<CleanerAvailability />} />
                <Route path="inkomsten" element={<CleanerEarnings />} />
                <Route path="uitbetalingen" element={<PayoutSettings />} />
                <Route path="recensies" element={<MyReviews />} />
                <Route path="abonnement" element={<CleanerSubscription />} />
                <Route path="provedor" element={<CleanerProvider />} />
                <Route path="instellingen" element={<CleanerSettings />} />
                <Route path="chat" element={<CleanerChat />} />
              </Route>

              {/* Customer Account Routes */}
              <Route path="/account" element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="boekingen" element={<CustomerBookings />} />
                <Route path="profiel" element={<CustomerProfile />} />
                <Route path="favorieten" element={<FavoriteCleaners />} />
                <Route path="betaalmethoden" element={<CustomerPayment />} />
                <Route path="adressen" element={<CustomerAddresses />} />
                <Route path="instellingen" element={<CustomerSettings />} />
                <Route path="chat" element={<CustomerChat />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="schoonmakers" element={<SchoonmakersBeheren />} />
                <Route path="schoonmakers/nieuw" element={<SchoonmakerForm />} />
                <Route path="schoonmakers/bewerken/:id" element={<SchoonmakerForm />} />
                <Route path="klanten" element={<CustomersBeheren />} />
                <Route path="boekingen" element={<BoekingenBeheren />} />
                <Route path="uitbetalingen" element={<PayoutsBeheren />} />
                <Route path="abonnementen" element={<SubscriptionsBeheren />} />
                <Route path="instellingen" element={<AdminSettings />} />
                <Route path="chat" element={<AdminChat />} />
                {/* <Route path="quick-booking" element={<QuickBooking />} /> */} {/* Rota removida */}
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
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;