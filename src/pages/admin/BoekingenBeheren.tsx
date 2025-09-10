import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Booking, Schoonmaker } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const BoekingenBeheren = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cleaners, setCleaners] = useState<Schoonmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newCleanerId, setNewCleanerId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.email !== "admin@helpme.com") {
        showError("U heeft geen toegang tot deze pagina.");
        navigate('/');
        return;
      }
      fetchData();
    } else if (!isAuthLoading && !user) {
      showError("U moet ingelogd zijn om boekingen te beheren.");
      navigate('/login');
    }
  }, [isAuthLoading, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
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
          profiles (first_name, last_name),
          cleaners (id, name)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw new Error(bookingsError.message);

      const mappedBookings: Booking[] = bookingsData.map(item => ({
        ...item,
        profiles: item.profiles && Array.isArray(item.profiles) && item.profiles.length > 0 ? item.profiles[0] : null,
        cleaners: item.cleaners && Array.isArray(item.cleaners) && item.cleaners.length > 0 ? item.cleaners[0] : null,
      })) as Booking[]; // Explicitly cast to Booking[]
      setBookings(mappedBookings);

      // Fetch cleaners
      const { data: cleanersData, error: cleanersError } = await supabase
        .from('cleaners')
        .select('id, name');
      if (cleanersError) throw new Error(cleanersError.message);
      setCleaners(cleanersData as Schoonmaker[]);

    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewCleanerId(booking.cleaner_id); // Pre-select current cleaner
    setIsDialogOpen(true);
  };

  const handleChangeCleaner = async () => {
    if (!selectedBooking || !newCleanerId) return;

    const toastId = showLoading("Schoonmaker wijzigen...");
    try {
      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({ cleaner_id: newCleanerId, status: 'pending_offer', updated_at: new Date().toISOString() })
        .eq('id', selectedBooking.id);

      if (updateBookingError) throw new Error(updateBookingError.message);

      // Create a new job offer for the newly assigned cleaner
      const { error: createOfferError } = await supabase
        .from('job_offers')
        .insert({
          booking_id: selectedBooking.id,
          cleaner_id: newCleanerId,
          status: 'pending',
        });

      if (createOfferError) throw new Error(createOfferError.message);

      dismissToast(toastId);
      showSuccess("Schoonmaker succesvol gewijzigd en nieuwe aanbieding verzonden!");
      setIsDialogOpen(false);
      fetchData(); // Refresh the list
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const toastId = showLoading("Boeking annuleren...");
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw new Error(error.message);

      // Also update any related job offers to 'rejected' or delete them
      await supabase
        .from('job_offers')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('booking_id', bookingId)
        .in('status', ['pending', 'accepted']); // Only update pending/accepted offers

      dismissToast(toastId);
      showSuccess(`Boeking ${bookingId} succesvol geannuleerd.`);
      fetchData();
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'completed':
      case 'accepted':
        return 'default';
      case 'pending_offer':
      case 'executing':
      case 'pending_assignment':
      case 'paid_pending_assignment':
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
        <CardHeader><CardTitle>Boekingen</CardTitle></CardHeader>
        <CardContent><p>Laden van boekingen...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Boekingen</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Boekingen</CardTitle>
          <CardDescription>
            Bekijk en beheer alle boekingen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boeking ID</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Schoonmaker</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead><span className="sr-only">Acties</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((boeking) => (
                <TableRow key={boeking.id}>
                  <TableCell className="font-medium">{boeking.id}</TableCell>
                  <TableCell>{boeking.profiles ? `${boeking.profiles.first_name} ${boeking.profiles.last_name}` : 'Onbekende Klant'}</TableCell>
                  <TableCell>{boeking.cleaners?.name || 'Nog niet toegewezen'}</TableCell>
                  <TableCell>{boeking.booking_date}</TableCell>
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
                  <TableCell className="text-right">€{boeking.total_price.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenDialog(boeking)}>
                          Schoonmaker wijzigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCancelBooking(boeking.id)}>
                          Annuleren
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schoonmaker Wijzigen</DialogTitle>
            <DialogDescription>
              Wijs een nieuwe schoonmaker toe aan boeking #{selectedBooking?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={(value) => setNewCleanerId(value)} value={newCleanerId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Kies een nieuwe schoonmaker" />
              </SelectTrigger>
              <SelectContent>
                {cleaners.map(cleaner => <SelectItem key={cleaner.id} value={cleaner.id}>{cleaner.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuleren</Button>
            <Button onClick={handleChangeCleaner}>Opslaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BoekingenBeheren;