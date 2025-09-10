"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

const daysOfWeek = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

const CleanerAvailability = () => {
  // Simulação de dados iniciais (em um app real, viria de uma API)
  const [selectedAvailableDaysOfWeek, setSelectedAvailableDaysOfWeek] = useState<string[]>(["Maandag", "Woensdag", "Vrijdag"]);
  const [unavailableDates, setUnavailableDates] = useState<Date[] | undefined>([addDays(new Date(), 7)]); // Exemplo: uma data indisponível

  useEffect(() => {
    // Em um app real, você carregaria a disponibilidade do backend aqui
    console.log("Carregando disponibilidade inicial...");
  }, []);

  const handleDayOfWeekChange = (day: string, checked: boolean) => {
    setSelectedAvailableDaysOfWeek(prev =>
      checked ? [...prev, day] : prev.filter(d => d !== day)
    );
  };

  const handleMarkAllAvailable = () => {
    setSelectedAvailableDaysOfWeek(daysOfWeek);
    showSuccess("Alle dagen van de week zijn gemarkeerd als beschikbaar!");
  };

  const handleSaveAvailability = () => {
    // Em um app real, você enviaria selectedAvailableDaysOfWeek e unavailableDates para o backend
    console.log("Disponibilidade semanal salva:", selectedAvailableDaysOfWeek);
    console.log("Datas indisponíveis salvas:", unavailableDates?.map(date => format(date, "yyyy-MM-dd")));
    showSuccess("Je beschikbaarheid is succesvol opgeslagen!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Beschikbaarheid</CardTitle>
        <CardDescription>
          Beheer hier je algemene beschikbaarheid per dag van de week en markeer specifieke dagen als onbeschikbaar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Weekly Availability */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Algemene wekelijkse beschikbaarheid</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {daysOfWeek.map(day => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={selectedAvailableDaysOfWeek.includes(day)}
                  onCheckedChange={(checked: boolean) => handleDayOfWeekChange(day, checked)}
                />
                <Label htmlFor={`day-${day}`} className="font-normal">
                  {day}
                </Label>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4" onClick={handleMarkAllAvailable}>
            Markeer alle dagen als beschikbaar
          </Button>
        </div>

        {/* Specific Unavailable Dates */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Specifieke onbeschikbare dagen</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Selecteer hieronder de specifieke datums waarop je NIET beschikbaar bent, ongeacht je wekelijkse instellingen.
          </p>
          <div className="flex flex-col items-center">
            <Calendar
              mode="multiple"
              selected={unavailableDates}
              onSelect={setUnavailableDates}
              disabled={(date) => date < addDays(new Date(), -1)}
              className="rounded-md border"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              {unavailableDates?.length ? 
                `Je bent onbeschikbaar op ${unavailableDates.length} specifieke dag(en).` : 
                "Geen specifieke onbeschikbare dagen ingesteld."
              }
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveAvailability}>
            Beschikbaarheid Opslaan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanerAvailability;