import { Camera, Landmark, Flower2, UtensilsCrossed, Sparkles, Shirt, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Illustrated stand-in used when a service has no photo (or the photo fails to load)
const THEMES = {
  "Photography & Videography": { Icon: Camera, from: "#E9D5E4", to: "#B98BB0", dot: "#fff" },
  "Wedding Venues": { Icon: Landmark, from: "#E6EADF", to: "#9DB09F", dot: "#fff" },
  "Decoration & Florist": { Icon: Flower2, from: "#F6DCE5", to: "#D9809F", dot: "#fff" },
  "Catering Services": { Icon: UtensilsCrossed, from: "#F6E7CC", to: "#D9B070", dot: "#fff" },
  "Makeup & Styling": { Icon: Sparkles, from: "#EBDDF2", to: "#A67BC0", dot: "#fff" },
  "Wedding Fashion": { Icon: Shirt, from: "#DDE6F2", to: "#7C98BC", dot: "#fff" },
};

export default function ArtPlaceholder({ category, className }) {
  const t = THEMES[category] || { Icon: Heart, from: "#F1DCE8", to: "#C58AAA", dot: "#fff" };
  const { Icon } = t;
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", className)} style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} role="img" aria-label={category || "Wedding service"}>
      <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.6" fill={t.dot} /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <circle cx="85%" cy="15%" r="60" fill="none" stroke="#fff" strokeWidth="3" opacity=".7" />
        <circle cx="75%" cy="15%" r="60" fill="none" stroke="#fff" strokeWidth="3" opacity=".7" />
      </svg>
      <span className="relative rounded-full bg-white/70 p-5 text-plum shadow-sm"><Icon className="h-9 w-9" /></span>
    </div>
  );
}
