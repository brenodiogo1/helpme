import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Smile, ShieldCheck, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const cities = [
  { name: "Amsterdam", image: "https://images.unsplash.com/photo-1581287053822-fd7bf4f4bf38?q=80&w=800&auto=format&fit=crop" },
  { name: "Rotterdam", image: "https://images.unsplash.com/photo-1559653435-552751c23678?q=80&w=800&auto=format&fit=crop" },
  { name: "Den Haag", image: "https://images.unsplash.com/photo-1618553681509-926200357038?q=80&w=800&auto=format&fit=crop" },
  { name: "Utrecht", image: "https://images.unsplash.com/photo-1598610942257-9a1910a1654b?q=80&w=800&auto=format&fit=crop" },
  { name: "Eindhoven", image: "https://images.unsplash.com/photo-1589612229833-b558c4554959?q=80&w=800&auto=format&fit=crop" },
  { name: "Groningen", image: "https://images.unsplash.com/photo-1572949029855-834e5b5b3a40?q=80&w=800&auto=format&fit=crop" },
];

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1603712725038-92d867c1f0c3?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="relative z-10 p-4 container">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder={t('hero.postalCodePlaceholder')}
              className="text-black"
            />
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/zoeken">
                <Search className="mr-2 h-4 w-4" /> {t('hero.findCleaners')}
              </Link>
            </Button>
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
                <Calendar className="h-8 w-8" />
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

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-24 bg-secondary">
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