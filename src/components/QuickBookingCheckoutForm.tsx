"use client";

import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { showLoading, showSuccess, dismissToast, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as z from "zod"; // Importar z para o tipo do formulário

interface QuickBookingCheckoutFormProps {
  bookingDetails: z.infer<any>; // Usar 'any' temporariamente, ou definir um tipo mais específico
  totalPrice: number;
  setIsProcessing: (processing: boolean) => void;
  isProcessing: boolean;
}

const QuickBookingCheckoutForm: React.FC<QuickBookingCheckoutFormProps> = ({
  bookingDetails,
  totalPrice,
  setIsProcessing,
  isProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    const toastId = showLoading("Betaling verwerken en boeking aanmaken...");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const customerId = user?.id || null; // Pode ser nulo se o usuário não estiver logado

      const { error: submitError } = await elements.submit();

      if (submitError) {
        setMessage(submitError.message);
        throw new Error(submitError.message);
      }

      const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bevestiging`,
        },
        redirect: 'if_required',
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
                customer_id: customerId,
                cleaner_id: null, // Nenhum limpador atribuído inicialmente
                booking_date: format(bookingDetails.bookingDate, "yyyy-MM-dd"),
                booking_time: bookingDetails.bookingTime,
                duration_hours: bookingDetails.durationHours,
                total_price: totalPrice,
                status: 'paid_pending_assignment', // Novo status: pago e aguardando atribuição
                address: bookingDetails.address,
                postcode: bookingDetails.postcode,
                phone_number: bookingDetails.phoneNumber,
                first_name: bookingDetails.firstName,
                last_name: bookingDetails.lastName,
                email: bookingDetails.email,
            })
            .select()
            .single();

        if (bookingError || !bookingData) {
            throw new Error(bookingError?.message || "Fout bij het aanmaken van de boeking na betaling.");
        }

        dismissToast(toastId);
        showSuccess("Betaling succesvol! Je boeking is aangevraagd en aguarda atribuição.");

        const confirmationDetails = {
            schoonmaker: { name: "Nog niet toegewezen" }, // Placeholder
            date: bookingDetails.bookingDate.toISOString(),
            time: bookingDetails.bookingTime,
            hours: bookingDetails.durationHours,
            totalPrice,
            status: 'paid_pending_assignment',
            bookingId: bookingData.id,
        };
        navigate("/bevestiging", { state: { bookingDetails: confirmationDetails } });

      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        setMessage("Betaling vereist extra actie. Volg de instructies.");
        showError("Betaling vereist extra actie.");
      } else {
        setMessage("Er is een onverwachte fout opgetreden bij de betaling.");
        showError("Er is een onverwachte fout opgetreden bij de betaling.");
      }

    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Er is een onverwachte fout opgetreden bij het verwerken van de betaling.");
      console.error("Payment or quick booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form id="quick-booking-payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <Button size="lg" className="w-full mt-6" disabled={!stripe || !elements || isProcessing}>
        {isProcessing ? "Verwerken..." : `Betaal €${totalPrice.toFixed(2)} en vraag aan`}
      </Button>
      {message && <div id="payment-message" className="mt-4 text-red-500 text-sm">{message}</div>}
    </form>
  );
};

export default QuickBookingCheckoutForm;