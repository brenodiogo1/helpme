import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SchoonmakerCard from "@/components/SchoonmakerCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Schoonmaker } from "@/types";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Input } from "@/components/ui/input";

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
    city: "Amsterdam",
    address: "Kerkstraat 12, 1012 AB Amsterdam",
    phoneNumber: "+31612345678",
    availableDaysOfWeek: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"],
    unavailableDates: ["2025-09-15"], // Exemplo: Anna não está disponível em 15 de setembro de 2025
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
    city: "Utrecht",
    address: "Plein 4, 3511 HT Utrecht",
    phoneNumber: "+31623456789",
    availableDaysOfWeek: ["Dinsdag", "Donderdag", "Zaterdag"],
    unavailableDates: [],
  },
  {
    id: "3",
    name: "Carla Bakker",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 5.0,
    ratingCount: 210,
    hourlyRate: 20.00,
    bio: "Perfectie is mijn standaard. Ik ben gespecializado em grandes schoonmaakklussen en het organiseren van ruimtes. Uw tevredenheid is gegarandeerd.",
    services: ["Na verbouwing", "Grote schoonmaak", "Organiseren"],
    city: "Rotterdam",
    address: "Coolsingel 1, 3011 AA Rotterdam",
    phoneNumber: "+31634567890",
    availableDaysOfWeek: ["Maandag", "Woensdag", "Vrijdag", "Zaterdag", "Zondag"],
    unavailableDates: ["2025-09-20"],
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
    city: "Amsterdam",
    address: "Nieuwmarkt 20, 1011 JP Amsterdam",
    phoneNumber: "+31645678901",
    availableDaysOfWeek: ["Zaterdag", "Zondag"],
    unavailableDates: [],
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
    city: "Den Haag",
    address: "Laan van Meerdervoort 50, 2517 AN Den Haag",
    phoneNumber: "+31656789012",
    availableDaysOfWeek: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"],
    unavailableDates: [],
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
    city: "Utrecht",
    address: "Oudegracht 100, 3511 AW Utrecht",
    phoneNumber: "+31667890123",
    availableDaysOfWeek: ["Maandag", "Woensdag", "Vrijdag"],
    unavailableDates: [],
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
    city: "Eindhoven",
    address: "Demer 25, 5611 AS Eindhoven",
    phoneNumber: "+31678901234",
    availableDaysOfWeek: ["Dinsdag", "Donderdag"],
    unavailableDates: [],
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
    city: "Rotterdam",
    address: "Weena 700, 3013 AL Rotterdam",
    phoneNumber: "+31689012345",
    availableDaysOfWeek: ["Maandag", "Woensdag", "Vrijdag"],
    unavailableDates: [],
  },
];

const allServices = [...new Set(mockSchoonmakers.flatMap(s => s.services))].sort();
const allCities = [...new Set(mockSchoonmakers.map(s => s.city))].sort();
const daysOfWeek = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

const Zoeken = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([10, 50]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState<string>(searchParams.get("city") || "");
  const [filterPostcode, setFilterPostcode] = useState<string>(searchParams.get("postcode") || "");

  useEffect(() => {
    setFilterCity(searchParams.get("city") || "");
    setFilterPostcode(searchParams.get("postcode") || "");
  }, [searchParams]);

  const handleServiceChange = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleDayOfWeekFilterChange = (day: string) => {
    setSelectedDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleCityFilterChange = (cityValue: string) => {
    const newCity = cityValue === "all" ? "" : cityValue; // Treat "all" as empty string for filtering
    setFilterCity(newCity);
    const newSearchParams = new URLSearchParams(searchParams);
    if (newCity) {
      newSearchParams.set("city", newCity);
    } else {
      newSearchParams.delete("city");
    }
    setSearchParams(newSearchParams);
  };

  const handlePostcodeFilterChange = (postcode: string) => {
    setFilterPostcode(postcode);
    const newSearchParams = new URLSearchParams(searchParams);
    if (postcode) {
      newSearchParams.set("postcode", postcode);
    } else {
      newSearchParams.delete("postcode");
    }
    setSearchParams(newSearchParams);
  };

  const filteredSchoonmakers = useMemo(() => {
    const searchDateParam = searchParams.get("date");
    const searchTimeParam = searchParams.get("time");

    let searchDate: Date | null = null;
    if (searchDateParam) {
      searchDate = new Date(searchDateParam);
      searchDate.setHours(0, 0, 0, 0);
    }

    return mockSchoonmakers.filter(schoonmaker => {
      const priceMatch = schoonmaker.hourlyRate >= priceRange[0] && schoonmaker.hourlyRate <= priceRange[1];
      const servicesMatch = selectedServices.length === 0 || selectedServices.every(service => schoonmaker.services.includes(service));

      const daysOfWeekMatch = selectedDaysOfWeek.length === 0 ||
                              (schoonmaker.availableDaysOfWeek && selectedDaysOfWeek.every(day => schoonmaker.availableDaysOfWeek?.includes(day)));

      const cityMatch = !filterCity || schoonmaker.city.toLowerCase() === filterCity.toLowerCase();
      const postcodeMatch = !filterPostcode || schoonmaker.address.toLowerCase().includes(filterPostcode.toLowerCase());

      let dateAndTimeMatch = true;
      if (searchDate) {
        const dayName = format(searchDate, "eeee", { locale: nl });
        const isWeeklyAvailable = schoonmaker.availableDaysOfWeek?.includes(dayName);
        const isSpecificallyUnavailable = schoonmaker.unavailableDates?.includes(format(searchDate, "yyyy-MM-dd"));

        if (!isWeeklyAvailable || isSpecificallyUnavailable) {
          dateAndTimeMatch = false;
        }
      }

      return priceMatch && servicesMatch && daysOfWeekMatch && cityMatch && postcodeMatch && dateAndTimeMatch;
    });
  }, [priceRange, selectedServices, selectedDaysOfWeek, searchParams, filterCity, filterPostcode]);

  const initialPostcode = searchParams.get("postcode");
  const initialCity = searchParams.get("city");

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
                  <Label htmlFor="filter-city">Stad</Label>
                  <Select onValueChange={handleCityFilterChange} value={filterCity || "all"}> {/* Use "all" when filterCity is empty */}
                    <SelectTrigger id="filter-city">
                      <SelectValue placeholder="Alle steden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle steden</SelectItem> {/* Changed value to "all" */}
                      {allCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div>
                <Label htmlFor="filter-postcode">Postcode</Label>
                <Input
                  id="filter-postcode"
                  type="text"
                  placeholder="Voer postcode in"
                  value={filterPostcode}
                  onChange={(e) => handlePostcodeFilterChange(e.target.value)}
                  className="mt-2"
                />
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
              <div>
                  <Label>Beschikbaar op dagen</Label>
                  <div className="space-y-2 mt-2">
                      {daysOfWeek.map(day => (
                          <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-filter-${day}`}
                                checked={selectedDaysOfWeek.includes(day)}
                                onCheckedChange={() => handleDayOfWeekFilterChange(day)}
                              />
                              <Label htmlFor={`day-filter-${day}`} className="font-normal">{day}</Label>
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
            {initialCity && initialPostcode ? `Schoonmakers in ${initialCity} (${initialPostcode})` : initialCity ? `Schoonmakers in ${initialCity}` : initialPostcode ? `Schoonmakers in de buurt van ${initialPostcode}` : "Schoonmakers in jouw buurt"}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchoonmakers.length > 0 ? (
              filteredSchoonmakers.map((schoonmaker) => (
                <SchoonmakerCard key={schoonmaker.id} schoonmaker={schoonmaker} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">Geen schoonmakers gevonden die aan je criteria voldoen.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Zoeken;