"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import LeaveReviewDialog from "@/components/LeaveReviewDialog";
// import { Link } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { showError, showLoading, showSuccess, dismissToast } from "@/utils/toast";
// import { format } from "date-fns";
// import { nl } from "date-fns/locale";
// import { Booking } from "@/types"; // Importar a interface Booking do types/index.ts

const CustomerBookings = () => {
  // const [bookings, setBookings] = useState<Booking[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  // const [selectedSchoonmaker, setSelectedSchoonmaker] = useState("");

  // useEffect(() => {
  //   fetchBookings();
  // }, []);

  // const fetchBookings = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const { data: { user }, error: userError } = await supabase.auth.getUser();
  //     if (userError || !user) {
  //       throw new Error("Gebruiker niet ingelogd.");
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
  //         cleaners (name, photo_url)
  //       `)
  //       .eq('customer_id', user.id)
  //       .order('booking_date', { ascending: false });

  //     if (error) {
  //       throw new Error(error.message);
  //     }

  //     // Mapear os dados para corresponder à interface Booking
  //     const mappedBookings: Booking[] = data.map(item => ({
  //       ...item,
  //       cleaners: item.cleaners && item.cleaners.length > 0 ? item.cleaners[0] : null,
  //       profiles: null, // Profiles data is not selected here, so set to null
  //     }));

  //     setBookings(mappedBookings);
  //   } catch (err: any) {
  //     setError(err.message);
  //     showError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleOpenReviewDialog = (schoonmakerName: string) => {
  //   setSelectedSchoonmaker(schoonmakerName);
  //   setIsReviewDialogOpen(true);
  // };

  // const handleCancelBooking = async (bookingId: string) => {
  //   const toastId = showLoading("Boeking annuleren...");
  //   try {
  //     const { error } = await supabase
  //       .from('bookings')
  //       .update({ status: 'cancelled', updated_at: new Date().toISOString() })
  //       .eq('id', bookingId);

  //     if (error) {
  //       throw new Error(error.message);
  //     }

  //     dismissToast(toastId);
  //     showSuccess("Boeking succesvol geannuleerd!");
  //     fetchBookings(); // Refresh the list
  //   } catch (err: any) {
  //     dismissToast(toastId);
  //     showError(err.message);
  //   }
  // };

  // const getStatusBadgeVariant = (status: Booking['status']) => {
  //   switch (status) {
  //     case 'accepted':
  //     case 'completed':
  //       return 'default';
  //     case 'pending_offer':
  //     case 'executing':
  //       return 'secondary';
  //     case 'cancelled':
  //     case 'rejected':
  //       return 'destructive';
  //     default:
  //       return 'outline';
  //   }
  // };

  // if (loading) {
  //   return (
  //     <Card>
  //       <CardHeader><CardTitle>Mijn Boekingen</CardTitle></CardHeader>
  //       <CardContent><p>Laden van boekingen...</p></CardContent>
  //     </Card>
  //   );
  // }

  // if (error) {
  //   return (
  //     <Card>
  //       <CardHeader><CardTitle>Mijn Boekingen</CardTitle></CardHeader>
  //       <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Boekingen</CardTitle>
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
  );
};

export default CustomerBookings;