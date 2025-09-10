"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { showSuccess } from "@/utils/toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { useEffect } from "react";

const formSchema = z.object({
  googleMapsApiKey: z.string().optional(),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
  sendGridApiKey: z.string().optional(),
  stripePublishableKey: z.string().optional(), // Manter para exibição, mas será read-only
});

const AdminSettings = () => {
  const { settings, updateSetting } = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      googleMapsApiKey: settings.googleMapsApiKey,
      twilioAccountSid: settings.twilioAccountSid,
      twilioAuthToken: settings.twilioAuthToken,
      twilioPhoneNumber: settings.twilioPhoneNumber,
      sendGridApiKey: settings.sendGridApiKey,
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    },
  });

  useEffect(() => {
    form.reset({
      googleMapsApiKey: settings.googleMapsApiKey,
      twilioAccountSid: settings.twilioAccountSid,
      twilioAuthToken: settings.twilioAuthToken,
      twilioPhoneNumber: settings.twilioPhoneNumber,
      sendGridApiKey: settings.sendGridApiKey,
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    });
  }, [settings, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    updateSetting("googleMapsApiKey", values.googleMapsApiKey || "");
    updateSetting("twilioAccountSid", values.twilioAccountSid || "");
    updateSetting("twilioAuthToken", values.twilioAuthToken || "");
    updateSetting("twilioPhoneNumber", values.twilioPhoneNumber || "");
    updateSetting("sendGridApiKey", values.sendGridApiKey || "");

    // A chave publicável do Stripe é carregada do .env e não é salva aqui.
    // A chave secreta do Stripe é um segredo do Supabase e não é gerenciada aqui.

    console.log("Configurações salvas (simulação):", values);
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
            Voer hier je API-sleutels in voor de betalingsverwerking e outros serviços.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
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
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Betalingsgateways (Stripe)</h3>
                {/* Campo para Stripe Secret Key - Renderizado diretamente, não via FormField */}
                <FormItem>
                  <FormLabel>Stripe Secret Key</FormLabel>
                  <FormControl>
                    <Input id="stripe-key" placeholder="sk_test_..." value="********************" disabled />
                  </FormControl>
                  <FormDescription>
                    A chave secreta do Stripe deve ser configurada como um segredo de ambiente no Supabase para a Edge Function `create-payment-intent`.
                    Nome do segredo: <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">STRIPE_SECRET_KEY</code>.
                  </FormDescription>
                </FormItem>
                <FormField
                  control={form.control}
                  name="stripePublishableKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stripe Publishable Key</FormLabel>
                      <FormControl>
                        <Input id="stripe-publishable-key" placeholder="pk_test_..." {...field} readOnly /> {/* Campo somente leitura */}
                      </FormControl>
                      <FormDescription>
                        Esta chave é usada no frontend. Para alterá-la, atualize a variável de ambiente <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">VITE_STRIPE_PUBLISHABLE_KEY</code> em seu arquivo <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">.env</code> (para desenvolvimento) ou nas configurações de ambiente da sua plataforma de hospedagem (para produção).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">SMS Notificaties (Twilio)</h3>
                <FormField
                  control={form.control}
                  name="twilioAccountSid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twilio Account SID</FormLabel>
                      <FormControl>
                        <Input id="twilio-account-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twilioAuthToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twilio Auth Token</FormLabel>
                      <FormControl>
                        <Input id="twilio-auth-token" placeholder="your_auth_token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twilioPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twilio Telefoonnummer</FormLabel>
                      <FormControl>
                        <Input id="twilio-phone-number" placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        O número de telefone Twilio que será usado para enviar SMS.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">E-mail Notificaties (SendGrid)</h3>
                <FormField
                  control={form.control}
                  name="sendGridApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SendGrid API Key</FormLabel>
                      <FormControl>
                        <Input id="sendgrid-api-key" placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                      </FormControl>
                      <FormDescription>
                        Obtenha sua chave de API no {" "}
                        <Link to="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          SendGrid Dashboard
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