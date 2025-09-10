import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ClipboardList, Briefcase, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Separator } from "@/components/ui/separator";

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        {/* Left side: Logo and Desktop Nav */}
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center">
            <img src="/logo.png" alt="HelpMe Logo" className="h-16" />
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link to="/#hoe-het-werkt">{t("header.howItWorks")}</Link>
            <Link to="/voor-schoonmakers">{t("header.forCleaners")}</Link>
          </nav>
        </div>

        {/* Right side: Auth buttons and Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Desktop Auth */}
          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link to="/login">Inloggen</Link>
            </Button>
            <Button asChild>
              <Link to="/registreren">Aanmelden</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-3/4">
                <nav className="flex h-full flex-col p-6">
                  <Link
                    to="/"
                    className="mb-8 flex items-center gap-2 text-lg font-semibold"
                  >
                    <img
                      src="/logo.png"
                      alt="HelpMe Logo"
                      className="h-16"
                    />
                  </Link>
                  <div className="flex flex-col gap-6 text-xl">
                    <Link to="/#hoe-het-werkt" className="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                      <ClipboardList className="h-6 w-6" />
                      {t("header.howItWorks")}
                    </Link>
                    <Link to="/voor-schoonmakers" className="flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                      <Briefcase className="h-6 w-6" />
                      {t("header.forCleaners")}
                    </Link>
                  </div>

                  <div className="mt-auto">
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" asChild size="lg">
                            <Link to="/login">
                                <LogIn className="mr-2 h-5 w-5" />
                                Inloggen
                            </Link>
                        </Button>
                        <Button asChild size="lg">
                            <Link to="/registreren">
                                <UserPlus className="mr-2 h-5 w-5" />
                                Aanmelden
                            </Link>
                        </Button>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <LanguageSwitcher />
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;