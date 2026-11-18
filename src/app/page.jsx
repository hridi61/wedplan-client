"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Landmark, Flower2, UtensilsCrossed, Sparkles, Shirt, ShieldCheck, Search, MessageSquareHeart, CalendarCheck, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Empty, ErrorBox } from "@/components/ui/states";
import { ServiceCard, ServiceGridSkeleton } from "@/components/service-card";
import { useFetch } from "@/hooks/use-fetch";
import { CATEGORIES, HERO_PHOTO } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = { Camera, Landmark, Flower2, UtensilsCrossed, Sparkles, Shirt };

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.5 } };

function SectionHead({ title, text }) {
  return (
    <div className="mb-10 max-w-2xl">
      <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function HomePage() {
  const featured = useFetch("/api/services/featured?limit=6", { auth: false });
  const cats = useFetch("/api/services/categories", { auth: false });
  const counts = Object.fromEntries((cats.data?.items || []).map((c) => [c.name, c.count]));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-plum text-white">
        <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${HERO_PHOTO})` }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-plum via-plum/85 to-plum/30" />
        <div className="container grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }} className="max-w-2xl">
            <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-4xl font-semibold leading-[1.1] sm:text-6xl">
              Plan the wedding you pictured, with vendors you can trust
            </motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="mt-6 max-w-xl text-lg text-white/80">
              Compare photographers, venues, florists, caterers and stylists side by side, then send a booking request in a minute.
            </motion.p>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="mt-9 flex flex-wrap gap-3">
              <Link href="/services" className={buttonVariants({ variant: "gold", size: "lg" })}>Explore Wedding Services</Link>
              <Link href="/signup" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/40 bg-transparent text-white hover:bg-white/10")}>List your services</Link>
            </motion.div>
          </motion.div>
          <motion.img src="/hero-art.svg" alt="" aria-hidden initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.25 }} className="mx-auto hidden w-full max-w-md drop-shadow-2xl lg:block" />
        </div>
      </section>

      {/* Featured services */}
      <section className="container pt-20">
        <SectionHead title="Featured wedding services" text="Recently approved services from vendors across the platform." />
        {featured.loading ? <ServiceGridSkeleton /> : featured.error ? (
          <ErrorBox error={featured.error} onRetry={featured.reload} />
        ) : featured.data?.items?.length ? (
          <motion.div {...reveal} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.items.map((s) => <ServiceCard key={s.id} service={s} />)}
          </motion.div>
        ) : <Empty title="No services published yet" description="Approved services will appear here as soon as vendors publish them." />}
      </section>

      {/* Categories */}
      <section className="container pt-20">
        <SectionHead title="Start with what you need first" text="Pick a category to see only the services that fit." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = icons[c.icon];
            return (
              <Link key={c.name} href={`/services?category=${encodeURIComponent(c.name)}`} className="group flex items-start gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-secondary/60">
                <span className="rounded-full bg-secondary p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-6 w-6" /></span>
                <span>
                  <span className="block font-semibold">{c.name}</span>
                  <span className="block text-sm text-muted-foreground">{c.blurb}</span>
                  {cats.data && <span className="mt-1 block text-xs font-medium text-primary">{counts[c.name] || 0} services</span>}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why choose */}
      <section className="mt-20 bg-secondary/60 py-20">
        <div className="container">
          <SectionHead title="Why couples and vendors choose WedPlan" />
          <motion.div {...reveal} className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, t: "Every listing is reviewed", d: "Admins approve each service before it appears, so what you browse is what vendors actually offer." },
              { icon: Wallet, t: "Prices up front", d: "See the starting price and location on every card before you send a single message." },
              { icon: MessageSquareHeart, t: "One request, one answer", d: "Send your date and venue once. The vendor accepts or declines, and you see the result in your dashboard." },
              { icon: CalendarCheck, t: "Built for vendors too", d: "Publish services, manage requests and go Premium to list as many services as you like." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4">
                <Icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div><h3 className="text-lg font-semibold">{t}</h3><p className="mt-1 text-muted-foreground">{d}</p></div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="container pt-20">
        <SectionHead title="How WedPlan works" />
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Search, t: "Find", d: "Search by name, filter by category and location, and sort by price." },
            { icon: CalendarCheck, t: "Request", d: "Pick your event date and location and add a note for the vendor." },
            { icon: MessageSquareHeart, t: "Confirm", d: "Track the status of every request until the vendor accepts." },
          ].map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="rounded-lg border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-xl font-semibold">Step {i + 1}: {t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
