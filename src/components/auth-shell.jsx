import { Card } from "./ui/card";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="container flex min-h-[calc(100vh-16rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </Card>
    </div>
  );
}

export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9a6 6 0 1 1 0-12c1.9 0 3.1.8 3.8 1.5l2.6-2.5A9.6 9.6 0 0 0 12 2.4a9.6 9.6 0 1 0 0 19.2c5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1.1-.2-1.6z" />
  </svg>
);
