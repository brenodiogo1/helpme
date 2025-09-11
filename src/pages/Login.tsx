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
// Removido import { Chrome, Facebook } from "lucide-react"; // Não precisamos mais dos ícones de login social

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

  // As funções handleGoogleLogin e handleFacebookLogin foram removidas
  // pois os botões correspondentes não estarão mais presentes.

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
          {/* A seção de botões de login social foi removida */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;