'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Search,
  Filter,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { QuoteReviewModal } from "@/components/admin/quote-review-modal";

interface Quote {
  id: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  created_at: string;
  valid_until?: string;
  admin_notes?: string;
  customer_notes?: string;
  users: {
    first_name: string;
    last_name: string;
    email?: string;
    company_name?: string;
  };
  b2b_quote_items: any[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function QuotesAdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/quotes?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch: ${response?.statusText || 'No response'}`);
      }

      const data = await response.json();

      if (response.ok) {
        setQuotes(data.quotes);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch quotes:", data.error);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination?.page, pagination?.limit, statusFilter, searchTerm]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleSaveQuote = async (updatedData: any) => {
    if (!selectedQuote) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/admin/quotes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          quoteId: selectedQuote.id,
          status: 'under_review',
          items: updatedData.items,
          notes: updatedData.adminNotes,
          customerNotes: updatedData.customerNotes,
          subtotal: updatedData.subtotal,
          taxAmount: updatedData.tax,
          totalAmount: updatedData.total,
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchQuotes();
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleApproveQuote = async (updatedData: any) => {
    if (!selectedQuote) return;
    
    // Approval logic will be expanded in Phase 3
    console.log("Approving quote...", updatedData);
    alert("Approval logic will be implemented in the next phase.");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, icon: FileText, text: "Draft" },
      submitted: { variant: "default" as const, icon: Clock, text: "Submitted" },
      under_review: { variant: "default" as const, icon: Clock, text: "Under Review" },
      approved: { variant: "default" as const, icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive" as const, icon: AlertCircle, text: "Rejected" },
      expired: { variant: "destructive" as const, icon: AlertCircle, text: "Expired" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quotes Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <Input
              placeholder="Search by quote ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotes ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading quotes...
                    </TableCell>
                  </TableRow>
                ) : quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No quotes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-mono text-sm">
                        {quote.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {quote.users.first_name} {quote.users.last_name}
                          </div>
                          {quote.users.company_name && (
                            <div className="text-xs text-zinc-500">
                              {quote.users.company_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(quote.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedQuote(quote);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-earth-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} quotes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <QuoteReviewModal 
        quote={selectedQuote}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuote}
        onApprove={handleApproveQuote}
      />
    </div>
  );
}
