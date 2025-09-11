"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useRef } from "react";
import { Separator } from "@/components/ui/separator";

// Define o schema para esta parte do formulário
export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, { message: "Voornaam is verplicht." }),
  lastName: z.string().min(1, { message: "Achternaam is verplicht." }),
  email: z.string().email({ message: "Voer een geldig e-mailadres in." }),
  phoneNumber: z.string().min(10, { message: "Telefoonnummer is verplicht." }),
  address: z.string().min(1, { message: "Adres is verplicht." }),
  postcode: z.string().min(4, { message: "Postcode is verplicht." }),
});

interface PersonalDetailsFormProps {
  isSubmitting: boolean;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ isSubmitting }) => {
  const { control, setValue, trigger } = useFormContext();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.address_components) {
        let streetName = "";
        let streetNumber = "";
        let postcode = "";
        // let city = ""; // Removido: 'city' não é usado neste componente

        for (const component of place.address_components) {
          if (component.types.includes("street_number")) {
            streetNumber = component.long_name;
          } else if (component.types.includes("route")) {
            streetName = component.long_name;
          } else if (component.types.includes("postal_code")) {
            postcode = component.long_name;
          } else if (component.types.includes("locality")) {
            // city = component.long_name; // Removido
          }
        }
        setValue("address", `${streetName} ${streetNumber}`.trim());
        setValue("postcode", postcode);
        trigger(["address", "postcode"]);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="text-center text-muted-foreground">
        Laden van Google Maps voor adresvalidatie...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Jouw Gegevens</h3>
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
                <Input placeholder="Jansen" {...field} disabled={isSubmitting} />
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
            <FormLabel>E-mailadres</FormLabel>
            <FormControl>
              <Input type="email" placeholder="naam@voorbeeld.com" {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefoonnummer</FormLabel>
            <FormControl>
              <Input placeholder="0612345678" {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Autocomplete
                  onLoad={onLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: "nl" },
                  }}
                >
                  <Input placeholder="Kerkstraat 12" {...field} disabled={isSubmitting} />
                </Autocomplete>
              </FormControl>
              <FormDescription>
                Begin met typen en selecteer uw adres uit de lijst.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="postcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postcode</FormLabel>
              <FormControl>
                <Input placeholder="1012 AB" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Separator />
    </div>
  );
};

export default PersonalDetailsForm;