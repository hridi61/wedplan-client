import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Payment cancelled" };

export default function Page() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md space-y-4 p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Payment cancelled</h1>
        <p className="text-muted-foreground">No charge was made and your plan has not changed. You can upgrade whenever you are ready.</p>
        <Link href="/dashboard/vendor/subscription" className={buttonVariants({ className: "w-full" })}>Back to subscription</Link>
      </Card>
    </div>
  );
}
