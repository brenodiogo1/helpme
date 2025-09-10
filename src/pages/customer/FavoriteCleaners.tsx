import SchoonmakerCard from "@/components/SchoonmakerCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Schoonmaker } from "@/types";

// Mock data - em um app real, isso viria do estado do usuário
const mockFavoriteSchoonmakers: Schoonmaker[] = [
  {
    id: "1",
    name: "Anna de Vries",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 128,
    hourlyRate: 18.50,
    bio: "Met 5 jaar ervaring zorg ik voor een brandschoon huis...",
    services: ["Dieptereiniging", "Ramen wassen", "Strijken"],
    city: "Amsterdam",
    address: "Kerkstraat 12, 1012 AB Amsterdam", // Adicionado
    phoneNumber: "+31612345678" // Adicionado
  },
  {
    id: "3",
    name: "Carla Bakker",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 5.0,
    ratingCount: 210,
    hourlyRate: 20.00,
    bio: "Perfectie is mijn standaard...",
    services: ["Na verbouwing", "Grote schoonmaak", "Organiseren"],
    city: "Rotterdam",
    address: "Coolsingel 1, 3011 AA Rotterdam", // Adicionado
    phoneNumber: "+31634567890" // Adicionado
  },
];

const FavoriteCleaners = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Favoriete Schoonmakers</CardTitle>
        <CardDescription>
          Hier vind je de schoonmakers die je hebt opgeslagen als favoriet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mockFavoriteSchoonmakers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockFavoriteSchoonmakers.map((schoonmaker) => (
              <SchoonmakerCard key={schoonmaker.id} schoonmaker={schoonmaker} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Je hebt nog geen favoriete schoonmakers.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteCleaners;