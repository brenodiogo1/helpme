import ReviewCard from "@/components/ReviewCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Review } from "@/types";

const mockReviews: Review[] = [
    { id: "r1", author: "Piet H.", rating: 5, comment: "Anna is fantastisch! Ons huis was nog nooit zo schoon.", date: "2023-10-15" },
    { id: "r2", author: "Janneke S.", rating: 5, comment: "Zeer professioneel en vriendelijk. Een echte aanrader.", date: "2023-10-10" },
    { id: "r3", author: "Klaas de Wit", rating: 4, comment: "Goed werk geleverd, was alleen 10 minuten te laat.", date: "2023-09-28" },
    { id: "r4", author: "Eva de Jong", rating: 5, comment: "Uitstekende service, heel blij mee!", date: "2023-09-20" },
];

const MyReviews = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mijn Recensies</CardTitle>
        <CardDescription>
          Hieronder vind je alle recensies die klanten hebben achtergelaten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockReviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </CardContent>
    </Card>
  );
};

export default MyReviews;