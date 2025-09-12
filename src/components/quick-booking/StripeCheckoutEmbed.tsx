"use client";

import React, { useEffect, useRef } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { bookingDetailsSchema } from "./BookingDetailsForm";
import { extraServicesSchema } from "./ExtraServicesSelection";
import { contactDetailsSchema } from "./ContactDetailsForm";

// Combine all schemas to define the full form data type
const quickBookingSchema = z.object({
  ...bookingDetailsSchema.shape,
  ...extraServicesSchema.shape,
  ...contactDetailsSchema.shape,
});

type QuickBookingFormData = z.infer<typeof quickBookingSchema>;

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface StripeCheckoutEmbedProps {
  totalPrice: number;
  bookingDate: Date | undefined;
  bookingTime: string | undefined;
  setIsLoadingStripe: (loading: boolean) => void;
  stripeError: string | null;
  setStripeError: (error: string | null) => void;
  formTrigger: () => Promise<boolean>;
  isLoadingStripe: boolean;
  quickBookingFormData: QuickBookingFormData; // Adicionado para receber todos os dados do formulário
  basePrice: number; // Adicionado
  extrasPrice: number; // Adicionado
  discountAmount: number; // Adicionado
  platformFee: number; // Adicionado
}

const StripeCheckoutEmbed: React.FC<StripeCheckoutEmbedProps> = ({
  totalPrice,
  bookingDate,
  bookingTime,
  setIsLoadingStripe,
  stripeError,
  setStripeError,
  formTrigger,
  isLoadingStripe,
  quickBookingFormData, // Usado aqui
  basePrice,
  extrasPrice,
  discountAmount,
  platformFee,
}) => {
  const checkoutRef = useRef<HTMLDivElement>(null);

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
          setStripeError("Data e tempo da reserva não fornecidas.");
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

          // Prepare metadata, ensuring date is a string
          const metadataToSend = {
            ...quickBookingFormData,
            bookingDate: quickBookingFormData.bookingDate ? quickBookingFormData.bookingDate.toISOString() : undefined,
            basePrice: basePrice.toFixed(2),
            extrasPrice: extrasPrice.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            totalPrice: totalPrice.toFixed(2),
            platformFee: platformFee.toFixed(2),
            isQuickBooking: 'true', // Flag to identify quick bookings on confirmation page
          };

          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
              body: JSON.stringify({
                  amount: totalPrice,
                  currency: 'eur',
                  return_url: returnUrl,
                  metadata: metadataToSend, // Envia os dados do formulário como metadata
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
  }, [totalPrice, bookingDate, bookingTime, setIsLoadingStripe, setStripeError, formTrigger, quickBookingFormData, basePrice, extrasPrice, discountAmount, platformFee]);

  return (
    <>
      {stripeError ? (
          <div className="text-red-500 text-center p-4 border border-red-300 rounded-md mt-4">
              <p>Erro: {stripeError}</p>
              <Button onClick={() => window.location.reload()} className="mt-2">Opnieuw proberen</Button>
          </div>
      ) : (
          <>
              {isLoadingStripe ? (
                  <div className="flex items-center justify-center h-32 mt-4">
                      <p>Laden van betaalformulier...</p>
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
      )}
    </>
  );
};

export default StripeCheckoutEmbed;