"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

// Define o schema para esta parte do formulário
export const bookingDetailsSchema = z.object({
  bookingDate: z.date({ required_error: "Datum is verplicht." }),
  bookingTime: z.string().min(1, { message: "Tijd is verplicht." }),
  durationHours: z.coerce.number().min(1, { message: "Duur moet minimaal 1 uur zijn." }),
});

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

interface BookingDetailsFormProps {
  isSubmitting: boolean;
}

const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({ isSubmitting }) => {
  const { control, watch, setValue } = useFormContext(); // Removed formState as it's not directly used for FormMessage anymore
  const durationHours = watch("durationHours");

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Boekingsdetails</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="bookingDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Datum</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className="w-full pl-3 text-left font-normal"
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: nl })
                      ) : (
                        <span>Kies een datum</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bookingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tijd</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies een tijd" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="durationHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duur</FormLabel>
            <FormControl>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setValue("durationHours", Math.max(1, durationHours - 1))}
                  disabled={isSubmitting}
                  type="button"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold w-12 text-center">{durationHours} uur</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setValue("durationHours", durationHours + 1)}
                  disabled={isSubmitting}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Separator />
    </div>
  );
};

export default BookingDetailsForm;