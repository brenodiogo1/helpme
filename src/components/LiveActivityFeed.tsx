"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarCheck, UserPlus, DollarSign, Star, MapPin, ListTodo, CheckCircle, XCircle } from "lucide-react"; // Adicionado ListTodo, CheckCircle, XCircle
import { cn } from "@/lib/utils";

interface ActivityEvent {
  id: string;
  type: 'booking' | 'cleaner_joined' | 'review' | 'job_completed' | 'job_offer_accepted' | 'job_offer_rejected' | 'booking_cancelled';
  message: string;
  timestamp: string;
  icon: React.ReactNode;
  colorClass: string;
  avatarUrl?: string;
  avatarFallback?: string;
}

const generateRandomEvent = (id: number): ActivityEvent => {
  const eventTypes = ['booking', 'cleaner_joined', 'review', 'job_completed', 'job_offer_accepted', 'job_offer_rejected', 'booking_cancelled'] as const;
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const now = new Date();
  const cities = ["Amsterdam", "Utrecht", "Rotterdam", "Den Haag", "Eindhoven", "Groningen"];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const cleanerNames = ["Anna", "Ben", "Carla", "Daan", "Eva", "Frank", "Gerda", "Hans"];
  const customerNames = ["Piet", "Janneke", "Klaas", "Henk", "Mark", "Linda", "Sander", "Chantal"];
  const randomCleaner = cleanerNames[Math.floor(Math.random() * cleanerNames.length)];
  const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];

  let message = "";
  let icon: React.ReactNode;
  let colorClass = "";
  let avatarUrl: string | undefined;
  let avatarFallback: string | undefined;

  switch (randomType) {
    case 'booking':
      message = `Nieuwe boeking aangevraagd in ${randomCity}!`;
      icon = <CalendarCheck className="h-4 w-4" />;
      colorClass = "text-blue-500";
      break;
    case 'cleaner_joined':
      message = `${randomCleaner} heeft zich aangemeld als schoonmaker!`;
      icon = <UserPlus className="h-4 w-4" />;
      colorClass = "text-purple-500";
      avatarUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;
      avatarFallback = randomCleaner.charAt(0);
      break;
    case 'review':
      message = `${randomCustomer} heeft een nieuwe 5-sterren beoordeling achtergelaten!`;
      icon = <Star className="h-4 w-4" />;
      colorClass = "text-yellow-500";
      avatarUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;
      avatarFallback = randomCustomer.charAt(0);
      break;
    case 'job_completed':
      message = `${randomCleaner} heeft een schoonmaakklus in ${randomCity} voltooid.`;
      icon = <DollarSign className="h-4 w-4" />;
      colorClass = "text-green-500";
      avatarUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;
      avatarFallback = randomCleaner.charAt(0);
      break;
    case 'job_offer_accepted':
      message = `${randomCleaner} heeft een jobaanbieding geaccepteerd!`;
      icon = <CheckCircle className="h-4 w-4" />;
      colorClass = "text-green-600";
      avatarUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;
      avatarFallback = randomCleaner.charAt(0);
      break;
    case 'job_offer_rejected':
      message = `${randomCleaner} heeft een jobaanbieding geweigerd.`;
      icon = <XCircle className="h-4 w-4" />;
      colorClass = "text-red-500";
      avatarUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;
      avatarFallback = randomCleaner.charAt(0);
      break;
    case 'booking_cancelled':
      message = `Een boeking in ${randomCity} is geannuleerd.`;
      icon = <XCircle className="h-4 w-4" />;
      colorClass = "text-red-700";
      break;
  }

  return {
    id: `event-${id}`,
    type: randomType,
    message,
    timestamp: now.toISOString(),
    icon,
    colorClass,
    avatarUrl,
    avatarFallback,
  };
};

const LiveActivityFeed = () => {
  const [events, setEvents] = useState<ActivityEvent[]>(() => 
    Array.from({ length: 5 }, (_, i) => generateRandomEvent(i)).reverse()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prevEvents => {
        const newEvent = generateRandomEvent(Date.now());
        return [newEvent, ...prevEvents].slice(0, 10); // Keep max 10 events
      });
    }, 3000); // Adiciona um novo evento a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Activiteitenfeed</CardTitle>
        <CardDescription>Recente gebeurtenissen op het platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                {event.avatarUrl ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.avatarUrl} />
                    <AvatarFallback>{event.avatarFallback}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-muted", event.colorClass)}>
                    {event.icon}
                  </div>
                )}
                <div className="flex-grow">
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;