import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MovingDot {
  id: number;
  type: 'cleaner' | 'booking';
  from: { top: string; left: string };
  to: { top: string; left: string };
  text: string;
}

const generateRandomPosition = () => ({
  top: `${Math.random() * 85 + 7.5}%`,
  left: `${Math.random() * 85 + 7.5}%`,
});

const generateRandomDot = (id: number): MovingDot => {
  const type = Math.random() > 0.5 ? 'cleaner' : 'booking';
  return {
    id,
    type,
    from: generateRandomPosition(),
    to: generateRandomPosition(),
    text: type === 'cleaner' 
      ? `Limpador a caminho em ${['Amsterdam', 'Utrecht', 'Rotterdam'][Math.floor(Math.random() * 3)]}`
      : `Novo agendamento em ${['Den Haag', 'Eindhoven', 'Groningen'][Math.floor(Math.random() * 3)]}`
  };
};

const DotComponent = ({ dot }: { dot: MovingDot }) => {
  const [position, setPosition] = useState(dot.from);

  useEffect(() => {
    const timeout = setTimeout(() => setPosition(dot.to), 100); // Start moving shortly after render
    return () => clearTimeout(timeout);
  }, [dot.to]);

  const isCleaner = dot.type === 'cleaner';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ease-linear"
          style={{ ...position, transitionDuration: isCleaner ? '8000ms' : '0ms' }}
        >
          {isCleaner ? (
            <div className="p-1 bg-blue-500 rounded-full shadow-lg animate-pulse">
              <Users className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="p-1 bg-green-500 rounded-full shadow-lg">
              <MapPin className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{dot.text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const ActivityMap = () => {
  const [dots, setDots] = useState<MovingDot[]>(() => Array.from({ length: 8 }, (_, i) => generateRandomDot(i)));

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        const newDots = prevDots.slice(1);
        newDots.push(generateRandomDot(Date.now()));
        return newDots;
      });
    }, 4000); // A cada 4 segundos, um novo evento acontece

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade em Tempo Real</CardTitle>
        <CardDescription>Veja os schoonmakers ativos e os serviços recentes.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1596934361360-2422d0cf29b9?q=80&w=1364&auto=format&fit=crop" 
              alt="Mapa da Holanda" 
              className="w-full h-full object-cover"
            />
            {dots.map((dot) => (
              <DotComponent key={dot.id} dot={dot} />
            ))}
          </div>
        </TooltipProvider>
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>124 Schoonmakers Ativos</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span>32 Boekingen Hoje</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityMap;