import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Calendar, TrendingUp } from "lucide-react";

const mockPayouts = [
    { id: "P001", date: "2024-05-15", amount: 185.50, status: "Betaald" },
    { id: "P002", date: "2024-05-08", amount: 210.00, status: "Betaald" },
    { id: "P003", date: "2024-05-01", amount: 175.00, status: "Betaald" },
];

const CleanerEarnings = () => {
  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Totaal Verdiend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€4,521.50</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deze Maand</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€570.50</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Volgende Uitbetaling</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€120.00</div>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Uitbetalingsgeschiedenis</CardTitle>
                <CardDescription>Overzicht van je recente uitbetalingen.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Datum</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Bedrag</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockPayouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell>{payout.date}</TableCell>
                                <TableCell>{payout.status}</TableCell>
                                <TableCell className="text-right">€{payout.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
};

export default CleanerEarnings;