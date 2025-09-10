"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client

const formSchema = z.object({
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  password: z.string().min(1, { message: "Wachtwoord is verplicht." }),
});

const Login = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastId = showLoading("Inloggen...");
    try {
      // Admin user (still hardcoded for simplicity, can be managed with roles in DB)
      if (values.email === "admin@helpme.com" && values.password === "admin123") {
        dismissToast(toastId);
        showSuccess("Succesvol ingelogd als admin!");
        navigate("/admin");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError || !user) {
        throw new Error(getUserError?.message || "Fout bij het ophalen van gebruikersinformatie.");
      }

      // Check if cleaner
      const { data: cleanerProfile, error: cleanerError } = await supabase
        .from('cleaners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cleanerError && cleanerError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        throw new Error(cleanerError.message);
      }

      if (cleanerProfile) {
        dismissToast(toastId);
        showSuccess("Succesvol ingelogd als schoonmaker!");
        navigate("/dashboard");
        return;
      }

      // Default to customer
      dismissToast(toastId);
      showSuccess("Succesvol ingelogd!");
      navigate("/account");

    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Ongeldige e-mail of wachtwoord.");
      console.error("Login error:", error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="HelpMe Logo" className="h-16 mx-auto" />
          <CardTitle className="text-2xl mt-2">Inloggen</CardTitle>
          <CardDescription>
            Voer je e-mailadres in om in te loggen. Gebruik de testaccounts hieronder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Wachtwoord</FormLabel>
                      <Link
                        to="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Wachtwoord vergeten?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Inloggen
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Nog geen account?{" "}
            <Link to="/registreren" className="underline">
              Aanmelden
            </Link>
          </div>
          <div className="mt-6 text-xs text-muted-foreground text-center space-y-1 border-t pt-4">
            <p><strong>Admin:</strong> admin@helpme.com / admin123</p>
            <p><strong>Schoonmaker:</strong> schoonmaker@helpme.com / schoonmaker123</p>
            <p><strong>Klant:</strong> klant@helpme.com / klant123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;