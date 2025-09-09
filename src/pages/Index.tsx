import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Smile } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const cities = [
  "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg",
  "Groningen", "Almere", "Breda", "Nijmegen",
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
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596733639235-365013b854a7?q=80&w=2070&auto=format&fit=crop')" }}
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

      {/* Featured Cities Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">We zijn actief in heel Nederland</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {cities.map((city) => (
              <Button key={city} variant="outline" className="w-full">
                {city}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;