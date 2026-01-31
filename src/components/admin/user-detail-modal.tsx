'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar,
  CreditCard,
  FileText
} from "lucide-react";
import { AdminUser } from "@/types/admin";

interface UserDetailModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white overflow-hidden p-0">
        <div className="bg-zinc-900 p-6 border-b border-zinc-800">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                <User className="h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {user.first_name} {user.last_name}
                </DialogTitle>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    {user.role.replace('_', ' ')}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={
                      user.status === 'active' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                <FileText className="h-4 w-4" />
                <span>Orders</span>
              </div>
              <div className="text-xl font-bold">{user.totalOrders || 0}</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                <CreditCard className="h-4 w-4" />
                <span>Total Spent</span>
              </div>
              <div className="text-xl font-bold">₹{(user.totalSpent || 0).toLocaleString()}</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                <Calendar className="h-4 w-4" />
                <span>Joined</span>
              </div>
              <div className="text-sm font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <Mail className="h-5 w-5 text-zinc-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <Phone className="h-5 w-5 text-zinc-500" />
                <span>{user.phone || 'No phone provided'}</span>
              </div>
              {user.company_name && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <Building className="h-5 w-5 text-zinc-500" />
                  <span>{user.company_name}</span>
                </div>
              )}
            </div>
          </section>

          {/* Addresses */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Address Book</h3>
            {(user as any).addresses && (user as any).addresses.length > 0 ? (
              <div className="space-y-3">
                {(user as any).addresses.map((addr: any) => (
                  <div key={addr.id} className="flex gap-3 bg-zinc-900/50 p-3 rounded-md border border-zinc-800">
                    <MapPin className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {addr.type.charAt(0).toUpperCase() + addr.type.slice(1)} Address
                        {addr.is_default && <Badge className="text-[10px] h-4">Default</Badge>}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {addr.street_address}<br />
                        {addr.city}, {addr.state} {addr.postal_code}<br />
                        {addr.country}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No addresses found for this user.</p>
            )}
          </section>
        </div>

        <div className="bg-zinc-900 p-4 border-t border-zinc-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-zinc-800 hover:bg-zinc-800">
            Close
          </Button>
          <Button className="bg-white text-black hover:bg-zinc-200 font-semibold">
            Edit User Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
