"use client";

import React, { useState, useEffect } from "react"; // Removed useMemo as timeSlots is commented out
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BookingDetailsForm, { bookingDetailsSchema } from "@/components/quick-booking/BookingDetailsForm";
import ExtraServicesForm, { extraServicesSchema } from "@/components/quick-booking/ExtraServicesForm";
import ContactDetailsForm, { contactDetailsSchema } from "@/components/quick-booking/ContactDetailsForm";
// import PriceSummary from "@/components/quick-booking/PriceSummary"; // Removed unused import
import PaymentMethodSelection from "@/components/quick-booking/PaymentMethodSelection";
import StripeCheckoutEmbed from "@/components/quick-booking/StripeCheckoutEmbed";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BookingStepper from "@/components/booking/BookingStepper"; // Added missing import
import { FrequencyCards, FREQ, FrequencyCode } from "@/components/booking/FrequencyCards"; // Added missing import
import { BookingSummary } from "@/components/booking/BookingSummary"; // Added missing import
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label"; // Removed unused Label import
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useRef } from "react";

// Define o schema para a primeira etapa (Booking Builder)
const step1Schema = z.object({
  frequency: z.enum(Object.keys(FREQ) as [FrequencyCode, ...FrequencyCode[]]), // Corrected z.nativeEnum usage
  homeSizeM2: z.coerce.number().min(0).optional(),
  durationHours: z.coerce.number().min(2, { message: "Duur moet minimaal 2 uur zijn." }).step(0.5, { message: "Duur moet in stappen van 0.5 uur zijn." }),
  bookingDate: z.date({ required_error: "Datum is verplicht." }),
  bookingTime: z.string().min(1, { message: "Tijd is verplicht." }),
  allowAltWeekday: z.boolean().default(false),
  postcode: z.string().regex(/^[1-9][0-9]{3}[ ]?[A-Z]{2}$/, { message: "Voer een geldige Nederlandse postcode in (bijv. 1234AB)." }),
  city: z.string().min(1, { message: "Plaats is verplicht." }),
  selectedExtraServices: z.array(z.string()).optional(),
});

// Schemas para as próximas etapas (ainda não implementadas)
const step2Schema = contactDetailsSchema; // Reusing for now
const step3Schema = z.object({}); // Payment details will be handled by Stripe/Cash

// Combine all schemas for the main form
const quickBookingSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
});

type QuickBookingFormData = z.infer<typeof quickBookingSchema>;

