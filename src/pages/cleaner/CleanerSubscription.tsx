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
import { useNavigate } from "react-router-dom";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const CleanerSubscription = () => {
  const [paymentOption, setPaymentOption] = useState("direct"); // 'direct' or 'earnings'
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const proPlanPriceId = import.meta.env.VITE_STRIPE_PRO_PLAN_PRICE_ID;

  useEffect(() => {
    if (paymentOption === 'direct' && proPlanPriceId) {
      const initializeStripeCheckout = async () => {
        setIsLoadingStripe(true);
        setStripeError(null);

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

          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            throw new Error("Usuário não autenticado. Por favor, faça login novamente.");
          }

          const returnUrl = `${window.location.origin}/dashboard/abonnement`; // Return to this page after checkout

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
          console.error("Stripe Checkout initialization error:", err);
          setStripeError(err.message || "Erro ao inicializar o pagamento.");
        } finally {
          setIsLoadingStripe(false);
        }
      };

      initializeStripeCheckout();
    } else if (paymentOption === 'earnings') {
      setIsLoadingStripe(false);
      setStripeError(null);
    }
  }, [paymentOption, proPlanPriceId]);

  const handleUpgrade = async () => {
    if (paymentOption === "earnings") {
      const toastId = showLoading("Processando sua assinatura...");
      try {
        // Simulate backend logic for deducting from earnings
        // In a real app, this would involve updating the cleaner's subscription status in your DB
        // and setting up a recurring deduction from their payouts.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

        dismissToast(toastId);
        showSuccess("Gefeliciteerd! Je bent nu een Pro Schoonmaker. De kosten worden verrekend met je toekomstige inkomsten.");
        navigate("/dashboard"); // Redirect to dashboard after successful subscription
      } catch (error: any) {
        dismissToast(toastId);
        showError(error.message || "Er is een fout opgetreden bij het verwerken van je abonnement.");
      }
    } else if (paymentOption === 'direct') {
        // Stripe Embedded Checkout handles the submission for 'direct' payment
        // The user will interact with the Stripe form mounted in checkoutRef
        showSuccess("Voltooi de betaling via het Stripe-formulier hieronder.");
    }
  };

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
              <p>Erro: {stripeError}</p>
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