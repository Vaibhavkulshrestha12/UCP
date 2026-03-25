import type { ReactNode } from "react";
import { Panel, Eyebrow, DisplayValue } from "@/components/cards/primitives";

export function StatCard({
  title,
  value,
  meta,
  badge,
  children
}: {
  title: string;
  value: string;
  meta?: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Panel className="flex min-h-[294px] flex-col gap-10 px-8 py-8">
      <div className="flex items-start justify-between">
        <Eyebrow>{title}</Eyebrow>
        {badge}
      </div>

      <div className="space-y-4">
        <DisplayValue>{value}</DisplayValue>
        {meta ? <p className="text-sm uppercase tracking-[0.12em] text-zinc-400">{meta}</p> : null}
      </div>

      {children}
    </Panel>
  );
}
