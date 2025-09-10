"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { JobOffer } from "@/types"; // Importar a interface JobOffer do types/index.ts

const MijnTaken = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
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
        .from('job_offers')
        .select(`
          id,
          booking_id,
          cleaner_id,
          status,
          created_at,
          updated_at,
          bookings (
            id,
            customer_id,
            booking_date,
            booking_time,
            duration_hours,
            total_price,
            status,
            profiles (first_name, last_name)
          )
        `)
        .eq('cleaner_id', cleanerId)
        .in('status', ['pending', 'accepted']) // Show pending and accepted offers
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Mapear os dados para corresponder à interface JobOffer
      const mappedJobOffers: JobOffer[] = data.map((item: any) => {
        const bookingData = item.bookings && item.bookings.length > 0 ? item.bookings[0] : null;
        
        let mappedBooking: JobOffer['bookings'] = null;
        if (bookingData) {
          const profileData = bookingData.profiles && bookingData.profiles.length > 0 ? bookingData.profiles[0] : null;
          mappedBooking = {
            id: bookingData.id,
            customer_id: bookingData.customer_id,
            booking_date: bookingData.booking_date,
            booking_time: bookingData.booking_time,
            duration_hours: bookingData.duration_hours,
            total_price: bookingData.total_price,
            status: bookingData.status,
            profiles: profileData,
          };
        }

        return {
          id: item.id,
          booking_id: item.booking_id,
          cleaner_id: item.cleaner_id,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          bookings: mappedBooking,
        };
      });

      setJobOffers(mappedJobOffers);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferResponse = async (offerId: string, bookingId: string, newStatus: 'accepted' | 'rejected') => {
    const toastId = showLoading(`Aanbieding ${newStatus === 'accepted' ? 'accepteren' : 'weigeren'}...`);
    try {
      // Update job_offer status
      const { error: offerError } = await supabase
        .from('job_offers')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', offerId);

      if (offerError) {
        throw new Error(offerError.message);
      }

      // If accepted, update booking status
      if (newStatus === 'accepted') {
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', bookingId);

        if (bookingError) {
          throw new Error(bookingError.message);
        }
      } else {
        // If rejected, update booking status back to 'pending_offer' or 'rejected'
        // For now, let's set it to 'rejected' if the cleaner rejects it.
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', bookingId);

        if (bookingError) {
          throw new Error(bookingError.message);
        }
      }

      dismissToast(toastId);
      showSuccess(`Aanbieding succesvol ${newStatus === 'accepted' ? 'geaccepteerd' : 'geweigerd'}!`);
      fetchJobOffers(); // Refresh the list
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Taken</CardTitle></CardHeader>
        <CardContent><p>Laden van taken...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Taken</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Taken</CardTitle>
        <CardDescription>
          Bekijk hier de nieuwe jobaanbiedingen en je geaccepteerde taken.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobOffers.length === 0 ? (
          <p className="text-muted-foreground">Geen nieuwe jobaanbiedingen of geaccepteerde taken.</p>
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
              {jobOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">
                    {offer.bookings?.profiles ? `${offer.bookings.profiles.first_name} ${offer.bookings.profiles.last_name}` : 'Onbekende Klant'}
                  </TableCell>
                  <TableCell>
                    {offer.bookings ? format(new Date(offer.bookings.booking_date), "eeee d MMMM yyyy", { locale: nl }) : 'N/A'} om {offer.bookings?.booking_time || 'N/A'}
                  </TableCell>
                  <TableCell>{offer.bookings?.duration_hours ? `${offer.bookings.duration_hours} uur` : 'N/A'}</TableCell>
                  <TableCell>€{offer.bookings?.total_price ? offer.bookings.total_price.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      offer.status === "pending" ? "secondary" :
                      offer.status === "accepted" ? "default" : "destructive"
                    }>
                      {offer.status === "pending" ? "In afwachting" :
                       offer.status === "accepted" ? "Geaccepteerd" : "Geweigerd"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {offer.status === "pending" && offer.bookings ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleOfferResponse(offer.id, offer.bookings!.id, 'accepted')}>Accepteren</Button>
                        <Button variant="outline" size="sm" onClick={() => handleOfferResponse(offer.id, offer.bookings!.id, 'rejected')}>Weigeren</Button>
                      </div>
                    ) : (
                      <Badge variant="outline">Beheerd</Badge>
                    )}
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

export default MijnTaken;