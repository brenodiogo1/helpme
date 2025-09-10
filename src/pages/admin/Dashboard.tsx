import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, DollarSign, Wallet } from "lucide-react";
import { RevenueChart } from "@/components/RevenueChart";
import { RecentBookings } from "@/components/RecentBookings";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const Dashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [totalCleaners, setTotalCleaners] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);
  const [totalRevenueMonth, setTotalRevenueMonth] = useState(0);
  const [payoutsMonth, setPayoutsMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.email !== "admin@helpme.com") {
        showError("U heeft geen toegang tot deze pagina.");
        navigate('/'); // Redirect non-admin users
        return;
      }
      fetchDashboardData();
    } else if (!isAuthLoading && !user) {
      showError("U moet ingelogd zijn om het admin dashboard te bekijken.");
      navigate('/login');
    }
  }, [isAuthLoading, user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Total Cleaners
      const { count: cleanersCount, error: cleanersError } = await supabase
        .from('cleaners')
        .select('*', { count: 'exact', head: true });
      if (cleanersError) throw new Error(cleanersError.message);
      setTotalCleaners(cleanersCount || 0);

      // Active Bookings (e.g., 'accepted', 'executing', 'pending_offer', 'pending_assignment', 'paid_pending_assignment')
      const { count: activeBookingsCount, error: activeBookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['accepted', 'executing', 'pending_offer', 'pending_assignment', 'paid_pending_assignment']);
      if (activeBookingsError) throw new Error(activeBookingsError.message);
      setActiveBookings(activeBookingsCount || 0);

      // Total Revenue (Month) and Payouts (Month) - Simplified mock for now
      // In a real app, this would involve more complex queries with date filters
      setTotalRevenueMonth(4250.50);
      setPayoutsMonth(3500.00);

    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p>Laden van dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-red-500">Fout: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totaal Schoonmakers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCleaners}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% van vorige maand
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actieve Boekingen
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              +12.1% van vorige week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Omzet (Maand)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenueMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +8.0% van vorige maand
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uitbetaald aan Schoonmakers (Maand)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{payoutsMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              -2.5% van vorige maand
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mb-8">
        <LiveActivityFeed />
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <RevenueChart />
        </div>
        <div className="lg:col-span-3">
            <RecentBookings />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;