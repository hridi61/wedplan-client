"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Empty, ErrorBox } from "@/components/ui/states";
import { ServiceCard, ServiceGridSkeleton } from "@/components/service-card";
import { useFetch } from "@/hooks/use-fetch";
import { CATEGORIES } from "@/lib/constants";

export default function BrowseClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const page = params.get("page") || "1";

  const update = (patch) => {
    const next = new URLSearchParams(params.toString());
    Object.entries({ page: "1", ...patch }).forEach(([k, v]) => (v && v !== "newest" && !(k === "page" && v === "1") ? next.set(k, v) : next.delete(k)));
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  // Debounce the text inputs so we do not call the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== (params.get("q") || "") || location !== (params.get("location") || "")) update({ q, location, category, sort });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location]);

  const qs = new URLSearchParams({ ...(params.get("q") && { q: params.get("q") }), ...(params.get("location") && { location: params.get("location") }), ...(category && { category }), sort, page, limit: "9" });
  const { data, loading, error, reload } = useFetch(`/api/services?${qs}`, { auth: false });
  const hasFilters = q || location || category || sort !== "newest";
  const clear = () => { setQ(""); setLocation(""); router.replace(pathname, { scroll: false }); };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">Browse wedding services</h1>
      <p className="mt-2 text-muted-foreground">Search, filter and sort approved services from vendors near you.</p>

      <div className="mt-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2 lg:grid-cols-[2fr_1.4fr_1.4fr_1.2fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Search services" className="pl-9" placeholder="Search by service name" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select aria-label="Category" value={category} onChange={(e) => update({ q, location, category: e.target.value, sort })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
        </Select>
        <Input aria-label="Location" placeholder="Location, e.g. Dhaka" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Select aria-label="Sort by price" value={sort} onChange={(e) => update({ q, location, category, sort: e.target.value })}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
        {hasFilters && <Button variant="ghost" onClick={clear}><X className="h-4 w-4" />Clear</Button>}
      </div>

      <div className="mt-8">
        {loading ? <ServiceGridSkeleton count={6} /> : error ? <ErrorBox error={error} onRetry={reload} /> : data.items.length === 0 ? (
          <Empty title="No services match your search" description="Try a different keyword, another location, or clear the filters." action={hasFilters && <Button variant="outline" onClick={clear}>Clear filters</Button>} />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{data.total} service{data.total === 1 ? "" : "s"} found</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((s) => <ServiceCard key={s.id} service={s} />)}</div>
            {data.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={data.page <= 1} onClick={() => update({ q, location, category, sort, page: String(data.page - 1) })}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {data.page} of {data.pages}</span>
                <Button variant="outline" disabled={data.page >= data.pages} onClick={() => update({ q, location, category, sort, page: String(data.page + 1) })}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
