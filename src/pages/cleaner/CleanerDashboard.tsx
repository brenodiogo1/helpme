import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Clock, Star, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const mockUpcomingBooking = {
    customer: "Familie de Jong",
    address: "Kerkstraat 12, Amsterdam",
    date: "Morgen, 10:00",
    hours: 3,
};

const CleanerDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welkom terug, Anna!</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volgende Boeking</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Morgen om 10:00</div>
            <p className="text-xs text-muted-foreground">bij Familie de Jong</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verdient (deze week)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€185,50</div>
            <p className="text-xs text-muted-foreground">+€55,50 sinds gisteren</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Beoordeling</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9 / 5.0</div>
            <p className="text-xs text-muted-foreground">gebaseerd op 128 reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Gewerkte Uren</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">452</div>
            <p className="text-xs text-muted-foreground">12 uur deze week</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Je volgende afspraak</CardTitle>
                <CardDescription>Details van je aankomende schoonmaakklus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p><strong>Klant:</strong> {mockUpcomingBooking.customer}</p>
                <p><strong>Adres:</strong> {mockUpcomingBooking.address}</p>
                <p><strong>Datum & Tijd:</strong> {mockUpcomingBooking.date}</p>
                <p><strong>Duur:</strong> {mockUpcomingBooking.hours} uur</p>
                <Button asChild>
                    <Link to="/dashboard/boekingen">Bekijk alle boekingen</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CleanerDashboard;