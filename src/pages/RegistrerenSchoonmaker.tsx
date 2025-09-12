"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Link, useNavigate } => "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle, signUpEmailPassword as authSignUpEmailPassword } from '@/lib/auth'; // Import new auth functions
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phone: z.string().min(10, { message: "Voer een geldig telefoonnummer in." }),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens lang zijn." }),
  address: z.string().min(1, { message: "Adres is verplicht." }),
  postcode: z.string().regex(/^[1-9][0-9]{3}[ ]?[A-Z]{2}$/, { message: "Voer een geldige Nederlandse postcode in (bijv. 1234AB)." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
  canWorkInNL: z.boolean().refine(val => val === true, { message: "U moet bevestigen dat u in Nederland kunt werken." }),
  hasResidencePermitOrEU: z.boolean().refine(val => val === true, { message: "U moet bevestigen dat u een verblijfsvergunning of EU-burgerschap heeft." }),
});

const RegistrerenSchoonmaker = () => {
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

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
      phone: "",
      password: "",
      address: "",
      postcode: "",
      city: "",
      canWorkInNL: false,
      hasResidencePermitOrEU: false,
    },
  });

  useEffect(() => {
    if (user && user.app_metadata.provider === 'google') {
      form.setValue("firstName", user.user_metadata.first_name || "");
      form.setValue("lastName", user.user_metadata.last_name || "");
      form.setValue("email", user.email || "");
      form.setValue("password", "GOOGLE_AUTH_PLACEHOLDER"); // Placeholder, password not needed for Google
      form.trigger(["firstName", "lastName", "email"]);
    }
  }, [user, form]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.address_components) {
        let streetName = "";
        let streetNumber = "";
        let postcode = "";
        let city = "";

        for (const component of place.address_components) {
          if (component.types.includes("street_number")) {
            streetNumber = component.long_name;
          } else if (component.types.includes("route")) {
            streetName = component.long_name;
          } else if (component.types.includes("locality")) {
            city = component.long_name;
          } else if (component.types.includes("postal_code")) {
            postcode = component.long_name;
          }
        }
        form.setValue("address", `${streetName} ${streetNumber}`.trim());
        form.setValue("postcode", postcode);
        form.setValue("city", city);
        form.trigger(["address", "postcode", "city"]);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let authUserId = user?.id;

      if (!authUserId) {
        const { data: authData } = await authSignUpEmailPassword(
          values.email,
          values.password,
          'cleaner', // Role for cleaner
          `${values.firstName} ${values.lastName}`
        );

        if (!authData.user) {
          throw new Error("Gebruiker kon niet worden aangemaakt.");
        }
        authUserId = authData.user.id;
      }

      // Upsert cleaner profile
      // The initial profile is created by the handle_new_user trigger.
      // We only update with cleaner-specific fields here.
      const { error: cleanerUpsertError } = await supabase.from('cleaners').upsert({
        user_id: authUserId,
        name: `${values.firstName} ${values.lastName}`,
        city: values.city,
        hourly_rate: 0, // Default to 0, cleaner can update later
        bio: "", // Default to empty, cleaner can update later
        address: values.address,
        postcode: values.postcode,
        phone_number: values.phone,
        can_work_in_nl: values.canWorkInNL,
        has_residence_permit_or_eu: values.hasResidencePermitOrEU,
      }, { onConflict: 'user_id' }); // Use user_id as conflict target for upsert

      if (cleanerUpsertError) {
        console.error("Supabase cleaner profile upsert error:", cleanerUpsertError);
        throw new Error(cleanerUpsertError.message);
      }

      showSuccess("Account succesvol aangemaakt! Controleer uw e-mail voor een verificatielink om uw account te activeren.");
      navigate("/login");
    } catch (error: any) {
      showError(error.message);
      console.error("Registratie fout:", error);
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle('cleaner'); // Role for cleaner
      // Supabase will redirect, AuthContext will handle post-login navigation
    } catch (error: any) {
      showError(error.message || "Fout bij het registreren met Google.");
      console.error("Google registration error:", error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50 py-12">
        <Card className="mx-auto max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mt-2">Laden...</CardTitle>
            <CardDescription>Autenticação wordt geladen.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50 py-12">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="HelpMe Logo" className="h-16 mx-auto" />
          <CardTitle className="text-2xl mt-2">Account aanmaken (Schoonmaker)</CardTitle>
          <CardDescription>
            Word onderdeel van ons platform en start met verdienen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full mb-4" onClick={handleGoogleRegister} disabled={isAuthLoading}>
            <Chrome className="mr-2 h-4 w-4" />
            Registreren met Google
          </Button>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Of</span>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voornaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Anna" {...field} disabled={user?.app_metadata.provider === 'google'} />
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
                        <Input placeholder="de Vries" {...field} disabled={user?.app_metadata.provider === 'google'} />
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="naam@voorbeeld.com" {...field} disabled={user?.app_metadata.provider === 'google'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoonnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="0612345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!user || user.app_metadata.provider !== 'google' ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wachtwoord</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <Separator className="my-4" />
              <h3 className="font-semibold text-lg">Adresgegevens</h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres (straatnaam en huisnummer)</FormLabel>
                    <FormControl>
                      {isLoaded ? (
                        <Autocomplete
                          onLoad={onLoad}
                          onPlaceChanged={onPlaceChanged}
                          options={{
                            componentRestrictions: { country: "nl" },
                          }}
                        >
                          <Input placeholder="Kerkstraat 12" {...field} />
                        </Autocomplete>
                      ) : (
                        <Input placeholder="Kerkstraat 12" {...field} />
                      )}
                    </FormControl>
                    <FormDescription>
                      Comece a digitar e selecione seu endereço na lista.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input placeholder="1012 AB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stad</FormLabel>
                    <FormControl>
                        <Input placeholder="Amsterdam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-4" />
              <h3 className="font-semibold text-lg">Kwalificaties</h3>

              <FormField
                control={form.control}
                name="canWorkInNL"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ik kan in Nederland werken.
                      </FormLabel>
                      <FormDescription>
                        Dit is een vereiste om via ons platform te werken.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasResidencePermitOrEU"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ik heb een geldige verblijfsvergunning of ben een EU-burger.
                      </FormLabel>
                      <FormDescription>
                        Dit is een wettelijke vereiste om in Nederland te mogen werken.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Account aanmaken
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Heb je al een account?{" "}
            <Link to="/login" className="underline">
              Inloggen
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrerenSchoonmaker;