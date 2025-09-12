import { Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Schoonmaker } from "@/types";
import { Badge } from "./ui/badge";
import { Link, useNavigate } from "react-router-dom"; // Removed useSearchParams
import { useState } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
// Removed import { format } from "date-fns"; 

interface SchoonmakerCardProps {
  schoonmaker: Schoonmaker;
  selectedDate?: Date; // Added optional selectedDate prop
  selectedTime?: string; // Added optional selectedTime prop
}

const SchoonmakerCard: React.FC<SchoonmakerCardProps> = ({ schoonmaker, selectedDate, selectedTime }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth(); // Get session from AuthContext

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showSuccess(isFavorite ? `${schoonmaker.name} verwijderd van favorieten.` : `${schoonmaker.name} toegevoegd aan favorieten.`);
  };

  const handleBookNowClick = () => {
    if (!session) {
      showError("Você precisa estar logado para agendar uma limpeza.");
      navigate("/login");
    } else if (selectedDate && selectedTime) {
      navigate(`/boeken/${schoonmaker.id}`, { state: { date: selectedDate.toISOString(), time: selectedTime } });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={schoonmaker.photoUrl} alt={schoonmaker.name} />
          <AvatarFallback>{schoonmaker.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h3 className="text-xl font-bold">{schoonmaker.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{schoonmaker.ratingAvg?.toFixed(1) || 'N/A'}</span>
            <span>({schoonmaker.ratingCount || 0} reviews)</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFavorite}>
          <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{schoonmaker.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
            {schoonmaker.services?.slice(0, 3).map(service => (
                <Badge key={service} variant="secondary">{service}</Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-bold">
          €{schoonmaker.hourlyRate?.toFixed(2) || '0.00'}
          <span className="text-sm font-normal text-muted-foreground"> / uur</span>
        </div>
        {selectedDate && selectedTime ? (
          <Button onClick={handleBookNowClick}>
            Boek nu
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to={`/schoonmaker/${schoonmaker.id}`}>Bekijk profiel</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SchoonmakerCard;