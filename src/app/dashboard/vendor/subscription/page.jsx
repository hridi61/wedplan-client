"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Crown } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox } from "@/components/ui/states";
import { PageHeader } from "@/components/dashboard-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

const FREE = ["Maximum 3 active services", "Basic vendor dashboard", "Booking request management"];
const PREMIUM = ["Unlimited active services", "Premium Vendor badge on your listings", "Everything in Free"];

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/vendor/overview");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function upgrade() {
    setBusy(true);
    try {
      const { url } = await api("/api/payments/checkout", { method: "POST" });
      window.location.href = url;
    } catch (e) { toast.error(e.message); setBusy(false); }
  }
  async function cancel() {
    setBusy(true);
    try {
      const res = await api("/api/payments/cancel-subscription", { method: "POST" });
      toast.success(res.message);
      setConfirm(false);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const premium = data.plan === "premium";

  return (
    <>
      <PageHeader title="Subscription" description="Choose the plan that fits how many services you offer." />
      <div className="grid max-w-3xl gap-5 md:grid-cols-2">
        <Card className={`p-6 ${!premium ? "border-primary" : ""}`}>
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Free</h2>{!premium && <Badge>Current plan</Badge>}</div>
          <p className="mt-2 text-3xl font-semibold">$0</p>
          <ul className="mt-5 space-y-2 text-sm">{FREE.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-sage" />{f}</li>)}</ul>
        </Card>
        <Card className={`p-6 ${premium ? "border-primary" : ""}`}>
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-semibold"><Crown className="h-5 w-5 text-champagne" />Premium</h2>{premium && <Badge variant="gold">Current plan</Badge>}</div>
          <p className="mt-2 text-3xl font-semibold">$19<span className="text-base font-normal text-muted-foreground"> / month</span></p>
          <ul className="mt-5 space-y-2 text-sm">{PREMIUM.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-sage" />{f}</li>)}</ul>
          {premium ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground">Active until {formatDate(data.subscriptionExpiresAt)}.</p>
              <Button variant="outline" onClick={() => setConfirm(true)}>Cancel at period end</Button>
            </div>
          ) : (
            <Button className="mt-6 w-full" loading={busy} onClick={upgrade}>Upgrade to Premium</Button>
          )}
        </Card>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Payments are processed by Stripe. Premium turns on after Stripe confirms your payment.</p>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={cancel} loading={busy} destructive title="Cancel Premium?" message="You keep Premium until the end of the current billing period, then your plan returns to Free." confirmLabel="Cancel subscription" />
    </>
  );
}
