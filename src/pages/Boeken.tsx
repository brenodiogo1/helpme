import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Minus, Plus, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { showLoading, showSuccess, dismissToast, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from '@stripe/stripe-js';

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

// Carregar o Stripe fora do componente para evitar recargas desnecessárias
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const Boeken = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { date, time } = location.state || {};

    const [hours, setHours] = useState(3);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const checkoutRef = useRef<HTMLDivElement>(null);

    const schoonmaker = mockSchoonmaker; // Fetch cleaner by id

    const basePrice = hours * schoonmaker.hourlyRate;
    const extrasPrice = useMemo(() => {
        return extraServices
            .filter(service => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);
    }, [selectedServices]);
    const totalPrice = basePrice + extrasPrice;

    const handleServiceChange = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleInitiateCheckout = async () => {
        setIsProcessing(true);
        const toastId = showLoading("Sessie voor betaling aanmaken...");

        try {
            if (!stripePromise) {
                throw new Error("Stripe não está configurado. Verifique VITE_STRIPE_PUBLISHABLE_KEY.");
            }
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

            dismissToast(toastId);
            showSuccess("Sessie aangemaakt. Redirigindo para betaling...");

            // Pass booking details to confirmation page via state
            const bookingDetails = {
                schoonmaker,
                date,
                time,
                hours,
                totalPrice,
                selectedServices,
            };
            navigate(returnUrl, { state: { bookingDetails, clientSecret } }); // Pass clientSecret to confirmation page

        } catch (error: any) {
            dismissToast(toastId);
            showError(error.message || "Er is een onverwachte fout opgetreden bij het starten van de betaling.");
            console.error("Checkout initiation error:", error);
        } finally {
            setIsProcessing(false);
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
                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.max(2, h - 1))} disabled={isProcessing}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-bold w-12 text-center">{hours} uur</span>
                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.min(8, h + 1))} disabled={isProcessing}>
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
                                        disabled={isProcessing}
                                    />
                                    <Label htmlFor={service.id} className="flex justify-between w-full">
                                        <span>{service.label}</span>
                                        <span>€{service.price.toFixed(2)}</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
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
                        <div ref={checkoutRef} id="checkout">
                            {/* Stripe Checkout will be rendered here */}
                        </div>
                        <Button size="lg" className="w-full mt-6" onClick={handleInitiateCheckout} disabled={isProcessing}>
                            {isProcessing ? "Verwerken..." : `Betaal €${totalPrice.toFixed(2)} en bevestig`}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Boeken;