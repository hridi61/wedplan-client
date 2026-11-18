"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Eye, Check, X, Trash2, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { CATEGORIES } from "@/lib/constants";
import { Loader, ErrorBox, Empty } from "@/components/ui/states";
import { PageHeader } from "@/components/dashboard-bits";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/modal";
import { ServiceImage } from "@/components/service-card";
import { formatPrice } from "@/lib/utils";

export default function Page() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  useEffect(() => { const t = setTimeout(() => setDq(q), 350); return () => clearTimeout(t); }, [q]);

  const qs = new URLSearchParams({ ...(dq && { q: dq }), ...(status && { status }), ...(category && { category }) });
  const { data, loading, error, reload } = useFetch(`/api/admin/services?${qs}`);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  async function setState(s, next) {
    try {
      const res = await api(`/api/admin/services/${s.id}/status`, { method: "PATCH", body: { status: next } });
      toast.success(res.message);
      reload();
    } catch (e) { toast.error(e.message); }
  }
  async function remove() {
    setBusy(true);
    try { await api(`/api/admin/services/${deleting.id}`, { method: "DELETE" }); toast.success("Service deleted"); reload(); }
    catch (e) { toast.error(e.message); }
    setBusy(false);
    setDeleting(null);
  }

  return (
    <>
      <PageHeader title="Manage services" description="Review pending services and keep the public listing clean." />
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_240px]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search services" className="pl-9" placeholder="Search by service name" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></Select>
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</Select>
      </div>
      {loading ? <Loader /> : error ? <ErrorBox error={error} onRetry={reload} /> : data.items.length === 0 ? <Empty title="No services match" description="Change the filters to see other services." /> : (
        <div className="space-y-4">
          {data.items.map((s) => (
            <Card key={s.id} className="flex flex-col gap-4 p-4 sm:flex-row">
              <ServiceImage src={s.images?.[0]} category={s.category} alt="" className="h-36 w-full rounded-md sm:h-28 sm:w-40" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-sans text-lg font-semibold">{s.serviceName}</h2>
                  <StatusBadge status={s.status} />
                  {s.isActive === false && <Badge variant="neutral">Paused by vendor</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{s.category} &middot; {s.location} &middot; {formatPrice(s.price)} &middot; by {s.vendor?.businessName || s.vendor?.name || "Unknown"}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/services/${s.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Eye className="h-4 w-4" />View</Link>
                  {s.status !== "approved" && <Button size="sm" onClick={() => setState(s, "approved")}><Check className="h-4 w-4" />Approve</Button>}
                  {s.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setState(s, "rejected")}><X className="h-4 w-4" />Reject</Button>}
                  {s.status !== "pending" && <Button size="sm" variant="outline" onClick={() => setState(s, "pending")}><RotateCcw className="h-4 w-4" />Move to pending</Button>}
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeleting(s)}><Trash2 className="h-4 w-4" />Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} destructive title="Delete this service?" message={`"${deleting?.serviceName}" will be removed for good. Use Reject instead if the vendor should be able to fix it.`} confirmLabel="Delete service" />
    </>
  );
}
