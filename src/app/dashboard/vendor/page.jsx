"use client";
import Link from "next/link";
import { Store, CheckCircle2, Inbox, CalendarCheck, Crown } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox } from "@/components/ui/states";
import { PageHeader, StatCard, StatGrid } from "@/components/dashboard-bits";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/vendor/overview");
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Vendor overview" description="A snapshot of your services and booking requests." />
      <StatGrid>
        <StatCard icon={Store} label="Total services" value={data.totalServices} />
        <StatCard icon={CheckCircle2} label="Active services" value={data.activeServices} hint="Approved and available" />
        <StatCard icon={Inbox} label="Pending booking requests" value={data.pendingRequests} />
        <StatCard icon={CalendarCheck} label="Accepted bookings" value={data.acceptedBookings} />
        <StatCard icon={Crown} label="Current plan" value={data.plan} hint={data.plan === "premium" && data.subscriptionExpiresAt ? `Renews or ends ${formatDate(data.subscriptionExpiresAt)}` : "Up to 3 active services"} />
      </StatGrid>
      {data.pendingRequests > 0 && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
          <p>You have <strong>{data.pendingRequests}</strong> request{data.pendingRequests > 1 ? "s" : ""} waiting for a reply.</p>
          <Link href="/dashboard/vendor/bookings" className={buttonVariants()}>Review requests</Link>
        </Card>
      )}
    </>
  );
}
