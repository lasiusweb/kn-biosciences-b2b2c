import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Package, Scale, Droplets, Leaf, Wrench, Calendar } from 'lucide-react';

interface ProductSpecsProps {
  productId: string;
  specs: {
    weight: string;
    dimensions: string;
    form: string;
    packingType: string;
    shelfLife: string;
    ingredients: string[];
    benefits: string[];
    applicationGuides: {
      crop: string;
      dosage: string;
      timing: string;
      method: string;
    }[];
  };
}

export function ProductSpecs({ specs, productId }: ProductSpecsProps) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Specifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Weight</TableCell>
              <TableCell>{specs.weight}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Dimensions</TableCell>
              <TableCell>{specs.dimensions}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Form</TableCell>
              <TableCell>{specs.form}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Packing Type</TableCell>
              <TableCell>{specs.packingType}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Shelf Life</TableCell>
              <TableCell>{specs.shelfLife}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {specs.ingredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Benefits
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {specs.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>

        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="application-guides">
            <AccordionTrigger className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Application Guides
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 mt-4">
                {specs.applicationGuides.map((guide, index) => (
                  <Card key={index} className="border border-earth-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Crop</h4>
                          <p className="font-medium">{guide.crop}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Dosage</h4>
                          <p className="font-medium">{guide.dosage}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Timing</h4>
                          <p className="font-medium">{guide.timing}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Method</h4>
                          <p className="font-medium">{guide.method}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}