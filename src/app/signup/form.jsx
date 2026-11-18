"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, Store } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearToken, uploadImage } from "@/lib/api";
import AuthShell, { GoogleIcon } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const roles = [
  { value: "customer", label: "Customer", desc: "Find and book services", icon: Heart },
  { value: "vendor", label: "Vendor", desc: "Publish and sell services", icon: Store },
];

export default function SignUpForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (session?.user && !busy) router.replace(`/dashboard/${session.user.role}`);
  }, [session, busy, router]);

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.password.length < 6) e.password = "Use at least 6 characters";
    else if (!/[A-Z]/.test(form.password)) e.password = "Add an uppercase letter";
    else if (!/[a-z]/.test(form.password)) e.password = "Add a lowercase letter";
    if (file && !file.type.startsWith("image/")) e.image = "Choose an image file";
    else if (file && file.size > 5 * 1024 * 1024) e.image = "Image must be smaller than 5MB";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    clearToken();
    const { error } = await authClient.signUp.email({ name: form.name.trim(), email: form.email, password: form.password, role: form.role });
    if (error) {
      setBusy(false);
      return toast.error(error.message || "Could not create your account");
    }
    if (file) {
      try {
        const image = await uploadImage(file);
        await authClient.updateUser({ image });
      } catch (err) {
        toast.warning(`Account created, but the profile photo failed: ${err.message}. You can add it in Profile Settings.`);
      }
    }
    toast.success("Account created. Welcome to WedPlan!");
    router.replace(`/dashboard/${form.role}`);
  }

  async function google() {
    // Role is read by the server when the Google account is created for the first time
    document.cookie = `wp_role=${form.role}; path=/; max-age=600; SameSite=Lax`;
    clearToken();
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    if (error) toast.error(error.message || "Google sign-up failed");
  }

  return (
    <AuthShell title="Create your account" subtitle="Join WedPlan as a customer or a vendor." footer={<>Already registered? <Link href="/signin" className="font-medium text-primary hover:underline">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">I am a</legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ value, label, desc, icon: Icon }) => (
              <label key={value} className={cn("flex cursor-pointer flex-col gap-1 rounded-lg border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring", form.role === value ? "border-primary bg-secondary" : "hover:bg-secondary/50")}>
                <input type="radio" name="role" value={value} checked={form.role === value} onChange={set("role")} className="sr-only" />
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Full name" htmlFor="name" error={errors.name}><Input id="name" autoComplete="name" value={form.name} onChange={set("name")} /></Field>
        <Field label="Email" htmlFor="email" error={errors.email}><Input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} /></Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 6 characters with an uppercase and a lowercase letter."><Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} /></Field>
        <Field label="Profile photo (optional)" htmlFor="image" error={errors.image}><Input id="image" type="file" accept="image/*" className="h-auto py-2" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>
        <Button type="submit" className="w-full" loading={busy}>Create account</Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <Button variant="outline" className="w-full" onClick={google}><GoogleIcon />Sign up with Google as a {form.role}</Button>
    </AuthShell>
  );
}
