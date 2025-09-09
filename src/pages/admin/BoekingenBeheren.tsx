import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockBoekingen = [
    { id: "B001", klant: "Piet H.", schoonmaker: "Anna de Vries", datum: "2024-05-10", status: "Voltooid", bedrag: 55.50 },
    { id: "B002", klant: "Janneke S.", schoonmaker: "Anna de Vries", datum: "2024-05-12", status: "Voltooid", bedrag: 74.00 },
    { id: "B003", klant: "Klaas de Wit", schoonmaker: "Ben Janssen", datum: "2024-05-15", status: "Geannuleerd", bedrag: 51.00 },
    { id: "B004", klant: "Eva de Jong", schoonmaker: "Carla Bakker", datum: "2024-05-18", status: "Gepland", bedrag: 100.00 },
    { id: "B005", klant: "Henk Groot", schoonmaker: "Anna de Vries", datum: "2024-05-20", status: "Gepland", bedrag: 55.50 },
];

const BoekingenBeheren = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Boekingen</CardTitle>
        <CardDescription>
          Bekijk en beheer alle boekingen.
        </CardDescription>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BoekingenBeheren;