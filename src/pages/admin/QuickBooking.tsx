"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Schoonmaker } from "@/types"; // Reusing Schoonmaker type

// Mock data for cleaners and customers (will be replaced by Supabase fetch)
const mockCleaners: Schoonmaker[] = [
  { id: "1", name: "Anna de Vries", photoUrl: "", ratingAvg: 0, ratingCount: 0, hourlyRate: 18.50, bio: "", services: [], city: "Amsterdam", address: "", phoneNumber: "" },
  { id: "2", name: "Ben Janssen", photoUrl: "", ratingAvg: 0, ratingCount: 0, hourlyRate: 17.00, bio: "", services: [], city: "Utrecht", address: "", phoneNumber: "" },
  { id: "3", name: "Carla Bakker", photoUrl: "", ratingAvg: 0, ratingCount: 0, hourlyRate: 20.00, bio: "", services: [], city: "Rotterdam", address: "", phoneNumber: "" },
];

const mockCustomers = [
  { id: "cust1", name: "Piet H.", email: "piet.h@email.com" },
  { id: "cust2", name: "Janneke S.", email: "janneke.s@email.com" },
];

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const formSchema = z.object({
  cleanerId: z.string().min(1, { message: "Schoonmaker is verplicht." }),
  customerId: z.string().min(1, { message: "Klant is verplicht." }),
  bookingDate: z.date({ required_error: "Datum is verplicht." }),
  bookingTime: z.string().min(1, { message: "Tijd is verplicht." }),
  durationHours: z.coerce.number().min(1, { message: "Duur moet minimaal 1 uur zijn." }),
  selectedExtraServices: z.array(z.string()).optional(),
});

const QuickBooking = () => {
  const [cleaners, setCleaners] = useState<Schoonmaker[]>(mockCleaners); // Will be fetched from Supabase
  const [customers, setCustomers] = useState(mockCustomers); // Will be fetched from Supabase
  const [selectedCleanerHourlyRate, setSelectedCleanerHourlyRate] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cleanerId: "",
      customerId: "",
      bookingDate: undefined,
      bookingTime: "",
      durationHours: 3,
      selectedExtraServices: [],
    },
  });

  // Fetch cleaners and customers from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch cleaners
      const { data: cleanersData, error: cleanersError } = await supabase
        .from('cleaners')
        .select('id, name, hourly_rate');
      if (cleanersError) {
        console.error("Error fetching cleaners:", cleanersError);
        showError("Fout bij het laden van schoonmakers.");
      } else {
        setCleaners(cleanersData.map(c => ({
          id: c.id,
          name: c.name,
          hourlyRate: c.hourly_rate,
          photoUrl: "", bio: "", services: [], city: "", address: "", phoneNumber: "", ratingAvg: 0, ratingCount: 0
        })));
      }

      // Fetch customers (profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      if (profilesError) {
        console.error("Error fetching customers:", profilesError);
        showError("Fout bij het laden van klanten.");
      } else {
        setCustomers(profilesData.map(p => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          email: "", // Email is not in profiles table directly, but we can add a placeholder
        })));
      }
    };
    fetchUsers();
  }, []);

  // Update hourly rate when cleaner changes
  useEffect(() => {
    const cleanerId = form.watch("cleanerId");
    const selectedCleaner = cleaners.find(c => c.id === cleanerId);
    setSelectedCleanerHourlyRate(selectedCleaner?.hourlyRate || 0);
  }, [form.watch("cleanerId"), cleaners]);

  const durationHours = form.watch("durationHours");
  const selectedExtraServices = form.watch("selectedExtraServices") || [];

  const basePrice = durationHours * selectedCleanerHourlyRate;
  const extrasPrice = useMemo(() => {
    return extraServices
      .filter(service => selectedExtraServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
  }, [selectedExtraServices]);
  const totalPrice = basePrice + extrasPrice;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    const toastId = showLoading("Boeking aanmaken...");

    try {
      // 1. Create the booking entry with 'accepted' status (since admin is creating it)
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: values.customerId,
          cleaner_id: values.cleanerId,
          booking_date: format(values.bookingDate, "yyyy-MM-dd"),
          booking_time: values.bookingTime,
          duration_hours: values.durationHours,
          total_price: totalPrice,
          status: 'accepted', // Admin bookings are directly accepted
        })
        .select()
        .single();

      if (bookingError || !bookingData) {
        throw new Error(bookingError?.message || "Fout bij het aanmaken van de boeking.");
      }

      // 2. Create the job offer for the cleaner with 'accepted' status
      const { error: offerError } = await supabase
        .from('job_offers')
        .insert({
          booking_id: bookingData.id,
          cleaner_id: values.cleanerId,
          status: 'accepted', // Admin bookings are directly accepted
        });

      if (offerError) {
        throw new Error(offerError?.message || "Fout bij het aanmaken van de jobaanbieding.");
      }

      dismissToast(toastId);
      showSuccess("Boeking succesvol aangemaakt!");
      form.reset(); // Clear form after successful submission
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Er is een onverwachte fout opgetreden bij het aanmaken van de boeking.");
      console.error("Quick booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Snelle Boeking Aanmaken</CardTitle>
        <CardDescription>
          Maak snel een nieuwe schoonmaakboeking aan voor een klant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="cleanerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schoonmaker</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een schoonmaker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cleaners.map(cleaner => (
                        <SelectItem key={cleaner.id} value={cleaner.id}>
                          {cleaner.name} (€{cleaner.hourlyRate.toFixed(2)}/uur)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klant</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een klant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isProcessing ? "Aanmaken..." : "Boeking Aanmaken"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default QuickBooking;