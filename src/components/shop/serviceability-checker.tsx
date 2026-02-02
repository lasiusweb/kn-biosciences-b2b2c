'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceabilityResult {
  serviceable: boolean;
  edd?: string;
  description?: string;
  message?: string;
}

export function ServiceabilityChecker() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setError('Invalid Pincode. Please enter a 6-digit number.');
      setResult(null);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/shipping/serviceability?pincode=${pincode}`);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Serviceability check failed:', err);
      setError('Failed to check serviceability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Delivery Options
        </span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          maxLength={6}
          className="max-w-[200px]"
        />
        <Button 
          onClick={handleCheck} 
          disabled={loading}
          variant="secondary"
        >
          {loading ? 'Checking...' : 'Check'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className={cn(
          "p-3 rounded-md border",
          result.serviceable 
            ? "bg-green-50 border-green-100 text-green-800" 
            : "bg-orange-50 border-orange-100 text-orange-800"
        )}>
          {result.serviceable ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Serviceable</span>
              </div>
              {result.edd && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Truck className="h-4 w-4" />
                  <span>Delivery by {formatDate(result.edd)}</span>
                </div>
              )}
              {result.description && (
                <p className="text-xs text-green-600/80">{result.description}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span>Not Serviceable for Home Delivery</span>
              </div>
              <p className="text-xs text-orange-700">
                Transport options available at checkout.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}