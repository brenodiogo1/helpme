"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BookingStepperProps {
  currentStep: number;
  steps: string[];
}

const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className={cn(
            "flex items-center space-x-2",
            index + 1 === currentStep ? "text-primary font-semibold" : "text-muted-foreground"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2",
              index + 1 <= currentStep ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
            )}>
              {index + 1}
            </div>
            <span className="hidden sm:inline">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5",
              index + 1 < currentStep ? "bg-primary" : "bg-muted-foreground"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BookingStepper;