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
import { supabase } from "@/integrations/supabase/client"; // Importar o cliente Supabase
import { useAuth } from "@/contexts/AuthContext"; // Importar o contexto de autenticação

const formSchema = z.object({
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  password: z.string().min(1, { message: "Wachtwoord is verplicht." }),
});

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth(); // Usar o contexto de autenticação

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirecionar se já estiver logado
  if (!isLoading && session) {
    // Você pode adicionar lógica de redirecionamento baseada em função aqui, se necessário
    // Por exemplo, verificar o perfil do usuário para redirecionar para /admin, /dashboard ou /account
    // Por enquanto, vamos para a página inicial
    navigate('/');
    return null; // Não renderizar nada enquanto redireciona
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
      // O redirecionamento será tratado pelo AuthProvider via onAuthStateChange
    } catch (error: any) {
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
          <div className="mt-6 text-xs text-muted-foreground text-center space-y-1 border-t pt-4">
            <p><strong>Testaccounts (para testar as rotas):</strong></p>
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