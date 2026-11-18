"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import AuthShell, { GoogleIcon } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
  const { data: session } = authClient.useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session?.user && !busy) router.replace(safeRedirect || `/dashboard/${session.user.role}`);
  }, [session, busy, router, safeRedirect]);

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    clearToken();
    const { data, error } = await authClient.signIn.email({ email: form.email, password: form.password });
    if (error) {
      setBusy(false);
      return toast.error(error.message || "Email or password is incorrect");
    }
    toast.success("Welcome back!");
    router.replace(safeRedirect || `/dashboard/${data?.user?.role || "customer"}`);
  }

  async function google() {
    document.cookie = "wp_role=; path=/; max-age=0";
    clearToken();
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: safeRedirect || "/dashboard" });
    if (error) toast.error(error.message || "Google sign-in failed");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your bookings or services." footer={<>New to WedPlan? <Link href="/signup" className="font-medium text-primary hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email}><Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password" htmlFor="password" error={errors.password}><Input id="password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Button type="submit" className="w-full" loading={busy}>Sign in</Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <Button variant="outline" className="w-full" onClick={google}><GoogleIcon />Continue with Google</Button>
    </AuthShell>
  );
}
