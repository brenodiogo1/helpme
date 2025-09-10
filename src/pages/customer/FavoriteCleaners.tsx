import SchoonmakerCard from "@/components/SchoonmakerCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Schoonmaker } from "@/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";

const FavoriteCleaners = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [favoriteCleaners, setFavoriteCleaners] = useState<Schoonmaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchFavoriteCleaners(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw favoriete schoonmakers te bekijken.");
    }
  }, [isAuthLoading, user]);

  const fetchFavoriteCleaners = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Assuming a 'favorite_cleaners' table that links customer_id to cleaner_id
      const { data, error } = await supabase
        .from('favorite_cleaners')
        .select(`
          cleaners (
            id,
            name,
            photo_url,
            rating_avg,
            rating_count,
            hourly_rate,
            bio,
            services,
            city,
            address,
            phone_number
          )
        `)
        .eq('customer_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      const mappedCleaners: Schoonmaker[] = data.map((item: any) => ({
        id: item.cleaners.id,
        name: item.cleaners.name,
        photoUrl: item.cleaners.photo_url,
        ratingAvg: item.cleaners.rating_avg,
        ratingCount: item.cleaners.rating_count,
        hourlyRate: item.cleaners.hourly_rate,
        bio: item.cleaners.bio,
        services: item.cleaners.services || [],
        city: item.cleaners.city,
        address: item.cleaners.address,
        phoneNumber: item.cleaners.phone_number,
      }));

      setFavoriteCleaners(mappedCleaners);
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
        <CardHeader><CardTitle>Mijn Favoriete Schoonmakers</CardTitle></CardHeader>
        <CardContent><p>Laden van favoriete schoonmakers...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Favoriete Schoonmakers</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Favoriete Schoonmakers</CardTitle>
        <CardDescription>
          Hier vind je de schoonmakers die je hebt opgeslagen als favoriet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {favoriteCleaners.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {favoriteCleaners.map((schoonmaker) => (
              <SchoonmakerCard key={schoonmaker.id} schoonmaker={schoonmaker} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Je hebt nog geen favoriete schoonmakers.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteCleaners;