import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Dot {
  id: number;
  type: 'cleaner' | 'booking';
  top: string;
  left: string;
  text: string;
}

const generateRandomDot = (id: number): Dot => {
  const type = Math.random() > 0.4 ? 'cleaner' : 'booking';
  return {
    id,
    type,
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
    text: type === 'cleaner' 
      ? `Cleaner online em ${['Amsterdam', 'Utrecht', 'Rotterdam'][Math.floor(Math.random() * 3)]}`
      : `Novo agendamento em ${['Den Haag', 'Eindhoven', 'Groningen'][Math.floor(Math.random() * 3)]}`
  };
};

const ActivityMap = () => {
  const [dots, setDots] = useState<Dot[]>(() => Array.from({ length: 12 }, (_, i) => generateRandomDot(i)));

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        const newDots = prevDots.slice(1);
        newDots.push(generateRandomDot(Date.now()));
        return newDots;
      });
    }, 2000); // A cada 2 segundos, um ponto antigo some e um novo aparece

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
              src="https://images.unsplash.com/photo-1569950243582-2c7032119146?q=80&w=1287&auto=format&fit=crop" 
              alt="Mapa estilizado" 
              className="w-full h-full object-cover opacity-60"
            />
            {dots.map((dot) => (
              <Tooltip key={dot.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 ${
                      dot.type === 'cleaner' ? 'w-3 h-3 bg-blue-500 animate-pulse' : 'w-2 h-2 bg-green-500'
                    }`}
                    style={{ top: dot.top, left: dot.left }}
                  >
                    <span className="sr-only">{dot.text}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{dot.text}</p>
                </TooltipContent>
              </Tooltip>
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