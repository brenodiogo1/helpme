import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SchoonmakerCard from "@/components/SchoonmakerCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Schoonmaker } from "@/types";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const mockSchoonmakers: Schoonmaker[] = [
  {
    id: "1",
    name: "Anna de Vries",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 128,
    hourlyRate: 18.50,
    bio: "Met 5 jaar ervaring zorg ik voor een brandschoon huis. Ik ben betrouwbaar, efficiënt en heb oog voor detail. Specialiteit: dieptereiniging van keukens en badkamers. Ik gebruik milieuvriendelijke producten en ben flexibel inzetbaar. Ik kijk ernaar uit om ook uw huis te laten stralen!",
    services: ["Dieptereiniging", "Ramen wassen", "Strijken", "Milieuvriendelijk"],
    city: "Amsterdam",
    address: "Kerkstraat 12, 1012 AB Amsterdam",
    phoneNumber: "+31612345678",
    availableDaysOfWeek: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"],
    unavailableDates: ["2025-09-15"],
  },
  {
    id: "2",
    name: "Ben Janssen",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.8,
    ratingCount: 92,
    hourlyRate: 17.00,
    bio: "Flexibele en hardwerkende schoonmaker beschikbaar voor wekelijkse klussen. Ik gebruik milieuvriendelijke producten en laat uw huis stralen. Ik ben gespecialiseerd in het schoonmaken van appartementen en kleine kantoren.",
    services: ["Reguliere schoonmaak", "Milieuvriendelijk", "Huisdier-vriendelijk", "Kantoor schoonmaak"],
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
    bio: "Perfectie is mijn standaard. Ik ben gespecialiseerd in grote schoonmaakklussen en het organiseren van ruimtes. Uw tevredenheid is gegarandeerd. Ik werk snel en efficiënt, met oog voor elk detail.",
    services: ["Na verbouwing", "Grote schoonmaak", "Organiseren", "Dieptereiniging"],
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
    bio: "Student die met veel enthousiasme en precisie uw huis schoonmaakt. Beschikbaar in de weekenden en avonduren. Ik ben flexibel en pas me graag aan uw wensen aan.",
    services: ["Reguliere schoonmaak", "Boodschappen doen", "Student", "Flexibele uren"],
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
    bio: "Ervaren schoonmaakster met oog voor detail. Ik ben pas tevreden als uw huis weer blinkt. Zeer betrouwbaar en discreet. Ik heb ervaring met diverse huishoudens en speciale verzoeken.",
    services: ["Dieptereiniging", "Kantoor schoonmaak", "Ramen wassen", "Allergievriendelijk"],
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
    bio: "Hardwerkende en betrouwbare hulp. Ik help u graag met de wekelijkse schoonmaak en kleine klusjes in huis. Ik ben punctueel en zorgvuldig in mijn werk.",
    services: ["Reguliere schoonmaak", "Kleine klusjes", "Tuinonderhoud", "Wekelijkse schoonmaak"],
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
    bio: "Professionele schoonmaakster met meer dan 10 jaar ervaring. Gespecialiseerd in huishoudens met allergieën en speciale behoeften. Ik garandeer een vlekkeloos resultaat.",
    services: ["Anti-allergeen", "Dieptereiniging", "Milieuvriendelijk", "Grote schoonmaak"],
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
    bio: "Efficiënt en grondig. Ik zorg ervoor dat uw kantoor of huis er weer representatief uitziet. Ook voor eenmalige klussen. Ik ben flexibel in mijn planning en werk altijd met een glimlach.",
    services: ["Kantoor schoonmaak", "Grote schoonmaak", "Reguliere schoonmaak", "Eenmalige klus"],
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
const timeOfDaySlots = [
  { label: "Ochtend (08:00-12:00)", value: "morning" },
  { label: "Middag (12:00-17:00)", value: "afternoon" },
  { label: "Avond (17:00-21:00)", value: "evening" },
];

const Zoeken = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([10, 50]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState<string>(searchParams.get("city") || "");
  const [filterPostcode, setFilterPostcode] = useState<string>(searchParams.get("postcode") || "");
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string[]>([]);

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

  const handleTimeOfDayFilterChange = (timeSlot: string) => {
    setSelectedTimeOfDay(prev =>
      prev.includes(timeSlot)
        ? prev.filter(t => t !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handleCityFilterChange = (cityValue: string) => {
    const newCity = cityValue === "all" ? "" : cityValue;
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
      const ratingMatch = schoonmaker.ratingAvg >= minRating;

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

      // Time of day matching (simple check, can be more complex)
      let timeOfDayMatch = true;
      if (selectedTimeOfDay.length > 0 && searchTimeParam) {
        const bookingHour = parseInt(searchTimeParam.split(':')[0]);
        const isMorning = bookingHour >= 8 && bookingHour < 12;
        const isAfternoon = bookingHour >= 12 && bookingHour < 17;
        const isEvening = bookingHour >= 17 && bookingHour < 21;

        let cleanerAvailableInSelectedTime = false;
        if (selectedTimeOfDay.includes("morning") && isMorning) cleanerAvailableInSelectedTime = true;
        if (selectedTimeOfDay.includes("afternoon") && isAfternoon) cleanerAvailableInSelectedTime = true;
        if (selectedTimeOfDay.includes("evening") && isEvening) cleanerAvailableInSelectedTime = true;

        if (!cleanerAvailableInSelectedTime) {
          timeOfDayMatch = false;
        }
      }


      return priceMatch && servicesMatch && daysOfWeekMatch && cityMatch && postcodeMatch && dateAndTimeMatch && ratingMatch && timeOfDayMatch;
    });
  }, [priceRange, selectedServices, selectedDaysOfWeek, searchParams, filterCity, filterPostcode, minRating, selectedTimeOfDay]);

  const initialPostcode = searchParams.get("postcode");
  const initialCity = searchParams.get("city");

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Filters</h2>

            <div>
              <Label htmlFor="sort" className="font-semibold">Sorteer op</Label>
              <Select>
                <SelectTrigger id="sort" className="mt-2">
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

            <Separator />

            <div>
              <Label className="font-semibold">Uurprijs</Label>
              <Slider value={priceRange} onValueChange={setPriceRange} max={50} min={10} step={1} className="mt-2" />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>€{priceRange[0]}</span>
                  <span>€{priceRange[1]}</span>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="font-semibold">Minimale Beoordeling</Label>
              <Slider value={[minRating]} onValueChange={(val) => setMinRating(val[0])} max={5} min={0} step={0.5} className="mt-2" />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{minRating === 0 ? "Alle" : `${minRating} sterren`}</span>
                  <span>5 sterren</span>
              </div>
            </div>

            <Separator />

            <div>
                <Label htmlFor="filter-city" className="font-semibold">Stad</Label>
                <Select onValueChange={handleCityFilterChange} value={filterCity || "all"}>
                  <SelectTrigger id="filter-city" className="mt-2">
                    <SelectValue placeholder="Alle steden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle steden</SelectItem>
                    {allCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>

            <div>
              <Label htmlFor="filter-postcode" className="font-semibold">Postcode</Label>
              <Input
                id="filter-postcode"
                type="text"
                placeholder="Voer postcode in"
                value={filterPostcode}
                onChange={(e) => handlePostcodeFilterChange(e.target.value)}
                className="mt-2"
              />
            </div>

            <Separator />

            <div>
                <Label className="font-semibold">Diensten</Label>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">
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

            <Separator />

            <div>
                <Label className="font-semibold">Beschikbaar op dagen</Label>
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

            <Separator />

            <div>
                <Label className="font-semibold">Beschikbaar op tijdstip</Label>
                <div className="space-y-2 mt-2">
                    {timeOfDaySlots.map(slot => (
                        <div key={slot.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`time-of-day-filter-${slot.value}`}
                              checked={selectedTimeOfDay.includes(slot.value)}
                              onCheckedChange={() => handleTimeOfDayFilterChange(slot.value)}
                            />
                            <Label htmlFor={`time-of-day-filter-${slot.value}`} className="font-normal">{slot.label}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <Button variant="outline" className="w-full mt-6" onClick={() => {
              setPriceRange([10, 50]);
              setSelectedServices([]);
              setSelectedDaysOfWeek([]);
              setFilterCity("");
              setFilterPostcode("");
              setMinRating(0);
              setSelectedTimeOfDay([]);
              setSearchParams({}); // Clear URL params
            }}>
              Filters wissen
            </Button>
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