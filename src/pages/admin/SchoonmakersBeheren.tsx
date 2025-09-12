import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Schoonmaker } from "@/types";
import { MoreHorizontal, PlusCircle, ShieldCheck, UserX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { showSuccess } from "@/utils/toast";

const mockSchoonmakers: Schoonmaker[] = [
    { id: "1", name: "Anna de Vries", photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop", ratingAvg: 4.9, ratingCount: 128, hourlyRate: 18.50, bio: "Ervaren schoonmaakster met oog voor detail.", services: ["Dieptereiniging", "Ramen wassen"], city: "Amsterdam", address: "Kerkstraat 12", postcode: "1017 GW", phoneNumber: "+31612345678" },
    { id: "2", name: "Ben Janssen", photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop", ratingAvg: 4.8, ratingCount: 92, hourlyRate: 17.00, bio: "Betrouwbaar en efficiënt, altijd een glimlach.", services: ["Reguliere schoonmaak", "Strijken"], city: "Utrecht", address: "Oudegracht 15", postcode: "3511 AC", phoneNumber: "+31623456789" },
    { id: "3", name: "Carla Bakker", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop", ratingAvg: 5.0, ratingCount: 210, hourlyRate: 20.00, bio: "Perfectie is mijn standaard, uw huis is in goede handen.", services: ["Na verbouwing", "Grote schoonmaak"], city: "Rotterdam", address: "Coolsingel 1", postcode: "3011 AA", phoneNumber: "+31634567890" },
    { id: "4", name: "Dirk van Dijk", photoUrl: "https://i.pravatar.cc/150?img=68", ratingAvg: 4.5, ratingCount: 55, hourlyRate: 16.00, bio: "Flexibel en grondig, voor een fris en schoon huis.", services: ["Milieuvriendelijk", "Huisdier-vriendelijk"], city: "Den Haag", address: "Spui 20", postcode: "2511 BC", phoneNumber: "+31645678901" },
    { id: "5", name: "Eva de Jong", photoUrl: "https://i.pravatar.cc/150?img=69", ratingAvg: 4.7, ratingCount: 78, hourlyRate: 19.00, bio: "Uw tevredenheid is mijn prioriteit, ik werk snel en netjes.", services: ["Ovenreiniging", "Organiseren"], city: "Eindhoven", address: "Stationsplein 1", postcode: "5611 AC", phoneNumber: "+31656789012" },
];

const SchoonmakersBeheren = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Schoonmakers</CardTitle>
          <CardDescription>
            Beheer de schoonmakers op het platform.
          </CardDescription>
        </div>
        <Button asChild>
          <Link to="/admin/schoonmakers/nieuw">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nieuwe Toevoegen
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Stad</TableHead>
              <TableHead>Uurtarief</TableHead>
              <TableHead>Beoordeling</TableHead>
              <TableHead>
                <span className="sr-only">Acties</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSchoonmakers.map((schoonmaker) => (
              <TableRow key={schoonmaker.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={schoonmaker.photoUrl} alt={schoonmaker.name} />
                      <AvatarFallback>{schoonmaker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {schoonmaker.name}
                  </div>
                </TableCell>
                <TableCell>{schoonmaker.city}</TableCell>
                <TableCell>€{schoonmaker.hourlyRate.toFixed(2)}</TableCell>
                <TableCell>{schoonmaker.ratingAvg.toFixed(1)} ({schoonmaker.ratingCount})</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acties</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/schoonmakers/bewerken/${schoonmaker.id}`}>Bewerken</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => showSuccess(`${schoonmaker.name} geverifieerd!`)}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Verifiëren
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => showSuccess(`${schoonmaker.name} geschorst.`)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Schorsen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SchoonmakersBeheren;