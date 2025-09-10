import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Carriere = () => {
  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Werken bij HelpMe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Momenteel hebben we geen openstaande vacatures, maar we zijn altijd op zoek naar getalenteerde mensen. Stuur gerust een open sollicitatie!</p>
          <Button>Stuur je CV</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Carriere;