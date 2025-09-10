"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const defaultHourlyRate = 20.00; // Taxa horária padrão, já que nenhum limpador é selecionado

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
  const [isProcessing, setIsProcessing] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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
  const totalPrice = basePrice + extrasPrice;

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
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    const toastId = showLoading("Boeking aanmaken...");

    try {
      // Get current user ID if logged in, otherwise create booking without customer_id initially
      const { data: { user } } = await supabase.auth.getUser();
      const customerId = user?.id || null; // If user is not logged in, customer_id will be null

      // 1. Create the booking entry with 'pending_assignment' status
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerId, // Can be null if not logged in
          cleaner_id: null, // No cleaner assigned yet
          booking_date: format(values.bookingDate, "yyyy-MM-dd"),
          booking_time: values.bookingTime,
          duration_hours: values.durationHours,
          total_price: totalPrice,
          status: 'pending_assignment', // New status for unassigned bookings
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
        throw new Error(bookingError?.message || "Fout bij het aanmaken van de boeking.");
      }

      dismissToast(toastId);
      showSuccess("Boeking succesvol aangevraagd! We zoeken een geschikte schoonmaker voor je.");
      form.reset(); // Clear form after successful submission
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Er is een onverwachte fout opgetreden bij het aanmaken van de boeking.");
      console.error("Quick booking error:", error);
    } finally {
      setIsProcessing(false);
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
            Vul je gegevens in en boek snel een schoonmaakafspraak. We vinden de beste schoonmaker voor jou!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voornaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" {...field} disabled={isProcessing} />
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
                        <Input placeholder="Jansen" {...field} disabled={isProcessing} />
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
                      <Input type="email" placeholder="naam@voorbeeld.com" {...field} disabled={isProcessing} />
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
                      <Input placeholder="0612345678" {...field} disabled={isProcessing} />
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
                            <Input placeholder="Kerkstraat 12" {...field} disabled={isProcessing} />
                          </Autocomplete>
                        ) : (
                          <Input placeholder="Kerkstraat 12" {...field} disabled={isProcessing} />
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
                        <Input placeholder="1012 AB" {...field} disabled={isProcessing} />
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
                              disabled={isProcessing}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
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
                    disabled={isProcessing}
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-12 text-center">{durationHours} uur</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => form.setValue("durationHours", durationHours + 1)}
                    disabled={isProcessing}
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
                              disabled={isProcessing}
                            />
                          </FormControl>
                          <FormLabel className="flex justify-between w-full font-normal cursor-pointer">
                            <span>{service.label}</span>
                            <span>€{service.price.toFixed(2)}</span>
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
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
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Totaal</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <CardFooter className="flex justify-end p-0 pt-4">
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "Aanmaken..." : "Boeking Aanvragen"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicQuickBooking;