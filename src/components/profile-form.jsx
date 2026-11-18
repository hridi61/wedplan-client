"use client";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { uploadImage } from "@/lib/api";
import { Avatar } from "./navbar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Field, Input, Textarea } from "./ui/form";

export default function ProfileForm() {
  const { data } = authClient.useSession();
  const user = data?.user;
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  if (!user) return null;
  const f = form || { name: user.name || "", phone: user.phone || "", bio: user.bio || "", businessName: user.businessName || "" };
  const set = (k) => (e) => setForm({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = "Enter your name";
    if (f.phone && !/^[+\d][\d\s-]{5,19}$/.test(f.phone)) er.phone = "Enter a valid phone number";
    if (user.role === "vendor" && f.businessName.length > 100) er.businessName = "Keep it under 100 characters";
    setErrors(er);
    if (Object.keys(er).length) return;

    setBusy(true);
    try {
      const update = { name: f.name.trim(), phone: f.phone.trim(), bio: f.bio.trim() };
      if (user.role === "vendor") update.businessName = f.businessName.trim();
      if (file) update.image = await uploadImage(file);
      const { error } = await authClient.updateUser(update);
      if (error) throw new Error(error.message || "Could not update your profile");
      setFile(null);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-2xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Avatar user={file ? { ...user, image: URL.createObjectURL(file) } : user} size={64} />
        <div><p className="font-semibold">{user.name}</p><p className="text-sm text-muted-foreground">{user.email} &middot; <span className="capitalize">{user.role}</span></p></div>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name}><Input id="name" value={f.name} onChange={set("name")} /></Field>
        {user.role === "vendor" && <Field label="Business name" htmlFor="businessName" error={errors.businessName}><Input id="businessName" value={f.businessName} onChange={set("businessName")} /></Field>}
        <Field label="Phone" htmlFor="phone" error={errors.phone}><Input id="phone" type="tel" value={f.phone} onChange={set("phone")} /></Field>
        <Field label="About you" htmlFor="bio"><Textarea id="bio" maxLength={500} value={f.bio} onChange={set("bio")} /></Field>
        <Field label="Profile photo" htmlFor="image" hint="JPG or PNG up to 5MB."><Input id="image" type="file" accept="image/*" className="h-auto py-2" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>
        <Button type="submit" loading={busy}>Save changes</Button>
      </form>
    </Card>
  );
}
