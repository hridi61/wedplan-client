import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-secondary text-secondary-foreground",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-red-100 text-red-800",
      neutral: "bg-slate-100 text-slate-700",
      gold: "bg-accent text-accent-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export const Badge = ({ className, variant, ...props }) => <span className={cn(badgeVariants({ variant }), className)} {...props} />;

const map = {
  pending: "warning", approved: "success", accepted: "success", paid: "success",
  rejected: "danger", failed: "danger", cancelled: "neutral", blocked: "danger", active: "success",
};
export const StatusBadge = ({ status }) => (
  <Badge variant={map[status] || "default"} className="capitalize">{status}</Badge>
);
