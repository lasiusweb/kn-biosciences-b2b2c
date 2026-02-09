import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface InventoryStatusProps {
  stockQuantity: number;
  lowStockThreshold: number;
  className?: string;
}

export function InventoryStatus({ stockQuantity, lowStockThreshold, className }: InventoryStatusProps) {
  if (stockQuantity <= 0) {
    return (
      <Badge variant="destructive" className={className}>
        <XCircle className="h-3 w-3 mr-1" />
        Out of Stock
      </Badge>
    );
  }

  if (stockQuantity <= lowStockThreshold) {
    return (
      <Badge variant="outline" className={`border-yellow-500 text-yellow-700 ${className}`}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        Low Stock ({stockQuantity} left)
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={`bg-green-100 text-green-800 border-green-200 ${className}`}>
      <CheckCircle className="h-3 w-3 mr-1" />
      In Stock ({stockQuantity} available)
    </Badge>
  );
}