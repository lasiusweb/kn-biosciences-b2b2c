import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ShieldCheck, BadgeCheck, FileText, Globe } from 'lucide-react';
import { Product } from '@/types';

interface ProductComplianceInfoProps {
  product: Product;
}

export function ProductComplianceInfo({ product }: ProductComplianceInfoProps) {
  const hasComplianceInfo = product.cbirc_compliance || 
                           product.manufacturing_license || 
                           product.country_of_origin ||
                           product.gtin;

  if (!hasComplianceInfo) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Regulatory Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {/* GTIN/EAN/UPC */}
            {product.gtin && (
              <TableRow>
                <TableCell className="font-medium w-1/3">GTIN/EAN/UPC</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.gtin}</Badge>
                </TableCell>
              </TableRow>
            )}

            {/* Country of Origin */}
            {product.country_of_origin && (
              <TableRow>
                <TableCell className="font-medium w-1/3">Country of Origin</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-earth-500" />
                    <span>{product.country_of_origin}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* CBIRC Compliance */}
            {product.cbirc_compliance && (
              <TableRow>
                <TableCell className="font-medium w-1/3">CBIRC Compliance</TableCell>
                <TableCell>
                  <Badge className="bg-green-500 text-white">{product.cbirc_compliance}</Badge>
                </TableCell>
              </TableRow>
            )}

            {/* Manufacturing License */}
            {product.manufacturing_license && (
              <TableRow>
                <TableCell className="font-medium w-1/3">Manufacturing License</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {product.manufacturing_license}
                  </Badge>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}