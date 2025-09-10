"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Removido FormDescription
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { showLoading, showSuccess, dismissToast, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"; // Adicionado importação de Label

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const defaultHourlyRate = 20.00; // Taxa horária padrão, já que nenhum limpador é selecionado
const MIN_SERVICES_FOR_DISCOUNT = 2; // Mínimo de serviços para aplicar desconto
const DISCOUNT_PERCENTAGE = 0.10; // 10% de desconto

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phoneNumber: z.string().min(10, { message: "Telefoonnummer is verplicht." }),
  address: z.string().min(1, { message: "Adres is verplicht." }),
  postcode: z.string().min(4, { message: "Postcode is verplicht." }),
  bookingDate: z.date({ required_error: "Datum is verplicht." }),
  bookingTime: z.string().min(1, { message: "Tijd is verplicht." }),
  durationHours: z.coerce.number().min(1, { message: "Duur moet minimaal 1 uur zijn." }),
  selectedExtraServices: z.array(z.string()).optional(),
});

const PublicQuickBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStripe, setIsLoadingStripe] = useState(true);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

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

  const durationHours = form.watch("durationHours");
  const selectedExtraServices = form.watch("selectedExtraServices") || [];

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

  const totalPrice = basePrice + extrasPrice - discountAmount;

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.address_components) {
        let address = "";
        let postcode = "";
        for (const component of place.address_components) {
          if (component.types.includes("street_number")) {
            address = component.long_name + " " + address;
          } else if (component.types.includes("route")) {
            address += component.long_name;
          } else if (component.types.includes("postal_code")) {
            postcode = component.long_name;
          }
        }
        form.setValue("address", address.trim());
        form.setValue("postcode", postcode);
        form.trigger(["address", "postcode"]);
      }
    }
  };

  useEffect(() => {
    if (paymentMethod === 'stripe') {
        const initializeStripeCheckout = async () => {
            // Ensure all required form fields are valid before initializing Stripe
            const isValid = await form.trigger();
            if (!isValid) {
                setStripeError("Vul alstublieft alle verplichte velden in.");
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
    } else {
        setIsLoadingStripe(false); // No Stripe loading for cash payments
        setStripeError(null);
    }
  }, [paymentMethod, totalPrice, form.formState.isValid]); // Recarregar se o método de pagamento ou preço total mudar, ou validade do formulário

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const toastId = showLoading("Boekingsaanvraag verzenden...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const customerId = user?.id || null;

      const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .insert({
              customer_id: customerId,
              cleaner_id: null, // Nenhum limpador atribuído inicialmente
              booking_date: format(values.bookingDate, "yyyy-MM-dd"),
              booking_time: values.bookingTime,
              duration_hours: values.durationHours,
              total_price: totalPrice,
              status: 'pending_assignment', // Status: aguardando atribuição/pagamento
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
          schoonmaker: { name: "Nog niet toegeweid" }, // Placeholder
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
      showError(error.message || "Er is een onverwachte fout opgetreden bij het verzenden van de aanvraag.");
      console.error("Quick booking submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container py-8 max-w-3xl mx-auto text-center">
        <p>Laden van Google Maps...</p>
      </div>
    );
  }

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voornaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achternaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Jansen" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="naam@voorbeeld.com" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoonnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="0612345678" {...field} disabled={isSubmitting} />
                    </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={onLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                              componentRestrictions: { country: "nl" }, // Restrict to Netherlands
                            }}
                          >
                            <Input placeholder="Kerkstraat 12" {...field} disabled={isSubmitting} />
                          </Autocomplete>
                        ) : (
                          <Input placeholder="Kerkstraat 12" {...field} disabled={isSubmitting} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input placeholder="1012 AB" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bookingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Datum</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: nl })
                              ) : (
                                <span>Kies een datum</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tijd</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kies een tijd" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Duur</FormLabel>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => form.setValue("durationHours", Math.max(1, durationHours - 1))}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-12 text-center">{durationHours} uur</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => form.setValue("durationHours", durationHours + 1)}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage>{form.formState.errors.durationHours?.message}</FormMessage>
              </div>

              <div>
                <FormLabel>Extra diensten</FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {extraServices.map(service => (
                    <FormField
                      key={service.id}
                      control={form.control}
                      name="selectedExtraServices"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), service.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== service.id
                                      )
                                    );
                              }}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <Label className="flex justify-between w-full font-normal cursor-pointer">
                            <span>{service.label}</span>
                            <span>€{service.price.toFixed(2)}</span>
                          </Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                {selectedExtraServices.length >= MIN_SERVICES_FOR_DISCOUNT && (
                    <p className="text-sm text-green-600 mt-2">
                        Je krijgt {DISCOUNT_PERCENTAGE * 100}% korting op extra diensten!
                    </p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Prijsoverzicht</h3>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Uurtarief ({durationHours} uur)</span>
                    <span>€{basePrice.toFixed(2)}</span>
                  </div>
                  {selectedExtraServices.map(serviceId => {
                    const service = extraServices.find(s => s.id === serviceId);
                    return (
                      <div key={serviceId} className="flex justify-between">
                        <span>{service?.label}</span>
                        <span>€{service?.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Korting</span>
                      <span>-€{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Totaal</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Kies een betaalmethode</h3>
                <RadioGroup value={paymentMethod} onValueChange={(value: 'stripe' | 'cash') => setPaymentMethod(value)} className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="stripe" id="payment-stripe" disabled={isSubmitting} />
                        <Label htmlFor="payment-stripe" className="flex-grow cursor-pointer">
                            Online betalen (iDEAL, Creditcard, etc.)
                            <p className="text-xs text-muted-foreground">Veilig en direct via Stripe.</p>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="cash" id="payment-cash" disabled={isSubmitting} />
                        <Label htmlFor="payment-cash" className="flex-grow cursor-pointer">
                            Contant betalen
                            <p className="text-xs text-muted-foreground">Betaal de schoonmaker direct na de service.</p>
                        </Label>
                    </div>
                </RadioGroup>

                {paymentMethod === 'stripe' && (
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
                        <div ref={checkoutRef} id="checkout" className="mt-4" />
                    )
                )}

                {paymentMethod === 'cash' && (
                    <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
                        {isSubmitting ? "Verwerken..." : `Vraag aan voor €${totalPrice.toFixed(2)} (Betaal contant)`}
                    </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicQuickBooking;