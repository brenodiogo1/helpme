"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  accountHolder: z.string().min(1, { message: "Naam van de rekeninghouder is verplicht." }),
  iban: z.string().regex(/NL\d{2}[A-Z]{4}\d{10}/, { message: "Voer een geldig Nederlands IBAN in." }),
});

const PayoutSettings = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolder: "Anna de Vries",
      iban: "NL20INGB0001234567",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    showSuccess("Bankgegevens succesvol opgeslagen!");
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