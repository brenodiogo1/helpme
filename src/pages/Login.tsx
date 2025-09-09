import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Inloggen</CardTitle>
          <CardDescription>
            Voer je e-mailadres en wachtwoord in om in te loggen.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input id="email" type="email" placeholder="naam@voorbeeld.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Inloggen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;