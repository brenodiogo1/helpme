import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Customer {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    bookings_count: number;
    status: string; // e.g., 'Actief', 'Inactief'
}

const CustomersBeheren = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.email !== "admin@helpme.com") {
        showError("U heeft geen toegang tot deze pagina.");
        navigate('/');
        return;
      }
      fetchCustomers();
    } else if (!isAuthLoading && !user) {
      showError("U moet ingelogd zijn om klanten te beheren.");
      navigate('/login');
    }
  }, [isAuthLoading, user, navigate]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          auth_users:auth.users (email, created_at)
        `);

      if (profilesError) throw new Error(profilesError.message);

      const customerData: Customer[] = await Promise.all(profiles.map(async (profile: any) => {
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', profile.id);

        if (bookingsError) console.error("Error fetching bookings count:", bookingsError.message);

        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.auth_users?.email || 'N/A',
          avatar_url: profile.avatar_url,
          bookings_count: bookingsCount || 0,
          status: (profile.auth_users?.created_at && (new Date().getTime() - new Date(profile.auth_users.created_at).getTime() < 30 * 24 * 60 * 60 * 1000)) ? 'Actief' : 'Inactief', // Simplified status logic
        };
      }));

      setCustomers(customerData);
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
        <CardHeader><CardTitle>Klanten</CardTitle></CardHeader>
        <CardContent><p>Laden van klanten...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Klanten</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

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
            {customers.map((klant) => (
              <TableRow key={klant.id}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={klant.avatar_url} alt={`${klant.first_name} ${klant.last_name}`} />
                            <AvatarFallback>{klant.first_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {`${klant.first_name} ${klant.last_name}`}
                    </div>
                </TableCell>
                <TableCell>{klant.email}</TableCell>
                <TableCell>{klant.bookings_count}</TableCell>
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