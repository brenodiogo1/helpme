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
  platformBookingFee: z.coerce.number().min(0, { message: "A taxa de reserva não pode ser negativa." }).optional(),
  platformCommissionPercentage: z.coerce.number().min(0).max(100, { message: "A comissão deve ser entre 0 e 100%." }).optional(),
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
      platformBookingFee: settings.platformBookingFee,
      platformCommissionPercentage: settings.platformCommissionPercentage,
    },
  });

  useEffect(() => {
    form.reset({
      googleMapsApiKey: settings.googleMapsApiKey,
      twilioAccountSid: settings.twilioAccountSid,
      twilioAuthToken: settings.twilioAuthToken,
      twilioPhoneNumber: settings.twilioPhoneNumber,
      sendGridApiKey: settings.sendGridApiKey,
      platformBookingFee: settings.platformBookingFee,
      platformCommissionPercentage: settings.platformCommissionPercentage,
    });
  }, [settings, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    updateSetting("googleMapsApiKey", values.googleMapsApiKey || "");
    updateSetting("twilioAccountSid", values.twilioAccountSid || "");
    updateSetting("twilioAuthToken", values.twilioAuthToken || "");
    updateSetting("twilioPhoneNumber", values.twilioPhoneNumber || "");
    updateSetting("sendGridApiKey", values.sendGridApiKey || "");
    updateSetting("platformBookingFee", values.platformBookingFee || 0);
    updateSetting("platformCommissionPercentage", values.platformCommissionPercentage || 0);

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <h3 className="font-semibold">Algemene Tarieven & Commissies</h3>
                <FormField
                  control={form.control}
                  name="platformBookingFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vaste Boekingskosten (€)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="4.90" {...field} />
                      </FormControl>
                      <FormDescription>
                        Een vaste vergoeding die aan elke boeking wordt toegevoegd.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="platformCommissionPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commissiepercentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="10" {...field} />
                      </FormControl>
                      <FormDescription>
                        Het percentage dat van de inkomsten van de schoonmaker wordt ingehouden.
                      </FormDescription>
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
              <Separator />
              {/* Informações sobre o Stripe foram removidas da UI do AdminSettings */}
              <div className="space-y-2">
                <h3 className="font-semibold">Stripe (Pagamentos)</h3>
                <p className="text-muted-foreground text-sm">
                  A chave publicável do Stripe (<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">VITE_STRIPE_PUBLISHABLE_KEY</code>) é configurada no arquivo <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">.env</code> da aplicação.
                </p>
                <p className="text-muted-foreground text-sm">
                  A chave secreta do Stripe (<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">STRIPE_SECRET_KEY</code>) é configurada como um segredo de ambiente na seção <Link to="https://supabase.com/dashboard/project/_/functions" target="_blank" rel="noopener noreferrer" className="text-primary underline">Edge Functions</Link> do seu painel Supabase.
                </p>
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