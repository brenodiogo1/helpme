import { Bell, Home, Users, CalendarCheck, FileText, Settings, Gem } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="border-r bg-muted/40 h-full">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <Gem className="h-6 w-6" />
            <span className="">Admin Panel</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                location.pathname === "/admin" && "bg-muted text-primary"
              )}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/admin/boekingen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/admin/boekingen") && "bg-muted text-primary"
              )}
            >
              <CalendarCheck className="h-4 w-4" />
              Boekingen
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                6
              </Badge>
            </Link>
            <Link
              to="/admin/schoonmakers"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/admin/schoonmakers") && "bg-muted text-primary"
              )}
            >
              <Users className="h-4 w-4" />
              Schoonmakers
            </Link>
            <Link
              to="/admin/klanten"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/admin/klanten") && "bg-muted text-primary"
              )}
            >
              <Users className="h-4 w-4" />
              Klanten
            </Link>
            <Link
              to="/admin/abonnementen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/admin/abonnementen") && "bg-muted text-primary"
              )}
            >
              <FileText className="h-4 w-4" />
              Abonnementen
            </Link>
            <Link
              to="/admin/instellingen"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive("/admin/instellingen") && "bg-muted text-primary"
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

export default AdminSidebar;