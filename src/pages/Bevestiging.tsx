import { useLocation, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { loadStripe } from '@stripe/stripe-js';
import { Schoonmaker } from "@/types";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const Bevestiging = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'succeeded' | 'failed' | 'pending'>('loading');
  const [bookingCreated, setBookingCreated] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(location.state?.bookingDetails || null);

  useEffect(() => {
    const confirmPaymentAndCreateBooking = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        // If no session_id, it means it's a quick booking or direct navigation
        if (bookingDetails?.status === 'pending_assignment') {
          setPaymentStatus('pending');
        } else {
          setPaymentStatus('failed'); // Or handle as a direct confirmation without payment
        }
        return;
      }

      if (!stripePromise) {
        showError("Stripe não está configurado. Verifique VITE_STRIPE_PUBLISHABLE_KEY.");
        setPaymentStatus('failed');
        return;
      }

      try {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Falha ao carregar o Stripe.");
        }

        const { data, error } = await supabase.functions.invoke('get-checkout-session-status', {
          body: JSON.stringify({ sessionId }),
        });

        if (error) {
          throw new Error(error.message);
        }

        const { status, payment_status } = data as { status: string; payment_status: string };

        if (status === 'complete' && payment_status === 'paid') {
          setPaymentStatus('succeeded');

          // Retrieve booking details from location state
          const { schoonmaker, date, time, hours, totalPrice, selectedServices } = bookingDetails;

          if (!bookingCreated && bookingDetails) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error("Gebruiker niet ingelogd.");
            }

            // Create the booking in Supabase
            const { data: newBookingData, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: user.id,
                    cleaner_id: schoonmaker.id,
                    booking_date: format(new Date(date), "yyyy-MM-dd"),
                    booking_time: time,
                    duration_hours: hours,
                    total_price: totalPrice,
                    status: 'accepted', // Status 'accepted' após pagamento bem-sucedido
                })
                .select()
                .single();

            if (bookingError || !newBookingData) {
                throw new Error(bookingError?.message || "Fout bij het aanmaken van de boeking na betaling.");
            }

            // Create the job offer for the cleaner
            const { error: offerError } = await supabase
                .from('job_offers')
                .insert({
                    booking_id: newBookingData.id,
                    cleaner_id: schoonmaker.id,
                    status: 'accepted', // Oferta aceita automaticamente se o pagamento foi feito
                });

            if (offerError) {
                throw new Error(offerError?.message || "Fout bij het aanmaken van de jobaanbieding na betaling.");
            }

            setBookingCreated(true);
            showSuccess("Betaling succesvol! Je boeking is bevestigd.");
            setBookingDetails({ ...bookingDetails, status: 'accepted', bookingId: newBookingData.id });
          }
        } else {
          setPaymentStatus('failed');
          showError("Betaling mislukt of niet voltooid.");
        }
      } catch (error: any) {
        console.error("Error confirming payment:", error);
        setPaymentStatus('failed');
        showError(error.message || "Er is een onverwachte fout opgetreden bij het verwerken van de betaling.");
      }
    };

    confirmPaymentAndCreateBooking();
  }, [location.search, bookingDetails, bookingCreated]);

  if (!bookingDetails) {
    return (
      <div className="container text-center py-20">
        <h1 className="text-2xl font-bold">Geen boekingsinformatie gevonden.</h1>
        <p className="text-muted-foreground">Ga terug naar de homepagina om een nieuwe boeking te starten.</p>
        <Button asChild className="mt-4">
          <Link to="/">Terug naar Home</Link>
        </Button>
      </div>
    );
  }

  const { schoonmaker, date, time, hours, totalPrice } = bookingDetails;

  const renderContent = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <>
            <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center">
              <Clock className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl mt-4">Betaling verwerken...</CardTitle>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Even geduld, we controleren de status van je betaling en bevestigen je boeking.
              </p>
            </CardContent>
          </>
        );
      case 'succeeded':
        return (
          <>
            <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl mt-4">Je boeking is bevestigd!</CardTitle>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Een bevestiging is naar je e-mailadres gestuurd. Hieronder vind je de details van je afspraak.
              </p>
              <div className="text-left border rounded-lg p-4 space-y-2 bg-secondary/50">
                <p><strong>Schoonmaker:</strong> {schoonmaker?.name || "Nog niet toegewezen"}</p>
                <p><strong>Datum:</strong> {format(new Date(date), "eeee d MMMM yyyy", { locale: nl })}</p>
                <p><strong>Tijd:</strong> {time}</p>
                <p><strong>Duur:</strong> {hours} uur</p>
                <p className="font-semibold"><strong>Totaalprijs:</strong> €{totalPrice.toFixed(2)}</p>
              </div>
              <Button asChild className="mt-6">
                <Link to="/">Terug naar Home</Link>
              </Button>
            </CardContent>
          </>
        );
      case 'pending': // For quick bookings without immediate payment
        return (
          <>
            <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center">
                <Clock className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl mt-4">Je boekingsaanvraag is verzonden!</CardTitle>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We hebben je aanvraag ontvangen en zoeken een geschikte schoonmaker. Je ontvangt spoedig een update via e-mail en chat.
              </p>
              <div className="text-left border rounded-lg p-4 space-y-2 bg-secondary/50">
                <p><strong>Schoonmaker:</strong> {schoonmaker?.name || "Nog niet toegewezen"}</p>
                <p><strong>Datum:</strong> {format(new Date(date), "eeee d MMMM yyyy", { locale: nl })}</p>
                <p><strong>Tijd:</strong> {time}</p>
                <p><strong>Duur:</strong> {hours} uur</p>
                <p className="font-semibold"><strong>Totaalprijs:</strong> €{totalPrice.toFixed(2)}</p>
              </div>
              <Button asChild className="mt-6">
                <Link to="/">Terug naar Home</Link>
              </Button>
            </CardContent>
          </>
        );
      case 'failed':
        return (
          <>
            <div className="mx-auto bg-red-100 rounded-full h-16 w-16 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl mt-4">Betaling mislukt!</CardTitle>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Helaas is je betaling niet gelukt. Probeer het opnieuw of neem contact op met de ondersteuning.
              </p>
              <Button asChild className="mt-6">
                <Link to={`/boeken/${schoonmaker?.id}`} state={{ date, time }}>Opnieuw proberen</Link>
              </Button>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          {renderContent()}
        </CardHeader>
      </Card>
    </div>
  );
};

export default Bevestiging;