import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Factory, Package, Scale, Droplets, Users2, Building2 } from 'lucide-react';
import { Product } from '@/types';

interface ProductIdentityInfoProps {
  product: Product;
}

export function ProductIdentityInfo({ product }: ProductIdentityInfoProps) {
  const hasIdentityInfo = product.brand_name || 
                         product.market_by || 
                         product.net_content ||
                         product.customer_care_details;

  if (!hasIdentityInfo) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5" />
          Product Identity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {/* Brand Name */}
            {product.brand_name && (
              <TableRow>
                <TableCell className="font-medium w-1/3">Brand</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-lg py-1 px-3">
                    {product.brand_name}
                  </Badge>
                </TableCell>
              </TableRow>
            )}

            {/* Market By */}
            {product.market_by && (
              <TableRow>
                <TableCell className="font-medium w-1/3">Marketed By</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-earth-500" />
                    <span>{product.market_by}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Net Content */}
            {product.net_content && (
              <TableRow>
                <TableCell className="font-medium w-1/3">Net Content</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-earth-500" />
                    <span>{product.net_content}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Customer Care Details */}
            {product.customer_care_details && (
              <TableRow>
                <TableCell className="font-medium w-1/3">Customer Care</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-earth-500" />
                    <span>{product.customer_care_details}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}