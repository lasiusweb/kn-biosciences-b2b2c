import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Scale, Box } from 'lucide-react';

interface Variant {
  id: string;
  sku: string;
  weight: number;
  weightUnit: string;
  packingType: string;
  form: string;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-3">Select Variant</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          
          return (
            <Button
              key={variant.id}
              variant={isSelected ? "default" : "outline"}
              className={`h-auto p-4 text-left justify-start ${
                isSelected ? "border-2 border-organic-500" : ""
              }`}
              onClick={() => onSelect(variant.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  {variant.packingType === 'box' ? (
                    <Box className="h-6 w-6 text-organic-600" />
                  ) : variant.packingType === 'drum' ? (
                    <Package className="h-6 w-6 text-organic-600" />
                  ) : (
                    <Scale className="h-6 w-6 text-organic-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">
                    {variant.weight} {variant.weightUnit} • {variant.packingType} • {variant.form}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-organic-600">
                      ₹{variant.price.toLocaleString()}
                    </span>
                    {variant.comparePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{variant.comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <Badge 
                      variant={variant.stockQuantity > variant.lowStockThreshold ? "default" : "outline"}
                      className={
                        variant.stockQuantity > variant.lowStockThreshold 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "border-yellow-500 text-yellow-700"
                      }
                    >
                      {variant.stockQuantity > variant.lowStockThreshold 
                        ? `${variant.stockQuantity} in stock` 
                        : `Only ${variant.stockQuantity} left`}
                    </Badge>
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}