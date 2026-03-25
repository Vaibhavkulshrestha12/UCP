import { AppShell } from "@/components/app-shell/app-shell";
import { Panel, DisplayValue, Eyebrow } from "@/components/cards/primitives";
import { Heatmap } from "@/components/charts/heatmap";
import { getPlatformData } from "@/lib/page-data";

export default async function LeetCodePage() {
  const data = await getPlatformData("LEETCODE");
  const hero = (data.snapshotMap.hero ?? {}) as {
    solved?: number;
    easy?: number;
    medium?: number;
    hard?: number;
    ranking?: number | null;
  };

  return (
    <AppShell pathname="/leetcode">
      <div className="mx-auto max-w-[1280px] space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
          <Panel className="p-8">
            <div className="flex flex-col justify-between gap-10 lg:flex-row">
              <div>
                <Eyebrow>System Performance</Eyebrow>
                <div className="mt-4 flex items-end gap-2">
                  <DisplayValue>{hero.solved ?? 0}</DisplayValue>
                  <p className="pb-2 text-2xl text-zinc-400">Solved</p>
                </div>
              </div>
              <div className="border-l border-white/10 pl-8">
                <p className="font-display text-5xl font-bold uppercase tracking-tight">
                  #{hero.ranking ?? "NA"}
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">Global Ranking</p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {[
                `Easy ${hero.easy ?? 0}`,
                `Medium ${hero.medium ?? 0}`,
                `Hard ${hero.hard ?? 0}`
              ].map((label, index) => (
                <div key={label}>
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    <span>{label.split(" ")[0]}</span>
                    <span>{label.split(" ").slice(1).join(" ")}</span>
                  </div>
                  <div className="h-1 bg-white/5">
                    <div
                      className="h-1 bg-white"
                      style={{
                        width: `${[
                          Math.min(((hero.easy ?? 0) / Math.max(hero.solved ?? 1, 1)) * 100, 100),
                          Math.min(((hero.medium ?? 0) / Math.max(hero.solved ?? 1, 1)) * 100, 100),
                          Math.min(((hero.hard ?? 0) / Math.max(hero.solved ?? 1, 1)) * 100, 100)
                        ][index]}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-8">
            <Eyebrow>Active Sequence</Eyebrow>
            <p className="mt-6 font-display text-7xl font-bold uppercase tracking-tight">{data.streak.current}</p>
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Days</p>
            <div className="mt-10 border-t border-white/10 pt-8">
              <Eyebrow>Peak Sequence</Eyebrow>
              <p className="mt-4 font-display text-4xl font-bold uppercase tracking-tight">
                {data.streak.peak}_DAYS
              </p>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[386px_minmax(0,1fr)]">
          <Panel className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-black">
                {data.dailyChallenge?.difficulty ?? "N/A"}
              </span>
              <Eyebrow>Daily_Task</Eyebrow>
            </div>
            <h2 className="font-display text-5xl font-bold uppercase leading-none tracking-tight">
              {data.dailyChallenge?.title ?? "No daily challenge synced"}
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-zinc-400">
              Linked account: {data.account?.handle ?? "None yet"}. Acceptance rate:
              {" "}
              {data.dailyChallenge?.acceptanceRate ?? "N/A"}.
            </p>
            <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Status: {data.dailyChallenge?.solved ? "Solved" : "Pending"}
              </p>
              <a
                href={data.dailyChallenge?.url ?? "#"}
                className={`px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.22em] ${
                  data.dailyChallenge?.url ? "bg-white text-black" : "cursor-not-allowed bg-white/10 text-zinc-500"
                }`}
              >
                Execute_Code
              </a>
            </div>
          </Panel>

          <Panel className="p-8">
            <div className="flex items-center justify-between">
              <Eyebrow>Contribution_Grid</Eyebrow>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                <span>Less</span>
                <div className="flex gap-1">
                  <span className="h-3 w-3 bg-white/10" />
                  <span className="h-3 w-3 bg-emerald-500/60" />
                  <span className="h-3 w-3 bg-emerald-400/80" />
                  <span className="h-3 w-3 bg-emerald-300" />
                </div>
                <span>More</span>
              </div>
            </div>

            <div className="mt-8">
              <Heatmap rows={7} columns={12} active={data.heatmapActive} />
            </div>
          </Panel>
        </div>

        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <Eyebrow>Execution_History</Eyebrow>
            <button className="border border-white/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em]">
              Archive_Full
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/5">
                <tr className="text-[9px] uppercase tracking-[0.26em] text-zinc-400">
                  <th className="px-6 py-5">Problem_Module</th>
                  <th className="px-6 py-5">Status_Code</th>
                  <th className="px-6 py-5">Runtime</th>
                  <th className="px-6 py-5">Memory</th>
                  <th className="px-6 py-5">Stack</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions.map((submission) => (
                  <tr key={submission.id} className="border-t border-white/5">
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold uppercase tracking-[0.12em]">{submission.title}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {submission.submittedAtUtc.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-[10px] font-bold uppercase tracking-[0.18em]">
                      {submission.verdict}
                    </td>
                    <td className="px-6 py-6 text-[11px] text-zinc-400">{submission.runtimeLabel}</td>
                    <td className="px-6 py-6 text-[11px] text-zinc-400">{submission.memoryLabel}</td>
                    <td className="px-6 py-6">
                      <span className="border border-white/20 px-2 py-1 text-[9px] uppercase tracking-[0.16em]">
                        {submission.languageLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
