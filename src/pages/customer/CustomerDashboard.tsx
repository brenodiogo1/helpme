import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import ActivityMap from "@/components/ActivityMap";

const mockUpcomingBooking = {
    schoonmaker: "Anna de Vries",
    date: "Morgen, 10:00",
    hours: 3,
};

const CustomerDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welkom terug, Piet!</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Je volgende afspraak</CardTitle>
                <CardDescription>Details van je aankomende schoonmaakafspraak.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p><strong>Schoonmaker:</strong> {mockUpcomingBooking.schoonmaker}</p>
                <p><strong>Datum & Tijd:</strong> {mockUpcomingBooking.date}</p>
                <p><strong>Duur:</strong> {mockUpcomingBooking.hours} uur</p>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link to="/account/boekingen">Bekijk alle boekingen</Link>
                    </Button>
                    <Button variant="outline">Afspraak wijzigen</Button>
                </div>
            </CardContent>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center bg-secondary">
            <CardHeader>
                <CardTitle>Nieuwe boeking maken?</CardTitle>
                <CardDescription>Vind snel en eenvoudig een top-schoonmaker.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" asChild>
                    <Link to="/zoeken">
                        <CalendarPlus className="mr-2 h-5 w-5" />
                        Boek een schoonmaker
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <ActivityMap />
      </div>
    </div>
  );
};

export default CustomerDashboard;