const extraServicesOptions = [
  { id: "ramen", label: "Ramen wassen", price: 25.00 },
  { id: "oven", label: "Oven reinigen", price: 15.00 },
  { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
  { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const PublicQuickBooking: React.FC = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const methods = useForm<QuickBookingFormData>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: {
      frequency: 'once',
      homeSizeM2: undefined,
      durationHours: 2,
      bookingDate: undefined,
      bookingTime: "",
      allowAltWeekday: false,
      postcode: "",
      city: "",
      selectedExtraServices: [],
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  const { handleSubmit, watch, formState, reset, trigger, setValue } = methods; // Removed getValues

  const frequency = watch("frequency");
  // const homeSizeM2 = watch("homeSizeM2"); // Kept in schema, but not directly used in JSX here
  const durationHours = watch("durationHours");
  const bookingDate = watch("bookingDate");
  const bookingTime = watch("bookingTime");
  // const allowAltWeekday = watch("allowAltWeekday"); // Kept in schema, but not directly used in JSX here
  const postcode = watch("postcode");
  const city = watch("city");
  const selectedExtraServices = watch("selectedExtraServices") || [];

  const [basePrice, setBasePrice] = useState(0);
  const [extrasPrice, setExtrasPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const steps = ["Jouw boeking", "Jouw gegevens", "Betaling"];

  // Calculate prices dynamically
  useEffect(() => {
    if (settings.baseHourlyRate !== undefined && settings.baseHourlyRate !== null) {
      const frequencyDiscount = FREQ[frequency as FrequencyCode]?.discount || 0;
      const calculatedBasePrice = durationHours * settings.baseHourlyRate * (1 - frequencyDiscount);
      setBasePrice(calculatedBasePrice);

      const calculatedExtrasPrice = selectedExtraServices.reduce((sum: number, serviceId: string) => {
        const service = extraServicesOptions.find(s => s.id === serviceId);
        return sum + (service ? service.price : 0);
      }, 0);
      setExtrasPrice(calculatedExtrasPrice);

      // No separate discount for extra services in this model, it's part of frequency
      setDiscountAmount(durationHours * settings.baseHourlyRate * frequencyDiscount);

      const calculatedTotalPrice = calculatedBasePrice + calculatedExtrasPrice + settings.serviceFeeFixed;
      setTotalPrice(calculatedTotalPrice);
    }
  }, [durationHours, selectedExtraServices, frequency, settings.baseHourlyRate, settings.serviceFeeFixed]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.address_components) {
        let detectedPostcode = "";
        let detectedCity = "";

        for (const component of place.address_components) {
          if (component.types.includes("postal_code")) {
            detectedPostcode = component.long_name;
          } else if (component.types.includes("locality")) {
            detectedCity = component.long_name;
          }
        }
        setValue("postcode", detectedPostcode);
        setValue("city", detectedCity);
        trigger(["postcode", "city"]);
      }
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(["frequency", "homeSizeM2", "durationHours", "bookingDate", "bookingTime", "postcode", "city", "selectedExtraServices"]);
    } else if (currentStep === 2) {
      isValid = await trigger(["firstName", "lastName", "email", "phone", "address", "zipCode"]);
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error("Vul alstublieft alle verplichte velden in.");
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCashBookingSubmit = async (data: QuickBookingFormData) => {
    const toastId = toast.loading("Boeking indienen...");
    try {
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('name', 'Find a cleaner')
        .single();

      if (serviceError || !serviceData) {
        throw new Error(serviceError?.message || "Service 'Find a cleaner' not found.");
      }

      const { data: newBooking, error } = await supabase.from('bookings').insert({
        service_id: serviceData.id,
        frequency_code: data.frequency,
        home_size_m2: data.homeSizeM2,
        duration_hours: data.durationHours,
        date: (data.bookingDate as Date).toISOString().split('T')[0], // Explicitly cast to Date
        start_time: data.bookingTime,
        allow_alt_weekday: data.allowAltWeekday,
        postcode: data.postcode,
        city: data.city,
        base_hourly_rate: settings.baseHourlyRate,
        discount: FREQ[data.frequency as FrequencyCode]?.discount || 0,
        service_fee: settings.serviceFeeFixed,
        addons_total: extrasPrice,
        estimated_total: totalPrice,
        status: 'draft', // Initial status for cash booking
      }).select('id').single();

      if (error) {
        throw new Error(error.message);
      }

      if (selectedExtraServices.length > 0) {
        const { data: addonsData, error: addonsFetchError } = await supabase
          .from('addons')
          .select('id, name')
          .in('name', extraServicesOptions.filter(es => selectedExtraServices.includes(es.id)).map(es => es.label));

        if (addonsFetchError) {
          throw new Error(addonsFetchError.message);
        }

        const bookingAddonsToInsert = addonsData.map(addon => ({
          booking_id: newBooking.id,
          addon_id: addon.id,
          qty: 1,
        }));

        const { error: insertAddonsError } = await supabase
          .from('booking_addons')
          .insert(bookingAddonsToInsert);

        if (insertAddonsError) {
          throw new Error(insertAddonsError.message);
        }
      }

      toast.success("Uw boeking is succesvol ingediend!");
      reset();
      navigate('/bevestiging', { state: { bookingDetails: { status: 'pending_payment', totalPrice: totalPrice, date: (data.bookingDate as Date).toISOString(), time: data.bookingTime, hours: data.durationHours, firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, address: data.address, city: data.city, zipCode: data.zipCode, notes: data.notes, selectedExtraServices: data.selectedExtraServices, basePrice: basePrice, extrasPrice: extrasPrice, discountAmount: discountAmount, platformFee: settings.serviceFeeFixed } } });
    } catch (error: any) {
      toast.error(error.message || "Er is een fout opgetreden bij het indienen van uw boeking. Probeer het opnieuw.");
      console.error("Cash booking submission error:", error);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const onSubmit = async (data: QuickBookingFormData) => {
    if (currentStep === 3 && paymentMethod === 'cash') {
      await handleCashBookingSubmit(data);
    }
    // Stripe payment is handled by the StripeCheckoutEmbed component directly
    // It will redirect to /bevestiging on success
  };

  // const timeSlots = useMemo(() => { // Removed redundant timeSlots definition
  //   const slots = [];
  //   for (let i = 9; i <= 18; i++) { // 09:00 to 18:00
  //     slots.push(`${i.toString().padStart(2, '0')}:00`);
  //     if (i < 18) { // Don't add 18:30
  //       slots.push(`${i.toString().padStart(2, '0')}:30`);
  //     }
  //   }
  //   return slots;
  // }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Snel Boeken</CardTitle>
          <CardDescription className="text-center">
            Vul de details in voor uw schoonmaakboeking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingStepper currentStep={currentStep} steps={steps} />
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Booking Content */}
              <div className="lg:col-span-2 space-y-6">
                {currentStep === 1 && (
                  <>
                    <h3 className="font-semibold text-lg">Frequentie</h3>
                    <FormField
                      control={methods.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FrequencyCards value={field.value as FrequencyCode} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />

                    <h3 className="font-semibold text-lg">Locatie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={methods.control}
                        name="postcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postcode</FormLabel>
                            <FormControl>
                              {isLoaded ? (
                                <Autocomplete
                                  onLoad={onLoad}
                                  onPlaceChanged={onPlaceChanged}
                                  options={{
                                    componentRestrictions: { country: "nl" },
                                    types: ['geocode'],
                                  }}
                                >
                                  <Input placeholder="1234AB" {...field} disabled={formState.isSubmitting} />
                                </Autocomplete>
                              ) : (
                                <Input placeholder="1234AB" {...field} disabled={formState.isSubmitting} />
                              )}
                            </FormControl>
                            <FormDescription>
                              Begin met typen en selecteer uw postcode.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={methods.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plaats</FormLabel>
                            <FormControl>
                              <Input placeholder="Amsterdam" {...field} disabled={formState.isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator />

                    <h3 className="font-semibold text-lg">Tijd & Duur</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <BookingDetailsForm isSubmitting={formState.isSubmitting} />
                    </div>
                    <FormField
                      control={methods.control}
                      name="allowAltWeekday"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={formState.isSubmitting}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Ik ben op dit tijdstip ook beschikbaar op een andere dag (ma–vr)
                            </FormLabel>
                            <FormDescription>
                              Dit vergroot de kans dat we een schoonmaker voor u vinden.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />

                    <ExtraServicesForm isSubmitting={formState.isSubmitting} />

                    <div className="flex justify-end gap-4">
                      <Button type="button" onClick={handleNextStep} disabled={formState.isSubmitting}>
                        Volgende stap
                      </Button>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <ContactDetailsForm isSubmitting={formState.isSubmitting} />
                    <div className="flex justify-between gap-4">
                      <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={formState.isSubmitting}>
                        Vorige stap
                      </Button>
                      <Button type="button" onClick={handleNextStep} disabled={formState.isSubmitting}>
                        Volgende stap
                      </Button>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <h3 className="font-semibold text-lg">Betaling</h3>
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
                        formTrigger={() => trigger()} // Pass trigger function
                        isLoadingStripe={isLoadingStripe}
                      />
                    )}

                    {paymentMethod === 'cash' && (
                      <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
                        {formState.isSubmitting ? "Boeking indienen..." : "Boeking indienen"}
                      </Button>
                    )}

                    <div className="flex justify-start gap-4">
                      <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={formState.isSubmitting}>
                        Vorige stap
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <BookingSummary
                  ctx={{
                    postcode: postcode,
                    city: city,
                    frequency: frequency as FrequencyCode,
                    duration: durationHours,
                    date: bookingDate,
                    time: bookingTime,
                    addonsTotal: extrasPrice,
                  }}
                />
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicQuickBooking;