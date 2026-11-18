"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox, Empty } from "@/components/ui/states";
import { PageHeader } from "@/components/dashboard-bits";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { ServiceImage } from "@/components/service-card";
import { formatDate, formatPrice } from "@/lib/utils";

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/customer/bookings");
  const [view, setView] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState(false);

  async function cancel() {
    setBusy(true);
    try {
      const res = await api(`/api/customer/bookings/${cancelling.id}/cancel`, { method: "PATCH" });
      toast.success(res.message);
    } catch (e) { toast.error(e.message); }
    setBusy(false);
    setCancelling(null);
    reload();
  }

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="My bookings" description="You can cancel a request while it is still pending." />
      {data.items.length === 0 ? (
        <Empty title="No booking requests yet" description="Find a service you like and send your first request." action={<Link href="/services" className={buttonVariants()}>Browse services</Link>} />
      ) : (
        <div className="space-y-4">
          {data.items.map((b) => (
            <Card key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row">
              <ServiceImage src={b.service?.images?.[0]} category={b.service?.category} alt="" className="h-36 w-full rounded-md sm:h-28 sm:w-40" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-sans text-lg font-semibold">{b.service?.serviceName || "Service no longer available"}</h2>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-sm text-muted-foreground">Vendor: {b.vendor?.businessName || b.vendor?.name || "Unknown"}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(b.eventDate)}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{b.eventLocation}</span>
                </div>
                <p className="text-xs text-muted-foreground">Requested on {formatDate(b.createdAt)}</p>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setView(b)}>View details</Button>
                  {b.status === "pending" && <Button variant="outline" size="sm" className="text-destructive" onClick={() => setCancelling(b)}>Cancel request</Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!view} onClose={() => setView(null)} title="Booking details">
        {view && (
          <dl className="space-y-3 text-sm">
            {[
              ["Service", view.service?.serviceName || "No longer available"],
              ["Category", view.service?.category || "-"],
              ["Starting price", view.service ? formatPrice(view.service.price) : "-"],
              ["Vendor", view.vendor?.businessName || view.vendor?.name || "-"],
              ["Event date", formatDate(view.eventDate)],
              ["Event location", view.eventLocation],
              ["Your message", view.message || "No message"],
              ["Requested on", formatDate(view.createdAt)],
            ].map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="col-span-2 font-medium">{v}</dd></div>)}
            <div className="grid grid-cols-3 gap-2"><dt className="text-muted-foreground">Status</dt><dd className="col-span-2"><StatusBadge status={view.status} /></dd></div>
          </dl>
        )}
      </Modal>
      <ConfirmDialog open={!!cancelling} onClose={() => setCancelling(null)} onConfirm={cancel} loading={busy} destructive title="Cancel this request?" message="The vendor will no longer see this request as pending. You can send a new one later." confirmLabel="Cancel request" />
    </>
  );
}
