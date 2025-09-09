import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

const Bevestiging = () => {
  const location = useLocation();
  const { bookingDetails } = location.state || {};

  if (!bookingDetails) {
    return (
      <div className="container text-center py-20">
        <h1 className="text-2xl font-bold">Geen boekingsinformatie gevonden.</h1>
        <p className="text-muted-foreground">Ga terug naar de homepagina om een nieuwe boeking te starten.</p>
        <Button asChild className="mt-4">
          <Link to="/">Terug naar Home</Link>
        </Button>
      </div>
    );
  }

  const { schoonmaker, date, time, hours, totalPrice } = bookingDetails;

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl mt-4">Je boeking is bevestigd!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Een bevestiging is naar je e-mailadres gestuurd.
            Hieronder vind je de details van je afspraak.
          </p>
          <div className="text-left border rounded-lg p-4 space-y-2 bg-secondary/50">
            <p><strong>Schoonmaker:</strong> {schoonmaker.name}</p>
            <p><strong>Datum:</strong> {format(new Date(date), "eeee d MMMM yyyy", { locale: nl })}</p>
            <p><strong>Tijd:</strong> {time}</p>
            <p><strong>Duur:</strong> {hours} uur</p>
            <p className="font-semibold"><strong>Totaalprijs:</strong> €{totalPrice.toFixed(2)}</p>
          </div>
          <Button asChild className="mt-6">
            <Link to="/">Terug naar Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bevestiging;