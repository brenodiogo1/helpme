import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container flex items-center justify-center py-20 text-center">
      <div>
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="mt-4 text-2xl font-semibold text-foreground">
          Oeps! Pagina niet gevonden
        </p>
        <p className="mt-2 text-muted-foreground">
          Sorry, de pagina die je zoekt bestaat niet.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Terug naar Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;