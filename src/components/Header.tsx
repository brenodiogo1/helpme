import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ClipboardList, Briefcase, LogIn, UserPlus, User as UserIcon, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/UserContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useUser();

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case 'admin': return '/admin';
      case 'cleaner': return '/dashboard';
      case 'customer': return '/account';
      default: return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center">
            <img src="/logo.png" alt="HelpMe Logo" className="h-16" />
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link to="/#hoe-het-werkt">{t("header.howItWorks")}</Link>
            <Link to="/voor-schoonmakers">{t("header.forCleaners")}</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="flex items-center gap-2">
                     <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Uitloggen</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Inloggen</Link>
                </Button>
                <Button asChild>
                  <Link to="/registreren">Aanmelden</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-3/4">
                <nav className="flex h-full flex-col p-6">
                  <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
                    <img src="/logo.png" alt="HelpMe Logo" className="h-16" />
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
                    {user ? (
                       <div className="flex flex-col gap-4">
                         <Button asChild size="lg">
                            <Link to={getDashboardLink()}>
                                <UserIcon className="mr-2 h-5 w-5" />
                                Mijn Dashboard
                            </Link>
                        </Button>
                         <Button variant="outline" size="lg" onClick={logout}>
                            <LogOut className="mr-2 h-5 w-5" />
                            Uitloggen
                        </Button>
                       </div>
                    ) : (
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
                    )}
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