import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockSubscriptions = [
    { id: "S001", user: "Anna de Vries", plan: "Schoonmaker Pro", status: "Actief", nextBilling: "2024-06-10" },
    { id: "S002", user: "Carla Bakker", plan: "Schoonmaker Pro", status: "Actief", nextBilling: "2024-06-15" },
    { id: "S003", user: "Gerda van Dijk", plan: "Schoonmaker Pro", status: "Geannuleerd", nextBilling: "-" },
];

const SubscriptionsBeheren = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Abonnementen</CardTitle>
        <CardDescription>
          Bekijk en beheer alle actieve abonnementen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gebruiker</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Volgende Factuur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.user}</TableCell>
                <TableCell>{sub.plan}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === "Actief" ? "secondary" : "destructive"}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>{sub.nextBilling}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsBeheren;