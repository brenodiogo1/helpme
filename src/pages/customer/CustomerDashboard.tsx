import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarPlus, DollarSign, Clock, CheckCircle } from "lucide-react";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import CustomerBookingTimeline from "@/components/CustomerBookingTimeline";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Booking } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const CustomerDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [customerName, setCustomerName] = useState<string>("Gebruiker");
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchDashboardData(user.id);
    } else if (!isAuthLoading && !user) {
      // Handle unauthenticated state, e.g., redirect to login or show a message
      setLoading(false);
      setError("U moet ingelogd zijn om uw dashboard te bekijken.");
    }
  }, [isAuthLoading, user]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch customer profile to get the name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(profileError.message);
      }
      if (profileData) {
        setCustomerName(profileData.first_name || "Gebruiker");
      }

      // Fetch upcoming booking
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_id,
          cleaner_id,
          booking_date,
          booking_time,
          duration_hours,
          total_price,
          status,
          created_at,
          updated_at,
          cleaners (name)
        `)
        .eq('customer_id', userId)
        .in('status', ['pending_offer', 'accepted', 'executing', 'paid_pending_assignment', 'pending_assignment'])
        .order('booking_date', { ascending: true })
        .limit(1)
        .single();

      if (upcomingError && upcomingError.code !== 'PGRST116') {
        throw new Error(upcomingError.message);
      }

      if (upcomingData) {
        const mappedBooking: Booking = {
          ...upcomingData,
          cleaners: upcomingData.cleaners && Array.isArray(upcomingData.cleaners) && upcomingData.cleaners.length > 0
                      ? upcomingData.cleaners[0]
                      : null,
          profiles: null,
        };
        setUpcomingBooking(mappedBooking);
      } else {
        setUpcomingBooking(null);
      }

      // Fetch all bookings for statistics
      const { data: allBookingsData, error: allBookingsError } = await supabase
        .from('bookings')
        .select('id, total_price, status')
        .eq('customer_id', userId);

      if (allBookingsError) {
        throw new Error(allBookingsError.message);
      }

      setTotalBookings(allBookingsData.length);
      const totalAmount = allBookingsData.reduce((sum, booking) => {
        if (booking.status === 'completed' || booking.status === 'accepted' || booking.status === 'paid_pending_assignment') {
          return sum + booking.total_price;
        }
        return sum;
      }, 0);
      setTotalSpent(totalAmount);

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
        <h1 className="text-3xl font-bold mb-6">Welkom terug!</h1>
        <p>Laden van je dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Welkom terug!</h1>
        <p className="text-red-500">Fout: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welkom terug, {customerName}!</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Boekingen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Alle tijden</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Uitgegeven</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Voor voltooide en geaccepteerde boekingen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volgende Afspraak</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingBooking ? `${upcomingBooking.booking_time} op ${new Date(upcomingBooking.booking_date).toLocaleDateString('nl-NL')}` : "Geen"}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingBooking ? `met ${upcomingBooking.cleaners?.name || 'een schoonmaker'}` : "Boek nu een schoonmaker!"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Duur</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 uur</div>
            <p className="text-xs text-muted-foreground">Per boeking</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {upcomingBooking ? (
          <CustomerBookingTimeline
            booking={{
              id: upcomingBooking.id,
              cleaner_name: upcomingBooking.cleaners?.name || 'Onbekende Schoonmaker',
              booking_date: upcomingBooking.booking_date,
              booking_time: upcomingBooking.booking_time,
              duration_hours: upcomingBooking.duration_hours,
              total_price: upcomingBooking.total_price,
              status: upcomingBooking.status,
            }}
          />
        ) : (
          <Card className="flex flex-col items-center justify-center text-center bg-secondary">
            <CardHeader>
              <CardTitle>Nieuwe boeking maken?</CardTitle>
              <CardDescription>Vind snel en eenvoudig een top-schoonmaker.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" asChild>
                <Link to="/zoeken">
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Boek een schoonmaker
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        <LiveActivityFeed />
      </div>
    </div>
  );
};

export default CustomerDashboard;