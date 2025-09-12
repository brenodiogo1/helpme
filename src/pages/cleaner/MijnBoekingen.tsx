"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal } from "lucide-react";
// import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
// import { supabase } from "@/integrations/supabase/client";
// import { format } from "date-fns";
// import { nl } from "date-fns/locale";
// import { Booking } from "@/types"; // Importar a interface Booking do types/index.ts

const MijnBoekingen = () => {
  // const [bookings, setBookings] = useState<Booking[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

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

  //     // Fetch cleaner ID associated with the current user
  //     const { data: cleanerData, error: cleanerError } = await supabase
  //       .from('cleaners')
  //       .select('id')
  //       .eq('user_id', user.id)
  //       .single();

  //     if (cleanerError || !cleanerData) {
  //       throw new Error(cleanerError?.message || "Geen schoonmakerprofiel gevonden voor deze gebruiker.");
  //     }

  //     const cleanerId = cleanerData.id;

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
  //         profiles (first_name, last_name)
  //       `)
  //       .eq('cleaner_id', cleanerId)
  //       .in('status', ['accepted', 'executing', 'completed', 'cancelled']) // Only show relevant statuses for cleaner's bookings
  //       .order('booking_date', { ascending: true });

  //     if (error) {
  //       throw new Error(error.message);
  //     }

  //     // Mapear os dados para corresponder à interface Booking
  //     const mappedBookings: Booking[] = data.map(item => ({
  //       ...item,
  //       profiles: item.profiles && item.profiles.length > 0 ? item.profiles[0] : null,
  //       cleaners: null, // Cleaners data is not selected here, so set to null
  //     }));

  //     setBookings(mappedBookings);
  //   } catch (err: any) {
  //     setError(err.message);
  //     showError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleUpdateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
  //   const toastId = showLoading(`Status bijwerken naar '${newStatus}'...`);
  //   try {
  //     const { error } = await supabase
  //       .from('bookings')
  //       .update({ status: newStatus, updated_at: new Date().toISOString() })
  //       .eq('id', bookingId);

  //     if (error) {
  //       throw new Error(error.message);
  //     }

  //     dismissToast(toastId);
  //     showSuccess(`Boekingsstatus succesvol bijgewerkt naar '${newStatus}'!`);
  //     fetchBookings(); // Refresh the list
  //   } catch (err: any) {
  //     dismissToast(toastId);
  //     showError(err.message);
  //   }
  // };

  // const getStatusBadgeVariant = (status: Booking['status']) => {
  //   switch (status) {
  //     case 'accepted':
  //       return 'default';
  //     case 'executing':
  //       return 'secondary';
  //     case 'completed':
  //       return 'default'; // Alterado de 'success' para 'default'
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

export default MijnBoekingen;