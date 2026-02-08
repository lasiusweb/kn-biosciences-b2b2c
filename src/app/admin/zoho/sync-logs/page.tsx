// src/app/admin/zoho/sync-logs/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from "@/components/ui/pagination";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";

interface ZohoSyncLog {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  zoho_service: string;
  zoho_entity_type: string;
  zoho_entity_id: string | null;
  status: "pending" | "success" | "failed" | "retrying";
  attempt_count: number;
  max_attempts: number;
  next_retry_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  retrying: "bg-yellow-100 text-yellow-800",
  pending: "bg-blue-100 text-blue-800",
};

export default function ZohoSyncLogsPage() {
  const [logs, setLogs] = useState<ZohoSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [operationFilter, setOperationFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (entityTypeFilter !== "all") params.append("entityType", entityTypeFilter);
      if (operationFilter !== "all") params.append("operation", operationFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/admin/zoho/sync-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      const data = await response.json();
      setLogs(data.data);
      setTotalCount(data.count);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load sync logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, statusFilter, entityTypeFilter, operationFilter, searchTerm]);

  const handleRetry = async (logId: string) => {
    try {
      const response = await fetch("/api/admin/zoho/sync-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logId, action: "retry" }),
      });

      if (!response.ok) {
        throw new Error("Failed to retry task");
      }

      toast({
        title: "Retry Scheduled",
        description: "The task has been scheduled for immediate retry.",
      });
      fetchLogs(); // Refresh logs
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule retry.",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const entityTypes = useMemo(() => [
    "all", "user", "product", "order", "b2b_quote", "inventory", "contact_submission"
  ], []);

  const operations = useMemo(() => [
    "all", "create", "update", "delete", "sync_pull"
  ], []);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Zoho Sync Logs</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search errors or entity IDs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="retrying">Retrying</SelectItem>
          </SelectContent>
        </Select>

        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Entity Type" />
          </SelectTrigger>
          <SelectContent>
            {entityTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={operationFilter} onValueChange={setOperationFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Operation" />
          </SelectTrigger>
          <SelectContent>
            {operations.map(op => (
              <SelectItem key={op} value={op}>
                {op.charAt(0).toUpperCase() + op.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => fetchLogs()} disabled={loading}>
          {loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Zoho Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Error Message</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-xs">{log.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <div className="text-xs">{log.entity_type}</div>
                    <div className="text-gray-500 text-xs">{log.entity_id.substring(0, 8)}...</div>
                  </TableCell>
                  <TableCell>{log.operation}</TableCell>
                  <TableCell>{log.zoho_service}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[log.status] || "bg-gray-100 text-gray-800"}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.attempt_count}/{log.max_attempts}</TableCell>
                  <TableCell className="text-red-600 text-xs max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {log.error_message || "-"}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {log.status === "failed" || log.status === "retrying" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(log.id)}
                      >
                        Retry
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No sync logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationPrevious onClick={() => setPage(prev => Math.max(1, prev - 1))} />
          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationNext onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} />
        </PaginationContent>
      </Pagination>
    </div>
  );
}