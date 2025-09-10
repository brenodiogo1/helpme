import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";

const Prijzen = () => {
  return (
    <div className="container py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold">Transparante Prijzen</h1>
            <p className="text-muted-foreground">Geen verborgen kosten, alleen een schoon huis.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Per Uur</CardTitle>
                    <CardDescription>Flexibel en op maat.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-3xl font-bold">Vanaf €18,50 <span className="text-lg font-normal text-muted-foreground">/ uur</span></p>
                    <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Uurtarief bepaald door de schoonmaker.</li>
                        <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Minimaal 2 uur per boeking.</li>
                        <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Inclusief verzekering.</li>
                    </ul>
                </CardContent>
            </Card>
            <Card className="border-primary">
                <CardHeader>
                    <CardTitle>Abonnement (Binnenkort)</CardTitle>
                    <CardDescription>Voor regelmatige schoonmaak.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-3xl font-bold">Vaste lage prijs</p>
                     <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Korting op het uurtarief.</li>
                        <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Altijd dezelfde, vertrouwde schoonmaker.</li>
                        <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Flexibel pauzeren of opzeggen.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default Prijzen;