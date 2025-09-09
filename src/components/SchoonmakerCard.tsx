import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Schoonmaker } from "@/types";
import { Badge } from "./ui/badge";

interface SchoonmakerCardProps {
  schoonmaker: Schoonmaker;
}

const SchoonmakerCard: React.FC<SchoonmakerCardProps> = ({ schoonmaker }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={schoonmaker.photoUrl} alt={schoonmaker.name} />
          <AvatarFallback>{schoonmaker.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold">{schoonmaker.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{schoonmaker.ratingAvg.toFixed(1)}</span>
            <span>({schoonmaker.ratingCount} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{schoonmaker.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
            {schoonmaker.services.slice(0, 3).map(service => (
                <Badge key={service} variant="secondary">{service}</Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-bold">
          €{schoonmaker.hourlyRate.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground"> / uur</span>
        </div>
        <Button>Bekijk profiel</Button>
      </CardFooter>
    </Card>
  );
};

export default SchoonmakerCard;