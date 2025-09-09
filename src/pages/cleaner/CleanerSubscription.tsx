import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const CleanerSubscription = () => {
  const handleUpgrade = () => {
    showSuccess("Gefeliciteerd! Je bent nu een Pro Schoonmaker. (Simulatie)");
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <Star className="h-12 w-12 mx-auto text-yellow-400" />
        <CardTitle className="text-2xl mt-4">Word een Pro Schoonmaker</CardTitle>
        <CardDescription>
          Krijg meer zichtbaarheid en boekingen met ons Pro abonnement voor €9,99/maand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Hogere positie in de zoekresultaten.</span>
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Speciale "Pro" badge op je profiel.</span>
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            <span>Toegang tot exclusieve, grotere opdrachten.</span>
          </li>
        </ul>
        <Button size="lg" className="w-full" onClick={handleUpgrade}>
          Upgrade naar Pro
        </Button>
      </CardContent>
    </Card>
  );
};

export default CleanerSubscription;