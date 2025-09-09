import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const mockBoekingen = [
    { id: "B101", klant: "Piet H.", datum: "2024-05-10", tijd: "10:00", duur: 3, status: "Voltooid", adres: "Kerkstraat 12, Amsterdam" },
    { id: "B102", klant: "Janneke S.", datum: "2024-05-12", tijd: "14:00", duur: 2, status: "Voltooid", adres: "Plein 4, Utrecht" },
    { id: "B103", klant: "Eva de Jong", datum: "2024-05-18", tijd: "09:00", duur: 4, status: "Gepland", adres: "Laan van Meerdervoort 50, Den Haag" },
    { id: "B104", klant: "Henk Groot", datum: "2024-05-20", tijd: "13:00", duur: 3, status: "Gepland", adres: "Coolsingel 1, Rotterdam" },
    { id: "B105", klant: "Klaas de Wit", datum: "2024-05-15", tijd: "11:00", duur: 2.5, status: "Geannuleerd", adres: "Grote Markt 22, Groningen" },
];

const MijnBoekingen = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Boekingen</CardTitle>
        <CardDescription>
          Bekijk en beheer hier je geplande en voltooide boekingen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Klant</TableHead>
              <TableHead>Datum & Tijd</TableHead>
              <TableHead>Adres</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBoekingen.map((boeking) => (
              <TableRow key={boeking.id}>
                <TableCell className="font-medium">{boeking.klant}</TableCell>
                <TableCell>{boeking.datum} om {boeking.tijd}</TableCell>
                <TableCell>{boeking.adres}</TableCell>
                <TableCell>
                  <Badge variant={
                    boeking.status === "Voltooid" ? "default" : 
                    boeking.status === "Geannuleerd" ? "destructive" : "secondary"
                  }>
                    {boeking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                    <Button variant="outline" size="sm">Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MijnBoekingen;