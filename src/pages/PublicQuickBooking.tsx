"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BookingDetailsForm, { bookingDetailsSchema } from "@/components/quick-booking/BookingDetailsForm";
import ExtraServicesForm, { extraServicesSchema } from "@/components/quick-booking/ExtraServicesForm";
import ContactDetailsForm, { contactDetailsSchema } from "@/components/quick-booking/ContactDetailsForm";
import PriceSummary from "@/components/quick-booking/PriceSummary";
import PaymentMethodSelection from "@/components/quick-booking/PaymentMethodSelection";
import StripeCheckoutEmbed from "@/components/quick-booking/StripeCheckoutEmbed";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Combine all schemas
const quickBookingSchema = z.object({
  ...bookingDetailsSchema.shape,
  ...extraServicesSchema.shape,
  ...contactDetailsSchema.shape,
});

type QuickBookingFormData = z.infer<typeof quickBookingSchema>;

const PublicQuickBooking: React.FC = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const methods = useForm<QuickBookingFormData>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      bookingDate: undefined,
      bookingTime: "",
      durationHours: 2,
      selectedExtraServices: [],
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      notes: "",
    },
  });

  const { handleSubmit, watch, formState, reset, trigger } = methods;

  const durationHours = watch("durationHours");
  const selectedExtraServices = watch("selectedExtraServices") || [];
  const bookingDate = watch("bookingDate");
  const bookingTime = watch("bookingTime");

  const [basePrice, setBasePrice] = useState(0);
  const [extrasPrice, setExtrasPrice] = useState(0);
  const [discountAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const [isLoadingStripe, setIsLoadingStripe] = useState(false); // Estado para carregamento do Stripe
  const [stripeError, setStripeError] = useState<string | null>(null);

  const extraServicesOptions = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
  ];

  useEffect(() => {
    if (settings.hourlyRate !== undefined && settings.hourlyRate !== null) {
      const calculatedBasePrice = durationHours * settings.hourlyRate;
      setBasePrice(calculatedBasePrice);

      const calculatedExtrasPrice = selectedExtraServices.reduce((sum: number, serviceId: string) => {
        const service = extraServicesOptions.find(s => s.id === serviceId);
        return sum + (service ? service.price : 0);
      }, 0);
      setExtrasPrice(calculatedExtrasPrice);

      const calculatedTotalPrice = calculatedBasePrice + calculatedExtrasPrice + settings.platformBookingFee - discountAmount;
      setTotalPrice(calculatedTotalPrice);
    }
  }, [durationHours, selectedExtraServices, settings.hourlyRate, settings.platformBookingFee, discountAmount]);

  const handleCashBookingSubmit = async (data: QuickBookingFormData) => {
    const { error } = await supabase.from('quick_bookings').insert({
      booking_date: data.bookingDate.toISOString().split('T')[0],
      booking_time: data.bookingTime,
      duration_hours: data.durationHours,
      extra_services: data.selectedExtraServices,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      zip_code: data.zipCode,
      notes: data.notes,
      base_price: basePrice,
      extras_price: extrasPrice,
      discount_amount: discountAmount,
      total_price: totalPrice,
      platform_fee: settings.platformBookingFee,
      status: 'pending',
    });

    if (error) {
      console.error("Error submitting cash booking:", error);
      toast.error("Er is een fout opgetreden bij het indienen van uw boeking. Probeer het opnieuw.");
    } else {
      toast.success("Uw boeking is succesvol ingediend!");
      reset();
      navigate('/bevestiging', { state: { bookingDetails: { status: 'pending_assignment', totalPrice: totalPrice, date: data.bookingDate.toISOString(), time: data.bookingTime, hours: data.durationHours } } });
    }
  };

  const onSubmit = async (data: QuickBookingFormData) => {
    if (paymentMethod === 'cash') {
      await handleCashBookingSubmit(data);
    }
    // Stripe payment is handled by the StripeCheckoutEmbed component directly
    // It will redirect to /bevestiging on success
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Snel Boeken</CardTitle>
          <CardDescription className="text-center">
            Vul de details in voor uw schoonmaakboeking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <BookingDetailsForm isSubmitting={formState.isSubmitting} />
              <ExtraServicesForm isSubmitting={formState.isSubmitting} />
              <ContactDetailsForm isSubmitting={formState.isSubmitting} />

              <Separator className="my-6" />

              <PriceSummary
                durationHours={durationHours}
                selectedExtraServices={selectedExtraServices}
                basePrice={basePrice}
                extrasPrice={extrasPrice}
                discountAmount={discountAmount}
                totalPrice={totalPrice}
              />

              <PaymentMethodSelection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                isSubmitting={formState.isSubmitting}
                totalPrice={totalPrice}
              />

              {paymentMethod === 'stripe' && (
                <StripeCheckoutEmbed
                  totalPrice={totalPrice}
                  bookingDate={bookingDate}
                  bookingTime={bookingTime}
                  setIsLoadingStripe={setIsLoadingStripe}
                  stripeError={stripeError}
                  setStripeError={setStripeError}
                  formTrigger={trigger}
                  isLoadingStripe={isLoadingStripe} // <--- Passed isLoadingStripe here
                />
              )}

              {paymentMethod === 'cash' && (
                <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? "Boeking indienen..." : "Boeking indienen"}
                </Button>
              )}
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicQuickBooking;