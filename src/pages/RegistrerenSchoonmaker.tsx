"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useRef } from "react";
import { Separator } from "@/components/ui/separator"; // Import adicionado

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phone: z.string().min(10, { message: "Voer een geldig telefoonnummer in." }),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens lang zijn." }),
  address: z.string().min(1, { message: "Adres is verplicht." }), // Agora inclui rua e número
  postcode: z.string().min(4, { message: "Postcode is verplicht." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
  canWorkInNL: z.boolean().refine(val => val === true, { message: "U moet bevestigen dat u in Nederland kunt werken." }),
  hasResidencePermitOrEU: z.boolean().refine(val => val === true, { message: "U moet bevestigen dat u een verblijfsvergunning of EU-burgerschap heeft." }),
});

const RegistrerenSchoonmaker = () => {
  const navigate = useNavigate();
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
      phone: "",
      password: "",
      address: "",
      postcode: "",
      city: "",
      canWorkInNL: false,
      hasResidencePermitOrEU: false,
    },
  });

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
          } else if (component.types.includes("postal_code")) {
            postcode = component.long_name;
          } else if (component.types.includes("locality")) {
            city = component.long_name;
          }
        }
        form.setValue("address", `${streetName} ${streetNumber}`.trim());
        form.setValue("postcode", postcode);
        form.setValue("city", city);
        form.trigger(["address", "postcode", "city"]); // Validar os campos após preenchimento
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Registrar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Gebruiker kon niet worden aangemaakt.");
      }

      // 2. Criar o perfil do limpador na tabela 'cleaners'
      const { error: cleanerError } = await supabase.from('cleaners').insert({
        user_id: authData.user.id,
        name: `${values.firstName} ${values.lastName}`,
        city: values.city,
        hourly_rate: 0, // Pode ser definido posteriormente
        bio: "", // Pode ser definido posteriormente
        address: values.address, // Agora é o endereço completo
        postcode: values.postcode,
        phone_number: values.phone,
        can_work_in_nl: values.canWorkInNL,
        has_residence_permit_or_eu: values.hasResidencePermitOrEU,
      });

      if (cleanerError) {
        throw new Error(cleanerError.message);
      }

      // Lógica condicional para verificação por e-mail (simulada)
      if (values.canWorkInNL && values.hasResidencePermitOrEU) {
        showSuccess("Account succesvol aangemaakt! Een verificatielink is naar uw e-mailadres gestuurd. (Simulatie)");
        // Em um cenário real, você enviaria um e-mail de verificação aqui.
        // Ex: await supabase.auth.signInWithOtp({ email: values.email, options: { emailRedirectTo: 'YOUR_VERIFICATION_URL' } });
      } else {
        showSuccess("Account succesvol aangemaakt! Uw aanvraag wordt beoordeeld. (Simulatie)");
      }

      navigate("/login"); // Redirecionar para a página de login após o registro
    } catch (error: any) {
      showError(error.message);
      console.error("Registratie fout:", error);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50 py-12">
        <Card className="mx-auto max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mt-2">Laden...</CardTitle>
            <CardDescription>Google Maps wordt geladen voor adresvalidatie.</CardDescription>
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
                        <Input placeholder="Anna" {...field} />
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
                        <Input placeholder="de Vries" {...field} />
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
                      <Input placeholder="naam@voorbeeld.com" {...field} />
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
                            componentRestrictions: { country: "nl" }, // Restringir à Holanda
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