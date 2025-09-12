import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { loadStripe } from '@stripe/stripe-js';
import { BookingStatus } from "@/types";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const Bevestiging = () => {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'succeeded' | 'failed' | 'pending'>('loading');
  const [bookingCreated, setBookingCreated] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(location.state?.bookingDetails || null);

  useEffect(() => {
    const confirmPaymentAndCreateBooking = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!bookingDetails) {
        setPaymentStatus('failed'); // No booking details means something went wrong
        showError("Geen boekingsinformatie gevonden.");
        return;
      }

      // Handle cash bookings or direct navigation to confirmation
      if (bookingDetails.status === 'pending_payment') {
        setPaymentStatus('pending');
        return;
      }

      if (!sessionId) {
        setPaymentStatus('failed'); // If it's supposed to be a Stripe payment but no session ID
        showError("Geen Stripe sessie ID gevonden voor betalingsbevestiging.");
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

          if (!bookingCreated && bookingDetails) {
            // Retrieve booking details from location state
            const { date, time, hours, totalPrice, city, zipCode, selectedExtraServices, basePrice, extrasPrice, discountAmount, platformFee } = bookingDetails;

            // Fetch service_id for 'Find a cleaner'
            const { data: serviceData, error: serviceError } = await supabase
                .from('services')
                .select('id')
                .eq('name', 'Find a cleaner')
                .single();

            if (serviceError || !serviceData) {
                throw new Error(serviceError?.message || "Service 'Find a cleaner' not found.");
            }

            const insertData = {
                customer_id: null, // For public quick booking, customer_id is null initially
                service_id: serviceData.id,
                frequency_code: 'once', // Default for quick booking
                home_size_m2: null,
                duration_hours: hours,
                date: format(new Date(date), "yyyy-MM-dd"),
                start_time: time,
                allow_alt_weekday: false,
                postcode: zipCode,
                city: city,
                base_hourly_rate: basePrice / hours, // Calculate hourly rate from basePrice and hours
                discount: discountAmount,
                service_fee: platformFee,
                addons_total: extrasPrice,
                estimated_total: totalPrice,
                status: 'paid' as BookingStatus, // Mark as paid
            };

            const { data: newBookingData, error: bookingError } = await supabase
                .from('bookings')
                .insert(insertData)
                .select('id')
                .single();

            if (bookingError || !newBookingData) {
                throw new Error(bookingError?.message || "Fout bij het aanmaken van de boeking na betaling.");
            }

            // Insert booking addons
            if (selectedExtraServices && selectedExtraServices.length > 0) {
                const extraServicesOptions = [
                    { id: "ramen", label: "Ramen wassen", price: 25.00 },
                    { id: "oven", label: "Oven reinigen", price: 15.00 },
                    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
                    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
                ];
                const { data: addonsData, error: addonsFetchError } = await supabase
                    .from('addons')
                    .select('id, name')
                    .in('name', extraServicesOptions.filter(es => selectedExtraServices.includes(es.id)).map(es => es.label));

                if (addonsFetchError) {
                    throw new Error(addonsFetchError.message);
                }

                const bookingAddonsToInsert = addonsData.map(addon => ({
                    booking_id: newBookingData.id,
                    addon_id: addon.id,
                    qty: 1, // Assuming quantity is 1 for now
                }));

                const { error: insertAddonsError } = await supabase
                    .from('booking_addons')
                    .insert(bookingAddonsToInsert);

                if (insertAddonsError) {
                    throw new Error(insertAddonsError.message);
                }
            }

            setBookingDetails({ ...bookingDetails, status: 'paid', bookingId: newBookingData.id });
            setBookingCreated(true);
            showSuccess("Betaling succesvol! Je boeking is bevestigd.");
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

  const { schoonmaker, date, time, hours, totalPrice, firstName, lastName, email, address, city, zipCode } = bookingDetails;
  const isQuickBooking = !schoonmaker?.id; // Determine if it's a quick booking based on cleaner presence

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
                {isQuickBooking ? (
                    <>
                        <p><strong>Klant:</strong> {firstName} {lastName}</p>
                        <p><strong>E-mail:</strong> {email}</p>
                        <p><strong>Adres:</strong> {address}, {zipCode} {city}</p>
                        <p><strong>Schoonmaker:</strong> Wordt toegewezen</p>
                        <p><strong>Status:</strong> Betaald</p>
                    </>
                ) : (
                    <>
                        <p><strong>Schoonmaker:</strong> {schoonmaker?.name || "Nog niet toegewezen"}</p>
                        <p><strong>Status:</strong> Betaald</p>
                    </>
                )}
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
                {isQuickBooking ? (
                    <>
                        <p><strong>Klant:</strong> {firstName} {lastName}</p>
                        <p><strong>E-mail:</strong> {email}</p>
                        <p><strong>Adres:</strong> {address}, {zipCode} {city}</p>
                        <p><strong>Schoonmaker:</strong> Wordt toegewezen</p>
                        <p><strong>Status:</strong> In afwachting van betaling/toewijzing</p>
                    </>
                ) : (
                    <>
                        <p><strong>Schoonmaker:</strong> {schoonmaker?.name || "Nog niet toegewezen"}</p>
                        <p><strong>Status:</strong> In afwachting van betaling/aanbieding</p>
                    </>
                )}
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
                <Link to={`/quick-booking`}>Opnieuw proberen</Link>
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