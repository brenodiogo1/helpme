"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const allAvailableServices = [
  "Dieptereiniging", "Ramen wassen", "Strijken", "Milieuvriendelijk",
  "Huisdier-vriendelijk", "Oven reinigen", "Koelkast reinigen", "Kantoor schoonmaak",
  "Grote schoonmaak", "Organiseren", "Anti-allergeen", "Kleine klusjes",
  "Tuinonderhoud", "Wekelijkse schoonmaak", "Eenmalige klus", "Last-minute"
];

const formSchema = z.object({
  name: z.string().min(1, { message: "Naam is verplicht." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
  hourlyRate: z.coerce.number().positive({ message: "Uurtarief moet een positief getal zijn." }),
  photoUrl: z.string().url({ message: "Voer een geldige URL in." }).or(z.literal("")).optional(),
  bio: z.string().min(10, { message: "Biografie moet minimaal 10 tekens lang zijn." }),
  address: z.string().min(1, { message: "Adres is verplicht." }),
  phoneNumber: z.string().min(10, { message: "Telefoonnummer is verplicht." }),
  services: z.array(z.string()).optional(),
});

const CleanerProfiel = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currentCleanerId, setCurrentCleanerId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      services: [],
    },
  });

  useEffect(() => {
    const fetchCleanerProfile = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setProfileLoading(false);
        showError("U moet ingelogd zijn om uw profiel te bekijken.");
        return;
      }

      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('cleaners')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(error.message);
        }

        if (data) {
          setCurrentCleanerId(data.id);
          form.reset({
            name: data.name || "",
            city: data.city || "",
            hourlyRate: data.hourly_rate || 0,
            photoUrl: data.photo_url || "",
            bio: data.bio || "",
            address: data.address || "",
            phoneNumber: data.phone_number || "",
            services: data.services || [],
          });
        } else {
          showError("Geen schoonmakerprofiel gevonden voor deze gebruiker.");
        }
      } catch (err: any) {
        showError(err.message);
        console.error("Fout bij het laden van het profiel:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchCleanerProfile();
  }, [isAuthLoading, user, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAvatarFile(event.target.files[0]);
      const reader = new FileReader();
      reader.onload = (e) => {
        form.setValue("photoUrl", e.target?.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentCleanerId) {
      showError("Geen schoonmakerprofiel gevonden om bij te werken.");
      return;
    }

    const toastId = showLoading("Profiel bijwerken...");
    let newPhotoUrl = values.photoUrl;

    try {
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentCleanerId}.${fileExt}`;
        const filePath = `${currentCleanerId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Fout bij het uploaden van de avatar: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        newPhotoUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('cleaners')
        .update({
          name: values.name,
          city: values.city,
          hourly_rate: values.hourlyRate,
          photo_url: newPhotoUrl,
          bio: values.bio,
          address: values.address,
          phone_number: values.phoneNumber,
          services: values.services,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentCleanerId);

      if (updateError) {
        throw new Error(updateError.message);
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
        <CardDescription>Werk hier je persoonlijke gegevens en profielinformatie bij.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={form.getValues("photoUrl") || "/placeholder.svg"} />
                    <AvatarFallback>{form.getValues("name").charAt(0) || "C"}</AvatarFallback>
                </Avatar>
                <div className="grid gap-2 flex-grow">
                    <Label htmlFor="avatar-upload">Profielafbeelding uploaden</Label>
                    <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} />
                    <p className="text-sm text-muted-foreground">Upload een nieuwe afbeelding of voer een URL in.</p>
                </div>
            </div>
            <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Foto URL (optioneel, wordt overschreven door upload)</FormLabel>
                    <FormControl>
                    <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
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
                    <Textarea placeholder="Schrijf een korte biografie..." {...field} className="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Services Selection */}
            <div>
                <Label className="font-semibold mb-2 block">Diensten die ik aanbied</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allAvailableServices.map(service => (
                        <FormField
                            key={service}
                            control={form.control}
                            name="services"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(service)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), service])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                            (value) => value !== service
                                                        )
                                                    );
                                            }}
                                        />
                                    </FormControl>
                                    <Label className="font-normal cursor-pointer">
                                        {service}
                                    </Label>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                <FormMessage>{form.formState.errors.services?.message}</FormMessage>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Wijzigingen Opslaan</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CleanerProfiel;