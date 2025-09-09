import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage src={review.avatarUrl} alt={review.author} />
          <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{review.author}</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;