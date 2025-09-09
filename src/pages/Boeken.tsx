import { useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Schoonmaker } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

// Mock data - in a real app, you'd fetch this based on the ID
const mockSchoonmaker: Schoonmaker = {
    id: "1",
    name: "Anna de Vries",
    photoUrl: "https://i.pravatar.cc/150?img=1",
    ratingAvg: 4.9,
    ratingCount: 128,
    hourlyRate: 18.50,
    bio: "Bio",
    services: [],
    city: "Amsterdam",
};

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const Boeken = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { date, time } = location.state || {};

    const [hours, setHours] = useState(3);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const schoonmaker = mockSchoonmaker; // Fetch cleaner by id

    const basePrice = hours * schoonmaker.hourlyRate;
    const extrasPrice = useMemo(() => {
        return extraServices
            .filter(service => selectedServices.includes(service.id))
            .reduce((total, service) => total + service.price, 0);
    }, [selectedServices]);
    const totalPrice = basePrice + extrasPrice;

    const handleServiceChange = (serviceId: string) => {
        setSelectedServices(prev => 
            prev.includes(serviceId) 
                ? prev.filter(id => id !== serviceId) 
                : [...prev, serviceId]
        );
    };

    if (!date || !time) {
        return (
            <div className="container text-center py-20">
                <h1 className="text-2xl font-bold">Oeps! Er is iets misgegaan.</h1>
                <p className="text-muted-foreground">Selecteer een datum en tijd op de profielpagina.</p>
                <Button asChild className="mt-4">
                    <Link to={`/schoonmaker/${id}`}>Terug naar profiel</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Bevestig je boeking</CardTitle>
                    <CardDescription>
                        Je boekt {schoonmaker.name} op {format(new Date(date), "eeee d MMMM", { locale: nl })} om {time}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="font-semibold">Hoeveel uur?</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.max(2, h - 1))}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-bold w-12 text-center">{hours} uur</span>
                            <Button variant="outline" size="icon" onClick={() => setHours(h => Math.min(8, h + 1))}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label className="font-semibold">Extra diensten</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {extraServices.map(service => (
                                <div key={service.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={service.id} 
                                        onCheckedChange={() => handleServiceChange(service.id)}
                                    />
                                    <Label htmlFor={service.id} className="flex justify-between w-full">
                                        <span>{service.label}</span>
                                        <span>€{service.price.toFixed(2)}</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Prijsoverzicht</h3>
                        <div className="space-y-1 text-muted-foreground">
                            <div className="flex justify-between">
                                <span>{schoonmaker.name} ({hours} uur)</span>
                                <span>€{basePrice.toFixed(2)}</span>
                            </div>
                            {selectedServices.map(serviceId => {
                                const service = extraServices.find(s => s.id === serviceId);
                                return (
                                    <div key={serviceId} className="flex justify-between">
                                        <span>{service?.label}</span>
                                        <span>€{service?.price.toFixed(2)}</span>
                                    </div>
                                );
                            })}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-foreground">
                                <span>Totaal</span>
                                <span>€{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full">Nu betalen en bevestigen</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Boeken;