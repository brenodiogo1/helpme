import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus } from "lucide-react";

const CustomerAddresses = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Adressen</CardTitle>
        <CardDescription>Beheer hier je opgeslagen adressen.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="font-semibold">Thuis</p>
                    <p className="text-sm text-muted-foreground">Kerkstraat 12, 1012 AB, Amsterdam</p>
                </div>
            </div>
            <Button variant="ghost" size="sm">Verwijderen</Button>
        </div>
        <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nieuw adres toevoegen
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomerAddresses;