"use client";

import { useState, useMemo, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const allServices = ["Dieptereiniging", "Ramen wassen", "Strijken", "Reguliere schoonmaak", "Milieuvriendelijk", "Huisdier-vriendelijk", "Ovenreiniging", "Na verbouwing", "Grote schoonmaak", "Organiseren", "Boodschappen doen", "Student", "Kleine klusjes", "Tuinonderhoud", "Anti-allergeen", "Kantoor schoonmaak"]; // Consolidated all services
const allCities = ["Amsterdam", "Utrecht", "Rotterdam", "Den Haag", "Eindhoven", "Groningen"]; // Consolidated all cities
const daysOfWeek = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// Mock data for cleaners
const mockCleaners: Schoonmaker[] = [
  {
    id: "mock-1",
    name: "Sophie Jansen",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.8,
    ratingCount: 95,
    hourlyRate: 22.00,
    bio: "Ervaren en betrouwbare schoonmaakster met oog voor detail. Ik zorg ervoor dat uw huis weer straalt!",
    services: ["Reguliere schoonmaak", "Ramen wassen", "Milieuvriendelijk"],
    city: "Amsterdam",
    address: "Damrak 1, 1012 LK Amsterdam",
    phoneNumber: "+31611223344",
    availableDaysOfWeek: ["Maandag", "Woensdag", "Vrijdag"],
    unavailableDates: [],
  },
  {
    id: "mock-2",
    name: "Thomas Bakker",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.5,
    ratingCount: 70,
    hourlyRate: 20.00,
    bio: "Flexibele en hardwerkende schoonmaker, beschikbaar voor diverse klussen. Uw tevredenheid is mijn prioriteit.",
    services: ["Dieptereiniging", "Ovenreiniging", "Kleine klusjes"],
    city: "Utrecht",
    address: "Oudegracht 100, 3511 AW Utrecht",
    phoneNumber: "+31655443322",
    availableDaysOfWeek: ["Dinsdag", "Donderdag", "Zaterdag"],
    unavailableDates: [],
  },
  {
    id: "mock-3",
    name: "Laura de Jong",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.9,
    ratingCount: 110,
    hourlyRate: 25.00,
    bio: "Specialist in grote schoonmaak en na verbouwing. Ik werk snel en efficiënt, met een perfect resultaat.",
    services: ["Na verbouwing", "Grote schoonmaak", "Strijken"],
    city: "Rotterdam",
    address: "Coolsingel 1, 3011 AA Rotterdam",
    phoneNumber: "+31677889900",
    availableDaysOfWeek: ["Maandag", "Dinsdag", "Donderdag"],
    unavailableDates: [],
  },
  {
    id: "mock-4",
    name: "Mohammed El-Amin",
    photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=500&auto=format&fit=crop",
    ratingAvg: 4.7,
    ratingCount: 80,
    hourlyRate: 19.50,
    bio: "Vriendelijke en grondige schoonmaker. Ik help u graag met uw huishouden, inclusief huisdier-vriendelijke opties.",
    services: ["Reguliere schoonmaak", "Huisdier-vriendelijk", "Boodschappen doen"],
    city: "Den Haag",
    address: "Spui 1, 2511 AA Den Haag",
    phoneNumber: "+31699887766",
    availableDaysOfWeek: ["Woensdag", "Vrijdag", "Zondag"],
    unavailableDates: [],
  },
];

const Zoeken = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([10, 50]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState<string>(searchParams.get("city") || "");
  const [filterPostcode, setFilterPostcode] = useState<string>(searchParams.get("postcode") || "");

  const initialDateParam = searchParams.get("date");
  const initialTimeParam = searchParams.get("time");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDateParam ? new Date(initialDateParam) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(initialTimeParam || undefined);

  const [realCleaners, setRealCleaners] = useState<Schoonmaker[]>([]); // Stores cleaners from Supabase
  const [loading, setLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null); // Specific error for Supabase fetch

  // New states for sorting and rating filter
  const [sortOption, setSortOption] = useState<string>("recommended"); // 'recommended', 'price_low_high', 'price_high_low', 'rating'
  const [minRating, setMinRating] = useState<number>(0); // 0, 3, 4, 4.5

  useEffect(() => {
    const fetchCleaners = async () => {
      setLoading(true);
      setSupabaseError(null); // Clear previous Supabase errors
      try {
        let query = supabase.from('cleaners').select('*');

        if (filterCity) {
          query = query.ilike('city', `%${filterCity}%`);
        }
        if (filterPostcode) {
          query = query.ilike('postcode', `%${filterPostcode}%`);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(error.message);
        }
        setRealCleaners(data || []);
      } catch (err: any) {
        setSupabaseError(err.message);
        console.error("Error fetching cleaners from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCleaners();
  }, [filterCity, filterPostcode]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (selectedDate) {
      newSearchParams.set("date", format(selectedDate, "yyyy-MM-dd"));
    } else {
      newSearchParams.delete("date");
    }
    if (selectedTime) {
      newSearchParams.set("time", selectedTime);
    } else {
      newSearchParams.delete("time");
    }
    setSearchParams(newSearchParams);
  }, [selectedDate, selectedTime, setSearchParams]);


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
    const newCity = cityValue === "all" ? "" : cityValue;
    setFilterCity(newCity);
  };

  const handlePostcodeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterPostcode(e.target.value);
  };

  const handleClearFilters = () => {
    setPriceRange([10, 50]);
    setSelectedServices([]);
    setSelectedDaysOfWeek([]);
    setFilterCity("");
    setFilterPostcode("");
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setSortOption("recommended");
    setMinRating(0);
    setSearchParams({}); // Clear URL search params
  };

  const allAvailableCleaners = useMemo(() => {
    // Combine mock cleaners with real cleaners, ensuring uniqueness by ID
    const combinedCleanersMap = new Map<string, Schoonmaker>();
    mockCleaners.forEach(cleaner => combinedCleanersMap.set(cleaner.id, cleaner));
    realCleaners.forEach(cleaner => combinedCleanersMap.set(cleaner.id, cleaner));
    return Array.from(combinedCleanersMap.values());
  }, [realCleaners]);


  const filteredSchoonmakers = useMemo(() => {
    let currentFilteredCleaners = allAvailableCleaners;

    // Apply price range filter
    currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker => {
      return (schoonmaker.hourlyRate || 0) >= priceRange[0] && (schoonmaker.hourlyRate || 0) <= priceRange[1];
    });

    // Apply services filter
    if (selectedServices.length > 0) {
      currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker =>
        selectedServices.every(service => schoonmaker.services?.includes(service))
      );
    }

    // Apply days of week filter
    if (selectedDaysOfWeek.length > 0) {
      currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker =>
        schoonmaker.availableDaysOfWeek && selectedDaysOfWeek.every(day => schoonmaker.availableDaysOfWeek?.includes(day))
      );
    }

    // Apply date filter
    if (selectedDate) {
      const dayName = format(selectedDate, "eeee", { locale: nl });
      const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

      currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker => {
        const isWeeklyAvailable = schoonmaker.availableDaysOfWeek?.includes(dayName);
        const isSpecificallyUnavailable = schoonmaker.unavailableDates?.includes(formattedSelectedDate);
        
        return isWeeklyAvailable && !isSpecificallyUnavailable;
      });
    }

    // Apply minimum rating filter
    if (minRating > 0) {
      currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker =>
        (schoonmaker.ratingAvg || 0) >= minRating
      );
    }

    // Apply sorting
    if (sortOption === "price_low_high") {
      currentFilteredCleaners.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    } else if (sortOption === "price_high_low") {
      currentFilteredCleaners.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    } else if (sortOption === "rating") {
      currentFilteredCleaners.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    }
    // "recommended" (default) doesn't require explicit sorting here, as the initial order is maintained or can be randomized.

    return currentFilteredCleaners;
  }, [allAvailableCleaners, priceRange, selectedServices, selectedDaysOfWeek, selectedDate, minRating, sortOption]);

  const initialPostcode = searchParams.get("postcode");
  const initialCity = searchParams.get("city");

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Laden van schoonmakers...</p>
      </div>
    );
  }

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
                <Select onValueChange={setSortOption} value={sortOption}>
                  <SelectTrigger id="sort">
                    <SelectValue placeholder="Aanbevolen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Aanbevolen</SelectItem>
                    <SelectItem value="price_low_high">Prijs (laag-hoog)</SelectItem>
                    <SelectItem value="price_high_low">Prijs (hoog-laag)</SelectItem>
                    <SelectItem value="rating">Beoordeling (hoog-laag)</SelectItem>
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
                <Label htmlFor="min-rating">Minimale beoordeling</Label>
                <Select onValueChange={(value) => setMinRating(Number(value))} value={String(minRating)}>
                  <SelectTrigger id="min-rating" className="mt-2">
                    <SelectValue placeholder="Geen minimale beoordeling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Geen minimale beoordeling</SelectItem>
                    <SelectItem value="3">3 sterren of meer</SelectItem>
                    <SelectItem value="4">4 sterren of meer</SelectItem>
                    <SelectItem value="4.5">4.5 sterren of meer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                  <Label htmlFor="filter-city">Stad</Label>
                  <Select onValueChange={handleCityFilterChange} value={filterCity || "all"}>
                    <SelectTrigger id="filter-city">
                      <SelectValue placeholder="Alle steden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle steden</SelectItem>
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
                  onChange={handlePostcodeFilterChange}
                  className="mt-2"
                />
              </div>

              {/* New Date Filter */}
              <div>
                <Label>Datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd-MM-yyyy") : <span>Kies een datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* New Time Filter */}
              <div>
                <Label>Tijd</Label>
                <Select onValueChange={setSelectedTime} value={selectedTime}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Kies een tijd" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                  </SelectContent>
                </Select>
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
              <Button variant="outline" className="w-full mt-6" onClick={handleClearFilters}>
                Filters wissen
              </Button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="md:col-span-3">
          <h1 className="text-3xl font-bold mb-4">
            {initialCity && initialPostcode ? `Schoonmakers in ${initialCity} (${initialPostcode})` : initialCity ? `Schoonmakers in ${initialCity}` : initialPostcode ? `Schoonmakers in de buurt van ${initialPostcode}` : "Schoonmakers in jouw buurt"}
          </h1>
          {supabaseError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Oeps!</strong>
              <span className="block sm:inline"> Er is een fout opgetreden bij het laden van schoonmakers uit de database: {supabaseError}. De getoonde schoonmakers zijn voorbeelden.</span>
            </div>
          )}
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