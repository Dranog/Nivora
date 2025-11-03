"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceOption {
  id: string;
  label: string;
  price: number;
  description?: string;
  recommended?: boolean;
}

interface PriceSelectorProps {
  options: PriceOption[];
  selectedId?: string;
  onSelect: (option: PriceOption) => void;
  currency?: string;
}

export function PriceSelector({
  options,
  selectedId,
  onSelect,
  currency = "€",
}: PriceSelectorProps) {
  const [selected, setSelected] = useState(selectedId);

  const handleSelect = (option: PriceOption) => {
    setSelected(option.id);
    onSelect(option);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Price</Label>
      <div className="grid gap-3">
        {options.map((option) => {
          const isSelected = selected === option.id;

          return (
            <Card
              key={option.id}
              onClick={() => handleSelect(option)}
              className={cn(
                "relative p-4 cursor-pointer transition-all border-2",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{option.label}</p>
                    {option.recommended && (
                      <Badge className="oliver-badge-primary text-xs h-5">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  {option.description && (
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold tracking-tight">
                    {currency}
                    {(option.price / 100).toFixed(2)}
                  </p>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Example usage component for reference
export function PriceSelectorExample() {
  const [selectedOption, setSelectedOption] = useState<PriceOption | null>(null);

  const priceOptions: PriceOption[] = [
    {
      id: "unlock",
      label: "Unlock Post",
      price: 999,
      description: "One-time access to this content",
    },
    {
      id: "subscribe",
      label: "Subscribe",
      price: 1990,
      description: "Monthly subscription • Unlimited access",
      recommended: true,
    },
  ];

  return (
    <PriceSelector
      options={priceOptions}
      selectedId="subscribe"
      onSelect={setSelectedOption}
    />
  );
}
