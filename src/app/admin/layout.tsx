'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Globe,
  Tag,
  Megaphone
} from 'lucide-react';
import Link from 'next/link';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/admin/inventory', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'CMS', href: '/admin/cms', icon: Globe },
  { name: 'SEO', href: '/admin/seo', icon: Tag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/auth');
        return;
      }

      const role = user.user_metadata?.role;
      if (role !== 'admin') {
        router.push('/');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-black text-white font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold">
              KN
            </div>
            <span className="text-xl font-bold tracking-tight">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-black p-8">
        {children}
      </main>
    </div>
  );
}
