import ReviewCard from "@/components/ReviewCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Review } from "@/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";

const MyReviews = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchReviews(user.id);
    } else if (!isAuthLoading && !user) {
      setLoading(false);
      setError("U moet ingelogd zijn om uw recensies te bekijken.");
    }
  }, [isAuthLoading, user]);

  const fetchReviews = async (userId: string) => {
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

      // Assuming a 'reviews' table with cleaner_id and customer_id
      const { data, error } = await supabase
        .from('reviews') // Assuming a table named 'reviews'
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (first_name, last_name, avatar_url)
        `)
        .eq('cleaner_id', cleanerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const mappedReviews: Review[] = data.map((item: any) => ({
        id: item.id,
        author: `${item.profiles?.first_name || 'Onbekend'} ${item.profiles?.last_name || ''}`,
        rating: item.rating,
        comment: item.comment,
        date: item.created_at,
        avatarUrl: item.profiles?.avatar_url,
      }));

      setReviews(mappedReviews);
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
        <CardHeader><CardTitle>Mijn Recensies</CardTitle></CardHeader>
        <CardContent><p>Laden van recensies...</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Mijn Recensies</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">Fout: {error}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Recensies</CardTitle>
        <CardDescription>
          Hieronder vind je alle recensies die klanten hebben achtergelaten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">Nog geen recensies ontvangen.</p>
        ) : (
          reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default MyReviews;