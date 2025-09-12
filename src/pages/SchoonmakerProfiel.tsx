"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription
import { Star, MapPin, CheckCircle, CalendarDays, Phone, Loader2 } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isBefore } from "date-fns"; // Removed addDays
import { nl } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

const SchoonmakerProfiel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cleaner, setCleaner] = useState<Schoonmaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  useEffect(() => {
    const fetchCleaner = async () => {
      if (!id) {
        setError('ID do limpador não fornecido na URL.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('cleaners')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Mock reviews and services for now, as they are not directly in the 'cleaners' table in the schema
          // In a real app, you'd fetch these from related tables or adjust the schema.
          const mockReviews = [
            { id: "r1", author: "Piet H.", rating: 5, comment: "Anna is fantastisch! Ons huis was nog nooit zo schoon.", date: "2023-10-15", avatarUrl: "https://i.pravatar.cc/150?img=1" },
            { id: "r2", author: "Janneke S.", rating: 5, comment: "Zeer professioneel en vriendelijk. Een echte aanrader.", date: "2023-10-10", avatarUrl: "https://i.pravatar.cc/150?img=2" },
            { id: "r3", author: "Klaas de Wit", rating: 4, comment: "Goed werk geleverd, was alleen 10 minuten te laat.", date: "2023-09-28", avatarUrl: "https://i.pravatar.cc/150?img=3" },
          ];
          const mockServices = ["Dieptereiniging", "Ramen wassen", "Strijken", "Milieuvriendelijk", "Huisdier-vriendelijk", "Ovenreiniging"];

          setCleaner({
            ...data,
            name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            photoUrl: data.photo_url || "https://via.placeholder.com/150",
            ratingAvg: data.rating_avg || 0,
            ratingCount: data.rating_count || 0,
            hourlyRate: data.hourly_rate || 0,
            bio: data.bio || "Geen biografie beschikbaar.",
            services: data.services || mockServices, // Use real services if available, otherwise mock
            city: data.city || "Onbekend",
            address: data.address || "Onbekend adres",
            postcode: data.postcode || "Onbekend postcode", // Added postcode
            phoneNumber: data.phone_number || "Onbekend telefoonnummer",
            reviews: mockReviews, // Use mock reviews for now
            availableDaysOfWeek: data.available_days_of_week || [],
            unavailableDates: data.unavailable_dates || [],
          } as Schoonmaker);
        } else {
          setError('Limpador não encontrado.');
        }
      } catch (err: any) {
        console.error('Erro ao buscar limpador:', err.message);
        setError(`Falha ao carregar perfil do limpador: ${err.message}`);
        showError(`Falha ao carregar perfil do limpador: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCleaner();
  }, [id]);

  // Função para verificar se uma data está disponível
  const isDateAvailable = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison

    // Disable past dates
    if (isBefore(day, today)) {
      return false;
    }

    // Check specific unavailable dates
    const formattedUnavailableDates = cleaner?.unavailableDates?.map(d => format(new Date(d), "yyyy-MM-dd")) || [];
    if (formattedUnavailableDates.includes(format(day, "yyyy-MM-dd"))) {
      return false;
    }

    // Check general available days of week
    const dayName = format(day, "eeee", { locale: nl }); // Get day name in Dutch
    if (!cleaner?.availableDaysOfWeek?.includes(dayName)) {
      return false;
    }

    return true;
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime && cleaner) {
      // Navigate to PublicQuickBooking with pre-filled parameters
      navigate(`/quick-booking`, { 
        state: { 
          date: selectedDate.toISOString(), 
          time: selectedTime,
          postcode: cleaner.postcode,
          city: cleaner.city,
          // You might want to pass cleaner.id if the quick booking needs to pre-select a cleaner
          // For now, the quick booking is generic, so we'll just pass location details.
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Laden van schoonmakerprofiel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-20 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Fout</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button asChild className="mt-4">
              <Link to="/zoeken">Terug naar zoeken</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cleaner) {
    return (
      <div className="container py-20 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Schoonmaker niet gevonden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">De schoonmaker die je zoekt, bestaat niet of is niet beschikbaar.</p>
            <Button asChild className="mt-4">
              <Link to="/zoeken">Terug naar zoeken</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={cleaner.photoUrl} alt={cleaner.name} />
              <AvatarFallback>{cleaner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold">{cleaner.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{cleaner.ratingAvg.toFixed(1)}</span>
                  <span>({cleaner.ratingCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5" />
                    <span>{cleaner.city}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Phone className="h-5 w-5" />
                    <span>{cleaner.phoneNumber}</span>
                </div>
              </div>
              <p className="mt-4">{cleaner.bio}</p>
            </div>
          </div>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adres</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{cleaner.address}, {cleaner.postcode}</span>
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
                {cleaner.availableDaysOfWeek && cleaner.availableDaysOfWeek.length > 0 ? (
                  cleaner.availableDaysOfWeek.map(day => (
                    <Badge key={day} variant="secondary" className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {day}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">Geen wekelijkse beschikbaarheid ingesteld.</p>
                )}
              </div>
              {cleaner.unavailableDates && cleaner.unavailableDates.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Niet beschikbaar op: {cleaner.unavailableDates.map(d => format(new Date(d), "dd-MM-yyyy")).join(", ")}
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
              {cleaner.services.map(service => (
                <Badge key={service} variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {service}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recensies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cleaner.reviews?.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-center">Boek {cleaner.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
                <div className="text-2xl font-bold">
                    €{cleaner.hourlyRate.toFixed(2)}
                    <span className="text-base font-normal text-muted-foreground"> / uur</span>
                </div>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(day) => !isDateAvailable(day)}
                    className="rounded-md border"
                />
                <Select onValueChange={setSelectedTime} value={selectedTime}>
                    <SelectTrigger>
                        <SelectValue placeholder="Kies een tijd" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button size="lg" className="w-full" disabled={!selectedDate || !selectedTime} onClick={handleBooking}>
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