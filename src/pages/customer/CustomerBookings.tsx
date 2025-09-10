"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import LeaveReviewDialog from "@/components/LeaveReviewDialog";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showLoading, showSuccess, dismissToast } from "@/utils/toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Booking } from "@/types"; // Importar a interface Booking do types/index.ts

const CustomerBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedSchoonmaker, setSelectedSchoonmaker] = useState("");

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
          created_at,
          updated_at,
          cleaners (name, photo_url)
        `)
        .eq('customer_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Mapear os dados para corresponder à interface Booking
      const mappedBookings: Booking[] = data.map(item => ({
        ...item,
        cleaners: item.cleaners && item.cleaners.length > 0 ? item.cleaners[0] : null,
        profiles: null, // Profiles data is not selected here, so set to null
      }));

      setBookings(mappedBookings);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewDialog = (schoonmakerName: string) => {
    setSelectedSchoonmaker(schoonmakerName);
    setIsReviewDialogOpen(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    const toastId = showLoading("Boeking annuleren...");
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) {
        throw new Error(error.message);
      }

      dismissToast(toastId);
      showSuccess("Boeking succesvol geannuleerd!");
      fetchBookings(); // Refresh the list
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return 'default';
      case 'pending_offer':
      case 'executing':
        return 'secondary';
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mijn Boekingen</CardTitle>
          <CardDescription>
            Bekijk hier je boekingsgeschiedenis en aankomende afspraken.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground">Je hebt nog geen boekingen.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schoonmaker</TableHead>
                  <TableHead>Datum & Tijd</TableHead>
                  <TableHead>Duur</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((boeking) => (
                  <TableRow key={boeking.id}>
                    <TableCell className="font-medium">{boeking.cleaners?.name || 'Onbekend'}</TableCell>
                    <TableCell>
                      {format(new Date(boeking.booking_date), "eeee d MMMM yyyy", { locale: nl })} om {boeking.booking_time}
                    </TableCell>
                    <TableCell>{boeking.duration_hours} uur</TableCell>
                    <TableCell className="text-right">€{boeking.total_price.toFixed(2)}</TableCell>
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
                    <TableCell className="text-right flex gap-2 justify-end">
                        {boeking.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewDialog(boeking.cleaners?.name || 'Schoonmaker')}
                          >
                            Beoordeling schrijven
                          </Button>
                        )}
                        {(boeking.status === "pending_offer" || boeking.status === "accepted") && (
                          <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(boeking.id)}>
                              Annuleren
                          </Button>
                        )}
                        {boeking.status !== "completed" && boeking.status !== "cancelled" && boeking.status !== "rejected" && boeking.cleaners?.name && boeking.cleaners?.photo_url && (
                          <Button asChild variant="secondary" size="sm">
                              <Link to="/account/chat" state={{ cleanerName: boeking.cleaners.name, cleanerAvatar: boeking.cleaners.photo_url }}>
                                  Chat
                              </Link>
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <LeaveReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        schoonmakerName={selectedSchoonmaker}
      />
    </>
  );
};

export default CustomerBookings;