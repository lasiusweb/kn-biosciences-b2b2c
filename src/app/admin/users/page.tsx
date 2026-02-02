import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { AdminUser } from '@/types/admin';
import { UserDetailModal } from '@/components/admin/user-detail-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function UserDirectoryPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'role' | 'status' | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<Partial<AdminUser> | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        // Handle unauthenticated state if necessary, e.g., redirect to login
        return;
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        role: roleFilter,
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch users:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async () => {
    if (!selectedUser || !pendingUpdate) return;

    try {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        // Handle unauthenticated state
        return;
      }
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: selectedUser.id, ...pendingUpdate }),
      });

      if (response.ok) {
        console.log("User updated successfully");
        fetchUsers();
        setIsConfirmModalOpen(false);
        setPendingUpdate(null);
        setSelectedUser(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
    } catch (error: any) {
      console.error("Update failed:", error.message);
      setIsConfirmModalOpen(false);
      setPendingUpdate(null);
      setSelectedUser(null);
    }
  };

  const openConfirmModal = (user: AdminUser, type: 'role' | 'status', update: Partial<AdminUser>) => {
    setSelectedUser(user);
    setActionType(type);
    setPendingUpdate(update);
    setIsConfirmModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'staff': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'vendor': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'b2b_client': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">User Directory</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-800 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px] bg-zinc-950 border-zinc-800 text-white">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="b2b_client">B2B Client</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-zinc-950 border-zinc-800 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Orders</TableHead>
              <TableHead className="text-zinc-400 text-right">Spent</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{user.first_name} {user.last_name}</span>
                      <span className="text-xs text-zinc-500">{user.email}</span>
                      {user.company_name && (
                        <span className="text-xs text-zinc-400 italic">{user.company_name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => openConfirmModal(user, 'role', { role: newRole as any })}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="b2b_client">B2B Client</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.status}
                      onValueChange={(newStatus) => openConfirmModal(user, 'status', { status: newStatus as any })}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right text-zinc-300">{user.totalOrders || 0}</TableCell>
                  <TableCell className="text-right text-white font-medium">
                    ₹{(user.totalSpent || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-400 hover:text-white"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="bg-zinc-950 border-zinc-800 text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="bg-zinc-950 border-zinc-800 text-white"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRoleChange={(role) => selectedUser && openConfirmModal(selectedUser, 'role', { role: role as any })}
        onStatusChange={(status) => selectedUser && openConfirmModal(selectedUser, 'status', { status: status as any })}
      />

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm {actionType === 'role' ? 'Role Change' : 'Status Change'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to change {selectedUser?.first_name} {selectedUser?.last_name}'s {actionType === 'role' ? 'role to' : 'status to'}{' '}
              <span className="font-semibold text-white">
                {actionType === 'role' ? (pendingUpdate?.role) : (pendingUpdate?.status)}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} className="border-zinc-800 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="bg-red-600 hover:bg-red-700">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
