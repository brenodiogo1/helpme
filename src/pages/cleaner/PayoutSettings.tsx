"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  accountHolder: z.string().min(1, { message: "Naam van de rekeninghouder is verplicht." }),
  iban: z.string().regex(/NL\d{2}[A-Z]{4}\d{10}/, { message: "Voer een geldig Nederlands IBAN in." }),
});

const PayoutSettings = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cleanerId, setCleanerId] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolder: "",
      iban: "",
    },
  });

  useEffect(() => {
    const fetchPayoutSettings = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setSettingsLoading(false);
        showError("U moet ingelogd zijn om uw uitbetalingsgegevens te beheren.");
        return;
      }

      setSettingsLoading(true);
      try {
        const { data: cleanerData, error: cleanerError } = await supabase
          .from('cleaners')
          .select('id, account_holder_name, iban') // Assuming these columns exist in 'cleaners' table
          .eq('user_id', user.id)
          .single();

        if (cleanerError && cleanerError.code !== 'PGRST116') {
          throw new Error(cleanerError.message);
        }

        if (cleanerData) {
          setCleanerId(cleanerData.id);
          form.reset({
            accountHolder: cleanerData.account_holder_name || "",
            iban: cleanerData.iban || "",
          });
        } else {
          showError("Geen schoonmakerprofiel gevonden om uitbetalingsgegevens te laden.");
        }
      } catch (err: any) {
        showError(err.message);
        console.error("Fout bij het laden van uitbetalingsinstellingen:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchPayoutSettings();
  }, [isAuthLoading, user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!cleanerId) {
      showError("Geen schoonmakerprofiel gevonden om bij te werken.");
      return;
    }

    const toastId = showLoading("Bankgegevens opslaan...");
    try {
      const { error: updateError } = await supabase
        .from('cleaners')
        .update({
          account_holder_name: values.accountHolder,
          iban: values.iban,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cleanerId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      dismissToast(toastId);
      showSuccess("Bankgegevens succesvol opgeslagen!");
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
      console.error("Fout bij het opslaan van bankgegevens:", err);
    }
  }

  if (isAuthLoading || settingsLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Uitbetalingsgegevens</CardTitle></CardHeader>
        <CardContent><p>Laden van uitbetalingsgegevens...</p></CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader><CardTitle>Uitbetalingsgegevens</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">U moet ingelogd zijn om uw uitbetalingsgegevens te beheren.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uitbetalingsgegevens</CardTitle>
        <CardDescription>Beheer hier je bankgegevens voor het ontvangen van betalingen.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 max-w-lg">
            <FormField
              control={form.control}
              name="accountHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam Rekeninghouder</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IBAN</FormLabel>
                  <FormControl>
                    <Input placeholder="NL00ABCD1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Opslaan</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PayoutSettings;