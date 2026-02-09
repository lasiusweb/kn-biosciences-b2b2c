import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, BookOpen } from 'lucide-react';
import { Product } from '@/types';

interface ProductDocumentsProps {
  product: Product;
}

export function ProductDocuments({ product }: ProductDocumentsProps) {
  const hasDocuments = product.leaflet_urls && product.leaflet_urls.length > 0;

  if (!hasDocuments) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Documentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Product Literature
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {product.leaflet_urls?.map((url, index) => (
              <a 
                key={index} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Leaflet {index + 1}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    PDF
                  </Badge>
                </Button>
              </a>
            ))}
          </div>
          
          <p className="text-sm text-earth-600 mt-3">
            These documents contain detailed instructions, safety information, and product specifications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}