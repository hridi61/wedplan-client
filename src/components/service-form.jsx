"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "./ui/button";
import { Field, Input, Select, Textarea } from "./ui/form";

export default function ServiceForm({ initial, onSubmit, submitLabel = "Save service" }) {
  const [form, setForm] = useState({
    serviceName: initial?.serviceName || "",
    category: initial?.category || "",
    description: initial?.description || "",
    price: initial?.price ?? "",
    location: initial?.location || "",
  });
  const [images, setImages] = useState(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function addFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, 5 - images.length);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setImages((cur) => [...cur, ...urls].slice(0, 5));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (form.serviceName.trim().length < 3) er.serviceName = "Enter at least 3 characters";
    if (!form.category) er.category = "Choose a category";
    if (form.description.trim().length < 10) er.description = "Describe the service in at least 10 characters";
    if (!(Number(form.price) > 0)) er.price = "Enter a price above 0";
    if (form.location.trim().length < 2) er.location = "Enter the location";
    if (!images.length) er.images = "Upload at least one image";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await onSubmit({ ...form, price: Number(form.price), images });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Service name" htmlFor="serviceName" error={errors.serviceName}><Input id="serviceName" value={form.serviceName} onChange={set("serviceName")} maxLength={100} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" error={errors.category}>
          <Select id="category" value={form.category} onChange={set("category")}>
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Starting price (USD)" htmlFor="price" error={errors.price}><Input id="price" type="number" min="1" step="1" value={form.price} onChange={set("price")} /></Field>
      </div>
      <Field label="Location" htmlFor="location" error={errors.location}><Input id="location" placeholder="City or area" value={form.location} onChange={set("location")} /></Field>
      <Field label="Description" htmlFor="description" error={errors.description}><Textarea id="description" rows={5} maxLength={2000} value={form.description} onChange={set("description")} /></Field>
      <Field label="Service images" htmlFor="images" error={errors.images} hint="Up to 5 images, 5MB each. The first one is the cover.">
        <Input id="images" type="file" accept="image/*" multiple className="h-auto py-2" disabled={uploading || images.length >= 5} onChange={addFiles} />
      </Field>
      {(images.length > 0 || uploading) && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={src} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Upload ${i + 1}`} className="h-20 w-20 rounded-md object-cover" />
              <button type="button" aria-label="Remove image" onClick={() => setImages(images.filter((x) => x !== src))} className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {uploading && <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-md bg-muted text-xs">Uploading</div>}
        </div>
      )}
      <Button type="submit" loading={busy} disabled={uploading}>{submitLabel}</Button>
    </form>
  );
}
