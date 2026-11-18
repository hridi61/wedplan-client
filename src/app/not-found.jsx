import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-serif text-6xl text-primary">404</p>
      <h1 className="text-2xl font-semibold">We could not find that page</h1>
      <p className="max-w-md text-muted-foreground">The link may be broken or the page may have moved. Head back and keep planning.</p>
      <div className="flex gap-2">
        <Link href="/" className={buttonVariants()}>Go home</Link>
        <Link href="/services" className={buttonVariants({ variant: "outline" })}>Browse services</Link>
      </div>
    </div>
  );
}
