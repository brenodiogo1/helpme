import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "react-router-dom";

const SchoonmakerForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const title = isEditing ? "Schoonmaker Bewerken" : "Nieuwe Schoonmaker Toevoegen";
  const description = isEditing
    ? "Bewerk de gegevens van de schoonmaker hieronder."
    : "Voer de gegevens van de nieuwe schoonmaker hieronder in.";
  const buttonText = isEditing ? "Wijzigingen Opslaan" : "Schoonmaker Toevoegen";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Naam</Label>
              <Input id="name" placeholder="Anna de Vries" defaultValue={isEditing ? "Anna de Vries" : ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Stad</Label>
              <Input id="city" placeholder="Amsterdam" defaultValue={isEditing ? "Amsterdam" : ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hourlyRate">Uurtarief (€)</Label>
              <Input id="hourlyRate" type="number" placeholder="18.50" defaultValue={isEditing ? "18.50" : ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="photoUrl">Foto URL</Label>
              <Input id="photoUrl" placeholder="https://..." defaultValue={isEditing ? "https://images.unsplash.com/photo-1580489944761-15a19d654956" : ""} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Biografie</Label>
            <Textarea id="bio" placeholder="Schrijf een korte biografie..." defaultValue={isEditing ? "Met 5 jaar ervaring zorg ik voor een brandschoon huis." : ""} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link to="/admin/schoonmakers">Annuleren</Link>
            </Button>
            <Button type="submit">{buttonText}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SchoonmakerForm;