'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  User, 
  Building, 
  Mail, 
  FileText, 
  Plus, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function QuoteReviewModal({ quote, isOpen, onClose, onSave, onApprove }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    if (quote) {
      setItems(quote.b2b_quote_items || []);
      setAdminNotes(quote.admin_notes || '');
      setCustomerNotes(quote.customer_notes || '');
    }
  }, [quote]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [items]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].total_price = newItems[index].unit_price * newItems[index].quantity;
    setItems(newItems);
  };

  if (!quote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
        <div className="p-6 border-b">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  Review Quote: {quote.id.substring(0, 8).toUpperCase()}
                </DialogTitle>
                <DialogDescription>
                  Review and adjust pricing before approval.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {quote.status}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Customer Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Customer Details</Label>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-zinc-400" />
                <span className="font-medium">{quote.users.first_name} {quote.users.last_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span>{quote.users.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Company</Label>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-zinc-400" />
                <span className="font-medium">{quote.users.company_name || 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* Items Table */}
          <section className="space-y-4">
            <Label className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Quote Items</Label>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    <TableHead>Product/SKU</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="w-[150px]">Unit Price (₹)</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product_variants.products.name}</div>
                        <div className="text-xs text-zinc-500">{item.product_variants.sku}</div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.unit_price} 
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(item.unit_price * item.quantity).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Notes & Summary */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Internal Admin Notes</Label>
                <Textarea 
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Only visible to sales team..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-notes">Notes for Customer</Label>
                <Textarea 
                  id="customer-notes"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Visible to the customer on their portal..."
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 space-y-4">
              <h3 className="font-bold text-zinc-900">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Subtotal</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">GST (18%)</span>
                  <span>₹{totals.tax.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-zinc-900">
                  <span>Total Amount</span>
                  <span>₹{totals.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t bg-zinc-50/50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="secondary"
            onClick={() => onSave({ items, adminNotes, customerNotes, ...totals })}
          >
            Save Changes
          </Button>
          <Button 
            className="bg-organic-600 hover:bg-organic-700 text-white font-bold"
            onClick={() => onApprove({ items, adminNotes, customerNotes, ...totals })}
          >
            Approve & Create Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}