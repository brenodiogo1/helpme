import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Zoeken from "./pages/Zoeken";
import SchoonmakerProfiel from "./pages/SchoonmakerProfiel";
import Boeken from "./pages/Boeken";
import Bevestiging from "./pages/Bevestiging";
import VoorSchoonmakers from "./pages/VoorSchoonmakers";
import Login from "./pages/Login";
import Registreren from "./pages/Registreren";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/zoeken" element={<Zoeken />} />
            <Route path="/schoonmaker/:id" element={<SchoonmakerProfiel />} />
            <Route path="/boeken/:id" element={<Boeken />} />
            <Route path="/bevestiging" element={<Bevestiging />} />
            <Route path="/voor-schoonmakers" element={<VoorSchoonmakers />} />
            <Route path="/inloggen" element={<Login />} />
            <Route path="/registreren" element={<Registreren />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;