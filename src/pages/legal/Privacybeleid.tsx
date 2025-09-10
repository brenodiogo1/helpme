import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Privacybeleid = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Privacybeleid</CardTitle>
          <CardDescription>Laatst bijgewerkt: 10 september 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <h3 className="font-semibold text-foreground">1. Inleiding</h3>
          <p>HelpMe respecteert uw privacy en zet zich in om uw persoonlijke gegevens te beschermen. Dit privacybeleid informeert u over hoe wij uw persoonlijke gegevens verzamelen en verwerken wanneer u onze website bezoekt.</p>
          
          <h3 className="font-semibold text-foreground">2. Gegevens die we verzamelen</h3>
          <p>Wij kunnen verschillende soorten persoonlijke gegevens over u verzamelen, gebruiken, opslaan en overdragen, zoals: Identiteitsgegevens (naam, e-mailadres), Contactgegevens (adres, telefoonnummer), Financiële Gegevens (betaalkaartgegevens) en Technische Gegevens (IP-adres, browsertype).</p>

          <h3 className="font-semibold text-foreground">3. Hoe we uw gegevens gebruiken</h3>
          <p>We gebruiken uw persoonlijke gegevens alleen wanneer de wet dit toestaat. Meestal gebruiken we uw gegevens om de overeenkomst die we met u aangaan uit te voeren, om te voldoen aan een wettelijke verplichting en voor onze legitieme belangen.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacybeleid;