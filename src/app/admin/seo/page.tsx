'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Search, Globe, Tag } from 'lucide-react';
import { SEOMetadata } from '@/types/admin';
import { updatePageSEO } from '@/lib/admin-service';

const PAGES = [
  { path: '/', title: 'Home' },
  { path: '/shop', title: 'Shop' },
  { path: '/about', title: 'About Us' },
  { path: '/contact', title: 'Contact' },
  { path: '/knowledge', title: 'Knowledge Center' },
];

export default function SEOAdminPage() {
  const [selectedPage, setSelectedPage] = useState(PAGES[0]);
  const [metadata, setMetadata] = useState<SEOMetadata>({
    title: '',
    description: '',
    keywords: [],
  });
  const [saving, setSaveing] = useState(false);

  const handleSave = async () => {
    setSaveing(true);
    try {
      await updatePageSEO(selectedPage.path, metadata);
      alert('SEO updated successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setSaveing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">SEO Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-950 border-zinc-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white text-lg">Pages</CardTitle>
            <CardDescription className="text-zinc-500">Select a page to edit its metadata</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {PAGES.map((page) => (
                <button
                  key={page.path}
                  onClick={() => setSelectedPage(page)}
                  className={`flex items-center space-x-3 px-6 py-4 text-left border-b border-zinc-800 transition-colors ${selectedPage.path === page.path ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/50'}`}
                >
                  <Globe className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{page.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{page.path}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white text-lg">Metadata for {selectedPage.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-400">SEO Title</Label>
              <Input 
                id="title" 
                value={metadata.title} 
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="bg-black border-zinc-800 text-white" 
                placeholder="Page title for search results"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-400">Meta Description</Label>
              <Textarea 
                id="description" 
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                className="bg-black border-zinc-800 text-white h-24" 
                placeholder="Brief summary of the page content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-zinc-400">Keywords (Comma separated)</Label>
              <Input 
                id="keywords" 
                value={metadata.keywords.join(', ')}
                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value.split(',').map(k => k.trim()) })}
                className="bg-black border-zinc-800 text-white" 
                placeholder="e.g. bio-fertilizer, sustainable farming"
              />
            </div>
            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
