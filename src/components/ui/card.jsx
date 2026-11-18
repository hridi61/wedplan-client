import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
);
export const CardHeader = ({ className, ...props }) => <div className={cn("flex flex-col gap-1 p-5", className)} {...props} />;
export const CardTitle = ({ className, ...props }) => <h3 className={cn("text-lg font-semibold", className)} {...props} />;
export const CardContent = ({ className, ...props }) => <div className={cn("p-5 pt-0", className)} {...props} />;
