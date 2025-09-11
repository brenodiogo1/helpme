"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { showLoading, showSuccess, dismissToast, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { format } from "date-fns";

// Importar os novos componentes modulares e seus schemas
import PersonalDetailsForm, { personalDetailsSchema } from "@/components/quick-booking/PersonalDetailsForm";
import BookingDetailsForm, { bookingDetailsSchema } from "@/components/quick-booking/BookingDetailsForm";
import ExtraServicesSelection, { extraServicesSchema } from "@/components/quick-booking/ExtraServicesSelection";
import PriceSummary from "@/components/quick-booking/PriceSummary";
import PaymentMethodSelection from "@/components/quick-booking/PaymentMethodSelection";
import StripeCheckoutEmbed from "@/components/quick-booking/StripeCheckoutEmbed";

// Combinar todos os schemas em um único schema principal
const formSchema = z.object({
  ...personalDetailsSchema.shape,
  ...bookingDetailsSchema.shape,
  ...extraServicesSchema.shape,
});

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const defaultHourlyRate = 20.00;
const MIN_SERVICES_FOR_DISCOUNT = 2;
const DISCOUNT_PERCENTAGE = 0.10;

const PublicQuickBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isLoadingStripe, setIsLoadingStripe] = useState(true); // Removido: agora gerenciado em StripeCheckoutEmbed
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const navigate = useNavigate();
  const { settings } = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      postcode: "",
      bookingDate: undefined,
      bookingTime: "",
      durationHours: 3,
      selectedExtraServices: [],
    },
  });

  const { watch, trigger } = form;
  const durationHours = watch("durationHours");
  const selectedExtraServices = watch("selectedExtraServices") || [];
  const bookingDate = watch("bookingDate");
  const bookingTime = watch("bookingTime");

  const basePrice = durationHours * defaultHourlyRate;
  const extrasPrice = useMemo(() => {
    return extraServices
      .filter(service => selectedExtraServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
  }, [selectedExtraServices]);

  const discountAmount = useMemo(() => {
    if (selectedExtraServices.length >= MIN_SERVICES_FOR_DISCOUNT) {
      return extrasPrice * DISCOUNT_PERCENTAGE;
    }
    return 0;
  }, [selectedExtraServices, extrasPrice]);

  const subtotal = basePrice + extrasPrice - discountAmount;
  const platformFee = settings.platformBookingFee;
  const totalPrice = subtotal + platformFee;

  // Reset Stripe loading/error state when payment method changes
  useEffect(() => {
    // setIsLoadingStripe(true); // Removido: agora gerenciado em StripeCheckoutEmbed
    setStripeError(null);
  }, [paymentMethod]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    if (paymentMethod === 'stripe') {
      // Stripe payment is handled by the embedded checkout, this submit is only for cash
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading("Boekingsaanvraag verzenden...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const customerId = user?.id || null;

      const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .insert({
              customer_id: customerId,
              cleaner_id: null,
              booking_date: format(values.bookingDate, "yyyy-MM-dd"),
              booking_time: values.bookingTime,
              duration_hours: values.durationHours,
              total_price: totalPrice,
              status: 'pending_assignment',
              address: values.address,
              postcode: values.postcode,
              phone_number: values.phoneNumber,
              first_name: values.firstName,
              last_name: values.lastName,
              email: values.email,
          })
          .select()
          .single();

      if (bookingError || !bookingData) {
          throw new Error(bookingError?.message || "Fout bij het aanmaken van de boekingsaanvraag.");
      }

      dismissToast(toastId);
      showSuccess("Boekingsaanvraag succesvol verzonden! We nemen spoedig contact met u op via chat.");

      const confirmationDetails = {
          schoonmaker: { name: "Nog niet toegeweid" },
          date: values.bookingDate.toISOString(),
          time: values.bookingTime,
          hours: values.durationHours,
          totalPrice,
          status: 'pending_assignment',
          bookingId: bookingData.id,
      };
      navigate("/bevestiging", { state: { bookingDetails: confirmationDetails } });

    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Er is een onverwachte fout opgetredene bij het verzenden van de aanvraag.");
      console.error("Quick booking submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Snel een Schoonmaker Boeken</CardTitle>
          <CardDescription>
            Vul je gegevens in en vraag snel een schoonmaakafspraak aan. We vinden de beste schoonmaker voor jou!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-6">
                <PersonalDetailsForm isSubmitting={isSubmitting} />
                <BookingDetailsForm isSubmitting={isSubmitting} />
                <ExtraServicesSelection isSubmitting={isSubmitting} />
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
                  isSubmitting={isSubmitting}
                  totalPrice={totalPrice}
                />

                {paymentMethod === 'stripe' && (
                    <StripeCheckoutEmbed
                        totalPrice={totalPrice}
                        bookingDate={bookingDate}
                        bookingTime={bookingTime}
                        // setIsLoadingStripe={setIsLoadingStripe} // Removido: agora gerenciado internamente
                        stripeError={stripeError}
                        setStripeError={setStripeError}
                        formTrigger={trigger}
                    />
                )}

                {paymentMethod === 'cash' && (
                    <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
                        {isSubmitting ? "Verwerken..." : `Vraag aan voor €${totalPrice.toFixed(2)} (Betaal contant)`}
                    </Button>
                )}
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicQuickBooking;