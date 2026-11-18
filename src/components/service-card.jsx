"use client";
import Link from "next/link";
import { useState } from "react";
import { MapPin, BadgeCheck } from "lucide-react";
import ArtPlaceholder from "./art";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import { cn, formatPrice } from "@/lib/utils";

export function ServiceImage({ src, alt, className, category }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <ArtPlaceholder category={category} className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={cn("object-cover", className)} />;
}

export function ServiceCard({ service }) {
  const v = service.vendor;
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <ServiceImage src={service.images?.[0]} alt={service.serviceName} category={service.category} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge>{service.category}</Badge>
          <span className="font-semibold text-primary">{formatPrice(service.price)}</span>
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{service.serviceName}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{service.location}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          by <span className="font-medium text-foreground">{v?.businessName || v?.name || "Vendor"}</span>
          {v?.isPremium && <BadgeCheck className="h-4 w-4 text-champagne" aria-label="Premium vendor" />}
        </p>
        <Link href={`/services/${service.id}`} className={cn(buttonVariants({ variant: "outline" }), "mt-auto")}>View details</Link>
      </div>
    </Card>
  );
}

export function ServiceGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border bg-card">
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
