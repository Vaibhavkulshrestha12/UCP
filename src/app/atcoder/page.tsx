import { AppShell } from "@/components/app-shell/app-shell";
import { ContestCard } from "@/components/cards/contest-card";
import { DisplayValue, Eyebrow, Panel } from "@/components/cards/primitives";
import { Heatmap } from "@/components/charts/heatmap";
import { getPlatformData } from "@/lib/page-data";

export default async function AtCoderPage() {
  const data = await getPlatformData("ATCODER");
  const hero = (data.snapshotMap.hero ?? {}) as {
    rating?: number;
    status?: string;
    globalRank?: string;
    highestRating?: number;
    ratedMatches?: number;
    acceptedCount?: number;
    peakRank?: number | null;
  };
  const history = ((data.snapshotMap["rank-history"] ?? []) as Array<{
    ContestName: string;
    Rank: number;
    Rating: number;
    EndTime: number;
    Competed: boolean;
  }>)
    .filter((entry) => entry.Competed)
    .slice(-5)
    .reverse();

  return (
    <AppShell pathname="/atcoder">
      <div className="mx-auto max-w-[1280px] space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
          <Panel className="p-10">
            <div className="flex flex-col justify-between gap-10 lg:flex-row">
              <div>
                <Eyebrow>Performance Index</Eyebrow>
                <h1 className="font-display text-6xl font-bold uppercase tracking-tight">
                  {hero.status ?? "No Rating Synced"}
                </h1>
                <div className="mt-10">
                  <DisplayValue>{hero.globalRank ?? "N/A"}</DisplayValue>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Global Ranking</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="border border-white/10 px-8 py-6">
                  <div className="flex items-end gap-3">
                    <p className="font-display text-5xl font-bold uppercase tracking-tight">
                      {hero.rating ?? 0}
                    </p>
                    <p className="pb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Rating</p>
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    <span>Peak Rating</span>
                    <span>{hero.highestRating ?? hero.rating ?? 0}</span>
                  </div>
                  <div className="h-0.5 bg-white/5">
                    <div
                      className="h-0.5 bg-white"
                      style={{
                        width: `${Math.min(
                          (((hero.rating ?? 0) / Math.max(hero.highestRating ?? hero.rating ?? 1, 1)) * 100),
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-8">
            <Eyebrow>Platform Analytics</Eyebrow>
            <div className="mt-8 space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Solutions</span>
                <span className="font-display text-3xl font-bold tracking-tight">
                  {hero.acceptedCount ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Contests</span>
                <span className="font-display text-3xl font-bold tracking-tight">
                  {hero.ratedMatches ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Peak Rank</span>
                <span className="font-display text-3xl font-bold tracking-tight">
                  {hero.peakRank ? `#${hero.peakRank}` : "N/A"}
                </span>
              </div>
            </div>
            <button className="mt-8 h-12 w-full border border-white/15 text-[10px] font-extrabold uppercase tracking-[0.22em]">
              Access Ledger
            </button>
          </Panel>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <Eyebrow>Pending Challenges</Eyebrow>
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Fortnight Schedule</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {data.contests.map((contest, index) => (
              <ContestCard key={contest.id} contest={contest} cta={index === 0 ? "Enroll Now" : "Details"} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <Eyebrow>Historical Data</Eyebrow>
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Archive</p>
          </div>
          <Panel className="overflow-hidden">
            <table className="min-w-full text-left">
              <thead className="bg-white/5">
                <tr className="text-[9px] uppercase tracking-[0.24em] text-zinc-400">
                  <th className="px-6 py-5">Identifier</th>
                  <th className="px-6 py-5">Position</th>
                  <th className="px-6 py-5">Solution Matrix</th>
                  <th className="px-6 py-5">Rating</th>
                  <th className="px-6 py-5">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={`${entry.ContestName}-${entry.EndTime}`} className="border-t border-white/5">
                    <td className="px-6 py-6 text-sm font-bold uppercase tracking-[0.12em]">
                      {entry.ContestName}
                    </td>
                    <td className="px-6 py-6">#{entry.Rank}</td>
                    <td className="px-6 py-6">COMPETED</td>
                    <td className="px-6 py-6">{entry.Rating}</td>
                    <td className="px-6 py-6 text-zinc-500">
                      {new Date(entry.EndTime * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <Panel className="p-8">
          <div className="flex items-center justify-between">
            <Eyebrow>Activity Signature</Eyebrow>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              <span>Less</span>
              <div className="flex gap-1">
                <span className="h-3 w-3 bg-white/10" />
                <span className="h-3 w-3 bg-emerald-500/40" />
                <span className="h-3 w-3 bg-emerald-500/70" />
                <span className="h-3 w-3 bg-emerald-400" />
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="mt-8">
            <Heatmap
              rows={7}
              columns={34}
              active={data.heatmapActive}
            />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
