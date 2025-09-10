import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";

const ActivityMap = () => {
  // Posições simuladas para os pontos no mapa
  const cleaners = [
    { top: '20%', left: '30%' }, { top: '50%', left: '50%' },
    { top: '45%', left: '25%' }, { top: '60%', left: '70%' },
    { top: '75%', left: '40%' },
  ];
  const bookings = [
    { top: '25%', left: '35%' }, { top: '55%', left: '52%' },
    { top: '48%', left: '29%' }, { top: '65%', left: '75%' },
    { top: '80%', left: '43%' }, { top: '30%', left: '60%' },
    { top: '40%', left: '80%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade em Tempo Real</CardTitle>
        <CardDescription>Veja os schoonmakers ativos e os serviços recentes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-200">
          <img 
            src="https://images.unsplash.com/photo-1569950243582-2c7032119146?q=80&w=1287&auto=format&fit=crop" 
            alt="Mapa estilizado" 
            className="w-full h-full object-cover opacity-60"
          />
          {cleaners.map((pos, i) => (
            <div key={`c-${i}`} className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={pos}>
              <span className="sr-only">Schoonmaker</span>
            </div>
          ))}
          {bookings.map((pos, i) => (
            <div key={`b-${i}`} className="absolute w-2 h-2 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" style={pos}>
              <span className="sr-only">Boeking</span>
            </div>
          ))}
        </div>
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