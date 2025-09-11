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
import { Chrome, Facebook } from "lucide-react"; // Importar ícones do Google e Facebook

const formSchema = z.object({
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  password: z.string().min(1, { message: "Wachtwoord is verplicht." }),
});

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (!isLoading && session) {
    navigate('/');
    return null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      showSuccess("Succesvol ingelogd!");
    } catch (error: any) {
      showError(error.message || "Ongeldige e-mail of wachtwoord.");
      console.error("Login error:", error);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`, // Redireciona para a home após o login
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      showError(error.message || "Fout bij het inloggen met Google.");
      console.error("Google login error:", error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`, // Redireciona para a home após o login
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      showError(error.message || "Fout bij het inloggen met Facebook.");
      console.error("Facebook login error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="HelpMe Logo" className="h-16 mx-auto" />
          <CardTitle className="text-2xl mt-2">Inloggen</CardTitle>
          <CardDescription>
            Voer je e-mailadres in om in te loggen.
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
              <Button type="submit" className="w-full" disabled={isLoading}>
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
          <div className="mt-6 space-y-2">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
              <Chrome className="mr-2 h-4 w-4" /> Inloggen met Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={isLoading}>
              <Facebook className="mr-2 h-4 w-4" /> Inloggen met Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;