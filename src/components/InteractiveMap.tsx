"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Users, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/SettingsContext"; // Importar o hook de contexto

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

interface ActivityDot {
  id: number;
  type: 'cleaner' | 'booking';
  lat: number;
  lng: number;
  text: string;
}

interface InteractiveMapProps {
  dots: ActivityDot[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 52.370216, // Approximate center of Netherlands
  lng: 4.895168,
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ dots }) => {
  const { settings } = useSettings(); // Obter as configurações do contexto
  const googleMapsApiKey = settings.googleMapsApiKey; // Usar a chave do contexto

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey, // Usar a chave do contexto
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        <p>Google Maps API Key não configurada. Por favor, configure-a no painel de administração.</p>
      </div>
    );
  }

  if (loadError) return <div>Erro ao carregar o Google Maps</div>;
  if (!isLoaded) return <div>Carregando Mapa...</div>;

  return (
    <TooltipProvider>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {dots.map((dot) => (
          <Marker
            key={dot.id}
            position={{ lat: dot.lat, lng: dot.lng }}
            icon={{
              path: dot.type === 'cleaner' ? google.maps.SymbolPath.CIRCLE : google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              fillColor: dot.type === 'cleaner' ? '#3B82F6' : '#10B981', // Blue for cleaner, Green for booking
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 6,
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute transform -translate-x-1/2 -translate-y-1/2">
                  {dot.type === 'cleaner' ? (
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
          </Marker>
        ))}
      </GoogleMap>
    </TooltipProvider>
  );
};

export default InteractiveMap;