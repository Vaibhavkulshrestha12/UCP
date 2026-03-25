import { submitSettings } from "@/lib/actions/forms";
import { AppShell } from "@/components/app-shell/app-shell";
import { Field } from "@/components/forms/field";
import { ToggleField } from "@/components/forms/toggle";
import { getSettingsData } from "@/lib/page-data";

export default async function SettingsPage() {
  const { profile, preference, accounts, canEditDisplayName } = await getSettingsData();
  const leetcode = accounts.find((account) => account.platform === "LEETCODE");
  const codeforces = accounts.find((account) => account.platform === "CODEFORCES");
  const atcoder = accounts.find((account) => account.platform === "ATCODER");

  return (
    <AppShell pathname="/settings">
      <div className="mx-auto max-w-[1240px] space-y-12">
        <div>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight lg:text-6xl">
            SETTINGS & CONFIG
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            Configure platform presence and practice logic. System-wide sync enabled.
          </p>
        </div>

        <form action={submitSettings} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="panel space-y-8 p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-yellow-400">Identity</p>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight">
                Sidebar Identity
              </h2>
            </div>
            <label className="block space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                Display Name
              </span>
              <input
                type="text"
                name="displayName"
                defaultValue={profile.displayName ?? ""}
                disabled={!canEditDisplayName}
                className="w-full border border-white/10 bg-[#0e0e0e] px-4 py-4 text-sm text-white outline-none transition-colors focus:border-white disabled:cursor-not-allowed disabled:border-white/5 disabled:text-zinc-500"
              />
            </label>
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {canEditDisplayName
                ? "You can change your display name once. Auth name is used by default."
                : "Display name already changed once for this account."}
            </p>
            <label className="block space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                Sidebar Showcase
              </span>
              <select
                name="sidebarShowcasePlatform"
                defaultValue={preference?.sidebarShowcasePlatform ?? "LEETCODE"}
                className="w-full border border-white/10 bg-[#0e0e0e] px-4 py-4 text-sm text-white outline-none transition-colors focus:border-white"
              >
                <option value="LEETCODE">LeetCode</option>
                <option value="CODEFORCES">Codeforces</option>
                <option value="ATCODER">AtCoder</option>
              </select>
            </label>
            <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Save to update the left sidebar identity and showcase metric.
              </p>
              <button
                type="submit"
                className="h-11 border border-yellow-400 bg-yellow-400 px-6 text-[10px] font-extrabold uppercase tracking-[0.24em] text-black transition-colors hover:bg-yellow-300"
              >
                Save Sidebar
              </button>
            </div>
          </section>

          <section className="panel space-y-8 p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Platform Linking</p>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight">
                Submission & Rating Sync
              </h2>
            </div>
            <Field label="LeetCode Username" name="leetcodeUsername" defaultValue={leetcode?.handle ?? ""} />
            <Field
              label="Codeforces Handle (optional)"
              name="codeforcesHandle"
              defaultValue={codeforces?.handle ?? ""}
            />
            <Field label="AtCoder Handle (optional)" name="atcoderHandle" defaultValue={atcoder?.handle ?? ""} />
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Leave optional fields blank to skip or unlink that platform.
            </p>
            <button className="h-12 w-full bg-white text-sm font-extrabold uppercase tracking-[0.24em] text-black">
              Verify & Link All
            </button>
          </section>

          <section className="panel space-y-4 p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-yellow-400">Alert Logic</p>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight">
                Notification Parameters
              </h2>
            </div>
            <ToggleField label="Daily Ping" name="dailyProblemEnabled" defaultChecked={preference?.dailyProblemEnabled} />
            <ToggleField label="Streak Alert" name="streakReminderEnabled" defaultChecked={preference?.streakReminder} />
            <ToggleField label="Contest T-60" name="contestReminderEnabled" defaultChecked={preference?.contestReminder} />
            <ToggleField label="Live Updates" name="liveContestAlertEnabled" defaultChecked={preference?.liveContestAlert} />
          </section>

          <section className="panel space-y-8 p-8 lg:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Temporal Config</p>
                <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight">
                  Syncing Local Peak With Practice
                </h2>
              </div>
              <div className="border border-white/20 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                DST Auto_Adjust Enabled
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Field label="Training Window" name="solveTime" type="time" defaultValue={preference?.solveTime} />
              <Field label="Deadline Ping" name="streakCheckTime" type="time" defaultValue={preference?.streakCheckTime} />
              <Field label="Anchor Zone" name="timezone" defaultValue={preference?.timezone} />
            </div>
          </section>

          <section className="border border-red-500/20 bg-red-500/[0.02] p-8 lg:col-span-2">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-display text-3xl font-bold uppercase tracking-tight text-red-500">
                  SYSTEM PURGE
                </p>
                <p className="mt-2 text-[12px] uppercase tracking-[0.18em] text-red-400/70">
                  Data persistence & account linking
                </p>
              </div>
              <div className="flex gap-4">
                <button type="button" className="h-11 border border-white/20 px-6 text-[10px] font-bold uppercase tracking-[0.18em]">
                  Export Data
                </button>
                <button type="button" className="h-11 border border-red-500 px-6 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">
                  Purge Links
                </button>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 lg:col-span-2">
            <button type="button" className="h-11 px-6 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400">
              Discard_All
            </button>
            <button className="h-11 bg-white px-8 text-[10px] font-extrabold uppercase tracking-[0.32em] text-black">
              Sync_Changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
