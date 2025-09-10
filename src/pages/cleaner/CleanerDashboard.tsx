import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Clock, Star, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

const CleanerDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [cleanerName, setCleanerName] = useState<string>("Schoonmaker");
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalHoursWorked, setTotalHoursWorked] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchDashboardData(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw dashboard te bekijken.");
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [isAuthLoading, user, navigate]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch cleaner profile
      const { data: cleanerProfile, error: profileError } = await supabase
        .from('cleaners')
        .select('id, name, rating_avg, rating_count')
        .eq('user_id', userId)
        .single();

      if (profileError || !cleanerProfile) {
        throw new Error(profileError?.message || "Geen schoonmakerprofiel gevonden voor deze gebruiker.");
      }

      setCleanerName(cleanerProfile.name);
      setAverageRating(cleanerProfile.rating_avg || 0);

      // Fetch upcoming booking
      const { data: upcomingBookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          duration_hours,
          profiles (first_name, last_name)
        `)
        .eq('cleaner_id', cleanerProfile.id)
        .in('status', ['accepted', 'executing'])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
        .limit(1)
        .single();

      if (bookingError && bookingError.code !== 'PGRST116') {
        throw new Error(bookingError.message);
      }

      if (upcomingBookingData) {
        setUpcomingBooking({
          customer: `${upcomingBookingData.profiles?.[0]?.first_name} ${upcomingBookingData.profiles?.[0]?.last_name}`, // Access first element of profiles array
          date: format(new Date(upcomingBookingData.booking_date), "eeee d MMMM yyyy", { locale: nl }),
          time: upcomingBookingData.booking_time,
          hours: upcomingBookingData.duration_hours,
        });
      } else {
        setUpcomingBooking(null);
      }

      // Fetch earnings and total hours (simplified for dashboard, more detailed in earnings page)
      const { data: completedBookings, error: completedBookingsError } = await supabase
        .from('bookings')
        .select('total_price, duration_hours, created_at')
        .eq('cleaner_id', cleanerProfile.id)
        .eq('status', 'completed');

      if (completedBookingsError) {
        throw new Error(completedBookingsError.message);
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));

      let currentWeeklyEarnings = 0;
      let currentTotalHoursWorked = 0;

      completedBookings.forEach(booking => {
        currentTotalHoursWorked += booking.duration_hours;
        if (new Date(booking.created_at) > oneWeekAgo) {
          currentWeeklyEarnings += booking.total_price;
        }
      });

      setWeeklyEarnings(currentWeeklyEarnings);
      setTotalHoursWorked(currentTotalHoursWorked);

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
      <h1 className="text-3xl font-bold mb-6">Welkom terug, {cleanerName}!</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volgende Boeking</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingBooking ? `${upcomingBooking.time}` : "Geen"}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingBooking ? `${upcomingBooking.date} bij ${upcomingBooking.customer}` : "Geen aankomende boeking"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verdient (deze week)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{weeklyEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+€55,50 sinds gisteren</p> {/* Mock data */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Beoordeling</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)} / 5.0</div>
            <p className="text-xs text-muted-foreground">gebaseerd op 128 reviews</p> {/* Mock data */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Gewerkte Uren</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursWorked}</div>
            <p className="text-xs text-muted-foreground">12 uur deze week</p> {/* Mock data */}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Je volgende afspraak</CardTitle>
                <CardDescription>Details van je aankomende schoonmaakklus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {upcomingBooking ? (
                  <>
                    <p><strong>Klant:</strong> {upcomingBooking.customer}</p>
                    <p><strong>Datum & Tijd:</strong> {upcomingBooking.date} om {upcomingBooking.time}</p>
                    <p><strong>Duur:</strong> {upcomingBooking.hours} uur</p>
                    <Button asChild>
                        <Link to="/dashboard/boekingen">Bekijk alle boekingen</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Geen aankomende boekingen.</p>
                )}
            </CardContent>
        </Card>
        <LiveActivityFeed />
      </div>
    </div>
  );
};

export default CleanerDashboard;