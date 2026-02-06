"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  CreditCard, 
  LogOut,
  ChevronRight,
  ShoppingBag,
  Truck,
  Clock,
  Star,
  Phone,
  Mail,
  Calendar,
  Shield,
  Award
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User as UserType, Order, Address } from "@/types";

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
  savedAddresses: number;
  wishlistItems: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items?: any[];
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    savedAddresses: 0,
    wishlistItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/auth?redirect=/account');
        return;
      }

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Use auth user data if no profile exists
      const profileData = (userData || {
        id: authUser.id,
        email: authUser.email || '',
        first_name: authUser.user_metadata?.first_name || '',
        last_name: authUser.user_metadata?.last_name || '',
        phone: authUser.user_metadata?.phone || '',
        role: 'customer' as const,
        created_at: authUser.created_at || '',
        updated_at: authUser.updated_at,
      }) as UserType;

      setUser(profileData);

      // Fetch dashboard stats
      await Promise.all([
        fetchUserStats(authUser.id),
        fetchRecentOrders(authUser.id),
      ]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      // Fetch orders count and stats
      const { data: orders } = await supabase
        .from("orders")
        .select("status, total_amount")
        .eq("user_id", userId);

      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + ((order as any).total_amount || 0), 0) || 0;
      const pendingOrders = orders?.filter(order => 
        ['pending', 'confirmed', 'processing'].includes((order as any).status)
      ).length || 0;
      const completedOrders = orders?.filter(order => 
        ['delivered'].includes((order as any).status)
      ).length || 0;

      // Fetch addresses count
      const { count: addressCount } = await supabase
        .from("addresses")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId);

      // Fetch wishlist count
      const { count: wishlistCount } = await supabase
        .from("wishlists")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId);

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        completedOrders,
        savedAddresses: addressCount || 0,
        wishlistItems: wishlistCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentOrders = async (userId: string) => {
    try {
      const { data: orders } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product_variants (
              *,
              products (
                name,
                images
              )
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentOrders(orders || []);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-organic-200 border-t-organic-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <User className="h-16 w-16 mx-auto text-earth-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <Button onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-earth-600">
          <Link href="/" className="hover:text-earth-900">Home</Link>
          <span>/</span>
          <span>My Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              {/* User Profile */}
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-4 bg-organic-100">
                  <AvatarFallback className="text-organic-600 text-xl font-semibold">
                    {getInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold text-earth-900">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-sm text-earth-600">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-earth-600">{user.phone}</p>
                )}
                <Badge variant="outline" className="mt-2">
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <Separator className="my-4" />

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <Link href="/account" className="flex items-center justify-between p-2 rounded-lg bg-organic-50 text-organic-700">
                  <span className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    Dashboard
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                
                <Link href="/account/orders" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-earth-700">
                  <span className="flex items-center gap-3">
                    <Package className="h-4 w-4" />
                    My Orders
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                
                <Link href="/account/addresses" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-earth-700">
                  <span className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" />
                    Addresses
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                
                <Link href="/account/wishlist" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-earth-700">
                  <span className="flex items-center gap-3">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                
                <Link href="/account/profile" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-earth-700">
                  <span className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </nav>

              <Separator className="my-4" />

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back, {user.first_name}! 👋</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-earth-600">
                Manage your orders, update your profile, and track your purchases all in one place.
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                <div className="text-2xl font-bold text-earth-900">{stats.totalOrders}</div>
                <div className="text-sm text-earth-600">Total Orders</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                <div className="text-2xl font-bold text-earth-900">₹{stats.totalSpent.toFixed(0)}</div>
                <div className="text-sm text-earth-600">Total Spent</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                <div className="text-2xl font-bold text-earth-900">{stats.pendingOrders}</div>
                <div className="text-sm text-earth-600">Pending Orders</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                <div className="text-2xl font-bold text-earth-900">{stats.completedOrders}</div>
                <div className="text-sm text-earth-600">Completed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                <div className="text-2xl font-bold text-earth-900">{stats.savedAddresses}</div>
                <div className="text-sm text-earth-600">Addresses</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-organic-600" />
                <div className="text-2xl font-bold text-earth-900">{stats.wishlistItems}</div>
                <div className="text-sm text-earth-600">Wishlist</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/account/orders">
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-earth-300 mb-4" />
                  <h3 className="text-lg font-medium text-earth-900 mb-2">No orders yet</h3>
                  <p className="text-earth-600 mb-4">Start shopping to see your orders here!</p>
                  <Link href="/shop">
                    <Button className="bg-organic-500 hover:bg-organic-600">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-earth-900">Order #{order.order_number}</p>
                          <p className="text-sm text-earth-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-earth-600">
                            {order.order_items?.length || 0} items
                          </span>
                          <span className="font-semibold text-organic-600">
                            ₹{order.total_amount?.toFixed(2)}
                          </span>
                        </div>
                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/shop">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/account/addresses">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </Link>
                <Link href="/account/wishlist">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    View Wishlist
                  </Button>
                </Link>
                <Link href="/track-order">
                  <Button variant="outline" className="w-full justify-start">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}