import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Hourglass, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface BookingTimelineProps {
  booking: {
    id: string;
    cleaner_name: string;
    booking_date: string;
    booking_time: string;
    duration_hours: number;
    total_price: number;
    status: 'pending_offer' | 'accepted' | 'rejected' | 'executing' | 'completed' | 'cancelled' | 'pending_assignment';
  };
}

const statusSteps = [
  { status: 'pending_offer', label: 'Aanvraag verzonden', icon: Hourglass, color: 'text-blue-500' },
  { status: 'accepted', label: 'Aanvraag geaccepteerd', icon: CalendarCheck, color: 'text-green-500' },
  { status: 'executing', label: 'Schoonmaak bezig', icon: Clock, color: 'text-yellow-500' },
  { status: 'completed', label: 'Schoonmaak voltooid', icon: CheckCircle, color: 'text-green-600' },
  { status: 'rejected', label: 'Aanvraag geweigerd', icon: XCircle, color: 'text-red-500' },
  { status: 'cancelled', label: 'Boeking geannuleerd', icon: XCircle, color: 'text-red-500' },
];

const CustomerBookingTimeline: React.FC<BookingTimelineProps> = ({ booking }) => {
  const currentStatusIndex = statusSteps.findIndex(step => step.status === booking.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Boekingsstatus voor {booking.cleaner_name}</CardTitle>
        <CardDescription>
          Je afspraak op {format(new Date(booking.booking_date), "eeee d MMMM yyyy", { locale: nl })} om {booking.booking_time}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {statusSteps.map((step, index) => {
            const isCurrentOrPast = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isRejectedOrCancelled = booking.status === 'rejected' || booking.status === 'cancelled';

            // Only show relevant steps for rejected/cancelled bookings
            if (isRejectedOrCancelled && !(step.status === 'pending_offer' || step.status === booking.status)) {
                return null;
            }
            // Don't show 'executing' or 'completed' if rejected/cancelled
            if ((step.status === 'executing' || step.status === 'completed') && isRejectedOrCancelled) {
                return null;
            }
            // Don't show 'accepted' if rejected/cancelled and it's not the current status
            if (step.status === 'accepted' && isRejectedOrCancelled && !isCurrent) {
                return null;
            }


            return (
              <div key={step.status} className="mb-6 flex items-start">
                <div className="absolute left-0 flex h-6 w-6 items-center justify-center">
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      isCurrentOrPast && !isRejectedOrCancelled ? step.color.replace('text-', 'border-') : "border-muted-foreground",
                      isCurrent && !isRejectedOrCancelled && step.color.replace('text-', 'bg-')
                    )}
                  />
                </div>
                <div className="ml-8">
                  <div className={cn("font-medium", isCurrentOrPast && !isRejectedOrCancelled ? step.color : "text-muted-foreground")}>
                    <step.icon className={cn("inline-block h-4 w-4 mr-2", isCurrentOrPast && !isRejectedOrCancelled ? step.color : "text-muted-foreground")} />
                    {step.label}
                  </div>
                  {isCurrent && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.status === 'pending_offer' && "De schoonmaker bekijkt je aanvraag."}
                      {booking.status === 'accepted' && "Je boeking is bevestigd! De schoonmaker komt op de afgesproken tijd."}
                      {booking.status === 'executing' && "De schoonmaak is momenteel bezig."}
                      {booking.status === 'completed' && "De schoonmaak is voltooid. Geniet van je schone huis!"}
                      {booking.status === 'rejected' && "Helaas heeft de schoonmaker je aanvraag geweigerd. Probeer een andere schoonmaker."}
                      {booking.status === 'cancelled' && "Je boeking is geannuleerd."}
                      {booking.status === 'pending_assignment' && "We zoeken een geschikte schoonmaker voor je boeking."}
                    </p>
                  )}
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[11px] top-6 h-full w-0.5",
                      isCurrentOrPast && !isRejectedOrCancelled ? step.color.replace('text-', 'bg-') : "bg-muted-foreground"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerBookingTimeline;