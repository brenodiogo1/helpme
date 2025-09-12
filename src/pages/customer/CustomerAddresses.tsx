import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus } from "lucide-react";

const mockAddresses = [
  { id: "1", name: "Thuis", address: "Kerkstraat 12", postcode: "1017 GW", city: "Amsterdam" },
  { id: "2", name: "Kantoor", address: "Coolsingel 1", postcode: "3011 AA", city: "Rotterdam" },
];

const CustomerAddresses = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Adressen</CardTitle>
        <CardDescription>Beheer hier je opgeslagen adressen.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockAddresses.map(addr => (
          <div key={addr.id} className="rounded-lg border p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <div>
                      <p className="font-semibold">{addr.name}</p>
                      <p className="text-sm text-muted-foreground">{addr.address}, {addr.postcode}, {addr.city}</p>
                  </div>
              </div>
              <Button variant="ghost" size="sm">Verwijderen</Button>
          </div>
        ))}
        <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nieuw adres toevoegen
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomerAddresses;