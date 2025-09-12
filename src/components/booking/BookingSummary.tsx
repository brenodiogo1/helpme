"use client";

import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { FREQ, FrequencyCode } from './FrequencyCards'; // Corrected relative import path

function calcTotal({
  baseHourly = 16.9,
  frequencyDiscount = 0,
  duration = 2,
  serviceFee = 2.9,
  addons = 0
}) {
  const time = duration * baseHourly * (1 - frequencyDiscount);
  const total = Math.max(0, time) + serviceFee + addons;
  return { time: Number(time.toFixed(2)), total: Number(total.toFixed(2)) };
}

interface BookingSummaryProps {
  postcode?: string;
  city?: string;
  frequency: FrequencyCode;
  duration: number;
  date?: Date;
  time?: string;
  addonsTotal: number;
}

export function BookingSummary({ ctx }:{ ctx: BookingSummaryProps }) {
  const { settings } = useSettings();
  const baseHourly = settings.baseHourlyRate;
  const serviceFee = settings.serviceFeeFixed;
  const frequencyDiscount = FREQ[ctx.frequency]?.discount || 0;

  const { time: subtotalTime, total } = calcTotal({
    baseHourly: baseHourly,
    frequencyDiscount: frequencyDiscount,
    duration: ctx.duration,
    serviceFee: serviceFee,
    addons: ctx.addonsTotal
  });

  return (
    <aside className="rounded-lg border bg-card p-4 w-full sticky top-24">
      <h3 className="font-semibold text-lg mb-4">Jouw boeking</h3>
      
      {ctx.postcode && ctx.city && (
        <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
          <span className="font-medium text-foreground">Locatie:</span> {ctx.postcode}, {ctx.city}
        </div>
      )}

      <dl className="text-sm space-y-2">
        <div className="flex justify-between"><dt className="text-muted-foreground">Dienst</dt><dd className="font-medium">Schoonmaak</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Frequentie</dt><dd className="font-medium">{FREQ[ctx.frequency]?.label_nl}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Duur</dt><dd className="font-medium">{ctx.duration} uur</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Datum</dt><dd className="font-medium">{ctx.date ? format(ctx.date, "dd-MM-yyyy", { locale: nl }) : '-'}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Tijd</dt><dd className="font-medium">{ctx.time ? `Om ${ctx.time}` : '-'}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Servicekosten</dt><dd className="font-medium">€{serviceFee.toFixed(2)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Gem. prijs/uur</dt><dd className="font-medium">€{baseHourly.toFixed(2)}</dd></div>
      </dl>
      <Separator className="my-4"/>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotaal tijd</span>
        <span className="font-medium">€{subtotalTime.toFixed(2)}</span>
      </div>
      {frequencyDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-600 mt-1">
          <span>Frequentiekorting</span>
          <span>-€{(ctx.duration * baseHourly * frequencyDiscount).toFixed(2)}</span>
        </div>
      )}
      {ctx.addonsTotal > 0 && (
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Extra diensten</span>
          <span className="font-medium">€{ctx.addonsTotal.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-lg mt-4">
        <span>Totaal</span><span>€{total.toFixed(2)}</span>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Prijzen kunnen variëren op basis van de schoonmakerselectie in de volgende stap.
      </div>
      <div className="mt-4">
        <input className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Voucher code"/>
      </div>
    </aside>
  );
}