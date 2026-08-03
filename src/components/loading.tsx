import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingProps = {
  className?: string;
  label?: string;
  fullScreen?: boolean;
};

export function Loading({ className, label = "Loading...", fullScreen = false }: LoadingProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">{content}</div>;
  }

  return content;
}
