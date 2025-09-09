import { Home, Calendar, User, Settings, Wallet, Star, CalendarDays } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const CleanerSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="">Mijn Dashboard</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                location.pathname === "/dashboard" && "bg-muted text-primary"
              )}
            >
              <Home className="h-4 w-4" />
              Overzicht
            </Link>
            <Link
              to="/dashboard/boekingen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/dashboard/boekingen") && "bg-muted text-primary"
              )}
            >
              <Calendar className="h-4 w-4" />
              Mijn Boekingen
            </Link>
            <Link
              to="/dashboard/beschikbaarheid"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/dashboard/beschikbaarheid") && "bg-muted text-primary"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Beschikbaarheid
            </Link>
            <Link
              to="/dashboard/inkomsten"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/dashboard/inkomsten") && "bg-muted text-primary"
              )}
            >
              <Wallet className="h-4 w-4" />
              Inkomsten
            </Link>
            <Link
              to="/dashboard/profiel"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/dashboard/profiel") && "bg-muted text-primary"
              )}
            >
              <User className="h-4 w-4" />
              Mijn Profiel
            </Link>
            <Link
              to="/dashboard/abonnement"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/dashboard/abonnement") && "bg-muted text-primary"
              )}
            >
              <Star className="h-4 w-4" />
              Pro Abonnement
            </Link>
            <Link
              to="/dashboard/instellingen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/dashboard/instellingen") && "bg-muted text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
              Instellingen
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CleanerSidebar;