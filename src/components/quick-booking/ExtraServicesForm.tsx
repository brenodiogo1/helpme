"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export const extraServicesSchema = z.object({
  selectedExtraServices: z.array(z.string()).default([]),
});

const extraServicesOptions = [
  { id: "ramen", label: "Ramen wassen", price: 25.00 },
  { id: "oven", label: "Oven reinigen", price: 15.00 },
  { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
  { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

interface ExtraServicesFormProps {
  isSubmitting: boolean;
}

const ExtraServicesForm: React.FC<ExtraServicesFormProps> = ({ isSubmitting }) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Extra Diensten</h3>
      <FormField
        control={control}
        name="selectedExtraServices"
        render={({ field }) => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Kies extra diensten</FormLabel>
            </div>
            {extraServicesOptions.map((item) => (
              <FormField
                key={item.id}
                control={control}
                name="selectedExtraServices"
                render={({ field: innerField }) => {
                  return (
                    <FormItem
                      key={item.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={innerField.value?.includes(item.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? innerField.onChange([...innerField.value, item.id])
                              : innerField.onChange(
                                  innerField.value?.filter(
                                    (value: string) => value !== item.id
                                  )
                                );
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {item.label} (€{item.price.toFixed(2)})
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
    </div>
  );
};

export default ExtraServicesForm;