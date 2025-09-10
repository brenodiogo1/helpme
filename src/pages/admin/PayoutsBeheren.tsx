import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess } from "@/utils/toast";

const mockPayouts = [
    { id: "1", name: "Anna de Vries", iban: "NL20INGB0001234567", amount: 185.50 },
    { id: "2", name: "Ben Janssen", iban: "NL25ABNA0009876543", amount: 210.00 },
    { id: "3", name: "Carla Bakker", iban: "NL30RABO0005432109", amount: 175.00 },
];

const PayoutsBeheren = () => {
  const handlePayout = (name: string) => {
    showSuccess(`Betaling voor ${name} succesvol verwerkt! (Simulatie)`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uitbetalingen</CardTitle>
        <CardDescription>
          Beheer en verwerk de uitbetalingen aan schoonmakers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schoonmaker</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead className="text-right">Te Betalen Bedrag</TableHead>
              <TableHead className="text-right">Actie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell className="font-medium">{payout.name}</TableCell>
                <TableCell>{payout.iban}</TableCell>
                <TableCell className="text-right">€{payout.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                    <Button size="sm" onClick={() => handlePayout(payout.name)}>Verwerk Betaling</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PayoutsBeheren;