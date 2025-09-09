import SchoonmakerCard from "@/components/SchoonmakerCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Schoonmaker } from "@/types";

const mockSchoonmakers: Schoonmaker[] = [
  {
    id: "1",
    name: "Anna de Vries",
    photoUrl: "https://i.pravatar.cc/150?img=1",
    ratingAvg: 4.9,
    ratingCount: 128,
    hourlyRate: 18.50,
    bio: "Met 5 jaar ervaring zorg ik voor een brandschoon huis. Ik ben betrouwbaar, efficiënt en heb oog voor detail. Specialiteit: dieptereiniging van keukens en badkamers.",
    services: ["Dieptereiniging", "Ramen wassen", "Strijken"],
    city: "Amsterdam"
  },
  {
    id: "2",
    name: "Ben Janssen",
    photoUrl: "https://i.pravatar.cc/150?img=2",
    ratingAvg: 4.8,
    ratingCount: 92,
    hourlyRate: 17.00,
    bio: "Flexibele en hardwerkende schoonmaker beschikbaar voor wekelijkse klussen. Ik gebruik milieuvriendelijke producten en laat uw huis stralen.",
    services: ["Reguliere schoonmaak", "Milieuvriendelijk", "Huisdier-vriendelijk"],
    city: "Utrecht"
  },
  {
    id: "3",
    name: "Carla Bakker",
    photoUrl: "https://i.pravatar.cc/150?img=3",
    ratingAvg: 5.0,
    ratingCount: 210,
    hourlyRate: 20.00,
    bio: "Perfectie is mijn standaard. Ik ben gespecialiseerd in grote schoonmaakklussen en het organiseren van ruimtes. Uw tevredenheid is gegarandeerd.",
    services: ["Na verbouwing", "Grote schoonmaak", "Organiseren"],
    city: "Rotterdam"
  },
];

const Zoeken = () => {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Filters</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="sort">Sorteer op</Label>
              <Select>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Aanbevolen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Aanbevolen</SelectItem>
                  <SelectItem value="price_low_high">Prijs (laag-hoog)</SelectItem>
                  <SelectItem value="price_high_low">Prijs (hoog-laag)</SelectItem>
                  <SelectItem value="rating">Beoordeling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label>Uurprijs</Label>
                <Slider defaultValue={[15, 25]} max={50} min={10} step={1} className="mt-2" />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>€10</span>
                    <span>€50</span>
                </div>
            </div>
            <div>
                <Label>Diensten</Label>
                <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="dieptereiniging" />
                        <Label htmlFor="dieptereiniging">Dieptereiniging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ramen" />
                        <Label htmlFor="ramen">Ramen wassen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="oven" />
                        <Label htmlFor="oven">Oven/koelkast</Label>
                    </div>
                </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="md:col-span-3">
          <h1 className="text-3xl font-bold mb-4">Schoonmakers in jouw buurt</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockSchoonmakers.map((schoonmaker) => (
              <SchoonmakerCard key={schoonmaker.id} schoonmaker={schoonmaker} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Zoeken;