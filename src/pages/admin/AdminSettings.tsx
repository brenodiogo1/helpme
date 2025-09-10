"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { showSuccess } from "@/utils/toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"; // Adicionado FormDescription
import { Link } from "react-router-dom";

const formSchema = z.object({
  stripeSecretKey: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  idealApiKey: z.string().optional(),
  googleMapsApiKey: z.string().optional(), // Novo campo para a chave da API do Google Maps
});

const AdminSettings = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stripeSecretKey: "sk_test_...",
      stripePublishableKey: "pk_test_...",
      paypalClientId: "AZ...",
      idealApiKey: "your_ideal_api_key",
      googleMapsApiKey: "AIzaSy...", // Valor de exemplo
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    showSuccess("Instellingen opgeslagen! (Simulatie)");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Instellingen</CardTitle>
          <CardDescription>
            Beheer hier de algemene instellingen van het platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Instellingen zoals tarieven, commissies e-mailnotificaties komen hier.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Integrações & API-sleutels</CardTitle>
          <CardDescription>
            Voer hier je API-sleutels in voor de betalingsverwerking en outros serviços.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <h3 className="font-semibold">Betalingsgateways</h3>
                <FormField
                  control={form.control}
                  name="stripeSecretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stripe Secret Key</FormLabel>
                      <FormControl>
                        <Input id="stripe-key" placeholder="sk_test_..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stripePublishableKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stripe Publishable Key</FormLabel>
                      <FormControl>
                        <Input id="stripe-publishable-key" placeholder="pk_test_..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paypalClientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PayPal Client ID</FormLabel>
                      <FormControl>
                        <Input id="paypal-client-id" placeholder="AZ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idealApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>iDEAL API Key</FormLabel>
                      <FormControl>
                        <Input id="ideal-api-key" placeholder="your_ideal_api_key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Google Maps</h3>
                <FormField
                  control={form.control}
                  name="googleMapsApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Maps API Key</FormLabel>
                      <FormControl>
                        <Input id="google-maps-api-key" placeholder="AIzaSy..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Obtenha sua chave de API no {" "}
                        <Link to="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          Google Cloud Console
                        </Link>
                        .
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Opslaan</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;