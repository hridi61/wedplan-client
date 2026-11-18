"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import { Button, buttonVariants } from "./ui/button";
import { Skeleton } from "./ui/states";
import { cn } from "@/lib/utils";

export const Logo = ({ light }) => (
  <Link href="/" className={cn("flex items-center gap-2 font-serif text-2xl font-semibold", light ? "text-white" : "text-primary")}>
    <span aria-hidden className="relative inline-block h-6 w-9">
      <span className="absolute left-0 top-0 h-6 w-6 rounded-full border-2 border-current" />
      <span className="absolute left-3 top-0 h-6 w-6 rounded-full border-2 border-champagne" />
    </span>
    WedPlan
  </Link>
);

export function Avatar({ user, size = 36 }) {
  const initial = (user?.name || "?").charAt(0).toUpperCase();
  return user?.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.image} alt="" width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground" style={{ width: size, height: size }}>
      {initial}
    </span>
  );
}

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const user = session?.user;

  useEffect(() => { setMenu(false); setOpen(false); }, [pathname]);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function logout() {
    await authClient.signOut();
    clearToken();
    toast.success("You have been signed out");
    router.push("/");
  }

  const links = [{ href: "/", label: "Home" }, { href: "/services", label: "Browse Services" }];
  const active = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary", active(l.href) && "bg-secondary text-primary")}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isPending ? (
            <Skeleton className="h-9 w-24" />
          ) : user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 hover:bg-secondary" aria-haspopup="menu" aria-expanded={open}>
                <Avatar user={user} size={30} />
                <span className="hidden max-w-[110px] truncate text-sm font-medium sm:block">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {open && (
                <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border bg-card shadow-lg">
                  <div className="flex items-center gap-3 border-b p-4">
                    <Avatar user={user} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs capitalize text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                  <Link role="menuitem" href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
                  <Link role="menuitem" href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"><UserCog className="h-4 w-4" />Profile Settings</Link>
                  <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-sm text-destructive hover:bg-secondary"><LogOut className="h-4 w-4" />Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/signin" className={buttonVariants({ variant: "ghost" })}>Sign In</Link>
              <Link href="/signup" className={buttonVariants()}>Sign Up</Link>
            </div>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenu((m) => !m)} aria-label="Toggle menu">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menu && (
        <nav className="border-t bg-background p-4 md:hidden" aria-label="Mobile">
          <div className="container flex flex-col gap-1 p-0">
            {links.map((l) => <Link key={l.href} href={l.href} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">{l.label}</Link>)}
            {!user && !isPending && (
              <>
                <Link href="/signin" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">Sign In</Link>
                <Link href="/signup" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
