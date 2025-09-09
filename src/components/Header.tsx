import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">CleanNL</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/#hoe-het-werkt">Hoe het werkt</Link>
            <Link to="/voor-schoonmakers">Voor schoonmakers</Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span>CleanNL</span>
                  </Link>
                  <Link to="/#hoe-het-werkt">Hoe het werkt</Link>
                  <Link to="/voor-schoonmakers">Voor schoonmakers</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/inloggen">Inloggen</Link>
            </Button>
            <Button asChild>
              <Link to="/registreren">Registreren</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;