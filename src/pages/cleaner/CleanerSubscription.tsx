"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useState, useRef, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom"; // Added Link import
import { useAuth } from "@/contexts/AuthContext";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const CleanerSubscription = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [paymentOption, setPaymentOption] = useState("direct");
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const proPlanPriceId = import.meta.env.VITE_STRIPE_PRO_PLAN_PRICE_ID;

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      showError("U moet ingelogd zijn om uw abonnement te beheren.");
      navigate('/login', { state: { from: '/dashboard/abonnement' } });
      return;
    }

    if (paymentOption === 'direct' && proPlanPriceId) {
      const initializeStripeCheckout = async () => {
        setIsLoadingStripe(true);
        setStripeError(null);

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

          const returnUrl = `${window.location.origin}/dashboard/abonnement`;

          const { data, error } = await supabase.functions.invoke('create-subscription-checkout-session', {
            body: JSON.stringify({
              priceId: proPlanPriceId,
              customerEmail: user.email,
              returnUrl: returnUrl,
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
    } else if (paymentOption === 'earnings') {
      setIsLoadingStripe(false);
      setStripeError(null);
    }
  }, [paymentOption, proPlanPriceId, user, isAuthLoading, navigate]);

  const handleUpgrade = async () => {
    if (!user) {
      showError("U moet ingelogd zijn om uw abonnement te beheren.");
      navigate('/login', { state: { from: '/dashboard/abonnement' } });
      return;
    }

    if (paymentOption === "earnings") {
      const toastId = showLoading("Processando uw abonnement...");
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        dismissToast(toastId);
        showSuccess("Gefeliciteerd! Je bent nu een Pro Schoonmaker. De kosten worden verrekend met je toekomstige inkomsten.");
        navigate("/dashboard");
      } catch (error: any) {
        dismissToast(toastId);
        showError(error.message || "Er is een fout opgetreden bij het verwerken van uw abonnement.");
      }
    } else if (paymentOption === 'direct') {
        showSuccess("Voltooi de betaling via het Stripe-formulier hieronder.");
    }
  };

  if (isAuthLoading) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mt-2">Laden...</CardTitle>
          <CardDescription>Controleren van authenticatiestatus.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mt-2">Niet geauthenticeerd</CardTitle>
          <CardDescription>U moet ingelogd zijn om uw abonnement te beheren.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link to="/login">Inloggen</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <Star className="h-12 w-12 mx-auto text-yellow-400" />
        <CardTitle className="text-2xl mt-4">Word een Pro Schoonmaker</CardTitle>
        <CardDescription>
          Krijg meer zichtbaarheid en boekingen met ons Pro abonnement voor €9,99/maand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Hogere positie in de zoekresultaten.</span>
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Speciale "Pro" badge op je profiel.</span>
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Toegang tot exclusieve, grotere opdrachten.</span>
          </li>
        </ul>

        <div className="space-y-2">
          <h3 className="font-semibold">Kies je betaalmethode:</h3>
          <RadioGroup value={paymentOption} onValueChange={setPaymentOption} className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="direct" id="direct-payment" disabled={isLoadingStripe} />
              <Label htmlFor="direct-payment" className="flex-grow cursor-pointer">
                Directe betaling (€9,99/maand)
                <p className="text-xs text-muted-foreground">Betaal via iDEAL/Creditcard.</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="earnings" id="earnings-discount" disabled={isLoadingStripe} />
              <Label htmlFor="earnings-discount" className="flex-grow cursor-pointer">
                Verrekenen met inkomsten
                <p className="text-xs text-muted-foreground">De kosten worden automatisch afgetrokken van je wekelijkse uitbetalingen.</p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {paymentOption === 'direct' && (
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
            <>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Vul uw betaalgegevens in het onderstaande formulier in om de abonnement te voltooien.
              </p>
              <div ref={checkoutRef} id="checkout" className="mt-4" />
            </>
          )
        )}

        {paymentOption === 'earnings' && (
          <Button size="lg" className="w-full" onClick={handleUpgrade} disabled={isLoadingStripe}>
            Upgrade naar Pro
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CleanerSubscription;