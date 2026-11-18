"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard-bits";
import ServiceForm from "@/components/service-form";
import { Card } from "@/components/ui/card";

export default function Page() {
  const router = useRouter();
  async function create(data) {
    try {
      const res = await api("/api/vendor/services", { method: "POST", body: data });
      toast.success(res.message);
      router.push("/dashboard/vendor/services");
    } catch (e) {
      if (e.code === "LIMIT_REACHED") {
        toast.error(e.message, { action: { label: "Upgrade", onClick: () => router.push("/dashboard/vendor/subscription") } });
        return;
      }
      throw e;
    }
  }
  return (
    <>
      <PageHeader title="Add a service" description="New services stay Pending until an admin approves them." />
      <Card className="max-w-2xl p-6"><ServiceForm onSubmit={create} submitLabel="Submit for approval" /></Card>
    </>
  );
}
