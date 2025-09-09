import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockKlanten = [
    { id: "C001", name: "Piet H.", email: "piet.h@email.com", bookings: 5, status: "Actief", avatarUrl: "https://i.pravatar.cc/150?img=7" },
    { id: "C002", name: "Janneke S.", email: "janneke.s@email.com", bookings: 2, status: "Actief", avatarUrl: "https://i.pravatar.cc/150?img=8" },
    { id: "C003", name: "Klaas de Wit", email: "klaas.w@email.com", bookings: 1, status: "Inactief", avatarUrl: "https://i.pravatar.cc/150?img=9" },
    { id: "C004", name: "Eva de Jong", email: "eva.j@email.com", bookings: 8, status: "Actief", avatarUrl: "https://i.pravatar.cc/150?img=10" },
];

const CustomersBeheren = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Klanten</CardTitle>
        <CardDescription>
          Bekijk en beheer alle klanten op het platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Aantal Boekingen</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockKlanten.map((klant) => (
              <TableRow key={klant.id}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={klant.avatarUrl} alt={klant.name} />
                            <AvatarFallback>{klant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {klant.name}
                    </div>
                </TableCell>
                <TableCell>{klant.email}</TableCell>
                <TableCell>{klant.bookings}</TableCell>
                <TableCell>
                  <Badge variant={klant.status === "Actief" ? "default" : "outline"}>
                    {klant.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CustomersBeheren;