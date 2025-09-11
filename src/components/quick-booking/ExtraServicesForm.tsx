"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// Define o schema para esta parte do formulário
export const extraServicesSchema = z.object({
  selectedExtraServices: z.array(z.string()).optional(),
});

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const MIN_SERVICES_FOR_DISCOUNT = 2;
const DISCOUNT_PERCENTAGE = 0.10;

interface ExtraServicesSelectionProps {
  isSubmitting: boolean;
}

const ExtraServicesSelection: React.FC<ExtraServicesSelectionProps> = ({ isSubmitting }) => {
  const { control, watch } = useFormContext();
  const selectedExtraServices = watch("selectedExtraServices") || [];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Extra diensten</h3>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <FormField
          control={control}
          name="selectedExtraServices"
          render={({ field: _field }) => ( // Renamed 'field' to '_field'
            <FormItem>
              {extraServices.map(service => (
                <FormField
                  key={service.id}
                  control={control}
                  name="selectedExtraServices"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(service.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), service.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== service.id
                                  )
                                );
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <Label className="flex justify-between w-full font-normal cursor-pointer">
                        <span>{service.label}</span>
                        <span>€{service.price.toFixed(2)}</span>
                      </Label>
                    </FormItem>
                  )}
                />
              ))}
            </FormItem>
          )}
        />
      </div>
      {selectedExtraServices.length >= MIN_SERVICES_FOR_DISCOUNT && (
          <p className="text-sm text-green-600 mt-2">
              Je krijgt {DISCOUNT_PERCENTAGE * 100}% korting op extra diensten!
          </p>
      )}
      <Separator />
    </div>
  );
};

export default ExtraServicesSelection;