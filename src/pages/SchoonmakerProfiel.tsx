import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, CheckCircle, CalendarDays, Phone } from "lucide-react";
// import ReviewCard from "@/components/ReviewCard"; // Removido: 'ReviewCard' não é lido
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isBefore } from "date-fns"; // Removido: 'addDays' não é lido
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const SchoonmakerProfiel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schoonmaker, setSchoonmaker] = useState<Schoonmaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();

  const fetchSchoonmaker = useCallback(async () => {
    if (!id) {
      showError("ID do limpador não fornecido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      setSchoonmaker(data as Schoonmaker);
    } catch (err: any) {
      showError(err.message || "Fout bij het laden van het schoonmakerprofiel.");
      console.error("Error fetching cleaner profile:", err);
      setSchoonmaker(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSchoonmaker();
  }, [fetchSchoonmaker]);

  // Função para verificar se uma data está disponível
  const isDateAvailable = (day: Date) => {
    if (!schoonmaker) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison

    // Disable past dates
    if (isBefore(day, today)) {
      return false;
    }

    // Check specific unavailable dates
    const formattedUnavailableDates = schoonmaker.unavailable_dates?.map(d => format(new Date(d), "yyyy-MM-dd")) || [];
    if (formattedUnavailableDates.includes(format(day, "yyyy-MM-dd"))) {
      return false;
    }

    // Check general available days of week
    const dayName = format(day, "eeee", { locale: nl }); // Get day name in Dutch
    if (!schoonmaker.available_days_of_week?.includes(dayName)) {
      return false;
    }

    return true;
  };

  const handleBooking = () => {
    if (date && time && schoonmaker) {
      navigate(`/boeken/${schoonmaker.id}`, { state: { date: date.toISOString(), time } });
    }
  };

  if (loading) {
    return <div className="container py-8 text-center">Laden van schoonmakerprofiel...</div>;
  }

  if (!schoonmaker) {
    return <div className="container py-8 text-center">Schoonmaker niet gevonden</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={schoonmaker.photo_url || undefined} alt={schoonmaker.name} />
              <AvatarFallback>{schoonmaker.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold">{schoonmaker.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{schoonmaker.rating_avg?.toFixed(1) || 'N/A'}</span>
                  <span>({schoonmaker.rating_count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5" />
                    <span>{schoonmaker.city}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Phone className="h-5 w-5" />
                    <span>{schoonmaker.phone_number}</span>
                </div>
              </div>
              <p className="mt-4">{schoonmaker.bio}</p>
            </div>
          </div>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adres</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{schoonmaker.address}</span>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Beschikbaarheid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="font-semibold mr-2">Beschikbaar op:</span>
                {schoonmaker.available_days_of_week && schoonmaker.available_days_of_week.length > 0 ? (
                  schoonmaker.available_days_of_week.map(day => (
                    <Badge key={day} variant="secondary" className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {day}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">Geen wekelijkse beschikbaarheid ingesteld.</p>
                )}
              </div>
              {schoonmaker.unavailable_dates && schoonmaker.unavailable_dates.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Niet beschikbaar op: {schoonmaker.unavailable_dates.map(d => format(new Date(d), "dd-MM-yyyy")).join(", ")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Diensten</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {schoonmaker.services && schoonmaker.services.length > 0 ? (
                schoonmaker.services.map(service => (
                  <Badge key={service} variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {service}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">Geen diensten ingesteld.</p>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recensies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reviews will be fetched here later */}
              <p className="text-muted-foreground">Nog geen recensies beschikbaar.</p>
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-center">Boek {schoonmaker.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
                <div className="text-2xl font-bold">
                    €{schoonmaker.hourly_rate?.toFixed(2) || '0.00'}
                    <span className="text-base font-normal text-muted-foreground"> / uur</span>
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(day) => !isDateAvailable(day)} // Usar a função de disponibilidade
                    className="rounded-md border"
                />
                <Select onValueChange={setTime} value={time}>
                    <SelectTrigger>
                        <SelectValue placeholder="Kies een tijd" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button size="lg" className="w-full" disabled={!date || !time} onClick={handleBooking}>
                  Boek nu
                </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default SchoonmakerProfiel;