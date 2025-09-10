"use client";

import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { showLoading, showSuccess, dismissToast, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Schoonmaker } from "@/types";

interface CheckoutFormProps {
  schoonmaker: Schoonmaker;
  date: string;
  time: string;
  hours: number;
  totalPrice: number;
  selectedServices: string[];
  setIsProcessing: (processing: boolean) => void;
  isProcessing: boolean; // Adicionado: o estado de processamento também precisa ser passado
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  schoonmaker,
  date,
  time,
  hours,
  totalPrice,
  selectedServices,
  setIsProcessing,
  isProcessing, // Adicionado: desestruturar a prop
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
    const toastId = showLoading("Betaling verwerken en boeking aanmaken...");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
          throw new Error("Gebruiker niet ingelogd.");
      }

      const { error: submitError } = await elements.submit();

      if (submitError) {
        setMessage(submitError.message);
        throw new Error(submitError.message);
      }

      const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: `${window.location.origin}/bevestiging`, // Stripe redirecionará para cá após o pagamento
        },
        redirect: 'if_required', // Não redirecionar automaticamente, vamos lidar com isso manualmente
      });

      if (confirmError) {
        setMessage(confirmError.message);
        throw new Error(confirmError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, now create the booking in Supabase
        const { data: bookingData, error: bookingError } = await supabase
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

        if (bookingError || !bookingData) {
            throw new Error(bookingError?.message || "Fout bij het aanmaken van de boeking na betaling.");
        }

        // Create the job offer for the cleaner
        const { error: offerError } = await supabase
            .from('job_offers')
            .insert({
                booking_id: bookingData.id,
                cleaner_id: schoonmaker.id,
                status: 'accepted', // Oferta aceita automaticamente se o pagamento foi feito
            });

        if (offerError) {
            throw new Error(offerError?.message || "Fout bij het aanmaken van de jobaanbieding na betaling.");
        }

        dismissToast(toastId);
        showSuccess("Betaling succesvol! Je boeking is bevestigd.");

        const bookingDetails = {
            schoonmaker,
            date,
            time,
            hours,
            totalPrice,
            status: 'accepted',
            bookingId: bookingData.id,
        };
        navigate("/bevestiging", { state: { bookingDetails } });

      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle 3D Secure or other actions
        setMessage("Betaling vereist extra actie. Volg de instructies.");
        showError("Betaling vereist extra actie.");
        // Stripe will handle the redirect if return_url is set
      } else {
        setMessage("Er is een onverwachte fout opgetreden bij de betaling.");
        showError("Er is een onverwachte fout opgetreden bij de betaling.");
      }

    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Er is een onverwachte fout opgetreden bij het verwerken van de betaling.");
      console.error("Payment or booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <Button size="lg" className="w-full mt-6" disabled={!stripe || !elements || isProcessing}>
        {isProcessing ? "Verwerken..." : `Betaal €${totalPrice.toFixed(2)} en bevestig`}
      </Button>
      {message && <div id="payment-message" className="mt-4 text-red-500 text-sm">{message}</div>}
    </form>
  );
};

export default CheckoutForm;