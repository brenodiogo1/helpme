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
    if (settings.baseHourlyRate !== undefined && settings.baseHourlyRate !== null) {
      const calculatedBasePrice = durationHours * settings.baseHourlyRate;
      setBasePrice(calculatedBasePrice);

      const calculatedExtrasPrice = selectedExtraServices.reduce((sum: number, serviceId: string) => {
        const service = extraServicesOptions.find(s => s.id === serviceId);
        return sum + (service ? service.price : 0);
      }, 0);
      setExtrasPrice(calculatedExtrasPrice);

      const calculatedTotalPrice = calculatedBasePrice + calculatedExtrasPrice + settings.serviceFeeFixed - discountAmount;
      setTotalPrice(calculatedTotalPrice);
    }
  }, [durationHours, selectedExtraServices, settings.baseHourlyRate, settings.serviceFeeFixed, discountAmount]);

  const handleCashBookingSubmit = async (data: QuickBookingFormData) => {
    // Fetch service_id for 'Find a cleaner'
    const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('name', 'Find a cleaner')
        .single();

    if (serviceError || !serviceData) {
        console.error("Error fetching service ID:", serviceError);
        toast.error("Service 'Find a cleaner' not found. Please contact support.");
        return;
    }

    const { data: newBooking, error } = await supabase.from('bookings').insert({
      service_id: serviceData.id,
      frequency_code: 'once', // Default to 'once' for quick booking
      home_size_m2: null, // Not collected in quick booking
      duration_hours: data.durationHours,
      date: data.bookingDate.toISOString().split('T')[0],
      start_time: data.bookingTime,
      allow_alt_weekday: false, // Default for quick booking
      postcode: data.zipCode,
      city: data.city,
      base_hourly_rate: settings.baseHourlyRate,
      discount: discountAmount,
      service_fee: settings.serviceFeeFixed,
      addons_total: extrasPrice,
      estimated_total: totalPrice,
      status: 'draft', // Initial status for cash booking
    }).select('id').single();

    if (error) {
      console.error("Error submitting cash booking:", error);
      toast.error("Er is een fout opgetreden bij het indienen van uw boeking. Probeer het opnieuw.");
      return;
    }

    // Insert booking addons
    if (selectedExtraServices.length > 0) {
        const { data: addonsData, error: addonsFetchError } = await supabase
            .from('addons')
            .select('id, name')
            .in('name', extraServicesOptions.filter(es => selectedExtraServices.includes(es.id)).map(es => es.label));

        if (addonsFetchError) {
            console.error("Error fetching addons:", addonsFetchError);
            toast.error("Er is een fout opgetreden bij het toevoegen van extra diensten.");
            return;
        }

        const bookingAddonsToInsert = addonsData.map(addon => ({
            booking_id: newBooking.id,
            addon_id: addon.id,
            qty: 1, // Assuming quantity is 1 for now
        }));

        const { error: insertAddonsError } = await supabase
            .from('booking_addons')
            .insert(bookingAddonsToInsert);

        if (insertAddonsError) {
            console.error("Error inserting booking addons:", insertAddonsError);
            toast.error("Er is een fout opgetreden bij het opslaan van extra diensten.");
            return;
        }
    }

    toast.success("Uw boeking is succesvol ingediend!");
    reset();
    navigate('/bevestiging', { state: { bookingDetails: { status: 'pending_payment', totalPrice: totalPrice, date: data.bookingDate.toISOString(), time: data.bookingTime, hours: data.durationHours, firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, address: data.address, city: data.city, zipCode: data.zipCode, notes: data.notes, selectedExtraServices: data.selectedExtraServices, basePrice: basePrice, extrasPrice: extrasPrice, discountAmount: discountAmount, platformFee: settings.serviceFeeFixed } } });
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
                  isLoadingStripe={isLoadingStripe}
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