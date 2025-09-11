"use client";

import React, { useEffect, useRef } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from "@/integrations/supabase/client";
// import { showError } from "@/utils/toast"; // Removido: 'showError' não é usado diretamente aqui
import { Button } from "@/components/ui/button";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface StripeCheckoutEmbedProps {
  totalPrice: number;
  bookingDate: Date | undefined;
  bookingTime: string | undefined;
  // setIsLoadingStripe: (loading: boolean) => void; // Removido: agora gerenciado internamente
  stripeError: string | null;
  setStripeError: (error: string | null) => void;
  formTrigger: () => Promise<boolean>; // Adicionado para validar o formulário antes de inicializar o Stripe
}

const StripeCheckoutEmbed: React.FC<StripeCheckoutEmbedProps> = ({
  totalPrice,
  bookingDate,
  bookingTime,
  // setIsLoadingStripe, // Removido da desestruturação
  stripeError,
  setStripeError,
  formTrigger,
}) => {
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [isLoadingStripe, setIsLoadingStripe] = React.useState(true); // Adicionado estado interno

  useEffect(() => {
    const initializeStripeCheckout = async () => {
      setIsLoadingStripe(true);
      setStripeError(null);

      const isValid = await formTrigger();
      if (!isValid) {
          setStripeError("Vul alstublieft alle verplichte velden in.");
          setIsLoadingStripe(false);
          return;
      }

      if (totalPrice <= 0) {
        setStripeError("Het totaalbedrag moet positief zijn om online te betalen.");
        setIsLoadingStripe(false);
        return;
      }

      if (!bookingDate || !bookingTime) {
          setStripeError("Data en tijd da reserva não fornecidas.");
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
  }, [totalPrice, bookingDate, bookingTime, setStripeError, formTrigger]);

  return (
    <>
      {stripeError ? (
          <div className="text-red-500 text-center p-4 border border-red-300 rounded-md mt-4">
              <p>Erro: {stripeError}</p>
              <Button onClick={() => window.location.reload()} className="mt-2">Opnieuw proberen</Button>
          </div>
      ) : (
          <>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                  Vul uw betaalgegevens in het onderstaande formulier in om de boeking te voltooien.
              </p>
              <div ref={checkoutRef} id="checkout" className="mt-4" />
          </>
      )}
    </>
  );
};

export default StripeCheckoutEmbed;