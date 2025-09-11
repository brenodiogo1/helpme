import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AlgemeneVoorwaarden = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Algemene Voorwaarden</CardTitle>
          <CardDescription>Laatst bijgewerkt: 10 september 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <h3 className="font-semibold text-foreground">1. Toepasselijkheid</h3>
          <p>Deze algemene voorwaarden zijn van toepassing op elk aanbod van HelpMe en op elke tot stand gekomen overeenkomst op afstand tussen ondernemer en consument.</p>
          
          <h3 className="font-semibold text-foreground">2. Het aanbod</h3>
          <p>Indien een aanbod een beperkte geldigheidsduur heeft of onder voorwaarden geschiedt, wordt dit nadrukkelijk in het aanbod vermeld. Het aanbod bevat een volledige en nauwkeurige omschrijving van de aangeboden diensten.</p>

          <h3 className="font-semibold text-foreground">3. De overeenkomst</h3>
          <p>De overeenkomst komt, onder voorbehoud van het bepaalde in lid 4, tot stand op het moment van aanvaarding door de consument van het aanbod en het voldoen aan de daarbij gestelde voorwaarden.</p>

          <h3 className="font-semibold text-foreground">4. Annuleringsbeleid</h3>
          <p>Annuleringen van boekingen moeten tijdig worden doorgegeven. De volgende voorwaarden zijn van toepassing:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bij annulering minder dan 24 uur voor de geplande service, wordt 50% van het totale bedrag in rekening gebracht.</li>
            <li>Bij annulering minder dan 3 uur voor de geplande service, wordt 100% van het totale bedrag in rekening gebracht.</li>
            <li>Annuleringen meer dan 24 uur van tevoren zijn kosteloos.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlgemeneVoorwaarden;