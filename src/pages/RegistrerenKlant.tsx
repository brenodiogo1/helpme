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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Chrome } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  password: z.string().min(6, { message: "Wachtwoord moet minimaal 6 tekens lang zijn." }).optional(),
});

const RegistrerenKlant = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
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
        // Only include password if it's defined (for manual signup)
        if (!values.password) {
          throw new Error("Wachtwoord is verplicht voor handmatige registratie.");
        }
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              first_name: values.firstName,
              last_name: values.lastName,
              role: 'customer',
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
        const { error: profileUpdateError } = await supabase.from('profiles').update({
          first_name: values.firstName,
          last_name: values.lastName,
          role: 'customer',
        }).eq('id', authUserId);

        if (profileUpdateError) {
          console.error("Supabase profile update error:", profileUpdateError);
          throw new Error(profileUpdateError.message);
        }
      }

      showSuccess("Account succesvol aangemaakt! Verifique seu e-mail para ativar sua conta.");
      navigate("/login");
    } catch (error: any) {
      showError(error.message || "Fout bij het aanmaken van het account.");
      console.error("Registration catch block error:", error);
    }
  }

  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/registreren/klant',
          // Removed 'data' property as it's not supported in signInWithOAuth options
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