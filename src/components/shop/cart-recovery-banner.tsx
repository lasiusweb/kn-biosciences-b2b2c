import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CartRecoveryBannerProps {
  cartItemsCount: number;
  cartValue: number;
  onDismiss: () => void;
  onRestore: () => void;
}

export function CartRecoveryBanner({ 
  cartItemsCount, 
  cartValue, 
  onDismiss, 
  onRestore 
}: CartRecoveryBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed this banner recently
    const dismissedUntil = localStorage.getItem('cartRecoveryBannerDismissedUntil');
    if (dismissedUntil && new Date().getTime() < parseInt(dismissedUntil)) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    // Dismiss for 24 hours
    const dismissUntil = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem('cartRecoveryBannerDismissedUntil', dismissUntil.toString());
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-white border border-organic-200 rounded-lg shadow-lg p-4 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-earth-900">Your cart is waiting!</h3>
          <p className="text-sm text-earth-600 mt-1">
            {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} worth ₹{cartValue.toLocaleString()} 
            {' '}are still in your cart.
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 h-auto w-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDismiss}
          className="flex-1"
        >
          Continue Shopping
        </Button>
        <Button 
          size="sm" 
          className="bg-organic-500 hover:bg-organic-600 flex-1"
          onClick={onRestore}
        >
          Return to Cart
        </Button>
      </div>
    </div>
  );
}