"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox, Empty } from "@/components/ui/states";
import { PageHeader } from "@/components/dashboard-bits";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/navbar";
import { cn, formatDate } from "@/lib/utils";

const TABS = ["all", "pending", "accepted", "rejected", "cancelled"];

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/vendor/bookings");
  const [tab, setTab] = useState("all");
  const [working, setWorking] = useState(null);

  async function act(b, status) {
    setWorking(b.id + status);
    try {
      await api(`/api/vendor/bookings/${b.id}`, { method: "PATCH", body: { status } });
      toast.success(`Request ${status}`);
    } catch (e) { toast.error(e.message); }
    setWorking(null);
    reload();
  }

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const items = data.items.filter((b) => tab === "all" || b.status === tab);

  return (
    <>
      <PageHeader title="Booking requests" description="Accept or reject requests from customers. A decision cannot be changed afterwards." />
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-full border px-4 py-1.5 text-sm capitalize", tab === t ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}>{t}</button>)}
      </div>
      {items.length === 0 ? <Empty title="No requests here" description="Requests for your services will show up in this list." /> : (
        <div className="space-y-4">
          {items.map((b) => (
            <Card key={b.id} className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{b.service?.serviceName || "Deleted service"}</p>
                  <p className="text-xs text-muted-foreground">Requested {formatDate(b.createdAt)}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center gap-3">
                <Avatar user={b.customer} size={36} />
                <div className="text-sm">
                  <p className="font-medium">{b.customer?.name || "Customer"}</p>
                  <p className="flex flex-wrap gap-x-3 text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{b.customer?.email}</span>
                    {b.customer?.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{b.customer.phone}</span>}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(b.eventDate)}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{b.eventLocation}</span>
              </div>
              {b.message && <p className="rounded-md bg-secondary/60 p-3 text-sm">{b.message}</p>}
              {b.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" loading={working === b.id + "accepted"} disabled={!!working} onClick={() => act(b, "accepted")}>Accept</Button>
                  <Button size="sm" variant="outline" loading={working === b.id + "rejected"} disabled={!!working} onClick={() => act(b, "rejected")}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
