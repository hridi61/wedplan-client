"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function Inner() {
  const sessionId = useSearchParams().get("session_id");
  const [state, setState] = useState({ status: "checking" });

  // The redirect alone never unlocks Premium. We only read what the verified webhook has saved.
  useEffect(() => {
    if (!sessionId) return setState({ status: "missing" });
    let tries = 0, stop = false;
    const poll = async () => {
      try {
        const res = await api(`/api/payments/status?session_id=${encodeURIComponent(sessionId)}`);
        if (stop) return;
        if (res.status === "paid") return setState(res);
        if (res.status === "failed") return setState(res);
      } catch (e) {
        if (e.status === 404) return !stop && setState({ status: "missing" });
      }
      if (++tries >= 15) return !stop && setState({ status: "slow" });
      setTimeout(poll, 2000);
    };
    poll();
    return () => { stop = true; };
  }, [sessionId]);

  const paid = state.status === "paid";
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md space-y-4 p-8 text-center">
        {paid ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /> : state.status === "checking" ? <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /> : null}
        <h1 className="text-2xl font-semibold">
          {paid ? "You are now a Premium vendor" : state.status === "checking" ? "Confirming your payment..." : state.status === "failed" ? "Payment did not go through" : state.status === "slow" ? "Still confirming" : "Payment not found"}
        </h1>
        <p className="text-muted-foreground">
          {paid ? `We received ${state.amount} ${String(state.currency).toUpperCase()}. Unlimited services and the Premium badge are active.`
            : state.status === "checking" ? "This usually takes a few seconds. Please keep this page open."
            : state.status === "slow" ? "Stripe has not confirmed the payment yet. Premium turns on automatically once it does. Check your subscription page in a minute."
            : state.status === "failed" ? "You have not been charged. You can try upgrading again."
            : "We could not find a payment for this link."}
        </p>
        <Link href="/dashboard/vendor/subscription" className={buttonVariants({ className: "w-full" })}>Go to subscription</Link>
      </Card>
    </div>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
