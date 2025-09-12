"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, signUpEmailPassword, signInWithGoogle } from "@/integrations/supabase/client"; // Import new auth functions
import { useAuth } from "@/contexts/AuthContext";
import { Chrome } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens lang zijn." }).optional(),
  address: z.string().min(1, { message: "Adres is verplicht." }).optional(), // Added address
  postcode: z.string().regex(/^[1-9][0-9]{3}[ ]?[A-Z]{2}$/, { message: "Voer een geldige Nederlandse postcode in (bijv. 1234AB)." }).optional(), // Added postcode with NL regex
});

const RegistrerenKlant = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth(); // Added refreshUser

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      address: "", // Default value
      postcode: "", // Default value
    },
  });

  useEffect(() => {
    if (user && user.app_metadata.provider === 'google') {
      form.setValue("firstName", user.user_metadata.first_name || "");
      form.setValue("lastName", user.user_metadata.last_name || "");
      form.setValue("email", user.email || "");
      form.setValue("password", undefined);
      form.trigger(["firstName", "lastName", "email"]);
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let authUserId = user?.id;

      if (!authUserId) {
        if (!values.password) {
          throw new Error("Wachtwoord is verplicht voor handmatige registratie.");
        }
        const { data, error: authError } = await signUpEmailPassword( // Corrected destructuring
          values.email,
          values.password,
          'customer',
          `${values.firstName} ${values.lastName}`
        );

        if (authError) {
          console.error("Supabase signup error:", authError);
          throw new Error(authError.message);
        }

        if (!data.user) { // Access user from data
          throw new Error("Gebruiker kon niet worden aangemaakt.");
        }
        authUserId = data.user.id; // Access user from data
      }

      // Update or insert profile with address and postcode
      const { error: profileUpsertError } = await supabase.from('profiles').upsert({
        id: authUserId,
        full_name: `${values.firstName} ${values.lastName}`,
        role: 'customer',
        address: values.address,
        postcode: values.postcode,
      }, { onConflict: 'id' }); // Use upsert to handle both new and existing (Google) profiles

      if (profileUpsertError) {
        console.error("Supabase profile upsert error:", profileUpsertError);
        throw new Error(profileUpsertError.message);
      }

      // Mensagem de sucesso atualizada para registro manual
      if (!user || user.app_metadata.provider !== 'google') {
        showSuccess("Account succesvol aangemaakt! Controleer uw e-mail voor een verificatielink om uw account te activeren.");
      } else {
        showSuccess("Account succesvol aangemaakt!");
        await refreshUser(); // Refresh user context after profile update
      }
      navigate("/login");
    } catch (error: any) {
      showError(error.message || "Fout bij het aanmaken van het account.");
      console.error("Registration catch block error:", error);
    }
  }

  const handleGoogleRegister = async () => {
    try {
      const { error } = await signInWithGoogle('customer');
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      showError(error.message || "Fout bij het registreren met Google.");
      console.error("Google registration error:", error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50 py-12">
        <Card className="mx-auto max-w-sm w-full">
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
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="HelpMe Logo" className="h-16 mx-auto" />
          <CardTitle className="text-2xl mt-2">Account aanmaken (Klant)</CardTitle>
          <CardDescription>
            Voer je gegevens in om de beste schoonmakers te vinden.
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
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voornaam</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan" {...field} disabled={user?.app_metadata.provider === 'google'} />
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
                      <Input placeholder="Jansen" {...field} disabled={user?.app_metadata.provider === 'google'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input placeholder="Dam 1" {...field} />
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
                      <Input placeholder="1012 JS" {...field} />
                    </FormControl>
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

export default RegistrerenKlant;