"use client";
import { Button } from "@/components/ui/button";

export default function Error({ reset }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">The page failed to load. Try again, and if it keeps happening come back in a few minutes.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
