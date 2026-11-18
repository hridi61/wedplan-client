"use client";
import { Card } from "./ui/card";

export const PageHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);

export const StatCard = ({ label, value, icon: Icon, hint }) => (
  <Card className="flex items-center gap-4 p-5">
    {Icon && <span className="rounded-full bg-secondary p-3 text-primary"><Icon className="h-5 w-5" /></span>}
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold capitalize">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  </Card>
);

export const StatGrid = ({ children }) => <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
