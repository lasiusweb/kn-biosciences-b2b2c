'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Tag, Megaphone, Clock, Percent, AlertCircle, MessageSquare, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const MOCK_COUPONS = [
  { code: 'SAVE10', type: 'percentage', value: 10, expiry: '2026-12-31', status: 'active' },
  { code: 'WELCOME500', type: 'fixed', value: 500, expiry: '2026-06-30', status: 'active' },
];

const MOCK_BANNERS = [
  { id: 1, title: 'Summer Special', location: 'Homepage Hero', status: 'active' },
  { id: 2, title: 'B2B Wholesale', location: 'Shop Sidebar', status: 'inactive' },
];

export default function MarketingAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Marketing & Campaigns</h1>
      </div>

      <Tabs defaultValue="coupons" className="space-y-6">
        <TabsList className="bg-zinc-950 border border-zinc-800">
          <TabsTrigger value="coupons" className="text-zinc-400 data-[state=active]:text-white">
            <Tag className="mr-2 h-4 w-4" />
            Coupons
          </TabsTrigger>
          <TabsTrigger value="banners" className="text-zinc-400 data-[state=active]:text-white">
            <Megaphone className="mr-2 h-4 w-4" />
            Promo Banners
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="text-zinc-400 data-[state=active]:text-white">
            <Percent className="mr-2 h-4 w-4" />
            Loyalty Points
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-zinc-400 data-[state=active]:text-white">
            <MessageSquare className="mr-2 h-4 w-4" />
            WhatsApp Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coupons">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Active Coupons</CardTitle>
                <CardDescription className="text-zinc-500">Manage discount codes and promotions</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Coupon
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Code</TableHead>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400">Value</TableHead>
                    <TableHead className="text-zinc-400">Expiry</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_COUPONS.map((coupon) => (
                    <TableRow key={coupon.code} className="border-zinc-800">
                      <TableCell className="text-white font-mono font-bold">{coupon.code}</TableCell>
                      <TableCell className="text-zinc-400 capitalize">{coupon.type}</TableCell>
                      <TableCell className="text-white">{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</TableCell>
                      <TableCell className="text-zinc-400 text-xs">{coupon.expiry}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Promotional Banners</CardTitle>
                <CardDescription className="text-zinc-500">Visual ads across the storefront</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload Banner
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Title</TableHead>
                    <TableHead className="text-zinc-400">Placement</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_BANNERS.map((banner) => (
                    <TableRow key={banner.id} className="border-zinc-800">
                      <TableCell className="text-white font-medium">{banner.title}</TableCell>
                      <TableCell className="text-zinc-400">{banner.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={banner.status === 'active' ? 'border-green-500 text-green-500' : 'border-zinc-500 text-zinc-500'}>
                          {banner.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Global Config</CardTitle>
                <CardDescription className="text-zinc-500">Loyalty point rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Points per ₹100 spent</Label>
                  <Input defaultValue="10" className="bg-black border-zinc-800 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Redemption Rate (1 point = ₹)</Label>
                  <Input defaultValue="0.5" className="bg-black border-zinc-800 text-white" />
                </div>
                <Button>Update Config</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Twilio API Integration</CardTitle>
                <CardDescription className="text-zinc-500">Configure your WhatsApp Business API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Account SID</Label>
                  <Input type="password" value="ACxxxxxxxxxxxxxxxxxxxxxxxx" className="bg-black border-zinc-800 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Auth Token</Label>
                  <Input type="password" value="••••••••••••••••" className="bg-black border-zinc-800 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">WhatsApp Number</Label>
                  <Input defaultValue="+91 1234567890" className="bg-black border-zinc-800 text-white" />
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save API Keys
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Message Templates</CardTitle>
                <CardDescription className="text-zinc-500">Automated notification triggers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-white">Order Confirmation</span>
                    <Badge variant="outline" className="text-[10px]">Approved</Badge>
                  </div>
                  <p className="text-xs text-zinc-400">Hello {'{{1}}'}, your order {'#{{2}}'} has been confirmed!</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-white">Shipping Update</span>
                    <Badge variant="outline" className="text-[10px]">Approved</Badge>
                  </div>
                  <p className="text-xs text-zinc-400">Your order {'#{{1}}'} is on the way. Track here: {'{{2}}'}</p>
                </div>
                <Button variant="outline" className="w-full border-zinc-800 text-zinc-400">
                  Sync with Twilio Console
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
