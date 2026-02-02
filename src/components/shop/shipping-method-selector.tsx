'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, Store, Info } from 'lucide-react';
import { ShippingRate, TRANSPORT_CARRIERS } from '@/types';

interface ShippingMethodSelectorProps {
  options: ShippingRate[];
  selectedOption: ShippingRate | null;
  onSelect: (option: ShippingRate) => void;
  selectedTransportCarrier: string;
  onTransportCarrierChange: (carrier: string) => void;
  onProceed: () => void;
  disabled?: boolean;
}

export function ShippingMethodSelector({
  options,
  selectedOption,
  onSelect,
  selectedTransportCarrier,
  onTransportCarrierChange,
  onProceed,
  disabled
}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Shipping Method</h3>
        <RadioGroup 
          value={selectedOption?.type} 
          onValueChange={(val) => {
            const opt = options.find(o => o.type === val);
            if (opt) onSelect(opt);
          }}
          disabled={disabled}
        >
          {options.map((option) => (
            <div
              key={option.type}
              className={`flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedOption?.type === option.type 
                  ? 'border-organic-500 bg-organic-50/50' 
                  : 'border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <RadioGroupItem value={option.type} id={option.type} className="mt-1" />
              <Label htmlFor={option.type} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {option.type === 'COURIER' ? <Truck className="h-5 w-5 text-zinc-500" /> : <Store className="h-5 w-5 text-zinc-500" />}
                    <span className="font-bold text-zinc-900">{option.carrier_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-organic-600">
                      {option.cost > 0 ? `₹${option.cost}` : 'To-Pay'}
                    </div>
                    {option.handling_fee > 0 && (
                      <div className="text-xs text-zinc-500">
                        + ₹{option.handling_fee} Handling
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-zinc-600 mt-1">{option.description}</p>
                {option.estimated_delivery_days && (
                  <p className="text-xs text-zinc-500 mt-1">Est. Delivery: {option.estimated_delivery_days} days</p>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {selectedOption?.type === 'TRANSPORT' && (
        <div className="space-y-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-700 font-medium mb-2">
            <Info className="h-4 w-4" />
            <span>Select Transport Carrier</span>
          </div>
          <Select value={selectedTransportCarrier} onValueChange={onTransportCarrierChange}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select a carrier..." />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORT_CARRIERS.map((carrier) => (
                <SelectItem key={carrier} value={carrier}>
                  {carrier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-500 italic">
            Freight charges will be paid by you at the destination godown. We will identify the nearest branch based on your address.
          </p>
        </div>
      )}

      <Button 
        onClick={onProceed} 
        disabled={disabled || !selectedOption || (selectedOption.type === 'TRANSPORT' && !selectedTransportCarrier)}
        className="w-full bg-organic-500 hover:bg-organic-600 h-12 text-lg font-semibold"
      >
        Proceed to Payment
      </Button>
    </div>
  );
}
