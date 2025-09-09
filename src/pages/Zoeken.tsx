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
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
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
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop",
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
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 5.0,
    ratingCount: 210,
    hourlyRate: 20.00,
    bio: "Perfectie is mijn standaard. Ik ben gespecialiseerd in grote schoonmaakklussen en het organiseren van ruimtes. Uw tevredenheid is gegarandeerd.",
    services: ["Na verbouwing", "Grote schoonmaak", "Organiseren"],
    city: "Rotterdam"
  },
  {
    id: "4",
    name: "Daan Meijer",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.7,
    ratingCount: 75,
    hourlyRate: 17.50,
    bio: "Student die met veel enthousiasme en precisie uw huis schoonmaakt. Beschikbaar in de weekenden en avonduren.",
    services: ["Reguliere schoonmaak", "Boodschappen doen", "Student"],
    city: "Amsterdam"
  },
  {
    id: "5",
    name: "Eva de Boer",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 150,
    hourlyRate: 19.00,
    bio: "Ervaren schoonmaakster met oog voor detail. Ik ben pas tevreden als uw huis weer blinkt. Zeer betrouwbaar en discreet.",
    services: ["Dieptereiniging", "Kantoor schoonmaak", "Ramen wassen"],
    city: "Den Haag"
  },
  {
    id: "6",
    name: "Frank de Wit",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.6,
    ratingCount: 60,
    hourlyRate: 16.50,
    bio: "Hardwerkende en betrouwbare hulp. Ik help u graag met de wekelijkse schoonmaak en kleine klusjes in huis.",
    services: ["Reguliere schoonmaak", "Kleine klusjes", "Tuinonderhoud"],
    city: "Utrecht"
  },
  {
    id: "7",
    name: "Gerda van Dijk",
    photoUrl: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 5.0,
    ratingCount: 180,
    hourlyRate: 21.00,
    bio: "Professionele schoonmaakster met meer dan 10 jaar ervaring. Gespecialiseerd in huishoudens met allergieën.",
    services: ["Anti-allergeen", "Dieptereiniging", "Milieuvriendelijk"],
    city: "Eindhoven"
  },
  {
    id: "8",
    name: "Hans Visser",
    photoUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.8,
    ratingCount: 110,
    hourlyRate: 18.00,
    bio: "Efficiënt en grondig. Ik zorg ervoor dat uw kantoor of huis er weer representatief uitziet. Ook voor eenmalige klussen.",
    services: ["Kantoor schoonmaak", "Grote schoonmaak", "Reguliere schoonmaak"],
    city: "Rotterdam"
  },
  {
    id: "9",
    name: "Ingrid Jacobs",
    photoUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 95,
    hourlyRate: 19.50,
    bio: "Vriendelijke en zorgvuldige schoonmaakster. Ik behandel uw huis alsof het mijn eigen is. Huisdieren zijn geen probleem.",
    services: ["Huisdier-vriendelijk", "Reguliere schoonmaak", "Strijken"],
    city: "Groningen"
  },
  {
    id: "10",
    name: "Jan de Haan",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.7,
    ratingCount: 82,
    hourlyRate: 17.00,
    bio: "Gepensioneerd en fit, ik help u graag met de schoonmaak. Ik ben stipt, betrouwbaar en neem mijn werk serieus.",
    services: ["Reguliere schoonmaak", "Ramen wassen", "Boodschappen doen"],
    city: "Amsterdam"
  },
  {
    id: "11",
    name: "Karin Smit",
    photoUrl: "https://images.unsplash.com/photo-1610276198568-eb6d0ff53e48?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 135,
    hourlyRate: 18.50,
    bio: "Zorgvuldige schoonmaak met oog voor de kleinste details. Ik laat uw huis weer fris en schoon achter.",
    services: ["Dieptereiniging", "Organiseren", "Milieuvriendelijk"],
    city: "Utrecht"
  },
  {
    id: "12",
    name: "Leo Mulder",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.8,
    ratingCount: 105,
    hourlyRate: 19.00,
    bio: "Professionele glazenwasser en schoonmaker. Voor streeploze ramen en een schoon interieur.",
    services: ["Ramen wassen", "Kantoor schoonmaak", "Grote schoonmaak"],
    city: "Rotterdam"
  },
  {
    id: "13",
    name: "Maria Gomes",
    photoUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 5.0,
    ratingCount: 250,
    hourlyRate: 22.00,
    bio: "Met mijn passie voor schoonmaken en organiseren, transformeer ik elke ruimte. Zeer ervaren en gewaardeerd door mijn klanten.",
    services: ["Organiseren", "Dieptereiniging", "Na verbouwing"],
    city: "Amsterdam"
  },
  {
    id: "14",
    name: "Niels de Jong",
    photoUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.7,
    ratingCount: 68,
    hourlyRate: 17.50,
    bio: "Betrouwbare en snelle schoonmaker voor uw wekelijkse schoonmaak. Ik werk netjes en efficiënt.",
    services: ["Reguliere schoonmaak", "Huisdier-vriendelijk", "Student"],
    city: "Leiden"
  },
  {
    id: "15",
    name: "Olga Petrova",
    photoUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 115,
    hourlyRate: 20.50,
    bio: "Ik heb een scherp oog voor detail en zorg voor een perfect resultaat. Gespecialiseerd in luxe appartementen.",
    services: ["Dieptereiniging", "Strijken", "Ramen wassen"],
    city: "Den Haag"
  },
  {
    id: "16",
    name: "Peter de Bruin",
    photoUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4b7f3?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.8,
    ratingCount: 99,
    hourlyRate: 18.00,
    bio: "Allround schoonmaker voor zowel binnen als buiten. Ik ben niet bang om mijn handen vuil te maken.",
    services: ["Grote schoonmaak", "Tuinonderhoud", "Na verbouwing"],
    city: "Eindhoven"
  },
  {
    id: "17",
    name: "Quinty van der Laan",
    photoUrl: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 85,
    hourlyRate: 19.00,
    bio: "Ik maak uw huis met plezier schoon. Ik ben een opgewekt persoon en zeer betrouwbaar.",
    services: ["Reguliere schoonmaak", "Milieuvriendelijk", "Huisdier-vriendelijk"],
    city: "Groningen"
  },
  {
    id: "18",
    name: "Robert Hendriks",
    photoUrl: "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.7,
    ratingCount: 78,
    hourlyRate: 18.50,
    bio: "Ervaren in het schoonmaken van kantoren en praktijkruimtes. Discreet en professioneel.",
    services: ["Kantoor schoonmaak", "Dieptereiniging", "Reguliere schoonmaak"],
    city: "Rotterdam"
  },
  {
    id: "19",
    name: "Sandra van Vliet",
    photoUrl: "https://images.unsplash.com/photo-1521296797187-726205347ca9?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 5.0,
    ratingCount: 195,
    hourlyRate: 21.50,
    bio: "Mijn doel is om uw verwachtingen te overtreffen. Ik lever altijd topkwaliteit en ben zeer flexibel.",
    services: ["Grote schoonmaak", "Organiseren", "Strijken"],
    city: "Utrecht"
  },
  {
    id: "20",
    name: "Thomas de Leeuw",
    photoUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.8,
    ratingCount: 122,
    hourlyRate: 19.00,
    bio: "Ik zorg voor een snelle en grondige schoonmaak, zodat u kunt genieten van uw vrije tijd.",
    services: ["Reguliere schoonmaak", "Ramen wassen", "Kleine klusjes"],
    city: "Amsterdam"
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