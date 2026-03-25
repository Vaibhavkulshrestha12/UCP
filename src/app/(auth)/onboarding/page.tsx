import { submitOnboarding } from "@/lib/actions/forms";
import { Field } from "@/components/forms/field";
import { ToggleField } from "@/components/forms/toggle";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Initial Sync</p>
        <h1 className="mt-4 font-display text-6xl font-bold uppercase leading-none tracking-tight">
          Link Platforms. Define The Schedule.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300">
          This flow seeds the unified dashboards, stores notification preferences, and schedules
          the first synchronization run. Codeforces and AtCoder are optional and can be linked later.
        </p>

        <form action={submitOnboarding} className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="panel space-y-6 p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Platform Linking</p>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight">
                Identity Matrix
              </h2>
            </div>

            <Field label="LeetCode Username" name="leetcodeUsername" />
            <Field label="Codeforces Handle (optional)" name="codeforcesHandle" />
            <Field label="AtCoder Handle (optional)" name="atcoderHandle" />

            <button
              type="submit"
              className="h-12 w-full bg-white px-6 text-sm font-extrabold uppercase tracking-[0.24em] text-black"
            >
              Verify & Link All
            </button>
          </section>

          <div className="space-y-6">
            <section className="panel space-y-4 p-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-yellow-500">Alert Logic</p>
                <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight">
                  Notification Parameters
                </h2>
              </div>

              <ToggleField label="Daily Ping" name="dailyProblemEnabled" defaultChecked />
              <ToggleField label="Streak Alert" name="streakReminderEnabled" defaultChecked />
              <ToggleField label="Contest T-60" name="contestReminderEnabled" defaultChecked />
              <ToggleField label="Live Updates" name="liveContestAlertEnabled" />
            </section>

            <section className="panel space-y-6 p-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Temporal Config</p>
                <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight">
                  Practice Window
                </h2>
              </div>

              <Field label="Training Window" name="solveTime" type="time" defaultValue="20:00" />
              <Field label="Deadline Ping" name="streakCheckTime" type="time" defaultValue="22:30" />
              <Field label="Anchor Zone" name="timezone" defaultValue="Asia/Kolkata" />
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
