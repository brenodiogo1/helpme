import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { showLoading, showSuccess, dismissToast, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from '@stripe/stripe-js';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";

// Mock data - in a real app, you'd fetch this based on the ID
const mockSchoonmaker: Schoonmaker = {
    id: "1",
    name: "Anna de Vries",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 128,
    hourlyRate: 18.50,
    bio: "Bio",
    services: [],
    city: "Amsterdam",
    address: "Kerkstraat 12, 1012 AB Amsterdam",
    phoneNumber: "+31612345678",
};

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const MIN_SERVICES_FOR_DISCOUNT = 2;
const DISCOUNT_PERCENTAGE = 0.10;

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const Boeken = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();

    const { date, time } = location.state || {};

    const [hours, setHours] = useState(3);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isLoadingStripe, setIsLoadingStripe] = useState(true);
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
    const checkoutRef = useRef<HTMLDivElement>(null);

    const schoonmaker = mockSchoonmaker; // Fetch cleaner by id

    const basePrice = hours * schoonmaker.hourlyRate;
    const extrasPrice = useMemo(() => {
        return extraServices
            .filter(service => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);
    }, [selectedServices]);

    const discountAmount = useMemo(() => {
        if (selectedServices.length >= MIN_SERVICES_FOR_DISCOUNT) {
          return extrasPrice * DISCOUNT_PERCENTAGE;
        }
        return 0;
    }, [selectedServices, extrasPrice]);

    const totalPrice = basePrice + extrasPrice - discountAmount;

    useEffect(() => {
      if (!isAuthLoading && !user) {
        showError("U moet ingelogd zijn om een boeking te maken.");
        navigate('/login', { state: { from: location.pathname, cleanerId: id, date, time } });
      }
    }, [isAuthLoading, user, navigate, location.pathname, id, date, time]);

    const handleServiceChange = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    useEffect(() => {
        if (paymentMethod === 'stripe' && user) { // Only initialize Stripe if user is logged in
            const initializeStripeCheckout = async () => {
                if (!date || !time) {
                    setStripeError("Data en tijd van de boeking niet opgegeven.");
                    setIsLoadingStripe(false);
                    return;
                }

                if (!stripePromise) {
                    setStripeError("Stripe is niet geconfigureerd. Controleer VITE_STRIPE_PUBLISHABLE_KEY.");
                    setIsLoadingStripe(false);
                    return;
                }

                try {
                    const stripe = await stripePromise;
                    if (!stripe) {
                        throw new Error("Fout bij het laden van Stripe.");
                    }

                    const returnUrl = `${window.location.origin}/bevestiging`;

                    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                        body: JSON.stringify({
                            amount: totalPrice,
                            currency: 'eur',
                            return_url: returnUrl,
                        }),
                    });

                    if (error) {
                        throw new Error(error.message);
                    }

                    const { clientSecret } = data as { clientSecret: string };

                    if (checkoutRef.current) {
                        const checkout = await stripe.initEmbeddedCheckout({
                            clientSecret,
                        });
                        checkout.mount(checkoutRef.current);
                    }
                } catch (err: any) {
                    console.error("Stripe Checkout initialisatiefout:", err);
                    setStripeError(err.message || "Fout bij het initialiseren van de betaling.");
                } finally {
                    setIsLoadingStripe(false);
                }
            };

            initializeStripeCheckout();
        } else {
            setIsLoadingStripe(false);
            setStripeError(null);
        }
    }, [date, time, totalPrice, id, paymentMethod, user]);

    const handleCashBooking = async () => {
        if (!user) {
          showError("U moet ingelogd zijn om een boeking te maken.");
          navigate('/login', { state: { from: location.pathname, cleanerId: id, date, time } });
          return;
        }

        setIsLoadingStripe(true);
        const toastId = showLoading("Boekingsaanvraag verzenden...");

        try {
            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: user.id,
                    cleaner_id: schoonmaker.id,
                    booking_date: format(new Date(date), "yyyy-MM-dd"),
                    booking_time: time,
                    duration_hours: hours,
                    total_price: totalPrice,
                    status: 'pending_offer',
                    extra_services: selectedServices,
                })
                .select()
                .single();

            if (bookingError || !bookingData) {
                throw new Error(bookingError?.message || "Fout bij het aanmaken van de boekingsaanvraag.");
            }

            const { error: offerError } = await supabase
                .from('job_offers')
                .insert({
                    booking_id: bookingData.id,
                    cleaner_id: schoonmaker.id,
                    status: 'pending',
                });

            if (offerError) {
                throw new Error(offerError?.message || "Fout bij het aanmaken van de jobaanbieding.");
            }

            dismissToast(toastId);
            showSuccess("Boekingsaanvraag succesvol verzonden! De schoonmaker zal uw aanvraag beoordelen.");

            const confirmationDetails = {
                schoonmaker,
                date: date.toISOString(),
                time,
                hours,
                totalPrice,
                status: 'pending_offer',
                bookingId: bookingData.id,
                extra_services: selectedServices,
            };
            navigate("/bevestiging", { state: { bookingDetails: confirmationDetails } });

        } catch (error: any) {
            dismissToast(toastId);
            showError(error.message || "Er is een onverwachte fout opgetreden bij het verzenden van de aanvraag.");
            console.error("Cash booking submission error:", error);
        } finally {
            setIsLoadingStripe(false);
        }
    };

    if (isAuthLoading || !user) {
      return (
        <div className="container text-center py-20">
          <h1 className="text-2xl font-bold">Laden...</h1>
          <p className="text-muted-foreground">Controleren van authenticatiestatus.</p>
        </div>
      );
    }

    if (!date || !time) {
        return (
            <div className="container text-center py-20">
                <h1 className="text-2xl font-bold">Oeps! Er is iets misgegaan.</h1>
                <p className="text-muted-foreground">Selecteer een datum en tijd op de profielpagina.</p>
                <Button asChild className="mt-4">
                    <Link to={`/schoonmaker/${id}`}>Terug naar profiel</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Bevestig je boeking</CardTitle>
                    <CardDescription>
                        Je boekt {schoonmaker.name} op {format(new Date(date), "eeee d MMMM", { locale: nl })} om {time}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="font-semibold">Hoeveel uur?</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.max(2, h - 1))} disabled={isLoadingStripe}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-bold w-12 text-center">{hours} uur</span>
                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.min(8, h + 1))} disabled={isLoadingStripe}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label className="font-semibold">Extra diensten</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {extraServices.map(service => (
                                <div key={service.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={service.id}
                                        onCheckedChange={() => handleServiceChange(service.id)}
                                        disabled={isLoadingStripe}
                                    />
                                    <Label htmlFor={service.id} className="flex justify-between w-full">
                                        <span>{service.label}</span>
                                        <span>€{service.price.toFixed(2)}</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {selectedServices.length >= MIN_SERVICES_FOR_DISCOUNT && (
                            <p className="text-sm text-green-600 mt-2">
                                Je krijgt {DISCOUNT_PERCENTAGE * 100}% korting op extra diensten!
                            </p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Prijsoverzicht</h3>
                        <div className="space-y-1 text-muted-foreground">
                            <div className="flex justify-between">
                                <span>{schoonmaker.name} ({hours} uur)</span>
                                <span>€{basePrice.toFixed(2)}</span>
                            </div>
                            {selectedServices.map(serviceId => {
                                const service = extraServices.find(s => s.id === serviceId);
                                return (
                                    <div key={serviceId} className="flex justify-between">
                                        <span>{service?.label}</span>
                                        <span>€{service?.price.toFixed(2)}</span>
                                    </div>
                                );
                            })}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Korting</span>
                                  <span>-€{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-foreground">
                                <span>Totaal</span>
                                <span>€{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Kies een betaalmethode</h3>
                        <RadioGroup value={paymentMethod} onValueChange={(value: 'stripe' | 'cash') => setPaymentMethod(value)} className="grid grid-cols-1 gap-4">
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="stripe" id="payment-stripe" disabled={isLoadingStripe} />
                                <Label htmlFor="payment-stripe" className="flex-grow cursor-pointer">
                                    Online betalen (iDEAL, Creditcard, etc.)
                                    <p className="text-xs text-muted-foreground">Veilig en direct via Stripe.</p>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value="cash" id="payment-cash" disabled={isLoadingStripe} />
                                <Label htmlFor="payment-cash" className="flex-grow cursor-pointer">
                                    Contant betalen
                                    <p className="text-xs text-muted-foreground">Betaal de schoonmaker direct na de service.</p>
                                </Label>
                            </div>
                        </RadioGroup>

                        {paymentMethod === 'stripe' && (
                            isLoadingStripe ? (
                                <div className="flex items-center justify-center h-32 mt-4">
                                    <p>Laden van betaalformulier...</p>
                                </div>
                            ) : stripeError ? (
                                <div className="text-red-500 text-center p-4 border border-red-300 rounded-md mt-4">
                                    <p>Fout: {stripeError}</p>
                                    <Button onClick={() => window.location.reload()} className="mt-2">Opnieuw proberen</Button>
                                </div>
                            ) : (
                                <div ref={checkoutRef} id="checkout" className="mt-4" />
                            )
                        )}

                        {paymentMethod === 'cash' && (
                            <Button size="lg" className="w-full mt-6" onClick={handleCashBooking} disabled={isLoadingStripe}>
                                {isLoadingStripe ? "Verwerken..." : `Bevestig boeking (Betaal €${totalPrice.toFixed(2)} contant)`}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Boeken;