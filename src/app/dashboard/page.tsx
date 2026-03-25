import Link from "next/link";
import { ArrowRight, Flame, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { ContestCard } from "@/components/cards/contest-card";
import { Panel, Eyebrow } from "@/components/cards/primitives";
import { StatCard } from "@/components/cards/stat-card";
import { Heatmap } from "@/components/charts/heatmap";
import { getDashboardData } from "@/lib/page-data";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const daily = data.dailyChallenge;
  const nextContest = data.contests[0];
  const leetcodeAccount = data.accounts.find((account) => account.platform === "LEETCODE");
  const codeforcesAccount = data.accounts.find((account) => account.platform === "CODEFORCES");
  const atcoderAccount = data.accounts.find((account) => account.platform === "ATCODER");
  const leetcodeHero = (data.heroByPlatform.LEETCODE ?? {}) as {
    solved?: number;
    ranking?: number | null;
    contestRating?: number | null;
  };
  const codeforcesHero = (data.heroByPlatform.CODEFORCES ?? {}) as {
    rating?: number;
    badge?: string;
  };
  const atcoderHero = (data.heroByPlatform.ATCODER ?? {}) as {
    rating?: number;
    globalRank?: string;
  };

  return (
    <AppShell pathname="/dashboard">
      <div className="mx-auto max-w-[1280px] space-y-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="font-display text-5xl font-bold uppercase tracking-tight lg:text-6xl">
              SYSTEM OVERVIEW
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
              Intelligence across your competitive programming ecosystem. Synchronized with
              LeetCode, Codeforces, and AtCoder.
            </p>
          </div>

          <Link
            href={nextContest?.registrationUrl ?? "#"}
            className="panel inline-flex items-center gap-5 px-6 py-5 transition-colors hover:border-yellow-400/40"
          >
            <div className="border border-yellow-400/30 p-4">
              <Search className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <Eyebrow>Next Contest</Eyebrow>
              <p className="mt-2 max-w-[14rem] font-display text-lg font-bold uppercase tracking-tight text-white">
                {nextContest?.title ?? "No upcoming contests"}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                {nextContest?.platform ?? "schedule"} {nextContest ? `| ${nextContest.countdownLabel}` : ""}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {nextContest?.countdownLabel ?? "NO UPCOMING"}
              </p>
            </div>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <StatCard
            title="LeetCode"
            value={`${leetcodeHero.solved ?? 0} Solved`}
            badge={
              <span className="bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-black">
                {leetcodeAccount?.verified ? "Linked" : "Pending"}
              </span>
            }
            meta={
              leetcodeHero.contestRating
                ? `RT ${leetcodeHero.contestRating} | #${leetcodeHero.ranking ?? "N/A"}`
                : leetcodeHero.ranking
                  ? `#${leetcodeHero.ranking}`
                  : "No rank synced"
            }
          >
            <div className="mt-auto border-t border-white/10 pt-6">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                <span>Current Streak</span>
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame className="h-3 w-3" />
                  {data.streak.current} Days
                </span>
              </div>
            </div>
          </StatCard>
          <StatCard
            title="Codeforces"
            value={String(codeforcesHero.rating ?? 0)}
            meta={codeforcesAccount?.verified ? codeforcesHero.badge ?? "Unrated" : "Not linked"}
            badge={
              <span className="border border-white/30 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em]">
                {codeforcesAccount?.verified ? codeforcesHero.badge ?? "Linked" : "Pending"}
              </span>
            }
          >
            <div className="mt-auto flex gap-2 pt-2">
              <div className="h-1 flex-1 bg-white" />
              <div className="h-1 flex-1 bg-white" />
              <div className="h-1 flex-1 bg-white" />
              <div className="h-1 flex-1 bg-white/10" />
              <div className="h-1 flex-1 bg-white/10" />
            </div>
          </StatCard>
          <StatCard
            title="AtCoder"
            value={String(atcoderHero.rating ?? 0)}
            meta={atcoderAccount?.verified ? String(atcoderHero.globalRank ?? "Unranked") : "Not linked"}
          >
            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Level</span>
              <span className="border border-white/10 px-4 py-4 text-[10px] uppercase tracking-[0.2em]">
                {atcoderHero.rating ? `RT ${atcoderHero.rating}` : "No sync"}
              </span>
            </div>
          </StatCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-[288px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Eyebrow>Today&apos;s Status</Eyebrow>
              </div>
              <Panel className="p-8">
                <div className="mb-6 inline-flex border border-yellow-400/30 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-yellow-400">
                  {daily ? "Daily Challenge" : "No Sync Yet"}
                </div>
                <h2 className="font-display text-5xl font-bold uppercase leading-none tracking-tight">
                  {daily?.title ?? "No daily challenge synced"}
                </h2>
                <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  <span className="bg-red-500 px-2 py-1 text-white">{daily?.difficulty ?? "N/A"}</span>
                  <span>Success: {daily?.acceptanceRate ?? "N/A"}</span>
                </div>
                <div className="mt-10 space-y-3">
                  <a
                    href={daily?.url ?? "#"}
                    className={`flex h-14 w-full items-center justify-center gap-3 rounded-sm border text-xs font-extrabold uppercase tracking-[0.22em] no-underline transition-colors ${
                      daily?.url
                        ? "border-yellow-400 bg-yellow-400 text-black hover:bg-yellow-300"
                        : "cursor-not-allowed border-white/10 bg-white/10 text-zinc-500"
                    }`}
                  >
                    Solve Now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Panel>
            </div>

            <Panel className="p-6">
              <Eyebrow>LeetCode Activity</Eyebrow>
              <div className="mt-6">
                <Heatmap
                  rows={data.contributionHeatmap.rows}
                  columns={data.contributionHeatmap.columns}
                  levels={data.contributionHeatmap.levels}
                  monthLabels={data.contributionHeatmap.monthLabels}
                  summary={{
                    totalLabel: `${data.contributionHeatmap.totalSubmissions} submissions in the tracked window`,
                    activeDaysLabel: `Active days: ${data.contributionHeatmap.activeDays}`,
                    peakLabel: `Peak day: ${data.contributionHeatmap.peakDay}`
                  }}
                  className="overflow-x-auto"
                />
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Eyebrow>Upcoming Contests</Eyebrow>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Schedule</p>
            </div>
            <div className="grid gap-4">
              {data.contests.slice(0, 2).map((contest) => (
                <Panel
                  key={contest.id}
                  className="flex items-center justify-between gap-6 px-8 py-8"
                >
                  <Link
                    href={contest.registrationUrl ?? "#"}
                    className="border border-white/10 p-5 transition-colors hover:border-yellow-400/40"
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </Link>
                  <div className="flex-1">
                    <div className="mb-3 flex gap-3">
                      <span className="border border-white/20 px-2 py-1 text-[9px] uppercase tracking-[0.16em]">
                        {contest.platform}
                      </span>
                      <span className="bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                        {contest.division ?? contest.difficultyTag ?? "Open"}
                      </span>
                    </div>
                    <h3 className="font-display text-3xl font-bold uppercase tracking-tight">
                      {contest.title}
                    </h3>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      {contest.startsAtUtc.toUTCString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Eyebrow className="text-right">Starts In</Eyebrow>
                    <p className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-yellow-400">
                      {contest.countdownLabel}
                    </p>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {data.contests.map((contest, index) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              cta={index === 0 ? "Enroll Now" : "Details"}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
