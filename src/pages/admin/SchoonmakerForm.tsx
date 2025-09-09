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
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  name: z.string().min(1, { message: "Naam is verplicht." }),
  city: z.string().min(1, { message: "Stad is verplicht." }),
  hourlyRate: z.coerce.number().positive({ message: "Uurtarief moet een positief getal zijn." }),
  photoUrl: z.string().url({ message: "Voer een geldige URL in." }).or(z.literal("")),
  bio: z.string().min(10, { message: "Biografie moet minimaal 10 tekens lang zijn." }),
});

const SchoonmakerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const title = isEditing ? "Schoonmaker Bewerken" : "Nieuwe Schoonmaker Toevoegen";
  const description = isEditing
    ? "Bewerk de gegevens van de schoonmaker hieronder."
    : "Voer de gegevens van de nieuwe schoonmaker hieronder in.";
  const buttonText = isEditing ? "Wijzigingen Opslaan" : "Schoonmaker Toevoegen";

  // In een echte app zou je hier de data van de schoonmaker ophalen als je aan het bewerken bent.
  const defaultValues = isEditing ? {
    name: "Anna de Vries",
    city: "Amsterdam",
    hourlyRate: 18.50,
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
    bio: "Met 5 jaar ervaring zorg ik voor een brandschoon huis."
  } : {
    name: "",
    city: "",
    hourlyRate: 0,
    photoUrl: "",
    bio: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    showSuccess(`Schoonmaker succesvol ${isEditing ? 'bewerkt' : 'toegevoegd'}! (Simulatie)`);
    navigate("/admin/schoonmakers");
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