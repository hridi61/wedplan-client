"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader } from "@/components/ui/states";

export default function DashboardRedirect() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  useEffect(() => {
    if (isPending) return;
    router.replace(data?.user ? `/dashboard/${data.user.role}` : "/signin?redirect=/dashboard");
  }, [data, isPending, router]);
  return <Loader />;
}
