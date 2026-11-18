"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, MapPin, Store } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Loader, ErrorBox } from "@/components/ui/states";
import { ServiceImage } from "@/components/service-card";
import { StatusBadge } from "@/components/ui/badge";
import { formatPrice, today } from "@/lib/utils";

export default function ServiceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data, loading, error, reload } = useFetch(`/api/services/${id}`);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ eventDate: "", eventLocation: "", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return <Loader label="Loading service..." />;
  if (error)
    return (
      <div className="container max-w-xl py-16 text-center">
        <ErrorBox error={error.status === 404 ? { message: "This service does not exist or is no longer available." } : error} onRetry={error.status === 404 ? undefined : reload} />
        <Link href="/services" className={buttonVariants({ variant: "outline", className: "mt-6" })}>Back to services</Link>
      </div>
    );

  const s = data.item;
  const v = s.vendor;
  const user = session?.user;
  const isOwn = user && s.vendorId === user.id;
  const isAdmin = user?.role === "admin";
  const canBook = data.bookable && user?.role === "customer";

  async function submit(e) {
    e.preventDefault();
    if (!form.eventDate || form.eventDate < today()) return toast.error("Choose an event date that is today or later");
    if (form.eventLocation.trim().length < 2) return toast.error("Enter the event location");
    setBusy(true);
    try {
      const res = await api("/api/bookings", { method: "POST", body: { serviceId: s.id, ...form } });
      toast.success(res.message);
      setOpen(false);
      router.push("/dashboard/customer/bookings");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  let note = null;
  if (!data.bookable) note = "This service is not published yet, so it cannot be booked.";
  else if (isOwn) note = "This is your own service. Vendors cannot book their own services.";
  else if (isAdmin) note = "Admins can review this service but cannot submit booking requests.";
  else if (user?.role === "vendor") note = "Booking requests are for customer accounts. Sign in with a customer account to book.";

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ServiceImage src={s.images?.[active]} alt={s.serviceName} category={s.category} className="aspect-[16/10] w-full rounded-lg" />
          {s.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {s.images.map((img, i) => (
                <button key={img} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={`overflow-hidden rounded-md border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                  <ServiceImage src={img} alt="" className="aspect-square w-full" />
                </button>
              ))}
            </div>
          )}
          <h2 className="mt-8 text-xl font-semibold">About this service</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{s.description}</p>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2"><Badge>{s.category}</Badge>{s.status !== "approved" && <StatusBadge status={s.status} />}</div>
            <h1 className="text-3xl font-semibold leading-tight">{s.serviceName}</h1>
            <p className="text-3xl font-semibold text-primary">{formatPrice(s.price)}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{s.location}</p>
            {note ? <p className="rounded-md bg-secondary p-3 text-sm">{note}</p> : null}
            {canBook && <Button size="lg" className="w-full" onClick={() => setOpen(true)}>Request booking</Button>}
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <span className="rounded-full bg-secondary p-3 text-primary"><Store className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Offered by</p>
              <p className="flex items-center gap-1.5 font-semibold">{v?.businessName || v?.name || "Vendor"}{v?.isPremium && <BadgeCheck className="h-4 w-4 text-champagne" aria-label="Premium vendor" />}</p>
              {v?.businessName && <p className="text-sm text-muted-foreground">{v.name}</p>}
            </div>
          </Card>
        </aside>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Request a booking">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Event date" htmlFor="eventDate"><Input id="eventDate" type="date" min={today()} value={form.eventDate} onChange={set("eventDate")} required /></Field>
          <Field label="Event location" htmlFor="eventLocation"><Input id="eventLocation" placeholder="Venue or city" value={form.eventLocation} onChange={set("eventLocation")} required /></Field>
          <Field label="Message to the vendor" htmlFor="message" hint="Optional: guest count, style, budget notes."><Textarea id="message" maxLength={1000} value={form.message} onChange={set("message")} /></Field>
          <Button type="submit" className="w-full" loading={busy}>Send booking request</Button>
        </form>
      </Modal>
    </div>
  );
}
