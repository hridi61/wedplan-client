"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Store, PlusCircle, Inbox, Crown, UserCog, CalendarHeart, Users, ClipboardCheck, Receipt, Ban } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { api, clearToken } from "@/lib/api";
import { Loader } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = {
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/services", label: "My Services", icon: Store },
    { href: "/dashboard/vendor/add-service", label: "Add Service", icon: PlusCircle },
    { href: "/dashboard/vendor/bookings", label: "Booking Requests", icon: Inbox },
    { href: "/dashboard/vendor/subscription", label: "Subscription", icon: Crown },
    { href: "/dashboard/vendor/profile", label: "Profile Settings", icon: UserCog },
  ],
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: CalendarHeart },
    { href: "/dashboard/customer/profile", label: "Profile Settings", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/services", label: "Manage Services", icon: ClipboardCheck },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/admin/profile", label: "Profile Settings", icon: UserCog },
  ],
};

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const role = session?.user?.role;
  const isRoot = pathname === "/dashboard";
  const allowed = isRoot || (role && pathname.startsWith(`/dashboard/${role}`));

  useEffect(() => {
    if (isPending) return;
    if (!session) router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
    else if (!allowed) router.replace(`/dashboard/${role}`); // wrong role: bounce to own dashboard
  }, [isPending, session, allowed, role, pathname, router]);

  // The API is the source of truth for blocked accounts
  useEffect(() => {
    if (!session) return;
    api("/api/me").catch((e) => e.code === "BLOCKED" && setBlocked(true));
  }, [session]);

  if (isPending || !session || !allowed) return <Loader label="Opening your dashboard..." />;

  if (blocked)
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Ban className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-semibold">Your account has been blocked</h1>
        <p className="max-w-md text-muted-foreground">You can no longer use dashboards or booking features. Contact hello@wedplan.com if you think this is a mistake.</p>
        <Button onClick={async () => { await authClient.signOut(); clearToken(); router.push("/"); }}>Sign out</Button>
      </div>
    );

  if (isRoot) return <Loader />;
  const items = NAV[role] || [];

  return (
    <div className="container grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 hidden px-3 text-xs font-medium text-muted-foreground lg:block">{role === "admin" ? "Admin" : role === "vendor" ? "Vendor" : "Customer"} dashboard</p>
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-2 lg:flex-col lg:overflow-visible">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium", active ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>
                <Icon className="h-4 w-4" />{label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
