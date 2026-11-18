"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox, Empty } from "@/components/ui/states";
import { PageHeader } from "@/components/dashboard-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/navbar";
import { formatDate } from "@/lib/utils";

export default function Page() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [role, setRole] = useState("");
  useEffect(() => { const t = setTimeout(() => setDq(q), 350); return () => clearTimeout(t); }, [q]);

  const qs = new URLSearchParams({ ...(dq && { q: dq }), ...(role && { role }) });
  const { data, loading, error, reload } = useFetch(`/api/admin/users?${qs}`);
  const [detail, setDetail] = useState(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function openDetail(u) {
    setDetail({ user: u, stats: null });
    try { setDetail(await api(`/api/admin/users/${u.id}`)); } catch (e) { toast.error(e.message); setDetail(null); }
  }
  async function toggleBlock() {
    setBusy(true);
    try {
      const res = await api(`/api/admin/users/${target.id}/block`, { method: "PATCH", body: { isBlocked: !target.isBlocked } });
      toast.success(res.message);
      reload();
    } catch (e) { toast.error(e.message); }
    setBusy(false);
    setTarget(null);
  }

  return (
    <>
      <PageHeader title="Manage users" description="Search accounts, review details and block or unblock users." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search users" className="pl-9" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option><option value="customer">Customers</option><option value="vendor">Vendors</option><option value="admin">Admins</option>
        </Select>
      </div>
      {loading ? <Loader /> : error ? <ErrorBox error={error} onRetry={reload} /> : data.items.length === 0 ? <Empty title="No users found" description="Try a different name, email or role." /> : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-secondary/50 text-muted-foreground"><tr><th className="p-3 font-medium">User</th><th className="p-3 font-medium">Role</th><th className="p-3 font-medium">Joined</th><th className="p-3 font-medium">Status</th><th className="p-3 text-right font-medium">Actions</th></tr></thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3"><div className="flex items-center gap-3"><Avatar user={u} size={34} /><div className="min-w-0"><p className="font-medium">{u.name}</p><p className="truncate text-xs text-muted-foreground">{u.email}</p></div></div></td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{formatDate(u.createdAt)}</td>
                  <td className="p-3">{u.isBlocked ? <Badge variant="danger">Blocked</Badge> : <Badge variant="success">Active</Badge>}</td>
                  <td className="p-3"><div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetail(u)}>Details</Button>
                    {u.role !== "admin" && <Button size="sm" variant={u.isBlocked ? "secondary" : "outline"} className={u.isBlocked ? "" : "text-destructive"} onClick={() => setTarget(u)}>{u.isBlocked ? "Unblock" : "Block"}</Button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="User details">
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3"><Avatar user={detail.user} size={52} /><div><p className="text-base font-semibold">{detail.user.name}</p><p className="text-muted-foreground">{detail.user.email}</p></div></div>
            <dl className="space-y-2">
              {[["Role", detail.user.role], ["Phone", detail.user.phone || "-"], ["Business", detail.user.businessName || "-"], ["Plan", detail.user.role === "vendor" ? detail.user.subscriptionPlan : "-"], ["Joined", formatDate(detail.user.createdAt)], ["Account", detail.user.isBlocked ? "Blocked" : "Active"]].map(([k, v]) => <div key={k} className="grid grid-cols-3"><dt className="text-muted-foreground">{k}</dt><dd className="col-span-2 font-medium capitalize">{v}</dd></div>)}
              {detail.stats ? (
                <>
                  {detail.user.role === "vendor" && <div className="grid grid-cols-3"><dt className="text-muted-foreground">Services</dt><dd className="col-span-2 font-medium">{detail.stats.services}</dd></div>}
                  <div className="grid grid-cols-3"><dt className="text-muted-foreground">Bookings</dt><dd className="col-span-2 font-medium">{detail.user.role === "vendor" ? detail.stats.bookingsAsVendor : detail.stats.bookingsAsCustomer}</dd></div>
                </>
              ) : <p className="text-muted-foreground">Loading activity...</p>}
            </dl>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!target} onClose={() => setTarget(null)} onConfirm={toggleBlock} loading={busy} destructive={!target?.isBlocked} title={target?.isBlocked ? "Unblock this user?" : "Block this user?"} message={target?.isBlocked ? `${target?.name} will be able to use the platform again.` : `${target?.name} will be signed out and lose access to protected features.`} confirmLabel={target?.isBlocked ? "Unblock" : "Block user"} />
    </>
  );
}
