"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;

    // Admin user
    if (email === "admin@helpme.com" && password === "admin123") {
      showSuccess("Succesvol ingelogd als admin!");
      navigate("/admin");
      return;
    }

    // Cleaner user
    if (email === "schoonmaker@helpme.com" && password === "schoonmaker123") {
      showSuccess("Succesvol ingelogd als schoonmaker!");
      navigate("/dashboard");
      return;
    }

    // Customer user
    if (email === "klant@helpme.com" && password === "klant123") {
      showSuccess("Succesvol ingelogd!");
      navigate("/account");
      return;
    }

    showError("Ongeldige e-mail of wachtwoord.");
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Sparkles className="h-8 w-8 mx-auto text-primary" />
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