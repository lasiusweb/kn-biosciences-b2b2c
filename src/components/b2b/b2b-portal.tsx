"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Send,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { B2BQuote, B2BQuoteItem, ProductVariant } from "@/types";
import { downloadQuotePDF } from "@/lib/quote-pdf";

export function B2BPortal() {
  const [quotes, setQuotes] = useState<B2BQuote[]>([]);
  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [newQuote, setNewQuote] = useState<Partial<B2BQuote>>({
    notes: "",
  });
  const [quoteItems, setQuoteItems] = useState<B2BQuoteItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<B2BQuoteItem>>({});

  useEffect(() => {
    // Fetch existing quotes and products
    const fetchData = async () => {
      try {
        // Fetch quotes
        const quotesResponse = await fetch("/api/b2b/quotes");
        if (quotesResponse.ok) {
          const quotesData = await quotesResponse.json();
          setQuotes(quotesData);
        }

        // Fetch products
        const productsResponse = await fetch("/api/b2b/products");
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDownloadPDF = async (quote: B2BQuote) => {
    try {
      // Fetch full quote details with product information
      const response = await fetch(`/api/b2b/quotes/${quote.id}`);
      if (response.ok) {
        const quoteData = await response.json();
        downloadQuotePDF(quoteData);
      } else {
        alert("Failed to generate quote PDF");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to generate quote PDF");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, icon: FileText, text: "Draft" },
      submitted: { variant: "default" as const, icon: Send, text: "Submitted" },
      under_review: {
        variant: "default" as const,
        icon: Clock,
        text: "Under Review",
      },
      approved: {
        variant: "default" as const,
        icon: CheckCircle,
        text: "Approved",
      },
      rejected: {
        variant: "destructive" as const,
        icon: AlertCircle,
        text: "Rejected",
      },
      expired: {
        variant: "destructive" as const,
        icon: AlertCircle,
        text: "Expired",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleAddItem = () => {
    if (
      currentItem.variant_id &&
      currentItem.quantity &&
      currentItem.unit_price
    ) {
      const newItem: B2BQuoteItem = {
        id: `temp-${Date.now()}`,
        quote_id: "",
        variant_id: currentItem.variant_id,
        quantity: currentItem.quantity,
        unit_price: currentItem.unit_price,
        total_price: currentItem.quantity * currentItem.unit_price,
      };

      setQuoteItems((prev) => [...prev, newItem]);

      // Calculate totals
      const items = [...quoteItems, newItem];
      const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = subtotal * 0.18; // 18% GST
      const totalAmount = subtotal + taxAmount;

      setNewQuote((prev) => ({
        ...prev,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      }));

      setCurrentItem({});
    }
  };

  const handleSubmitQuote = async () => {
    if (!quoteItems.length) {
      alert("Please add at least one product to the quote");
      return;
    }

    setLoading(true);
    try {
      const quoteData = {
        user_id: "current-user-id", // This should come from auth context
        items: quoteItems,
        notes: newQuote.notes,
        valid_until: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        subtotal: newQuote.subtotal,
        tax_amount: newQuote.tax_amount,
        total_amount: newQuote.total_amount,
      };

      const response = await fetch("/api/b2b/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        // Refresh quotes list
        const quotesResponse = await fetch("/api/b2b/quotes");
        if (quotesResponse.ok) {
          const quotesData = await quotesResponse.json();
          setQuotes(quotesData);
        }

        // Reset form
        setQuoteItems([]);
        setNewQuote({ notes: "" });
        alert("Quote submitted successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to submit quote: ${error.error}`);
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      alert("Failed to submit quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">B2B Portal</h1>
        <p className="text-earth-600">
          Manage bulk orders and get wholesale pricing
        </p>
      </div>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quotes">My Quotes</TabsTrigger>
          <TabsTrigger value="new-quote">Create Quote</TabsTrigger>
          <TabsTrigger value="pricing">Wholesale Pricing</TabsTrigger>
        </TabsList>

        {/* Quotes List */}
        <TabsContent value="quotes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-earth-900">
              Recent Quotes
            </h2>
            <Button className="bg-organic-500 hover:bg-organic-600">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(quotes) || quotes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-earth-600"
                      >
                        No quotes found. Create your first quote to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotes.map((quote: any) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{quote.id.substring(0, 8).toUpperCase()}</span>
                            {quote.order && (
                              <span className="text-xs text-organic-600 font-bold">
                                Order: {quote.order.order_number}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(quote.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell>
                          ₹{quote.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {quote.valid_until
                            ? new Date(quote.valid_until).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(quote)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            {quote.status === "approved" && quote.order?.payment_link_url && (
                              <Button 
                                className="bg-organic-600 hover:bg-organic-700 text-white" 
                                size="sm"
                                onClick={() => window.open(quote.order.payment_link_url, '_blank')}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Quote */}
        <TabsContent value="new-quote" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Quote Request</CardTitle>
              <CardDescription>
                Add products and specify quantities to request wholesale pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Items Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-earth-900">Add Products</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Product</Label>
                    <Select
                      onValueChange={(value) =>
                        setCurrentItem((prev) => ({
                          ...prev,
                          variant_id: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.sku}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={currentItem.quantity || ""}
                      onChange={(e) =>
                        setCurrentItem((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={currentItem.unit_price || ""}
                      onChange={(e) =>
                        setCurrentItem((prev) => ({
                          ...prev,
                          unit_price: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button onClick={handleAddItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quote Items */}
              {quoteItems && quoteItems.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-earth-900 mb-4">
                    Quote Items
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteItems.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.variant_id}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.unit_price}</TableCell>
                          <TableCell>₹{item.total_price}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any special requirements or notes..."
                  value={newQuote.notes || ""}
                  onChange={(e) =>
                    setNewQuote((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              {/* Summary */}
              {newQuote.subtotal && (
                <div className="border rounded-lg p-4 bg-organic-50">
                  <h3 className="font-semibold text-earth-900 mb-4">
                    Quote Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{newQuote.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span>₹{newQuote.tax_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{newQuote.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitQuote}
                  className="bg-organic-500 hover:bg-organic-600"
                  disabled={loading}
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Quote Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wholesale Pricing */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-earth-900 mb-2">
              Wholesale Pricing Tiers
            </h2>
            <p className="text-earth-600">
              Get better pricing with higher volume orders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bronze Tier</CardTitle>
                <CardDescription>Orders up to ₹50,000</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-earth-900 mb-2">
                  5% Off
                </div>
                <p className="text-sm text-earth-600">
                  Standard wholesale pricing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Silver Tier</CardTitle>
                <CardDescription>Orders ₹50,001 - ₹2,00,000</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-earth-900 mb-2">
                  10% Off
                </div>
                <p className="text-sm text-earth-600">
                  Better pricing for medium volumes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gold Tier</CardTitle>
                <CardDescription>Orders above ₹2,00,000</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-earth-900 mb-2">
                  15% Off
                </div>
                <p className="text-sm text-earth-600">
                  Best pricing for high volume orders
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Order Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-organic-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Free Shipping</h4>
                    <p className="text-sm text-earth-600">
                      On orders above ₹10,000
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-organic-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Priority Processing</h4>
                    <p className="text-sm text-earth-600">
                      Faster order processing
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-organic-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Dedicated Support</h4>
                    <p className="text-sm text-earth-600">
                      Personal account manager
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-organic-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Flexible Payment Terms</h4>
                    <p className="text-sm text-earth-600">
                      Credit facility available
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
