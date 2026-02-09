import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FlaskConical, 
  FileText, 
  Download, 
  Phone, 
  Globe,
  Info
} from 'lucide-react';
import { Product } from '@/types';

interface ProductSafetyInfoProps {
  product: Product;
}

export function ProductSafetyInfo({ product }: ProductSafetyInfoProps) {
  const hasSafetyInfo = product.safety_warnings || 
                       product.antidote_statement || 
                       product.precautions ||
                       product.directions_of_use ||
                       product.chemical_composition;

  if (!hasSafetyInfo) {
    return null;
  }

  return (
    <Card className="mt-8 border-red-200 bg-red-50">
      <CardHeader className="bg-red-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <ShieldAlert className="h-5 w-5" />
          Safety Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Chemical Composition */}
        {product.chemical_composition && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-blue-600" />
              Chemical Composition
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="whitespace-pre-line">{product.chemical_composition}</p>
            </div>
          </div>
        )}

        {/* Safety Warnings */}
        {product.safety_warnings && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Safety Warnings
            </h3>
            <Alert className="border-orange-300 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Important Safety Notice</AlertTitle>
              <AlertDescription className="text-orange-700 whitespace-pre-line">
                {product.safety_warnings}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Antidote Statement */}
        {product.antidote_statement && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-600" />
              Antidote Statement
            </h3>
            <Alert className="border-purple-300 bg-purple-50">
              <Info className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800">Emergency Information</AlertTitle>
              <AlertDescription className="text-purple-700 whitespace-pre-line">
                {product.antidote_statement}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Directions of Use */}
        {product.directions_of_use && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              Directions of Use
            </h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="whitespace-pre-line">{product.directions_of_use}</p>
            </div>
          </div>
        )}

        {/* Precautions */}
        {product.precautions && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-yellow-600" />
              Precautions
            </h3>
            <div className="space-y-2">
              {product.precautions.split('\n').map((precaution, index) => (
                precaution.trim() && (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-earth-700">{precaution.trim()}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}