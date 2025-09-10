import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Subscription {
    id: string;
    user_name: string;
    plan: string;
    status: 'active' | 'cancelled' | 'trialing';
    next_billing_date: string | null;
}

const SubscriptionsBeheren = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.email !== "admin@helpme.com") {
        showError("U heeft geen toegang tot deze pagina.");
        navigate('/');
        return;
      }
      fetchSubscriptions();
    } else if (!isAuthLoading && !user) {
      showError("U moet ingelogd zijn om abonnementen te beheren.");
      navigate('/login');
    }
  }, [isAuthLoading, user, navigate]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, you'd have a 'subscriptions' table linked to cleaners/users
      // For now, we'll simulate by finding cleaners who are 'Pro' (mocked)
      const { data: cleanersData, error: cleanersError } = await supabase
        .from('cleaners')
        .select('id, name, is_pro_subscriber, subscription_end_date'); // Assuming these columns exist

      if (cleanersError) throw new Error(cleanersError.message);

      const subs: Subscription[] = cleanersData.map(cleaner => ({
        id: `sub-${cleaner.id}`,
        user_name: cleaner.name,
        plan: cleaner.is_pro_subscriber ? "Schoonmaker Pro" : "Gratis",
        status: cleaner.is_pro_subscriber ? 'active' : 'cancelled',
        next_billing_date: cleaner.is_pro_subscriber && cleaner.subscription_end_date
          ? new Date(cleaner.subscription_end_date).toLocaleDateString('nl-NL')
          : '-',
      }));
      setSubscriptions(subs);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'trialing':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Abonnementen</CardTitle></CardHeader>
        <CardContent><p>Laden van abonnementen...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Abonnementen</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

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
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Geen abonnementen gevonden.</TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.user_name}</TableCell>
                  <TableCell>{sub.plan}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(sub.status)}>
                      {sub.status === 'active' ? 'Actief' :
                       sub.status === 'cancelled' ? 'Geannuleerd' :
                       sub.status === 'trialing' ? 'Proefperiode' : 'Onbekend'}
                    </Badge>
                  </TableCell>
                  <TableCell>{sub.next_billing_date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsBeheren;