import { AppShell } from "@/components/app-shell/app-shell";
import { DisplayValue, Eyebrow, Panel } from "@/components/cards/primitives";
import { Heatmap } from "@/components/charts/heatmap";
import { getPlatformData } from "@/lib/page-data";

export default async function CodeforcesPage() {
  const data = await getPlatformData("CODEFORCES");
  const hero = (data.snapshotMap.hero ?? {}) as {
    rating?: number;
    badge?: string;
    nextRank?: string;
    toGo?: number;
  };
  const history = ((data.snapshotMap["rating-history"] ?? []) as Array<{
    contestId: number;
    contestName: string;
    rank: number;
    newRating: number;
    oldRating: number;
  }>).slice(-6).reverse();

  return (
    <AppShell pathname="/codeforces">
      <div className="mx-auto max-w-[1280px] space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Panel className="p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <Eyebrow>Global Rating</Eyebrow>
                <div className="mt-4 flex items-center gap-4">
                  <DisplayValue>{hero.rating ?? 0}</DisplayValue>
                  <p className="text-3xl text-orange-400">CF</p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <span className="bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                    {hero.badge ?? "Unrated"}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {data.account?.handle ?? "No handle linked"}
                  </span>
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  <span>Next: {hero.nextRank ?? "Max"}</span>
                  <span>{hero.toGo ?? 0} to go</span>
                </div>
                <div className="h-0.5 bg-white/5">
                  <div
                    className="h-0.5 bg-white"
                    style={{ width: `${Math.max(10, 100 - Math.min(hero.toGo ?? 100, 100))}%` }}
                  />
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                  Synced from official Codeforces rating history
                </p>
              </div>
            </div>

            <div className="mt-16">
              <div className="mb-6 flex items-center justify-between">
                <Eyebrow>Submission Pulse</Eyebrow>
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">Recent Sync</p>
              </div>
              <Heatmap
                rows={3}
                columns={12}
                active={data.heatmapActive}
              />
            </div>
          </Panel>

          <div className="space-y-4">
            <Eyebrow>Upcoming Contests</Eyebrow>
            {data.contests.slice(0, 2).map((contest, index) => (
              <Panel
                key={contest.id}
                className={index === 0 ? "border-l-2 border-l-orange-500 px-6 py-6" : "px-6 py-6 opacity-60"}
              >
                <Eyebrow>{contest.title}</Eyebrow>
                <p className="mt-4 text-2xl">{contest.startsAtUtc.toLocaleString()}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {contest.durationMins} minutes
                </p>
              </Panel>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <Eyebrow>Recent Performance</Eyebrow>
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">View Archive</p>
          </div>

          <Panel className="overflow-hidden">
            <table className="min-w-full text-left">
              <thead className="bg-white/5">
                <tr className="text-[9px] uppercase tracking-[0.24em] text-zinc-400">
                  <th className="px-8 py-5">Event</th>
                  <th className="px-8 py-5">Rank</th>
                  <th className="px-8 py-5">Solved</th>
                  <th className="px-8 py-5">Delta</th>
                  <th className="px-8 py-5">Rating</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const delta = entry.newRating - entry.oldRating;

                  return (
                    <tr key={entry.contestId} className="border-t border-white/5">
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium">{entry.contestName}</p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          Contest #{entry.contestId}
                        </p>
                      </td>
                      <td className="px-8 py-6">#{entry.rank}</td>
                      <td className="px-8 py-6">Tracked</td>
                      <td className={`px-8 py-6 ${delta >= 0 ? "text-white" : "text-red-500"}`}>
                        {delta >= 0 ? `+${delta}` : delta}
                      </td>
                      <td className="px-8 py-6">{entry.newRating}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
