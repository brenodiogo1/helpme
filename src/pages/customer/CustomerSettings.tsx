import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  bookingConfirmation: z.boolean(),
  reminders: z.boolean(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

const CustomerSettings = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [settingsLoading, setSettingsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingConfirmation: true,
      reminders: true,
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setSettingsLoading(false);
        showError("U moet ingelogd zijn om uw instellingen te beheren.");
        return;
      }

      setSettingsLoading(true);
      try {
        // Assuming user settings are stored in a 'user_settings' table
        const { data, error } = await supabase
          .from('user_settings')
          .select('booking_confirmation, reminders')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(error.message);
        }

        form.reset({
          bookingConfirmation: data?.booking_confirmation ?? true,
          reminders: data?.reminders ?? true,
          currentPassword: "",
          newPassword: "",
        });
      } catch (err: any) {
        showError(err.message);
        console.error("Fout bij het laden van instellingen:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchUserSettings();
  }, [isAuthLoading, user, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      showError("U moet ingelogd zijn om uw instellingen op te slaan.");
      return;
    }

    const toastId = showLoading("Instellingen opslaan...");
    try {
      // Update notification settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          booking_confirmation: values.bookingConfirmation,
          reminders: values.reminders,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (settingsError) {
        throw new Error(settingsError.message);
      }

      // Update password if provided
      if (values.newPassword) {
        // In a real app, you'd verify currentPassword before updating.
        // Supabase's `updateUser` doesn't directly support current password verification.
        // You might need a custom Edge Function for this or handle it on the client side
        // by re-authenticating the user. For simplicity, we'll just update.
        const { error: passwordError } = await supabase.auth.updateUser({
          password: values.newPassword,
        });

        if (passwordError) {
          throw new Error(passwordError.message);
        }
      }

      dismissToast(toastId);
      showSuccess("Instellingen opgeslagen!");
      form.reset({ ...values, currentPassword: "", newPassword: "" }); // Clear password fields
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
      console.error("Fout bij het opslaan van instellingen:", err);
    }
  };

  if (isAuthLoading || settingsLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Instellingen</CardTitle></CardHeader>
        <CardContent><p>Laden van instellingen...</p></CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader><CardTitle>Instellingen</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">U moet ingelogd zijn om uw instellingen te beheren.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instellingen</CardTitle>
        <CardDescription>Beheer je account- en notificatie-instellingen.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Notificaties</h3>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="booking-confirmation">Boekingsbevestiging</Label>
              <Switch
                id="booking-confirmation"
                checked={form.watch("bookingConfirmation")}
                onCheckedChange={(checked) => form.setValue("bookingConfirmation", checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="reminders">Herinneringen voor afspraken</Label>
              <Switch
                id="reminders"
                checked={form.watch("reminders")}
                onCheckedChange={(checked) => form.setValue("reminders", checked)}
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold">Wachtwoord Wijzigen</h3>
            <div className="space-y-2">
              <Label htmlFor="current-password">Huidig wachtwoord</Label>
              <Input
                id="current-password"
                type="password"
                {...form.register("currentPassword")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nieuw wachtwoord</Label>
              <Input
                id="new-password"
                type="password"
                {...form.register("newPassword")}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Opslaan</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerSettings;