"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentMethodSelectionProps {
  paymentMethod: 'stripe' | 'cash';
  onPaymentMethodChange: (value: 'stripe' | 'cash') => void;
  isSubmitting: boolean;
  totalPrice: number;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  isSubmitting,
  totalPrice,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Kies een betaalmethode</h3>
      <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="stripe" id="payment-stripe" disabled={isSubmitting || totalPrice <= 0} />
              <Label htmlFor="payment-stripe" className="flex-grow cursor-pointer">
                  Online betalen (iDEAL, Creditcard, etc.)
                  <p className="text-xs text-muted-foreground">Veilig en direct via Stripe.</p>
              </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="cash" id="payment-cash" disabled={isSubmitting} />
              <Label htmlFor="payment-cash" className="flex-grow cursor-pointer">
                  Contant betalen
                  <p className="text-xs text-muted-foreground">Betaal de schoonmaker direct na de service.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                      Klik op "Vraag aan" hieronder om uw boeking te bevestigen en contant te betalar.
                  </p>
              </Label>
          </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelection;