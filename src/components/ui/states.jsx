import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-md bg-muted", className)} />;

export const Loader = ({ label = "Loading..." }) => (
  <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground" role="status">
    <Loader2 className="h-5 w-5 animate-spin" /> {label}
  </div>
);

export const ErrorBox = ({ error, onRetry }) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-red-50 p-8 text-center">
    <AlertTriangle className="h-8 w-8 text-destructive" />
    <p className="text-sm text-destructive">{error?.message || "Something went wrong."}</p>
    {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
  </div>
);

export const Empty = ({ title, description, action }) => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-card p-10 text-center">
    <Inbox className="h-8 w-8 text-muted-foreground" />
    <p className="font-medium">{title}</p>
    {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action}
  </div>
);
