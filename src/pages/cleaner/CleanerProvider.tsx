import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const CleanerProvider = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchCleanerData(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw providerinformatie te beheren.");
      navigate('/login', { state: { from: '/dashboard/provedor' } });
    }
  }, [isAuthLoading, user, navigate]);

  const fetchCleanerData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('name')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      // setCleanerName(data?.name || null); // Removed setting cleanerName as it's not used
    } catch (err: any) {
      showError(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Provider</CardTitle></CardHeader>
        <CardContent><p>Laden van providerinformatie...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Provider</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Provider</CardTitle>
        <CardDescription>
          Beheer de informatie en instellingen met betrekking tot uw serviceprovider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Deze sectie is gewijd aan het beheer van uw profiel als serviceprovider.
          Hier kunt u de diensten die u aanbiedt toevoegen en beheren,
          uw werkgebied en andere relevante informatie voor klanten configureren.
        </p>
        <Button asChild>
          <Link to="/dashboard/profiel">
            <PlusCircle className="mr-2 h-4 w-4" />
            Update Providerprofiel
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CleanerProvider;