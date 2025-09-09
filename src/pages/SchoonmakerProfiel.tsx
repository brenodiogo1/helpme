import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, CheckCircle } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for a single cleaner, including reviews
const mockSchoonmaker: Schoonmaker = {
    id: "1",
    name: "Anna de Vries",
    photoUrl: "https://i.pravatar.cc/150?img=1",
    ratingAvg: 4.9,
    ratingCount: 128,
    hourlyRate: 18.50,
    bio: "Met 5 jaar ervaring zorg ik voor een brandschoon huis. Ik ben betrouwbaar, efficiënt en heb oog voor detail. Specialiteit: dieptereiniging van keukens en badkamers. Ik ben flexibel inzetbaar en neem mijn eigen, milieuvriendelijke schoonmaakmiddelen mee. Ik kijk ernaar uit om ook uw huis te laten stralen!",
    services: ["Dieptereiniging", "Ramen wassen", "Strijken", "Milieuvriendelijk", "Huisdier-vriendelijk", "Ovenreiniging"],
    city: "Amsterdam",
    reviews: [
        { id: "r1", author: "Piet H.", rating: 5, comment: "Anna is fantastisch! Ons huis was nog nooit zo schoon.", date: "2023-10-15" },
        { id: "r2", author: "Janneke S.", rating: 5, comment: "Zeer professioneel en vriendelijk. Een echte aanrader.", date: "2023-10-10" },
        { id: "r3", author: "Klaas de Wit", rating: 4, comment: "Goed werk geleverd, was alleen 10 minuten te laat.", date: "2023-09-28" },
    ]
};

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const SchoonmakerProfiel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();

  const schoonmaker = mockSchoonmaker;

  const handleBooking = () => {
    if (date && time) {
      navigate(`/boeken/${schoonmaker.id}`, { state: { date: date.toISOString(), time } });
    }
  };

  if (!schoonmaker) {
    return <div>Schoonmaker niet gevonden</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={schoonmaker.photoUrl} alt={schoonmaker.name} />
              <AvatarFallback>{schoonmaker.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold">{schoonmaker.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{schoonmaker.ratingAvg.toFixed(1)}</span>
                  <span>({schoonmaker.ratingCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5" />
                    <span>{schoonmaker.city}</span>
                </div>
              </div>
              <p className="mt-4">{schoonmaker.bio}</p>
            </div>
          </div>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Diensten</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {schoonmaker.services.map(service => (
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
              {schoonmaker.reviews?.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
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
                    €{schoonmaker.hourlyRate.toFixed(2)}
                    <span className="text-base font-normal text-muted-foreground"> / uur</span>
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
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