import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OverOns = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Over HelpMe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Welkom bij HelpMe, dé plek waar schone huizen en tevreden klanten samenkomen. Onze missie is om het vinden van een betrouwbare en professionele schoonmaker zo eenvoudig mogelijk te maken.</p>
          <p>Opgericht in 2024, zijn we gestart met het idee dat iedereen recht heeft op een schoon en opgeruimd huis, zonder de stress en het gedoe van het zelf zoeken naar de juiste hulp. We verbinden huishoudens met zorgvuldig gescreende, ervaren schoonmakers in heel Nederland.</p>
          <p>Veiligheid, betrouwbaarheid en kwaliteit staan bij ons voorop. Elke schoonmaker op ons platform wordt uitgebreid gescreend, zodat jij met een gerust hart de deur uit kunt. Wij regelen de administratie en betalingen, zodat jij en de schoonmaker zich kunnen focussen op wat echt belangrijk is: een stralend schoon resultaat.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverOns;