import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockRecentBookings = [
    { name: "Olivia Martin", email: "olivia.martin@email.com", amount: 42.50, photoUrl: "https://i.pravatar.cc/150?img=1" },
    { name: "Jackson Lee", email: "jackson.lee@email.com", amount: 55.00, photoUrl: "https://i.pravatar.cc/150?img=2" },
    { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: 78.20, photoUrl: "https://i.pravatar.cc/150?img=3" },
    { name: "William Kim", email: "will@email.com", amount: 25.00, photoUrl: "https://i.pravatar.cc/150?img=4" },
    { name: "Sofia Davis", email: "sofia.davis@email.com", amount: 60.00, photoUrl: "https://i.pravatar.cc/150?img=5" },
];

export function RecentBookings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Boekingen</CardTitle>
        <CardDescription>
          Er zijn deze maand {mockRecentBookings.length} nieuwe boekingen geweest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {mockRecentBookings.map((booking, index) => (
                 <div key={index} className="flex items-center">
                 <Avatar className="h-9 w-9">
                   <AvatarImage src={booking.photoUrl} alt="Avatar" />
                   <AvatarFallback>{booking.name.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div className="ml-4 space-y-1">
                   <p className="text-sm font-medium leading-none">{booking.name}</p>
                   <p className="text-sm text-muted-foreground">
                     {booking.email}
                   </p>
                 </div>
                 <div className="ml-auto font-medium">+€{booking.amount.toFixed(2)}</div>
               </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}