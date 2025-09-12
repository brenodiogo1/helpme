"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { showLoading, showSuccess, dismissToast, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from '@stripe/stripe-js';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/contexts/SettingsContext";
import BookingStepper from "@/components/booking/BookingStepper";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { FrequencyCards, FREQ, FrequencyCode } from "@/components/booking/FrequencyCards";

// Mock data - in a real app, you'd fetch this based on the ID
const mockSchoonmaker: Schoonmaker = {
    id: "1",
    name: "Anna de Vries",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 128,
    hourlyRate: 18.50, // This will be overridden by baseHourlyRate from settings for calculation
    bio: "Bio",
    services: [],
    city: "Amsterdam",
    address: "Kerkstraat 12, 1012 AB Amsterdam",
    postcode: "1012 AB", // Added postcode
    phoneNumber: "+31612345678",
};

// Removed extraServices array as it is no longer used in this component.

// Carregar o Stripe fora do componente para evitar recargas desnecessárias
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const Boeken = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { date, time, postcode: initialPostcode, city: initialCity } = location.state || {};
    const { settings } = useSettings(); // Use settings context

    const [currentStep, setCurrentStep] = useState(1); // Start at step 1
    const [hours, setHours] = useState(3);
    // const [selectedServices, setSelectedServices] = useState<string[]>([]); // Removed as it's not used here
    const [frequency, setFrequency] = useState<FrequencyCode>('once');
    // const [homeSizeM2, setHomeSizeM2] = useState<number | undefined>(undefined); // Removed unused state
    // const [allowAltWeekday, setAllowAltWeekday] = useState(false); // Removed unused state
    const [postcode] = useState<string>(initialPostcode || ""); // Removed unused setter
    const [city] = useState<string>(initialCity || ""); // Removed unused setter

    const [isLoadingStripe, setIsLoadingStripe] = useState(true);
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
    const checkoutRef = useRef<HTMLDivElement>(null);

    const schoonmaker = mockSchoonmaker; // Fetch cleaner by id (for display purposes, pricing from settings)

    const steps = ["Jouw boeking", "Jouw gegevens", "Betaling"];

    const basePrice = hours * settings.baseHourlyRate;
    const extrasPrice = useMemo(() => {
        // Assuming selectedServices is managed elsewhere or not needed for this page's calculation
        // For now, setting to 0 as selectedServices state is removed.
        return 0; 
    }, []); // No dependencies as selectedServices is removed

    const frequencyDiscountAmount = useMemo(() => {
      const discountRate = FREQ[frequency]?.discount || 0;
      return basePrice * discountRate;
    }, [basePrice, frequency]);

    const subtotal = basePrice + extrasPrice - frequencyDiscountAmount;
    const platformFee = settings.serviceFeeFixed;
    const totalPrice = subtotal + platformFee;

    // const handleServiceChange = (serviceId: string) => { // Removed unused function
    //     setSelectedServices(prev =>
    //         prev.includes(serviceId)
    //             ? prev.filter(id => id !== serviceId)
    //             : [...prev, serviceId]
    //     );
    // };

    useEffect(() => {
        if (currentStep === 3 && paymentMethod === 'stripe') {
            const initializeStripeCheckout = async () => {
                if (!date || !time) {
                    setStripeError("Data e hora da reserva não fornecidas.");
                    setIsLoadingStripe(false);
                    return;
                }

                if (!stripePromise) {
                    setStripeError("Stripe não está configurado. Verifique VITE_STRIPE_PUBLISHABLE_KEY.");
                    setIsLoadingStripe(false);
                    return;
                }

                try {
                    const stripe = await stripePromise;
                    if (!stripe) {
                        throw new Error("Falha ao carregar o Stripe.");
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
                    console.error("Stripe Checkout initialization error:", err);
                    setStripeError(err.message || "Erro ao inicializar o pagamento.");
                } finally {
                    setIsLoadingStripe(false);
                }
            };

            initializeStripeCheckout();
        } else {
            setIsLoadingStripe(false);
            setStripeError(null);
        }
    }, [date, time, totalPrice, id, paymentMethod, settings.baseHourlyRate, settings.serviceFeeFixed, currentStep]);

    const handleCashBooking = async () => {
        setIsLoadingStripe(true);
        const toastId = showLoading("Boekingsaanvraag verzenden...");

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error("Gebruiker niet ingelogd.");
            }

            const { data: serviceData, error: serviceError } = await supabase
                .from('services')
                .select('id')
                .eq('name', 'Find a cleaner')
                .single();

            if (serviceError || !serviceData) {
                throw new Error(serviceError?.message || "Service 'Find a cleaner' not found.");
            }

            const { data: bookingData, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: user.id,
                    service_id: serviceData.id,
                    frequency_code: frequency,
                    // home_size_m2: homeSizeM2, // Removed as it's not collected here
                    duration_hours: hours,
                    date: format(new Date(date), "yyyy-MM-dd"),
                    start_time: time,
                    allow_alt_weekday: false,
                    postcode: postcode,
                    city: city,
                    base_hourly_rate: settings.baseHourlyRate,
                    discount: FREQ[frequency]?.discount || 0,
                    service_fee: settings.serviceFeeFixed,
                    addons_total: extrasPrice,
                    estimated_total: totalPrice,
                    status: 'pending_payment',
                })
                .select('id')
                .single();

            if (bookingError || !bookingData) {
                throw new Error(bookingError?.message || "Fout bij het aanmaken van de boekingsaanvraag.");
            }

            // if (selectedServices.length > 0) { // Removed as selectedServices state is removed
            //     const { data: addonsData, error: addonsError } = await supabase
            //         .from('addons')
            //         .select('id, name')
            //         .in('name', extraServices.filter(es => selectedServices.includes(es.id)).map(es => es.label));

            //     if (addonsError) {
            //         throw new Error(addonsError.message);
            //     }

            //     const bookingAddonsToInsert = addonsData.map(addon => ({
            //         booking_id: bookingData.id,
            //         addon_id: addon.id,
            //         qty: 1,
            //     }));

            //     const { error: insertAddonsError } = await supabase
            //         .from('booking_addons')
            //         .insert(bookingAddonsToInsert);

            //     if (insertAddonsError) {
            //         throw new Error(insertAddonsError.message);
            //     }
            // }

            dismissToast(toastId);
            showSuccess("Boekingsaanvraag succesvol verzonden! De schoonmaker zal uw aanvraag beoordelen.");

            const confirmationDetails = {
                schoonmaker,
                date: new Date(date).toISOString(),
                time,
                hours,
                totalPrice,
                status: 'pending_payment',
                bookingId: bookingData.id,
                postcode,
                city,
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
        <div className="container py-8 max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Bevestig je boeking</CardTitle>
                    <CardDescription>
                        Je boekt {schoonmaker.name} op {format(new Date(date), "eeee d MMMM", { locale: nl })} om {time}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <BookingStepper currentStep={currentStep} steps={steps} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Booking Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {currentStep === 1 && (
                                <>
                                    <h3 className="font-semibold text-lg">Frequentie</h3>
                                    <FrequencyCards value={frequency} onChange={setFrequency} />
                                    <Separator />

                                    <h3 className="font-semibold text-lg">Tijd & Duur</h3>
                                    <div>
                                        <Label className="font-semibold">Hoeveel uur?</Label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.max(2, h - 0.5))} disabled={isLoadingStripe || hours <= 2}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="text-lg font-bold w-12 text-center">{hours} uur</span>
                                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.min(8, h + 0.5))} disabled={isLoadingStripe}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={() => setCurrentStep(2)}>Volgende stap</Button>
                                    </div>
                                </>
                            )}

                            {currentStep === 2 && (
                                <>
                                    <h3 className="font-semibold text-lg">Jouw gegevens</h3>
                                    <p>Formulário de dados pessoais hier...</p>
                                    <div className="flex justify-between">
                                        <Button variant="outline" onClick={() => setCurrentStep(1)}>Vorige stap</Button>
                                        <Button onClick={() => setCurrentStep(3)}>Volgende stap</Button>
                                    </div>
                                </>
                            )}

                            {currentStep === 3 && (
                                <>
                                    <h3 className="font-semibold text-lg">Betaling</h3>
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
                                                <p>Erro: {stripeError}</p>
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
                                    <div className="flex justify-start">
                                        <Button variant="outline" onClick={() => setCurrentStep(2)}>Vorige stap</Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <BookingSummary
                                ctx={{
                                    postcode: postcode,
                                    city: city,
                                    frequency: frequency,
                                    duration: hours,
                                    date: date ? new Date(date) : undefined,
                                    time: time,
                                    addonsTotal: extrasPrice,
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Boeken;