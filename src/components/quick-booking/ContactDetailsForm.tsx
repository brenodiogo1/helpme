"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export const contactDetailsSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phone: z.string().min(10, { message: "Telefoonnummer is verplicht (minimaal 10 cijfers)." }),
  address: z.string().min(1, { message: "Adres is verplicht." }),
  city: z.string().min(1, { message: "Plaats is verplicht." }),
  zipCode: z.string().regex(/^\d{4}[A-Z]{2}$/, { message: "Voer een geldige Nederlandse postcode in (bijv. 1234AB)." }),
  notes: z.string().optional(),
});

interface ContactDetailsFormProps {
  isSubmitting: boolean;
}

const ContactDetailsForm: React.FC<ContactDetailsFormProps> = ({ isSubmitting }) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Contactgegevens</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voornaam</FormLabel>
              <FormControl>
                <Input placeholder="Jan" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Achternaam</FormLabel>
              <FormControl>
                <Input placeholder="De Vries" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input type="email" placeholder="jan.devries@example.com" {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefoonnummer</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="0612345678" {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adres</FormLabel>
            <FormControl>
              <Input placeholder="Hoofdstraat 10" {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postcode</FormLabel>
              <FormControl>
                <Input placeholder="1234AB" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plaats</FormLabel>
            <FormControl>
                <Input placeholder="Amsterdam" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opmerkingen (optioneel)</FormLabel>
            <FormControl>
              <Textarea placeholder="Specifieke instructies voor de schoonmaker..." {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
    </div>
  );
};

export default ContactDetailsForm;