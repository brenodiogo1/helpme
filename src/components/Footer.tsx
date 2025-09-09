import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-2">CleanNL</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/over-ons">Over ons</Link></li>
              <li><Link to="/pers">Pers</Link></li>
              <li><Link to="/carriere">Carrière</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Klanten</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/#hoe-het-werkt">Hoe het werkt</Link></li>
              <li><Link to="/prijzen">Prijzen</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Schoonmakers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/voor-schoonmakers">Word schoonmaker</Link></li>
              <li><Link to="/schoonmaker-faq">FAQ voor schoonmakers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Wettelijk</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/algemene-voorwaarden">Algemene voorwaarden</Link></li>
              <li><Link to="/privacybeleid">Privacybeleid</Link></li>
              <li><Link to="/cookiebeleid">Cookiebeleid</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>© {new Date().getFullYear()} CleanNL. Alle rechten voorbehouden.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;