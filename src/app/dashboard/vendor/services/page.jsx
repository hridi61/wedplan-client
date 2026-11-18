"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, Power } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox, Empty } from "@/components/ui/states";
import { PageHeader } from "@/components/dashboard-bits";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { ServiceImage } from "@/components/service-card";
import ServiceForm from "@/components/service-form";
import { formatPrice } from "@/lib/utils";

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/vendor/services");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  async function toggle(s) {
    try {
      await api(`/api/vendor/services/${s.id}`, { method: "PATCH", body: { isActive: !s.isActive } });
      toast.success(s.isActive ? "Service hidden from customers" : "Service is available again");
      reload();
    } catch (e) { toast.error(e.message); }
  }
  async function remove() {
    setBusy(true);
    try {
      await api(`/api/vendor/services/${deleting.id}`, { method: "DELETE" });
      toast.success("Service deleted");
      setDeleting(null);
      reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="My services" description="Edit details, pause availability or remove a service." action={<Link href="/dashboard/vendor/add-service" className={buttonVariants()}>Add service</Link>} />
      {data.items.length === 0 ? (
        <Empty title="You have not added any services" description="Publish your first service to start receiving booking requests." action={<Link href="/dashboard/vendor/add-service" className={buttonVariants()}>Add your first service</Link>} />
      ) : (
        <div className="space-y-4">
          {data.items.map((s) => (
            <Card key={s.id} className="flex flex-col gap-4 p-4 sm:flex-row">
              <ServiceImage src={s.images?.[0]} category={s.category} alt="" className="h-36 w-full rounded-md sm:h-28 sm:w-40" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-sans text-lg font-semibold">{s.serviceName}</h2>
                  <StatusBadge status={s.status} />
                  {s.status === "approved" && !s.isActive && <Badge variant="neutral">Paused</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{s.category} &middot; {s.location} &middot; {formatPrice(s.price)}</p>
                {s.status === "rejected" && <p className="text-sm text-destructive">Rejected by an admin, so customers cannot see it. Edit and resubmit to request another review.</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/services/${s.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Eye className="h-4 w-4" />View</Link>
                  <Button variant="outline" size="sm" onClick={() => setEditing(s)}><Pencil className="h-4 w-4" />Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => toggle(s)}><Power className="h-4 w-4" />{s.isActive ? "Pause" : "Resume"}</Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleting(s)}><Trash2 className="h-4 w-4" />Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit service" className="max-w-2xl">
        {editing && (
          <>
            <p className="mb-4 rounded-md bg-accent p-3 text-sm text-accent-foreground">Saving changes sends the service back for admin approval.</p>
            <ServiceForm initial={editing} submitLabel="Save and resubmit" onSubmit={async (d) => {
              const res = await api(`/api/vendor/services/${editing.id}`, { method: "PATCH", body: d });
              toast.success(res.message); setEditing(null); reload();
            }} />
          </>
        )}
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} destructive title="Delete this service?" message={`"${deleting?.serviceName}" will be removed permanently. This cannot be undone.`} confirmLabel="Delete service" />
    </>
  );
}
