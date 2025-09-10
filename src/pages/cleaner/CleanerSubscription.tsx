import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const CleanerSubscription = () => {
  const [paymentOption, setPaymentOption] = useState("direct"); // 'direct' or 'earnings'

  const handleUpgrade = () => {
    if (paymentOption === "direct") {
      showSuccess("Gefeliciteerd! Je bent nu een Pro Schoonmaker via directe betaling. (Simulatie)");
    } else {
      showSuccess("Gefeliciteerd! Je bent nu een Pro Schoonmaker. De kosten worden verrekend met je toekomstige inkomsten. (Simulatie)");
    }
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
      <CardContent className="space-y-6">
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

        <div className="space-y-2">
          <h3 className="font-semibold">Kies je betaalmethode:</h3>
          <RadioGroup value={paymentOption} onValueChange={setPaymentOption} className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="direct" id="direct-payment" />
              <Label htmlFor="direct-payment" className="flex-grow cursor-pointer">
                Directe betaling (€9,99/maand)
                <p className="text-xs text-muted-foreground">Betaal via iDEAL/Creditcard.</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="earnings" id="earnings-discount" />
              <Label htmlFor="earnings-discount" className="flex-grow cursor-pointer">
                Verrekenen met inkomsten
                <p className="text-xs text-muted-foreground">De kosten worden automatisch afgetrokken van je wekelijkse uitbetalingen.</p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button size="lg" className="w-full" onClick={handleUpgrade}>
          Upgrade naar Pro
        </Button>
      </CardContent>
    </Card>
  );
};

export default CleanerSubscription;