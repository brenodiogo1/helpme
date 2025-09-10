import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { format, subWeeks, isAfter } from "date-fns";

interface Payout {
    id: string;
    date: string;
    amount: number;
    status: string;
}

const CleanerEarnings = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState<number>(0);
  const [nextPayoutAmount, setNextPayoutAmount] = useState<number>(0);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchEarningsData(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw inkomsten te bekijken.");
    }
  }, [isAuthLoading, user]);

  const fetchEarningsData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: cleanerData, error: cleanerError } = await supabase
        .from('cleaners')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (cleanerError || !cleanerData) {
        throw new Error(cleanerError?.message || "Geen schoonmakerprofiel gevonden voor deze gebruiker.");
      }

      const cleanerId = cleanerData.id;

      // Fetch all completed bookings for this cleaner
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_price, created_at, updated_at')
        .eq('cleaner_id', cleanerId)
        .eq('status', 'completed');

      if (bookingsError) {
        throw new Error(bookingsError.message);
      }

      let total = 0;
      let monthEarnings = 0;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      bookingsData.forEach(booking => {
        total += booking.total_price;
        if (isAfter(new Date(booking.updated_at), startOfMonth)) {
          monthEarnings += booking.total_price;
        }
      });

      setTotalEarned(total);
      setThisMonthEarnings(monthEarnings);

      // Mock next payout and payout history for now
      setNextPayoutAmount(120.00); // This would be calculated based on pending earnings
      setPayouts([
        { id: "P001", date: format(subWeeks(now, 1), "yyyy-MM-dd"), amount: 185.50, status: "Betaald" },
        { id: "P002", date: format(subWeeks(now, 2), "yyyy-MM-dd"), amount: 210.00, status: "Betaald" },
        { id: "P003", date: format(subWeeks(now, 3), "yyyy-MM-dd"), amount: 175.00, status: "Betaald" },
      ]);

    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Inkomsten</CardTitle></CardHeader>
        <CardContent><p>Laden van inkomsten...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Inkomsten</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Totaal Verdiend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€{totalEarned.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deze Maand</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€{thisMonthEarnings.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Volgende Uitbetaling</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€{nextPayoutAmount.toFixed(2)}</div>
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
                        {payouts.map((payout) => (
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