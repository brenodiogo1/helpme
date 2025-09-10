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
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phone: z.string().optional(),
});

const CustomerProfile = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setProfileLoading(false);
        showError("U moet ingelogd zijn om uw profiel te bekijken.");
        return;
      }

      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone_number') // Fetch phone_number
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw new Error(error.message);
        }

        form.reset({
          firstName: data?.first_name || user.user_metadata.first_name || "",
          lastName: data?.last_name || user.user_metadata.last_name || "",
          email: user.email || "",
          phone: data?.phone_number || "", // Set phone number
        });
      } catch (err: any) {
        showError(err.message);
        console.error("Fout bij het laden van het profiel:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchCustomerProfile();
  }, [isAuthLoading, user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      showError("U moet ingelogd zijn om uw profiel bij te werken.");
      return;
    }

    const toastId = showLoading("Profiel bijwerken...");
    try {
      // Update auth.users metadata (if needed, though first/last name are already handled by trigger)
      // For now, we'll rely on the profiles table for first/last name and phone.
      
      // Update public.profiles table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: values.phone, // Save phone number
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileUpdateError) {
        throw new Error(profileUpdateError.message);
      }

      dismissToast(toastId);
      showSuccess("Profiel succesvol bijgewerkt!");
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
      console.error("Fout bij het bijwerken van het profiel:", err);
    }
  }

  if (isAuthLoading || profileLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Profiel</CardTitle></CardHeader>
        <CardContent><p>Laden van profiel...</p></CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Profiel</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">U moet ingelogd zijn om uw profiel te bekijken.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Profiel</CardTitle>
        <CardDescription>Beheer hier je contactgegevens.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 max-w-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voornaam</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achternaam</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mailadres</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled /> {/* Email is usually not editable directly */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefoonnummer</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Wijzigingen Opslaan</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CustomerProfile;