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
import { Booking } from "@/types";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CustomerBookings = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedSchoonmakerName, setSelectedSchoonmakerName] = useState("");
  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchBookings(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw boekingen te bekijken.");
    }
  }, [isAuthLoading, user]);

  const fetchBookings = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
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
          extra_services,
          cleaners (name, photo_url)
        `)
        .eq('customer_id', userId)
        .order('booking_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const mappedBookings: Booking[] = data.map(item => ({
        ...item,
        cleaners: item.cleaners && Array.isArray(item.cleaners) && item.cleaners.length > 0
                    ? item.cleaners[0]
                    : null,
        profiles: null,
      }));

      setBookings(mappedBookings);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewDialog = (schoonmakerName: string, cleanerId: string, bookingId: string) => {
    setSelectedSchoonmakerName(schoonmakerName);
    setSelectedCleanerId(cleanerId);
    setSelectedBookingId(bookingId);
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
      if (user) fetchBookings(user.id);
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
      case 'paid_pending_assignment':
      case 'pending_assignment':
        return 'secondary';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isAuthLoading || loading) {
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mijn Boekingen</CardTitle>
            <CardDescription>
              Bekijk hier je boekingsgeschiedenis en aankomende afspraken.
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/zoeken">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nieuwe Boeking Maken
            </Link>
          </Button>
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
                  <TableHead>Extra Diensten</TableHead>
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
                    <TableCell>
                      {boeking.extra_services && boeking.extra_services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {boeking.extra_services.map(service => (
                            <Badge key={service} variant="outline">{service}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Geen</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">€{boeking.total_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(boeking.status)}>
                        {boeking.status === 'pending_offer' ? 'In afwachting' :
                         boeking.status === 'accepted' ? 'Geaccepteerd' :
                         boeking.status === 'executing' ? 'Bezig' :
                         boeking.status === 'completed' ? 'Voltooid' :
                         boeking.status === 'cancelled' ? 'Geannuleerd' :
                         boeking.status === 'rejected' ? 'Geweigerd' :
                         boeking.status === 'pending_assignment' ? 'Wacht op toewijzing' :
                         boeking.status === 'paid_pending_assignment' ? 'Betaald, wacht op toewijzing' : 'Onbekend'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                        {boeking.status === "completed" && boeking.cleaner_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewDialog(boeking.cleaners?.name || 'Schoonmaker', boeking.cleaner_id!, boeking.id)}
                          >
                            Beoordeling schrijven
                          </Button>
                        )}
                        {(boeking.status === "pending_offer" || boeking.status === "accepted" || boeking.status === "pending_assignment" || boeking.status === "paid_pending_assignment") && (
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
        schoonmakerName={selectedSchoonmakerName}
        cleanerId={selectedCleanerId!}
        bookingId={selectedBookingId!}
        onReviewSubmitted={() => { if (user) fetchBookings(user.id); }}
      />
    </>
  );
};

export default CustomerBookings;