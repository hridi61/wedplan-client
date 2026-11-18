"use client";
import { Users, Store, Heart, ClipboardList, Hourglass, Receipt } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Loader, ErrorBox } from "@/components/ui/states";
import { PageHeader, StatCard, StatGrid } from "@/components/dashboard-bits";

export default function Page() {
  const { data, loading, error, reload } = useFetch("/api/admin/overview");
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <>
      <PageHeader title="Admin overview" description="Platform activity at a glance." />
      <StatGrid>
        <StatCard icon={Users} label="Registered users" value={data.totalUsers} />
        <StatCard icon={Store} label="Vendors" value={data.totalVendors} />
        <StatCard icon={Heart} label="Customers" value={data.totalCustomers} />
        <StatCard icon={ClipboardList} label="Total services" value={data.totalServices} />
        <StatCard icon={Hourglass} label="Pending services" value={data.pendingServices} hint="Waiting for review" />
        <StatCard icon={Receipt} label="Transactions" value={data.totalTransactions} />
      </StatGrid>
    </>
  );
}
