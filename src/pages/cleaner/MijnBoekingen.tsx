"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Booking {
  id: string;
  customer_id: string;
  cleaner_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  total_price: number;
  status: 'pending_offer' | 'accepted' | 'rejected' | 'executing' | 'completed' | 'cancelled';
  created_at: string;
  profiles: { // Assuming a 'profiles' table for customer names
    first_name: string;
    last_name: string;
  } | null;
}

const MijnBoekingen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Gebruiker niet ingelogd.");
      }

      // Fetch cleaner ID associated with the current user
      const { data: cleanerData, error: cleanerError } = await supabase
        .from('cleaners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cleanerError || !cleanerData) {
        throw new Error(cleanerError?.message || "Geen schoonmakerprofiel gevonden voor deze gebruiker.");
      }

      const cleanerId = cleanerData.id;

      const { data, error } = await supabase
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
          profiles (first_name, last_name)
        `)
        .eq('cleaner_id', cleanerId)
        .in('status', ['accepted', 'executing', 'completed', 'cancelled']) // Only show relevant statuses for cleaner's bookings
        .order('booking_date', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setBookings(data as Booking[]);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    const toastId = showLoading(`Status bijwerken naar '${newStatus}'...`);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) {
        throw new Error(error.message);
      }

      dismissToast(toastId);
      showSuccess(`Boekingsstatus succesvol bijgewerkt naar '${newStatus}'!`);
      fetchBookings(); // Refresh the list
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'executing':
        return 'secondary';
      case 'completed':
        return 'success'; // Assuming 'success' variant exists or using 'default'
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Boekingen</CardTitle></CardHeader>
        <CardContent><p>Laden van boekingen...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Boekingen</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Boekingen</CardTitle>
        <CardDescription>
          Bekijk en beheer hier je geplande en voltooide boekingen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-muted-foreground">Je hebt nog geen geaccepteerde boekingen.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klant</TableHead>
                <TableHead>Datum & Tijd</TableHead>
                <TableHead>Duur</TableHead>
                <TableHead>Prijs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((boeking) => (
                <TableRow key={boeking.id}>
                  <TableCell className="font-medium">
                    {boeking.profiles ? `${boeking.profiles.first_name} ${boeking.profiles.last_name}` : 'Onbekende Klant'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(boeking.booking_date), "eeee d MMMM yyyy", { locale: nl })} om {boeking.booking_time}
                  </TableCell>
                  <TableCell>{boeking.duration_hours} uur</TableCell>
                  <TableCell>€{boeking.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(boeking.status)}>
                      {boeking.status === 'pending_offer' ? 'In afwachting' :
                       boeking.status === 'accepted' ? 'Geaccepteerd' :
                       boeking.status === 'executing' ? 'Bezig' :
                       boeking.status === 'completed' ? 'Voltooid' :
                       boeking.status === 'cancelled' ? 'Geannuleerd' :
                       boeking.status === 'rejected' ? 'Geweigerd' : 'Onbekend'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acties</DropdownMenuLabel>
                        {boeking.status === 'accepted' && (
                          <DropdownMenuItem onClick={() => handleUpdateBookingStatus(boeking.id, 'executing')}>
                            Start Taak
                          </DropdownMenuItem>
                        )}
                        {boeking.status === 'executing' && (
                          <DropdownMenuItem onClick={() => handleUpdateBookingStatus(boeking.id, 'completed')}>
                            Markeer als Voltooid
                          </DropdownMenuItem>
                        )}
                        {(boeking.status === 'accepted' || boeking.status === 'executing') && (
                          <DropdownMenuItem onClick={() => handleUpdateBookingStatus(boeking.id, 'cancelled')}>
                            Annuleren
                          </DropdownMenuItem>
                        )}
                        {boeking.status === 'completed' && (
                          <DropdownMenuItem disabled>
                            Voltooid
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MijnBoekingen;