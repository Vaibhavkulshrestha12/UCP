import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Panel({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn("panel panel-blur border border-white/5", className)}>{children}</section>;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] uppercase tracking-[0.28em] text-zinc-400", className)}>
      {children}
    </p>
  );
}

export function DisplayValue({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-display text-4xl font-bold uppercase tracking-tight text-white", className)}>
      {children}
    </p>
  );
}
