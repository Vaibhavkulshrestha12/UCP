import Link from "next/link";
import type { Contest } from "@prisma/client";
import { CalendarDays, Timer } from "lucide-react";
import { Panel, Eyebrow } from "@/components/cards/primitives";
import { formatCountdown } from "@/lib/utils/time";

export function ContestCard({ contest, cta = "Details" }: { contest: Contest; cta?: string }) {
  return (
    <Panel className="flex h-full flex-col justify-between px-6 py-6">
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="border border-white/20 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-zinc-300">
            {contest.slug?.toUpperCase() ?? contest.platform}
          </div>
          <div className="text-right">
            <Eyebrow className="text-right">Countdown</Eyebrow>
            <p className="mt-1 font-display text-2xl uppercase tracking-tight text-zinc-300">
              {formatCountdown(contest.startsAtUtc)}
            </p>
          </div>
        </div>
        <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-tight">
          {contest.title}
        </h3>
        <div className="flex gap-5 text-xs uppercase tracking-[0.16em] text-zinc-400">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            {contest.startsAtUtc.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5" />
            {contest.durationMins}m
          </span>
        </div>
      </div>

      <Link
        href={contest.registrationUrl ?? "#"}
        className="mt-8 inline-flex h-11 items-center justify-center border border-white/20 px-4 text-xs font-bold uppercase tracking-[0.22em] hover:border-white"
      >
        {cta}
      </Link>
    </Panel>
  );
}
