"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SchoonmakerCard from "@/components/SchoonmakerCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Schoonmaker } from "@/types";
import { format, isBefore } from "date-fns";
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
  
  // Local states for filter inputs (user interacts with these)
  const [localPriceRange, setLocalPriceRange] = useState([10, 50]);
  const [localSelectedServices, setLocalSelectedServices] = useState<string[]>([]);
  const [localSelectedDaysOfWeek, setLocalSelectedDaysOfWeek] = useState<string[]>([]);
  const [localFilterCity, setLocalFilterCity] = useState<string>(searchParams.get("city") || "");
  const [localFilterPostcode, setLocalFilterPostcode] = useState<string>(searchParams.get("postcode") || "");
  const [localSelectedDate, setLocalSelectedDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined
  );
  const [localSelectedTime, setLocalSelectedTime] = useState<string | undefined>(searchParams.get("time") || undefined);
  const [localMinRating, setLocalMinRating] = useState<number>(Number(searchParams.get("minRating")) || 0);
  const [localSortOption, setLocalSortOption] = useState<string>(searchParams.get("sortOption") || "recommended");

  // States that actually trigger the fetch/memo re-evaluation (updated by "Apply Filters" button)
  const [appliedPriceRange, setAppliedPriceRange] = useState(localPriceRange);
  const [appliedSelectedServices, setAppliedSelectedServices] = useState(localSelectedServices);
  const [appliedSelectedDaysOfWeek, setAppliedSelectedDaysOfWeek] = useState(localSelectedDaysOfWeek);
  const [appliedFilterCity, setAppliedFilterCity] = useState(localFilterCity);
  const [appliedFilterPostcode, setAppliedFilterPostcode] = useState(localFilterPostcode);
  const [appliedSelectedDate, setAppliedSelectedDate] = useState(localSelectedDate);
  const [appliedSelectedTime, setAppliedSelectedTime] = useState(localSelectedTime);
  const [appliedMinRating, setAppliedMinRating] = useState(localMinRating);
  const [appliedSortOption, setAppliedSortOption] = useState(localSortOption);

  const [cleaners, setCleaners] = useState<Schoonmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Effect to initialize local states from URL search params on mount
  useEffect(() => {
    const cityParam = searchParams.get("city") || "";
    const postcodeParam = searchParams.get("postcode") || "";
    const dateParam = searchParams.get("date");
    const timeParam = searchParams.get("time");
    const minRatingParam = Number(searchParams.get("minRating")) || 0;
    const sortOptionParam = searchParams.get("sortOption") || "recommended";

    setLocalFilterCity(cityParam);
    setLocalFilterPostcode(postcodeParam);
    setLocalSelectedDate(dateParam ? new Date(dateParam) : undefined);
    setLocalSelectedTime(timeParam || undefined);
    setLocalMinRating(minRatingParam);
    setLocalSortOption(sortOptionParam);

    // Apply these initial values immediately
    setAppliedFilterCity(cityParam);
    setAppliedFilterPostcode(postcodeParam);
    setAppliedSelectedDate(dateParam ? new Date(dateParam) : undefined);
    setAppliedSelectedTime(timeParam || undefined);
    setAppliedMinRating(minRatingParam);
    setAppliedSortOption(sortOptionParam);
  }, [searchParams]);

  // Main fetch effect, now dependent on 'applied' states
  useEffect(() => {
    const fetchCleaners = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        let query = supabase.from('cleaners').select('*');

        if (appliedFilterCity) {
          query = query.ilike('city', `%${appliedFilterCity}%`);
        }
        if (appliedFilterPostcode) {
          query = query.ilike('postcode', `%${appliedFilterPostcode}%`);
        }
        if (appliedMinRating > 0) {
          query = query.gte('rating_avg', appliedMinRating);
        }

        // Apply sorting directly in the query if possible, otherwise client-side
        if (appliedSortOption === "price_low_high") {
          query = query.order('hourly_rate', { ascending: true });
        } else if (appliedSortOption === "price_high_low") {
          query = query.order('hourly_rate', { ascending: false });
        } else if (appliedSortOption === "rating") {
          query = query.order('rating_avg', { ascending: false });
        }
        // "recommended" (default) doesn't require explicit sorting here, as the initial order is maintained or can be randomized.

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
          postcode: item.postcode || "Onbekend postcode",
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
  }, [appliedFilterCity, appliedFilterPostcode, appliedMinRating, appliedSortOption]); // Dependencies for API fetch

  // Client-side filtering for date, time, price range, and services
  const filteredAndSortedCleaners = useMemo(() => {
    let currentFilteredCleaners = cleaners;

    // Apply price range filter
    currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker => {
      return (schoonmaker.hourlyRate || 0) >= appliedPriceRange[0] && (schoonmaker.hourlyRate || 0) <= appliedPriceRange[1];
    });

    // Apply services filter
    if (appliedSelectedServices.length > 0) {
      currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker =>
        appliedSelectedServices.every(service => schoonmaker.services?.includes(service))
      );
    }

    // Apply days of week filter
    if (appliedSelectedDaysOfWeek.length > 0) {
      currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker =>
        schoonmaker.availableDaysOfWeek && appliedSelectedDaysOfWeek.every(day => schoonmaker.availableDaysOfWeek?.includes(day))
      );
    }

    // Apply date filter
    if (appliedSelectedDate) {
      const dayName = format(appliedSelectedDate, "eeee", { locale: nl });
      const formattedAppliedSelectedDate = format(appliedSelectedDate, "yyyy-MM-dd");

      currentFilteredCleaners = currentFilteredCleaners.filter(schoonmaker => {
        const isWeeklyAvailable = schoonmaker.availableDaysOfWeek?.includes(dayName);
        const isSpecificallyUnavailable = schoonmaker.unavailableDates?.includes(formattedAppliedSelectedDate);
        
        // Also ensure the date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPastDate = isBefore(appliedSelectedDate, today);

        return isWeeklyAvailable && !isSpecificallyUnavailable && !isPastDate;
      });
    }

    // Apply time filter (simple check, could be more complex for time ranges)
    if (appliedSelectedTime) {
        // This is a simple check, assuming cleaners have availability by day, not specific time slots in their profile.
        // For a more robust time filter, cleaner profiles would need to store time slot availability.
        // For now, we'll just ensure a time is selected if the user wants to filter by it.
        // This filter is more about *having* a time selected for booking, rather than filtering cleaners by specific time slot availability.
    }

    return currentFilteredCleaners;
  }, [cleaners, appliedPriceRange, appliedSelectedServices, appliedSelectedDaysOfWeek, appliedSelectedDate, appliedSelectedTime]); // Dependencies for client-side filtering

  const handleApplyFilters = () => {
    // Update the 'applied' states, which will trigger the main useEffect and memo
    setAppliedPriceRange(localPriceRange);
    setAppliedSelectedServices(localSelectedServices);
    setAppliedSelectedDaysOfWeek(localSelectedDaysOfWeek);
    setAppliedFilterCity(localFilterCity);
    setAppliedFilterPostcode(localFilterPostcode);
    setAppliedSelectedDate(localSelectedDate);
    setAppliedSelectedTime(localSelectedTime);
    setAppliedMinRating(localMinRating);
    setAppliedSortOption(localSortOption);

    // Also update URL search params for persistence and sharing
    const newSearchParams = new URLSearchParams();
    if (localFilterCity) newSearchParams.set("city", localFilterCity);
    if (localFilterPostcode) newSearchParams.set("postcode", localFilterPostcode);
    if (localSelectedDate) newSearchParams.set("date", format(localSelectedDate, "yyyy-MM-dd"));
    if (localSelectedTime) newSearchParams.set("time", localSelectedTime);
    if (localMinRating > 0) newSearchParams.set("minRating", String(localMinRating));
    if (localSortOption !== "recommended") newSearchParams.set("sortOption", localSortOption);
    setSearchParams(newSearchParams);
  };

  const handleClearFilters = () => {
    setLocalPriceRange([10, 50]);
    setLocalSelectedServices([]);
    setLocalSelectedDaysOfWeek([]);
    setLocalFilterCity("");
    setLocalFilterPostcode("");
    setLocalSelectedDate(undefined);
    setLocalSelectedTime(undefined);
    setLocalMinRating(0);
    setLocalSortOption("recommended");

    // Clear applied states
    setAppliedPriceRange([10, 50]);
    setAppliedSelectedServices([]);
    setAppliedSelectedDaysOfWeek([]);
    setAppliedFilterCity("");
    setAppliedFilterPostcode("");
    setAppliedSelectedDate(undefined);
    setAppliedSelectedTime(undefined);
    setAppliedMinRating(0);
    setAppliedSortOption("recommended");

    setSearchParams({}); // Clear URL search params
  };

  const initialCity = searchParams.get("city");
  const initialPostcode = searchParams.get("postcode");

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
                <Select onValueChange={setLocalSortOption} value={localSortOption}>
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
                  <Slider value={localPriceRange} onValueChange={setLocalPriceRange} max={50} min={10} step={1} className="mt-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>€{localPriceRange[0]}</span>
                      <span>€{localPriceRange[1]}</span>
                  </div>
              </div>
              <div>
                <Label htmlFor="min-rating">Minimale beoordeling</Label>
                <Select onValueChange={(value) => setLocalMinRating(Number(value))} value={String(localMinRating)}>
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
                  <Select onValueChange={setLocalFilterCity} value={localFilterCity || "all"}>
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
                  value={localFilterPostcode}
                  onChange={(e) => setLocalFilterPostcode(e.target.value)}
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
                      {localSelectedDate ? format(localSelectedDate, "dd-MM-yyyy") : <span>Kies een datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localSelectedDate}
                      onSelect={setLocalSelectedDate}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* New Time Filter */}
              <div>
                <Label>Tijd</Label>
                <Select onValueChange={setLocalSelectedTime} value={localSelectedTime}>
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
                                checked={localSelectedServices.includes(service)}
                                onCheckedChange={() => setLocalSelectedServices(prev =>
                                  prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
                                )}
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
                                checked={localSelectedDaysOfWeek.includes(day)}
                                onCheckedChange={() => setLocalSelectedDaysOfWeek(prev =>
                                  prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                )}
                              />
                              <Label htmlFor={`day-filter-${day}`} className="font-normal">{day}</Label>
                          </div>
                      ))}
                  </div>
              </div>
              <Button className="w-full mt-6" onClick={handleApplyFilters}>
                Filters Toepassen
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={handleClearFilters}>
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Laden van schoonmakers...</p>
            </div>
          ) : fetchError ? (
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
          ) : filteredAndSortedCleaners.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAndSortedCleaners.map((schoonmaker) => (
                <SchoonmakerCard key={schoonmaker.id} schoonmaker={schoonmaker} selectedDate={appliedSelectedDate} selectedTime={appliedSelectedTime} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground col-span-full">Geen schoonmakers gevonden die aan je criteria voldoen.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Zoeken;