import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import CustomerBookingTimeline from "@/components/CustomerBookingTimeline"; // Importar o novo componente
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Booking {
  id: string;
  cleaner_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_price: number;
  status: 'pending_offer' | 'accepted' | 'rejected' | 'executing' | 'completed' | 'cancelled';
  cleaners: {
    name: string;
  } | null;
}

const CustomerDashboard = () => {
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingBooking();
  }, []);

  const fetchUpcomingBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Gebruiker niet ingelogd.");
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          cleaner_id,
          booking_date,
          booking_time,
          duration_hours,
          total_price,
          status,
          cleaners (name)
        `)
        .eq('customer_id', user.id)
        .in('status', ['pending_offer', 'accepted', 'executing']) // Only show active bookings
        .order('booking_date', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        throw new Error(error.message);
      }

      if (data) {
        setUpcomingBooking(data as Booking);
      } else {
        setUpcomingBooking(null);
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Welkom terug!</h1>
        <p>Laden van je volgende afspraak...</p>
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
      <h1 className="text-3xl font-bold mb-6">Welkom terug, Piet!</h1> {/* TODO: Dynamische naam */}
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
        <LiveActivityFeed /> {/* Substituído ActivityMap por LiveActivityFeed */}
      </div>
      <div className="mt-8">
        {/* Other dashboard content */}
      </div>
    </div>
  );
};

export default CustomerDashboard;