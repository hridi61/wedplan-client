"use client";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox, Empty } from "@/components/ui/states";
import { PageHeader } from "@/components/dashboard-bits";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/admin/transactions");
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Transactions" description="Read-only records. Statuses change only when Stripe confirms a payment." />
      {data.items.length === 0 ? <Empty title="No transactions yet" description="Subscription payments will appear here." /> : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b bg-secondary/50 text-muted-foreground"><tr><th className="p-3 font-medium">Vendor</th><th className="p-3 font-medium">Plan</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Date</th></tr></thead>
            <tbody>
              {data.items.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3"><p className="font-medium">{t.vendor?.businessName || t.vendor?.name || "Unknown"}</p><p className="text-xs text-muted-foreground">{t.vendor?.email}</p></td>
                  <td className="p-3 capitalize">{t.plan}</td>
                  <td className="p-3">{t.amount} {String(t.currency).toUpperCase()}</td>
                  <td className="p-3"><StatusBadge status={t.status} /></td>
                  <td className="p-3">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
