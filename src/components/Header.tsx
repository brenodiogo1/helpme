import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">CleanNL</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/#hoe-het-werkt">{t('header.howItWorks')}</Link>
            <Link to="/voor-schoonmakers">{t('header.forCleaners')}</Link>
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
                  <Link to="/#hoe-het-werkt">{t('header.howItWorks')}</Link>
                  <Link to="/voor-schoonmakers">{t('header.forCleaners')}</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <nav className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/inloggen">{t('header.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/registreren">{t('header.register')}</Link>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;