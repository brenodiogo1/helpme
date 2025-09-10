"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const daysOfWeek = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

const CleanerAvailability = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cleanerId, setCleanerId] = useState<string | null>(null);
  const [selectedAvailableDaysOfWeek, setSelectedAvailableDaysOfWeek] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Kept error for display, removed unused setError

  useEffect(() => {
    const fetchAvailability = async () => {
      if (isAuthLoading) return;

      if (!user) {
        setLoading(false);
        showError("U moet ingelogd zijn om uw beschikbaarheid te beheren.");
        return;
      }

      setLoading(true);
      try {
        const { data: cleanerData, error: cleanerError } = await supabase
          .from('cleaners')
          .select('id, available_days_of_week, unavailable_dates')
          .eq('user_id', user.id)
          .single();

        if (cleanerError && cleanerError.code !== 'PGRST116') {
          throw new Error(cleanerError.message);
        }

        if (cleanerData) {
          setCleanerId(cleanerData.id);
          setSelectedAvailableDaysOfWeek(cleanerData.available_days_of_week || []);
          setUnavailableDates(cleanerData.unavailable_dates?.map((dateStr: string) => new Date(dateStr)) || []);
        } else {
          showError("Geen schoonmakerprofiel gevonden om beschikbaarheid te laden.");
        }
      } catch (err: any) {
        showError(err.message);
        console.error("Fout bij het laden van beschikbaarheid:", err);
        setError(err.message); // Set error for display
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [isAuthLoading, user]);

  const handleDayOfWeekChange = (day: string, checked: boolean) => {
    setSelectedAvailableDaysOfWeek(prev =>
      checked ? [...prev, day] : prev.filter(d => d !== day)
    );
  };

  const handleMarkAllAvailable = () => {
    setSelectedAvailableDaysOfWeek(daysOfWeek);
    showSuccess("Alle dagen van de week zijn gemarkeerd als beschikbaar!");
  };

  const handleSaveAvailability = async () => {
    if (!cleanerId) {
      showError("Geen schoonmakerprofiel gevonden om beschikbaarheid bij te werken.");
      return;
    }

    const toastId = showLoading("Beschikbaarheid opslaan...");
    try {
      const { error: updateError } = await supabase
        .from('cleaners')
        .update({
          available_days_of_week: selectedAvailableDaysOfWeek,
          unavailable_dates: unavailableDates?.map(date => format(date, "yyyy-MM-dd")),
          updated_at: new Date().toISOString(),
        })
        .eq('id', cleanerId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      dismissToast(toastId);
      showSuccess("Je beschikbaarheid is succesvol opgeslagen!");
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
      console.error("Fout bij het opslaan van beschikbaarheid:", err);
      setError(err.message); // Set error for display
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Beschikbaarheid</CardTitle></CardHeader>
        <CardContent><p>Laden van beschikbaarheid...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Beschikbaarheid</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

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