import { useState, useMemo, useRef, useEffect } from "react";
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
// import QuickBooking from "@/pages/admin/QuickBooking"; // Remover importação

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const cities = [
  { name: "Amsterdam", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80" },
  { name: "Rotterdam", image: "https://images.unsplash.com/photo-1725980207-111111111111?q=80&w<dyad-problem-report summary="2 problems">
<problem file="src/pages/Index.tsx" line="226" column="11" code="17002">Expected corresponding JSX closing tag for 'div'.</problem>
<problem file="src/pages/Index.tsx" line="227" column="9" code="17002">Expected corresponding JSX closing tag for 'section'.</problem>
</dyad-problem-report><think>**Reviewing Testimonial Section**

I'm currently reviewing two TypeScript compile-time errors in `src/pages/Index.tsx` within the Testimonials Section. Both seem to stem from missing closing tags in that section's markup. The grid structure I'm building is likely the source of the issues, requiring a closer look at the syntax.


**Debugging Structure Errors**

I've identified the root cause of the TypeScript errors: redundant `<Card>` and `<CardContent>` tags enclosing the `ReviewCard` components. This is likely due to the `ReviewCard` component internally rendering a `Card`. The proposed fix involves removing the outer `<Card>` and `<CardContent>` and ensuring the `ReviewCard` components are rendered within the appropriate structure. I'm now testing this structural adjustment to resolve the compile-time issues.


**Analyzing Tag Misplacements**

I've determined the errors stem from misplaced closing tags.  The `ReviewCard` components likely encapsulate their own `Card` structure.  Therefore, extraneous `<Card>` and `<CardContent>` tags in the parent section are causing the errors. I'll test removing these redundant tags around the mapping of the `ReviewCard` components.


**Refining Tag Placement**

I'm now certain the extraneous `<CardContent>` and `<Card>` tags in `src/pages/Index.tsx` are the culprits. They're trying to close structures initiated *within* the `ReviewCard` components. I've re-examined the code and confirmed the `ReviewCard` likely renders its own internal card structure. I'll focus on removing those incorrect tags. Also, I'll delve into error logging for the Supabase Edge Function to diagnose payment initialization failures.


**Fixing Markup and Logging**

I've determined that the `</CardContent>` and `</Card>` tags in `Index.tsx` are redundant. Their removal is straightforward. Additionally, I'll enhance the logging within the Supabase Edge Function to diagnose payment initialization failures. I am confident that these changes will resolve the current issues.


</think>Com certeza! Vamos corrigir os erros de compilação no `src/pages/Index.tsx` e adicionar mais detalhes para depurar a falha na Edge Function de pagamento.

---

**1. Correção dos Erros de Compilação em `src/pages/Index.tsx`**

Os erros que você apontou (`TS17002`) indicam que há tags de fechamento `</CardContent>` e `</Card>` extras na seção de depoimentos (`Testimonials Section`). O componente `ReviewCard` já encapsula o conteúdo em seu próprio `Card`, então essas tags externas são redundantes e causam o erro. Vou removê-las.

<dyad-write path="src/pages/Index.tsx" description="Corrigindo tags de fechamento extras na seção de depoimentos.">
import { useState, useMemo, useRef, useEffect } from "react";
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
// import QuickBooking from "@/pages/admin/QuickBooking"; // Remover importação

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const cities = [
  { name: "Amsterdam", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80" },
  { name: "Rotterdam", image: "https://images.unsplash.com/photo-1725980207-111111111111?q=80&w=1920&auto=format&fit=crop" }, // Imagem de Rotterdam atualizada
  { name: "Den Haag", image: "https://images.unsplash.com/photo-1618897554035-43c6f5665131?auto=format&fit=crop&w=800&q=80" },
  { name: "Utrecht", image: "https://images.unsplash.com/photo-1561371228-789c35549834?auto=format&fit=crop&w=800&q=80" },
  { name: "Eindhoven", image: "https://images.unsplash.com/photo-1579253498-243080170428?auto=format&fit=crop&w=800&q=80" },
  { name: "Groningen", image: "https://images.unsplash.com/photo-1570164742218-8a8a5f00a633?auto=format&fit=crop&w=800&q=80" },
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
  const [city, setCity] = useState(""); // Novo estado para a cidade
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (postcode) params.append("postcode", postcode);
    if (city) params.append("city", city); // Adicionar cidade aos parâmetros
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center"> {/* Ajustado para 4 colunas */}
                <Input
                  type="text"
                  placeholder={t('hero.postalCodePlaceholder')}
                  className="text-black"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
                <Input // Novo campo para a cidade
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

      {/* Quick Booking Section (Removed) */}
      {/* <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Agendamento Rápido</h2>
          <QuickBooking />
        </div>
      </section> */}

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
                  Boek, beheer en betaal je schoonmaak online, op elk moment dat het jou uitkomt.
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
        </div> {/* Corrected: Removed extra </CardContent> and </Card> */}
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