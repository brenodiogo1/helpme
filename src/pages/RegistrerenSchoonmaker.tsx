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
import { useRef, useEffect } from "react"; // Adicionado useEffect
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext"; // Importado useAuth
import { Chrome } from "lucide-react"; // Importado Chrome icon

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phone: z.string().min(10, { message: "Voer een geldig telefoonnummer in." }),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens lang zijn." }).optional(), // Senha opcional para Google login
  address: z.string().min(1, { message: "Adres is verplicht." }),
  postcode: z.string().min(4, { message: "Postcode is verplicht." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
  canWorkInNL: z.boolean().refine(val => val === true, { message: "U moet bevestigen dat u in Nederland kunt werken." }),
  hasResidencePermitOrEU: z.boolean().refine(val => val === true, { message: "U moet bevestigen dat u een verblijfsvergunning of EU-burgerschap heeft." }),
});

const RegistrerenSchoonmaker = () => {
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { session, user, isLoading: isAuthLoading } = useAuth(); // Usar useAuth para verificar a sessão

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

  // Preencher campos se o usuário já estiver logado via Google
  useEffect(() => {
    if (user && user.app_metadata.provider === 'google') {
      form.setValue("firstName", user.user_metadata.first_name || "");
      form.setValue("lastName", user.user_metadata.last_name || "");
      form.setValue("email", user.email || "");
      // A senha não é necessária para usuários do Google
      form.setValue("password", undefined);
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
          } else if (component.types.includes("postal_code")) {
            postcode = component.long_name;
          } else if (component.types.includes("locality")) {
            city = component.long_name;
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
      let authUserId = user?.id; // Usar ID do usuário se já logado via Google

      if (!authUserId) { // Se não estiver logado, registrar manualmente
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              first_name: values.firstName,
              last_name: values.lastName,
              role: 'cleaner', // Passando o role 'cleaner'
            },
          },
        });

        if (authError) {
          console.error("Supabase signup error:", authError);
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error("Gebruiker kon niet worden aangemaakt.");
        }
        authUserId = authData.user.id;
      } else {
        // Se já logado via Google, apenas atualiza o perfil para garantir o role
        const { error: profileUpdateError } = await supabase.from('profiles').update({
          first_name: values.firstName,
          last_name: values.lastName,
          role: 'cleaner',
        }).eq('id', authUserId);

        if (profileUpdateError) {
          console.error("Supabase profile update error:", profileUpdateError);
          throw new Error(profileUpdateError.message);
        }
      }

      // 2. Criar ou atualizar o perfil do limpador na tabela 'cleaners'
      const { data: existingCleaner, error: fetchCleanerError } = await supabase
        .from('cleaners')
        .select('id')
        .eq('user_id', authUserId)
        .single();

      if (fetchCleanerError && fetchCleanerError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching existing cleaner profile:", fetchCleanerError);
        throw new Error(fetchCleanerError.message);
      }

      if (existingCleaner) {
        // Atualizar perfil existente
        const { error: updateCleanerError } = await supabase.from('cleaners').update({
          name: `${values.firstName} ${values.lastName}`,
          city: values.city,
          address: values.address,
          postcode: values.postcode,
          phone_number: values.phone,
          can_work_in_nl: values.canWorkInNL,
          has_residence_permit_or_eu: values.hasResidencePermitOrEU,
        }).eq('user_id', authUserId);

        if (updateCleanerError) {
          console.error("Supabase cleaner profile update error:", updateCleanerError);
          throw new Error(updateCleanerError.message);
        }
      } else {
        // Inserir novo perfil de limpador
        const { error: insertCleanerError } = await supabase.from('cleaners').insert({
          user_id: authUserId,
          name: `${values.firstName} ${values.lastName}`,
          city: values.city,
          hourly_rate: 0, // Pode ser definido depois
          bio: "", // Pode ser definido depois
          address: values.address,
          postcode: values.postcode,
          phone_number: values.phone,
          can_work_in_nl: values.canWorkInNL,
          has_residence_permit_or_eu: values.hasResidencePermitOrEU,
        });

        if (insertCleanerError) {
          console.error("Supabase cleaner profile creation error:", insertCleanerError);
          throw new Error(insertCleanerError.message);
        }
      }

      showSuccess("Account succesvol aangemaakt! Een verificatielink is naar uw e-mailadres gestuurd. Por favor, verifique uw e-mail om uw account te activeren.");
      navigate("/login");
    } catch (error: any) {
      showError(error.message);
      console.error("Registratie fout:", error);
    }
  }

  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/registreren/schoonmaker', // Redireciona de volta para esta página
          data: {
            role: 'cleaner', // Sugere o role 'cleaner' para o trigger handle_new_user
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      showError(error.message || "Fout bij het registreren met Google.");
      console.error("Google registration error:", error);
    }
  };

  if (!isLoaded || isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50 py-12">
        <Card className="mx-auto max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mt-2">Laden...</CardTitle>
            <CardDescription>Google Maps en autenticação worden geladen.</CardDescription>
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
              {!user || user.app_metadata.provider !== 'google' ? ( // Mostrar campo de senha apenas para registro manual
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