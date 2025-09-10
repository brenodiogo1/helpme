import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaveReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoonmakerName: string;
  cleanerId: string; // Added cleanerId prop
  bookingId: string; // Added bookingId prop
  onReviewSubmitted: () => void; // Callback to refresh bookings/reviews
}

const LeaveReviewDialog: React.FC<LeaveReviewDialogProps> = ({ open, onOpenChange, schoonmakerName, cleanerId, bookingId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      showError("U moet ingelogd zijn om een beoordeling te plaatsen.");
      return;
    }
    if (rating === 0 || !comment.trim()) {
      showError("Geef een beoordeling en schrijf een opmerking.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading("Beoordeling verzenden...");

    try {
      const { error } = await supabase
        .from('reviews') // Assuming a 'reviews' table
        .insert({
          customer_id: user.id,
          cleaner_id: cleanerId,
          booking_id: bookingId,
          rating: rating,
          comment: comment.trim(),
        });

      if (error) {
        throw new Error(error.message);
      }

      // Optionally update cleaner's average rating and count
      // This would typically be handled by a database trigger or a separate function
      // For now, we'll just show success.

      dismissToast(toastId);
      showSuccess("Bedankt voor je beoordeling!");
      onReviewSubmitted(); // Call the callback to refresh data
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (err: any) {
      dismissToast(toastId);
      showError(err.message);
      console.error("Fout bij het verzenden van de beoordeling:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beoordeel {schoonmakerName}</DialogTitle>
          <DialogDescription>
            Laat ons weten hoe je de schoonmaak hebt ervaren.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Schrijf hier je opmerking..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Annuleren</Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || !comment.trim() || isSubmitting}>Versturen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveReviewDialog;