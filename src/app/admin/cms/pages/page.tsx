'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Globe, ExternalLink, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const CORE_PAGES = [
  { title: 'About Us', slug: 'about', status: 'published' },
  { title: 'Contact Us', slug: 'contact', status: 'published' },
  { title: 'For Crop Champions', slug: 'for-crop-champions', status: 'published' },
  { title: 'For Pond Champions', slug: 'for-pond-champions', status: 'published' },
];

export default function CMSPagesAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Content Pages</h1>
        <Button>
          <Globe className="mr-2 h-4 w-4" />
          Create New Landing Page
        </Button>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Core Website Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Page Title</TableHead>
                <TableHead className="text-zinc-400">Slug</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CORE_PAGES.map((page) => (
                <TableRow key={page.slug} className="border-zinc-800">
                  <TableCell className="text-white font-medium">{page.title}</TableCell>
                  <TableCell className="text-zinc-400 font-mono text-xs">/{page.slug}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-green-500 text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Published
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white">
                        <Link href={`/${page.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
