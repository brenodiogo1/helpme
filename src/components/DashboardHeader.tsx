import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import React from "react";

interface DashboardHeaderProps {
  children: React.ReactNode; // This will be the sidebar component
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ children }) => {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-full sm:w-3/4">
          {children}
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default DashboardHeader;