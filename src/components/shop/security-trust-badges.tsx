import { Badge } from '@/components/ui/badge';
import { Shield, Lock, CheckCircle, Globe, CreditCard } from 'lucide-react';

export function SecurityTrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
      <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
        <Shield className="h-6 w-6 text-green-600 mb-1" />
        <span className="text-xs text-center text-green-700">Secure Checkout</span>
      </div>
      <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Lock className="h-6 w-6 text-blue-600 mb-1" />
        <span className="text-xs text-center text-blue-700">256-bit SSL</span>
      </div>
      <div className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg border border-purple-200">
        <CheckCircle className="h-6 w-6 text-purple-600 mb-1" />
        <span className="text-xs text-center text-purple-700">PCI DSS Compliant</span>
      </div>
      <div className="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <Globe className="h-6 w-6 text-yellow-600 mb-1" />
        <span className="text-xs text-center text-yellow-700">Global Security</span>
      </div>
      <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-lg border border-red-200">
        <CreditCard className="h-6 w-6 text-red-600 mb-1" />
        <span className="text-xs text-center text-red-700">Safe Payments</span>
      </div>
    </div>
  );
}