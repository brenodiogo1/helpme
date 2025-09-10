import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";
import InteractiveMap from "./InteractiveMap"; // Importar o novo componente

interface ActivityDot {
  id: number;
  type: 'cleaner' | 'booking';
  lat: number;
  lng: number;
  text: string;
}

// Funções para gerar coordenadas aleatórias dentro de uma área aproximada da Holanda
const generateRandomLatLng = () => {
  const minLat = 50.75; // Southernmost point of Netherlands
  const maxLat = 53.5;  // Northernmost point
  const minLng = 3.3;   // Westernmost point
  const maxLng = 7.2;   // Easternmost point

  const lat = Math.random() * (maxLat - minLat) + minLat;
  const lng = Math.random() * (maxLng - minLng) + minLng;
  return { lat, lng };
};

const generateRandomDot = (id: number): ActivityDot => {
  const type = Math.random() > 0.5 ? 'cleaner' : 'booking';
  const { lat, lng } = generateRandomLatLng();
  return {
    id,
    type,
    lat,
    lng,
    text: type === 'cleaner' 
      ? `Limpador a caminho em ${['Amsterdam', 'Utrecht', 'Rotterdam'][Math.floor(Math.random() * 3)]}`
      : `Novo agendamento em ${['Den Haag', 'Eindhoven', 'Groningen'][Math.floor(Math.random() * 3)]}`
  };
};

const ActivityMap = () => {
  const [dots, setDots] = useState<ActivityDot[]>(() => Array.from({ length: 8 }, (_, i) => generateRandomDot(i)));

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
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
          <InteractiveMap dots={dots} />
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