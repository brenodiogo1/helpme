"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useParams, useNavigate } from "react-router-dom";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  name: z.string().min(1, { message: "Naam is verplicht." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
  hourlyRate: z.coerce.number().positive({ message: "Uurtarief moet een positief getal zijn." }),
  photoUrl: z.string().url({ message: "Voer een geldige URL in." }).or(z.literal("")).optional(),
  bio: z.string().min(10, { message: "Biografie moet minimaal 10 tekens lang zijn." }),
  address: z.string().min(1, { message: "Adres is verplicht." }),
  phoneNumber: z.string().min(10, { message: "Telefoonnummer is verplicht." }),
});

const SchoonmakerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isEditing = !!id;
  const title = isEditing ? "Schoonmaker Bewerken" : "Nieuwe Schoonmaker Toevoegen";
  const description = isEditing
    ? "Bewerk de gegevens van de schoonmaker hieronder."
    : "Voer de gegevens van de nieuwe schoonmaker hieronder in.";
  const buttonText = isEditing ? "Wijzigingen Opslaan" : "Schoonmaker Toevoegen";

  const [formLoading, setFormLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      hourlyRate: 0,
      photoUrl: "",
      bio: "",
      address: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || user.email !== "admin@helpme.com") {
      showError("U heeft geen toegang tot deze pagina.");
      navigate('/');
      return;
    }

    const fetchCleanerData = async () => {
      if (!isEditing) {
        setFormLoading(false);
        return;
      }

      setFormLoading(true);
      try {
        const { data, error } = await supabase
          .from('cleaners')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw new Error(error.message);

        form.reset({
          name: data.name || "",
          city: data.city || "",
          hourlyRate: data.hourly_rate || 0,
          photoUrl: data.photo_url || "",
          bio: data.bio || "",
          address: data.address || "",
          phoneNumber: data.phone_number || "",
        });
      } catch (err: any) {
        setFormError(err.message);
        showError(err.message);
      } finally {
        setFormLoading(false);
      }
    };

    fetchCleanerData();
  }, [id, isEditing, form, isAuthLoading, user, navigate]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || user.email !== "admin@helpme.com") {
      showError("U heeft geen toestemming om deze actie uit te voeren.");
      return;
    }

    const toastId = showLoading(isEditing ? "Schoonmaker bijwerken..." : "Schoonmaker toevoegen...");
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('cleaners')
          .update({
            name: values.name,
            city: values.city,
            hourly_rate: values.hourlyRate,
            photo_url: values.photoUrl,
            bio: values.bio,
            address: values.address,
            phone_number: values.phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('cleaners')
          .insert({
            name: values.name,
            city: values.city,
            hourly_rate: values.hourlyRate,
            photo_url: values.photoUrl,
            bio: values.bio,
            address: values.address,
            phone_number: values.phoneNumber,
            user_id: null, // Admin adds cleaner, user_id can be linked later if cleaner registers
          });

        if (error) throw new Error(error.message);
      }

      dismissToast(toastId);
      showSuccess(`Schoonmaker succesvol ${isEditing ? 'bewerkt' : 'toegevoegd'}!`);
      navigate("/admin/schoonmakers");
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
      console.error("Fout bij het opslaan van schoonmaker:", err);
    }
  }

  if (isAuthLoading || formLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent><p>Laden van formulier...</p></CardContent>
      </Card>
    );
  }

  if (formError) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {formError}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naam</FormLabel>
                    <FormControl>
                      <Input placeholder="Anna de Vries" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stad</FormLabel>
                    <FormControl>
                      <Input placeholder="Amsterdam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uurtarief (€)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="18.50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                        <Input placeholder="Kerkstraat 12, 1012 AB Amsterdam" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Telefoonnummer</FormLabel>
                    <FormControl>
                        <Input placeholder="+31612345678" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografie</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Schrijf een korte biografie..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link to="/admin/schoonmakers">Annuleren</Link>
              </Button>
              <Button type="submit">{buttonText}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SchoonmakerForm;