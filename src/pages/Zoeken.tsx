"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const allServices = ["Dieptereiniging", "Ramen wassen", "Strijken", "Reguliere schoonmaak", "Milieuvriendelijk", "Huisdier-vriendelijk", "Ovenreiniging", "Na verbouwing", "Grote schoonmaak", "Organiseren", "Boodschappen doen", "Student", "Kleine klusjes", "Tuinonderhoud", "Anti-allergeen", "Kantoor schoonmaak"];
const allCities = ["Amsterdam", "Utrecht", "Rotterdam", "Den Haag", "Eindhoven", "Groningen"];
const daysOfWeek = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

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

  const [cleaners, setCleaners] = useState<Schoonmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // New states for sorting and rating filter
  const [sortOption, setSortOption] = useState<string>("recommended"); // 'recommended', 'price_low_high', 'price_high_low', 'rating'
  const [minRating, setMinRating] = useState<number>(0); // 0, 3, 4, 4.5

  useEffect(() => {
    const fetchCleaners = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        let query = supabase.from('cleaners').select('*');

        if (filterCity) {
          query = query.ilike('city', `%${filterCity}%`);
        }
        if (filterPostcode) {
          query = query.ilike('postcode', `%${filterPostcode}%`);
        }
        if (minRating > 0) {
          query = query.gte('rating_avg', minRating);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        const mappedCleaners: Schoonmaker[] = data.map(item => ({
          id: item.id,
          name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
          photoUrl: item.photo_url || "https://via.placeholder.com/150",
          ratingAvg: item.rating_avg || 0,
          ratingCount: item.rating_count || 0,
          hourlyRate: item.hourly_rate || 0,
          bio: item.bio || "Geen biografie beschikbaar.",
          services: item.services || [],
          city: item.city || "Onbekend",
          address: item.address || "Onbekend adres",
          postcode: item.postcode || "Onbekend postcode", // Added postcode
          phoneNumber: item.phone_number || "Onbekend telefoonnummer",
          availableDaysOfWeek: item.available_days_of_week || [],
          unavailableDates: item.unavailable_dates || [],
        }));

        setCleaners(mappedCleaners);
      } catch (err: any) {
        console.error("Error fetching cleaners from Supabase:", err.message);
        setFetchError(`Falha ao carregar limpadores: ${err.message}`);
        showError(`Falha ao carregar limpadores: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCleaners();
  }, [filterCity, filterPostcode, minRating]);

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

  const filteredAndSortedCleaners = useMemo(() => {
    let currentFilteredCleaners = cleaners;

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
  }, [cleaners, priceRange, selectedServices, selectedDaysOfWeek, selectedDate, minRating, sortOption]);

  const initialPostcode = searchParams.get("postcode");
  const initialCity = searchParams.get("city");

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Laden van schoonmakers...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container py-20 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Fout</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{fetchError}</p>
            <Button asChild className="mt-4">
              <Link to="/">Terug naar Home</Link>
            </Button>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedCleaners.length > 0 ? (
              filteredAndSortedCleaners.map((schoonmaker) => (
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