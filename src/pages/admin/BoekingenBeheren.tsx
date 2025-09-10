import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const mockBoekingen = [
    { id: "B001", klant: "Piet H.", schoonmaker: "Anna de Vries", datum: "2024-05-10", status: "Voltooid", bedrag: 55.50 },
    { id: "B002", klant: "Janneke S.", schoonmaker: "Anna de Vries", datum: "2024-05-12", status: "Voltooid", bedrag: 74.00 },
    { id: "B003", klant: "Klaas de Wit", schoonmaker: "Ben Janssen", datum: "2024-05-15", status: "Geannuleerd", bedrag: 51.00 },
    { id: "B004", klant: "Eva de Jong", schoonmaker: "Carla Bakker", datum: "2024-05-18", status: "Gepland", bedrag: 100.00 },
    { id: "B005", klant: "Henk Groot", schoonmaker: "Anna de Vries", datum: "2024-05-20", status: "Gepland", bedrag: 55.50 },
];

const mockSchoonmakers = ["Anna de Vries", "Ben Janssen", "Carla Bakker"];
const mockKlanten = ["Piet H.", "Janneke S.", "Klaas de Wit", "Eva de Jong"];

const BoekingenBeheren = () => {
  const [isChangeCleanerDialogOpen, setIsChangeCleanerDialogOpen] = useState(false);
  const [isManualOrderDialogOpen, setIsManualOrderDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const handleOpenDialog = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsChangeCleanerDialogOpen(true);
  };

  const handleChangeCleaner = () => {
    showSuccess("Schoonmaker succesvol gewijzigd! (Simulatie)");
    setIsChangeCleanerDialogOpen(false);
  };

  const handleManualOrder = () => {
    showSuccess("Nieuwe boeking succesvol aangemaakt! (Simulatie)");
    setIsManualOrderDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Boekingen</CardTitle>
            <CardDescription>
              Bekijk en beheer alle boekingen.
            </CardDescription>
          </div>
          <Dialog open={isManualOrderDialogOpen} onOpenChange={setIsManualOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nieuwe Boeking
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Handmatige Boeking Aanmaken</DialogTitle>
                <DialogDescription>
                  Maak hier een nieuwe boeking aan voor een klant.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="klant" className="text-right">Klant</Label>
                  <Select>
                    <SelectTrigger id="klant" className="col-span-3">
                      <SelectValue placeholder="Selecteer een klant" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockKlanten.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="schoonmaker" className="text-right">Schoonmaker</Label>
                  <Select>
                    <SelectTrigger id="schoonmaker" className="col-span-3">
                      <SelectValue placeholder="Selecteer een schoonmaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSchoonmakers.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="datum" className="text-right">Datum</Label>
                  <Input id="datum" type="date" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsManualOrderDialogOpen(false)}>Annuleren</Button>
                <Button onClick={handleManualOrder}>Boeking Aanmaken</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boeking ID</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Schoonmaker</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead><span className="sr-only">Acties</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBoekingen.map((boeking) => (
                <TableRow key={boeking.id}>
                  <TableCell className="font-medium">{boeking.id}</TableCell>
                  <TableCell>{boeking.klant}</TableCell>
                  <TableCell>{boeking.schoonmaker}</TableCell>
                  <TableCell>{boeking.datum}</TableCell>
                  <TableCell>
                    <Badge variant={
                      boeking.status === "Voltooid" ? "default" : 
                      boeking.status === "Geannuleerd" ? "destructive" : "secondary"
                    }>
                      {boeking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">€{boeking.bedrag.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenDialog(boeking.id)}>
                          Schoonmaker wijzigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showSuccess(`Boeking ${boeking.id} geannuleerd.`)}>
                          Annuleren
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

      <Dialog open={isChangeCleanerDialogOpen} onOpenChange={setIsChangeCleanerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schoonmaker Wijzigen</DialogTitle>
            <DialogDescription>
              Wijs een nieuwe schoonmaker toe aan boeking #{selectedBookingId}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Kies een nieuwe schoonmaker" />
              </SelectTrigger>
              <SelectContent>
                {mockSchoonmakers.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeCleanerDialogOpen(false)}>Annuleren</Button>
            <Button onClick={handleChangeCleaner}>Opslaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BoekingenBeheren;