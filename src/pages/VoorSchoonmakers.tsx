import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const benefits = [
  "Bepaal je eigen uurtarief",
  "Werk wanneer het jou uitkomt",
  "Kies je eigen werkgebied",
  "Geen administratieve rompslomp",
  "Verzekerd voor schade tot €2.500.000",
  "Wekelijkse uitbetaling",
];

const VoorSchoonmakers = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative text-white">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="relative z-10 container text-center py-20 lg:py-32">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Word schoonmaker bij HelpMe
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Verdien goed, werk flexibel en wees je eigen baas. Meld je vandaag nog aan.
          </p>
          <Button size="lg" variant="secondary">
            Meld je nu aan
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">De voordelen van werken via HelpMe</h2>
            <p className="text-muted-foreground mt-2">Alles wat je nodig hebt om succesvol te zijn.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full h-6 w-6 flex-shrink-0 flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Zo eenvoudig is het</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card>
              <CardHeader>
                <CardTitle>1. Maak je profiel aan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Meld je gratis aan, voltooi je profiel en stel je beschikbaarheid in.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Ontvang boekingen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Klanten in jouw buurt kunnen je vinden en direct boeken via de app.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3. Ga aan de slag</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Voer de schoonmaak uit op de afgesproken tijd en krijg wekelijks uitbetaald.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Klaar om te beginnen?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Word onderdeel van de beste schoonmaak-community van Nederland.
            De aanmelding is gratis en duurt slechts 5 minuten.
          </p>
          <Button size="lg">
            Start je aanmelding
          </Button>
        </div>
      </section>
    </div>
  );
};

export default VoorSchoonmakers;