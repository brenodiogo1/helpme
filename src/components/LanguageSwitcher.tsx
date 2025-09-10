import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const languages = [
  { code: 'nl', name: 'Nederlands', emoji: '🇳🇱' },
  { code: 'en', name: 'English', emoji: '🇬🇧' },
  { code: 'es', name: 'Español', emoji: '🇪🇸' },
  { code: 'pt', name: 'Português', emoji: '🇵🇹' },
  { code: 'pl', name: 'Polski', emoji: '🇵🇱' },
  { code: 'hi', name: 'हिन्दी', emoji: '🇮🇳' },
  { code: 'it', name: 'Italiano', emoji: '🇮🇹' },
  { code: 'fr', name: 'Français', emoji: '🇫🇷' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => changeLanguage(lang.code)}>
            <span className="mr-2">{lang.emoji}</span> {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;