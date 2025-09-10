import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Schoonmaker } from "@/types";
import { MoreHorizontal, PlusCircle, ShieldCheck, UserX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SchoonmakersBeheren = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [schoonmakers, setSchoonmakers] = useState<Schoonmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.email !== "admin@helpme.com") {
        showError("U heeft geen toegang tot deze pagina.");
        navigate('/');
        return;
      }
      fetchSchoonmakers();
    } else if (!isAuthLoading && !user) {
      showError("U moet ingelogd zijn om schoonmakers te beheren.");
      navigate('/login');
    }
  }, [isAuthLoading, user, navigate]);

  const fetchSchoonmakers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);

      setSchoonmakers(data as Schoonmaker[]);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCleaner = async (cleanerName: string) => { // Removed cleanerId
    const toastId = showLoading(`${cleanerName} verifiëren...`);
    try {
      // In a real app, this would update a 'is_verified' column in the cleaners table
      // For now, we'll just simulate success.
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      dismissToast(toastId);
      showSuccess(`${cleanerName} succesvol geverifieerd! (Simulatie)`);
      // Optionally refresh the list if verification status is displayed
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message || "Fout bij het verifiëren van de schoonmaker.");
    }
  };

  const handleSuspendCleaner = async (cleanerName: string) => { // Removed cleanerId
    const toastId = showLoading(`${cleanerName} schorsen...`);
    try {
      // In a real app, this would update a 'is_suspended' column or similar
      // For now, we'll just simulate success.
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      dismissToast(toastId);
      showSuccess(`${cleanerName} succesvol geschorst! (Simulatie)`);
      // Optionally refresh the list if suspension status is displayed
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message || "Fout bij het schorsen van de schoonmaker.");
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Schoonmakers</CardTitle></CardHeader>
        <CardContent><p>Laden van schoonmakers...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Schoonmakers</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Schoonmakers</CardTitle>
          <CardDescription>
            Beheer de schoonmakers op het platform.
          </CardDescription>
        </div>
        <Button asChild>
          <Link to="/admin/schoonmakers/nieuw">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nieuwe Toevoegen
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Stad</TableHead>
              <TableHead>Uurtarief</TableHead>
              <TableHead>Beoordeling</TableHead>
              <TableHead>
                <span className="sr-only">Acties</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoonmakers.map((schoonmaker) => (
              <TableRow key={schoonmaker.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={schoonmaker.photoUrl} alt={schoonmaker.name} />
                      <AvatarFallback>{schoonmaker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {schoonmaker.name}
                  </div>
                </TableCell>
                <TableCell>{schoonmaker.city}</TableCell>
                <TableCell>€{schoonmaker.hourlyRate.toFixed(2)}</TableCell>
                <TableCell>{schoonmaker.ratingAvg.toFixed(1)} ({schoonmaker.ratingCount})</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acties</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/schoonmakers/bewerken/${schoonmaker.id}`}>Bewerken</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVerifyCleaner(schoonmaker.name)}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Verifiëren
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleSuspendCleaner(schoonmaker.name)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Schorsen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SchoonmakersBeheren;