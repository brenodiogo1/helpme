import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";

const CleanerAvailability = () => {
  const [days, setDays] = useState<Date[] | undefined>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Beschikbaarheid</CardTitle>
        <CardDescription>
          Selecteer de dagen waarop je NIET beschikbaar bent. Klanten kunnen je niet boeken op deze dagen.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="multiple"
          selected={days}
          onSelect={setDays}
          disabled={(date) => date < addDays(new Date(), -1)}
          className="rounded-md border"
        />
        <div className="mt-4 text-sm text-muted-foreground">
          {days?.length ? `Je bent onbeschikbaar op ${days.length} dag(en).` : "Je bent alle dagen beschikbaar."}
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanerAvailability;