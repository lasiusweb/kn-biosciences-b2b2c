// src/app/admin/zoho/layout.tsx
import { notFound } from "next/navigation";
import { getUserRole } from "@/lib/auth/user-management"; // Assuming this exists or will be created
import AdminLayout from "@/components/layout/admin-layout"; // Assuming this exists

export default async function ZohoAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRole = await getUserRole(); // Implement this function to get the current user's role

  if (userRole !== "admin" && userRole !== "staff") {
    notFound(); // Only admins and staff can access Zoho admin pages
  }

  const navItems = [
    {
      title: "Sync Logs",
      href: "/admin/zoho/sync-logs",
      icon: "List", // Replace with appropriate icon if needed
    },
    // Add other Zoho-related admin pages here
  ];

  return (
    <AdminLayout navItems={navItems} title="Zoho Integration">
      {children}
    </AdminLayout>
  );
}
