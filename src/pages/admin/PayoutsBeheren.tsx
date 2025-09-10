import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface PayoutRequest {
    id: string;
    cleaner_id: string;
    cleaner_name: string;
    iban: string;
    amount: number;
    status: 'pending' | 'processed';
}

const PayoutsBeheren = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.email !== "admin@helpme.com") {
        showError("U heeft geen toegang tot deze pagina.");
        navigate('/');
        return;
      }
      fetchPayoutRequests();
    } else if (!isAuthLoading && !user) {
      showError("U moet ingelogd zijn om uitbetalingen te beheren.");
      navigate('/login');
    }
  }, [isAuthLoading, user, navigate]);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, you'd have a 'payout_requests' table.
      // For now, we'll simulate by finding cleaners with pending earnings.
      // This is a simplified mock.
      const { data: cleanersData, error: cleanersError } = await supabase
        .from('cleaners')
        .select('id, name, iban, account_holder_name');

      if (cleanersError) throw new Error(cleanersError.message);

      const requests: PayoutRequest[] = [];
      for (const cleaner of cleanersData) {
        // Simulate pending earnings
        const { data: completedBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('total_price')
          .eq('cleaner_id', cleaner.id)
          .eq('status', 'completed')
          .is('payout_processed', null); // Assuming a 'payout_processed' flag

        if (bookingsError) console.error("Error fetching cleaner bookings for payout:", bookingsError.message);

        const pendingAmount = completedBookings?.reduce((sum, booking) => sum + booking.total_price, 0) || 0;

        if (pendingAmount > 0 && cleaner.iban && cleaner.account_holder_name) {
          requests.push({
            id: `payout-${cleaner.id}-${Date.now()}`, // Unique ID for this mock request
            cleaner_id: cleaner.id,
            cleaner_name: cleaner.name,
            iban: cleaner.iban,
            amount: pendingAmount,
            status: 'pending',
          });
        }
      }
      setPayoutRequests(requests);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async (payoutRequest: PayoutRequest) => {
    const toastId = showLoading(`Betaling voor ${payoutRequest.cleaner_name} verwerken...`);
    try {
      // Simulate processing the payout
      // In a real app, this would involve:
      // 1. Initiating a bank transfer via a payment provider.
      // 2. Updating the status of the relevant bookings to 'payout_processed = true'.
      // 3. Recording the payout in a 'payouts_history' table.

      // For simulation, we'll just mark the bookings as processed
      const { error: updateBookingsError } = await supabase
        .from('bookings')
        .update({ payout_processed: true, updated_at: new Date().toISOString() })
        .eq('cleaner_id', payoutRequest.cleaner_id)
        .eq('status', 'completed')
        .is('payout_processed', null);

      if (updateBookingsError) throw new Error(updateBookingsError.message);

      dismissToast(toastId);
      showSuccess(`Betaling voor ${payoutRequest.cleaner_name} succesvol verwerkt!`);
      fetchPayoutRequests(); // Refresh the list
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Uitbetalingen</CardTitle></CardHeader>
        <CardContent><p>Laden van uitbetalingsverzoeken...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Uitbetalingen</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

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
            {payoutRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Geen openstaande uitbetalingsverzoeken.</TableCell>
              </TableRow>
            ) : (
              payoutRequests.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.cleaner_name}</TableCell>
                  <TableCell>{payout.iban}</TableCell>
                  <TableCell className="text-right">€{payout.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                      <Button size="sm" onClick={() => handlePayout(payout)} disabled={payout.status === 'processed'}>
                        {payout.status === 'processed' ? 'Verwerkt' : 'Verwerk Betaling'}
                      </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PayoutsBeheren;