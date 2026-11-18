"use client";
import Link from "next/link";
import { CalendarHeart, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox } from "@/components/ui/states";
import { PageHeader, StatCard, StatGrid } from "@/components/dashboard-bits";
import { buttonVariants } from "@/components/ui/button";

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/customer/overview");
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Your planning at a glance" description="Where each of your booking requests stands." action={<Link href="/services" className={buttonVariants()}>Browse services</Link>} />
      <StatGrid>
        <StatCard icon={CalendarHeart} label="Total booking requests" value={data.total} />
        <StatCard icon={Clock} label="Pending" value={data.pending} />
        <StatCard icon={CheckCircle2} label="Accepted" value={data.accepted} />
        <StatCard icon={XCircle} label="Rejected" value={data.rejected} />
      </StatGrid>
    </>
  );
}
