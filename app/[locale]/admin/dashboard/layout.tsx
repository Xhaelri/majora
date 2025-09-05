"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/tailwind-utils";

const sidebarItems = [
  { name: "Overview", href: "/admin/dashboard" },
  { name: "Products", href: "/admin/dashboard/products" },
  { name: "Categories", href: "/admin/dashboard/categories" },
  { name: "Variants", href: "/admin/dashboard/variants" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container flex w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-6">Admin</h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100",
                pathname === item.href
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
