"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader } from "@/components/ui/states";

export default function ProfileRedirect() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  useEffect(() => {
    if (isPending) return;
    router.replace(data?.user ? `/dashboard/${data.user.role}/profile` : "/signin?redirect=/profile");
  }, [data, isPending, router]);
  return <Loader />;
}
