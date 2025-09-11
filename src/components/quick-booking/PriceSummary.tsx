"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";

interface PriceSummaryProps {
  durationHours: number;
  selectedExtraServices: string[];
  basePrice: number;
  // extrasPrice: number; // Removido: não é usado diretamente aqui
  discountAmount: number;
  totalPrice: number;
}

const extraServices = [
    { id: "ramen", label: "Ramen wassen", price: 25.00 },
    { id: "oven", label: "Oven reinigen", price: 15.00 },
    { id: "koelkast", label: "Koelkast reinigen", price: 15.00 },
    { id: "strijken", label: "Strijken (per uur)", price: 10.00 },
];

const PriceSummary: React.FC<PriceSummaryProps> = ({
  durationHours,
  selectedExtraServices,
  basePrice,
  // extrasPrice, // Removido da desestruturação
  discountAmount,
  totalPrice,
}) => {
  const { settings } = useSettings();
  const platformFee = settings.platformBookingFee;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Prijsoverzicht</h3>
      <div className="space-y-1 text-muted-foreground">
        <div className="flex justify-between">
          <span>Uurtarief ({durationHours} uur)</span>
          <span>€{basePrice.toFixed(2)}</span>
        </div>
        {selectedExtraServices.map(serviceId => {
          const service = extraServices.find(s => s.id === serviceId);
          // Adiciona uma verificação para garantir que 'service' não é undefined
          if (!service) {
            console.warn(`Service with ID ${serviceId} not found in extraServices.`);
            return null; // Não renderiza se o serviço não for encontrado
          }
          return (
            <div key={serviceId} className="flex justify-between">
              <span>{service.label}</span>
              <span>€{service.price.toFixed(2)}</span>
            </div>
          );
        })}
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Korting</span>
            <span>-€{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
            <span>Boekingskosten platform</span>
            <span>€{platformFee.toFixed(2)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold text-foreground">
          <span>Totaal</span>
          <span>€{totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <Separator />
    </div>
  );
};

export default PriceSummary;