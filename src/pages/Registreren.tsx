import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const Registreren = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-secondary/50 py-12">
      <div className="text-center">
        <CardTitle className="text-3xl mb-2">Word lid van de community</CardTitle>
        <CardDescription className="mb-8">
          Kies het type account dat je wilt aanmaken.
        </CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link to="/registreren/klant">
            <Card className="hover:shadow-lg hover:border-primary transition-all">
              <CardHeader>
                <Briefcase className="h-12 w-12 mx-auto text-primary" />
                <CardTitle className="mt-4">Ik zoek een schoonmaker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Maak een account aan om de beste schoonmakers in jouw buurt te vinden en te boeken.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/registreren/schoonmaker">
            <Card className="hover:shadow-lg hover:border-primary transition-all">
              <CardHeader>
                <User className="h-12 w-12 mx-auto text-primary" />
                <CardTitle className="mt-4">Ik ben een schoonmaker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Meld je aan als schoonmaker, bepaal je eigen tarief en werk wanneer het jou uitkomt.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registreren;