import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SchoonmakerCard from "@/components/SchoonmakerCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
];

const allServices = [...new Set(mockSchoonmakers.flatMap(s => s.services))].sort();

const Zoeken = () => {
  const [searchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([10, 50]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleServiceChange = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service) 
        : [...prev, service]
    );
  };

  const filteredSchoonmakers = useMemo(() => {
    return mockSchoonmakers.filter(schoonmaker => {
      const priceMatch = schoonmaker.hourlyRate >= priceRange[0] && schoonmaker.hourlyRate <= priceRange[1];
      const servicesMatch = selectedServices.every(service => schoonmaker.services.includes(service));
      return priceMatch && servicesMatch;
    });
  }, [priceRange, selectedServices]);

  const postcode = searchParams.get("postcode");

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-24">
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
                  <Slider value={priceRange} onValueChange={setPriceRange} max={50} min={10} step={1} className="mt-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>€{priceRange[0]}</span>
                      <span>€{priceRange[1]}</span>
                  </div>
              </div>
              <div>
                  <Label>Diensten</Label>
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                      {allServices.map(service => (
                          <div key={service} className="flex items-center space-x-2">
                              <Checkbox 
                                id={service} 
                                checked={selectedServices.includes(service)}
                                onCheckedChange={() => handleServiceChange(service)}
                              />
                              <Label htmlFor={service} className="font-normal">{service}</Label>
                          </div>
                      ))}
                  </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="md:col-span-3">
          <h1 className="text-3xl font-bold mb-4">
            {postcode ? `Schoonmakers in ${postcode}` : "Schoonmakers in jouw buurt"}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchoonmakers.map((schoonmaker) => (
              <SchoonmakerCard key={schoonmaker.id} schoonmaker={schoonmaker} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Zoeken;