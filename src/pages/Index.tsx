import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar as CalendarIcon, Smile, ShieldCheck, Star, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LiveActivityFeed from "@/components/LiveActivityFeed";

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const cities = [
  { name: "Amsterdam", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80" },
  { name: "Rotterdam", image: "https://via.placeholder.com/800x450?text=Rotterdam" }, // Placeholder
  { name: "Den Haag", image: "https://via.placeholder.com/800x450?text=Den+Haag" }, // Placeholder
  { name: "Utrecht", image: "https://via.placeholder.com/800x450?text=Utrecht" }, // Placeholder
  { name: "Eindhoven", image: "https://via.placeholder.com/800x450?text=Eindhoven" }, // Placeholder
  { name: "Groningen", image: "https://via.placeholder.com/800x450?text=Groningen" }, // Placeholder
];

const mockReviews: Review[] = [
    { id: "r1", author: "Mark V.", rating: 5, comment: "Geweldige service! Anna was punctueel, professioneel en mijn huis is brandschoon. Zeker een aanrader.", date: "2023-10-20", avatarUrl: "https://i.pravatar.cc/150?img=1" },
    { id: "r2", author: "Linda de Groot", rating: 5, comment: "Ik ben zo blij met het werk van Ben. Hij is zeer grondig en vriendelijk. Ik boek hem zeker opnieuw.", date: "2023-10-18", avatarUrl: "https://i.pravatar.cc/150?img=2" },
    { id: "r3", author: "Sander Janssen", rating: 5, comment: "Topkwaliteit en zeer betrouwbaar. Carla heeft fantastisch werk geleverd na onze verbouwing.", date: "2023-10-15", avatarUrl: "https://i.pravatar.cc/150?img=3" },
    { id: "r4", author: "Chantal Willems", rating: 4, comment: "Goede schoonmaak, communicatie kon iets beter. Maar het resultaat was prima.", date: "2023-10-12", avatarUrl: "https://i.pravatar.cc/150?img=4" },
    { id: "r5", author: "Familie de Boer", rating: 5, comment: "Eva is een topper! Ze is geweldig met onze hond en het huis ruikt altijd heerlijk fris na haar bezoek.", date: "2023-10-10", avatarUrl: "https://i.pravatar.cc/150?img=5" },
    { id: "r6", author: "Pieter van Dijk", rating: 5, comment: "Eindelijk iemand gevonden die echt weet wat schoonmaken is. Zeer tevreden over de dieptereiniging.", date: "2023-10-05", avatarUrl: "https://i.pravatar.cc/150?img=6" },
];

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (postcode) params.append("postcode", postcode);
    if (city) params.append("city", city);
    if (date) params.append("date", date.toISOString().split('T')[0]);
    if (time) params.append("time", time);
    navigate(`/zoeken?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-image.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10 md:from-black/70 md:via-black/30 md:to-transparent"></div>
        <div className="relative container mx-auto px-4 py-24 sm:py-32 md:py-48 text-white">
          <div className="md:w-1/2 lg:w-2/3 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto md:mx-0">
              {t('hero.subtitle')}
            </p>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg max-w-xl mx-auto md:mx-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
                <Input
                  type="text"
                  placeholder={t('hero.postalCodePlaceholder')}
                  className="text-black"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Voer je stad in (bijv. Amsterdam)"
                  className="text-black"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal text-black">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd-MM-yyyy") : <span>Kies een datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Select onValueChange={setTime} value={time}>
                  <SelectTrigger className="text-black">
                    <SelectValue placeholder="Kies een tijd" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="w-full mt-2" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" /> {t('hero.findCleaners')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="hoe-het-werkt" className="py-16 lg:py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Hoe werkt het?</h2>
          <p className="text-muted-foreground mb-12">Jouw huis schoon in 3 simpele stappen.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Vertel ons waar</h3>
              <p className="text-muted-foreground">
                Voer je postcode in en vertel ons wat je nodig hebt.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Kies een datum</h3>
              <p className="text-muted-foreground">
                Selecteer een datum en tijd die jou het beste uitkomt.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                <Smile className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Geniet van je schone huis</h3>
              <p className="text-muted-foreground">
                Een betrouwbare schoonmaker komt langs en doet het werk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto">
            <LiveActivityFeed />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Waarom kiezen voor HelpMe?</h2>
          <p className="text-muted-foreground mb-12">Jouw tevredenheid is onze prioriteit.</p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <CardTitle>Betrouwbaar & Gescreend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Elke schoonmaker op ons platform is zorgvuldig gescreend en beoordeeld.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Star className="h-8 w-8 text-primary" />
                <CardTitle>Topkwaliteit Gegarandeerd</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We werken alleen met de beste schoonmakers om een vlekkeloos resultaat te garanderen.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Clock className="h-8 w-8 text-primary" />
                <CardTitle>Flexibel & Eenvoudig</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Boek, beheer en betaal je schoonmaak online, op elk momento que for mais conveniente para você.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Wat onze klanten zeggen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cities Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">We zijn actief in heel Nederland</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cities.map((city) => (
              <Link to="/zoeken" key={city.name} className="group relative">
                <Card className="overflow-hidden">
                  <AspectRatio ratio={16 / 9}>
                    <img src={city.image} alt={city.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;