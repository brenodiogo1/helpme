import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const mockBoekingen = [
    { id: "B101", schoonmaker: "Anna de Vries", datum: "2024-05-10", status: "Voltooid", bedrag: 55.50 },
    { id: "B103", schoonmaker: "Carla Bakker", datum: "2024-05-18", status: "Gepland", bedrag: 80.00 },
    { id: "B105", schoonmaker: "Ben Janssen", datum: "2024-04-22", status: "Voltooid", bedrag: 51.00 },
];

const CustomerBookings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Boekingen</CardTitle>
        <CardDescription>
          Bekijk hier je boekingsgeschiedenis en aankomende afspraken.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schoonmaker</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Bedrag</TableHead>
              <TableHead>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBoekingen.map((boeking) => (
              <TableRow key={boeking.id}>
                <TableCell className="font-medium">{boeking.schoonmaker}</TableCell>
                <TableCell>{boeking.datum}</TableCell>
                <TableCell>
                  <Badge variant={boeking.status === "Voltooid" ? "default" : "secondary"}>
                    {boeking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">€{boeking.bedrag.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                        {boeking.status === "Voltooid" ? "Opnieuw boeken" : "Beheren"}
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CustomerBookings;