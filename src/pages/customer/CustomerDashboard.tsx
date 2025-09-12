import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { CalendarPlus } from "lucide-react";
// import LiveActivityFeed from "@/components/LiveActivityFeed";
// import CustomerBookingTimeline from "@/components/CustomerBookingTimeline";
// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { showError } from "@/utils/toast";
// import { Booking } from "@/types"; // Removido format e nl

const CustomerDashboard = () => {
  // const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  // const [customerName, setCustomerName] = useState<string>("Gebruiker"); // Estado para o nome do cliente
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);

  // const fetchDashboardData = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const { data: { user }, error: userError } = await supabase.auth.getUser();
  //     if (userError || !user) {
  //       throw new Error("Gebruiker niet ingelogd.");
  //     }

  //     // Fetch customer profile to get the name
  //     const { data: profileData, error: profileError } = await supabase
  //       .from('profiles')
  //       .select('first_name')
  //       .eq('id', user.id)
  //       .single();

  //     if (profileError && profileError.code !== 'PGRST116') {
  //       throw new Error(profileError.message);
  //     }
  //     if (profileData) {
  //       setCustomerName(profileData.first_name || "Gebruiker");
  //     }

  //     const { data, error } = await supabase
  //       .from('bookings')
  //       .select(`
  //         id,
  //         customer_id,
  //         cleaner_id,
  //         booking_date,
  //         booking_time,
  //         duration_hours,
  //         total_price,
  //         status,
  //         created_at,
  //         updated_at,
  //         cleaners (name)
  //       `)
  //       .eq('customer_id', user.id)
  //       .in('status', ['pending_offer', 'accepted', 'executing']) // Only show active bookings
  //       .order('booking_date', { ascending: true })
  //       .limit(1)
  //       .single();

  //     if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
  //       throw new Error(error.message);
  //     }

  //     if (data) {
  //       // Mapear os dados para corresponder à interface Booking
  //       const mappedBooking: Booking = {
  //         ...data,
  //         cleaners: data.cleaners && data.cleaners.length > 0 ? data.cleaners[0] : null,
  //         profiles: null, // Profiles data is not selected here, so set to null
  //       };
  //       setUpcomingBooking(mappedBooking);
  //     } else {
  //       setUpcomingBooking(null);
  //     }
  //   } catch (err: any) {
  //     setError(err.message);
  //     showError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div>
  //       <h1 className="text-3xl font-bold mb-6">Welkom terug!</h1>
  //       <p>Laden van je volgende afspraak...</p>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div>
  //       <h1 className="text-3xl font-bold mb-6">Welkom terug!</h1>
  //       <p className="text-red-500">Fout: {error}</p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Welkom terug!</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mijn Dashboard</CardTitle>
          <CardDescription>
            Deze pagina is momenteel niet compatibel met het nieuwe boekingssysteem en moet opnieuw worden geïmplementeerd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Neem contact op met de beheerder voor meer informatie.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;