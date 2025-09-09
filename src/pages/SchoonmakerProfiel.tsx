import { useParams } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, CheckCircle } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";

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


const SchoonmakerProfiel = () => {
  const { id } = useParams<{ id: string }>();
  // In a real app, you would fetch the cleaner's data based on the id.
  // For now, we'll just use the mock data.
  const schoonmaker = mockSchoonmaker;

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
            <CardContent className="flex flex-col items-center">
                <div className="text-2xl font-bold mb-4">
                    €{schoonmaker.hourlyRate.toFixed(2)}
                    <span className="text-base font-normal text-muted-foreground"> / uur</span>
                </div>
                <Calendar
                    mode="single"
                    className="rounded-md border"
                />
                <Button size="lg" className="mt-4 w-full">Beschikbaarheid controleren</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default SchoonmakerProfiel;