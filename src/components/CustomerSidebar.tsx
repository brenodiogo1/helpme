import { Home, Calendar, User, Settings, CreditCard, MapPin, Heart, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

const CustomerSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="border-r bg-muted/40 h-full">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/account" className="flex items-center gap-2 font-semibold">
            <span className="">Mijn Account</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              to="/account"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                location.pathname === "/account" && "bg-muted text-primary"
              )}
            >
              <Home className="h-4 w-4" />
              Overzicht
            </Link>
            <Link
              to="/account/boekingen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/account/boekingen") && "bg-muted text-primary"
              )}
            >
              <Calendar className="h-4 w-4" />
              Mijn Boekingen
            </Link>
            <Link
              to="/account/profiel"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/account/profiel") && "bg-muted text-primary"
              )}
            >
              <User className="h-4 w-4" />
              Mijn Profiel
            </Link>
            <Link
              to="/account/favorieten"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/account/favorieten") && "bg-muted text-primary"
              )}
            >
              <Heart className="h-4 w-4" />
              Favoriete Schoonmakers
            </Link>
            <Link
              to="/account/betaalmethoden"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/account/betaalmethoden") && "bg-muted text-primary"
              )}
            >
              <CreditCard className="h-4 w-4" />
              Betaalmethoden
            </Link>
            <Link
              to="/account/adressen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/account/adressen") && "bg-muted text-primary"
              )}
            >
              <MapPin className="h-4 w-4" />
              Mijn Adressen
            </Link>
            <Link
              to="/account/instellingen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/account/instellingen") && "bg-muted text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
              Instellingen
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Separator className="mb-4" />
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
            <LogOut className="h-4 w-4" />
            Uitloggen
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerSidebar;