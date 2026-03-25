import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/app-shell/logo-mark";

export function MarketingHero() {
  return (
    <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-4">
        <div className="rounded-full border border-white/10 bg-white/5 p-2">
          <LogoMark className="h-10 w-10" />
        </div>
        <p className="font-display text-xl font-bold uppercase tracking-tight">UNIFIED CODING PLATFORM</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-zinc-500">
            Unified Coding Platform
          </p>
          <h1 className="font-display text-6xl font-bold uppercase leading-none tracking-tight text-white md:text-8xl">
            Competitive Intelligence, Centralized.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300">
            Track LeetCode, Codeforces, and AtCoder in one system. Get streak risk alerts,
            contest schedules, daily challenge status, and platform analytics in the same
            operational surface.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-3 bg-white px-6 text-sm font-extrabold uppercase tracking-[0.28em] text-black"
            >
              Enter UCP
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center border border-white/15 px-6 text-sm font-bold uppercase tracking-[0.22em] text-white"
            >
              Preview System
            </Link>
          </div>
        </div>

        <div className="panel relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative space-y-6">
            <div className="border-b border-white/10 pb-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Signal Stack</p>
              <p className="mt-3 text-5xl font-bold tracking-tight">3 Platforms</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Streak Risk</p>
                <p className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-red-500">
                  12 DAYS
                </p>
              </div>
              <div className="border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Next Contest</p>
                <p className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-yellow-400">
                  14 HOURS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
