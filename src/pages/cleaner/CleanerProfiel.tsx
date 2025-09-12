"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { showSuccess } from "@/utils/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(1, { message: "Naam is verplicht." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
  hourlyRate: z.coerce.number().positive({ message: "Uurtarief moet een positief getal zijn." }),
  photoUrl: z.string().url({ message: "Voer een geldige URL in." }).or(z.literal("")),
  bio: z.string().min(10, { message: "Biografie moet minimaal 10 tekens lang zijn." }),
  address: z.string().min(1, { message: "Adres is verplicht." }),
  postcode: z.string().min(4, { message: "Postcode is verplicht." }), // Added postcode
  phoneNumber: z.string().min(10, { message: "Telefoonnummer is verplicht." }),
});

const CleanerProfiel = () => {
  const defaultValues = {
    name: "Anna de Vries",
    city: "Amsterdam",
    hourlyRate: 18.50,
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
    bio: "Met 5 jaar ervaring zorg ik voor een brandschoon huis. Ik ben betrouwbaar, efficiënt en heb oog voor detail. Specialiteit: dieptereiniging van keukens en badkamers.",
    address: "Kerkstraat 12",
    postcode: "1017 GW", // Realistic Dutch postcode
    phoneNumber: "+31612345678",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    showSuccess("Profiel succesvol bijgewerkt!");
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
                    <AvatarImage src={form.getValues("photoUrl")} />
                    <AvatarFallback>{form.getValues("name").charAt(0)}</AvatarFallback>
                </Avatar>
                <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>Foto URL</FormLabel>
                        <FormControl>
                        <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
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
                        <Input placeholder="Kerkstraat 12" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                        <Input placeholder="1017 GW" {...field} />
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