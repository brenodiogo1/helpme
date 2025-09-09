import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Registreren = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50 py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Sparkles className="h-8 w-8 mx-auto text-primary" />
          <CardTitle className="text-2xl mt-2">Account aanmaken</CardTitle>
          <CardDescription>
            Voer je gegevens in om een nieuw account aan te maken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">Voornaam</Label>
              <Input id="first-name" placeholder="Jan" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Achternaam</Label>
              <Input id="last-name" placeholder="Jansen" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="naam@voorbeeld.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Account aanmaken
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Heb je al een account?{" "}
            <Link to="/login" className="underline">
              Inloggen
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registreren;