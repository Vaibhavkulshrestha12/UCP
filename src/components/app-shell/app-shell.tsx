import type { ReactNode } from "react";
import { Bell, Circle, Search } from "lucide-react";
import { Navigation } from "@/components/app-shell/navigation";
import { LogoMark } from "@/components/app-shell/logo-mark";
import { getSidebarData } from "@/lib/page-data";

type AppShellProps = {
  pathname: string;
  titleBar?: ReactNode;
  children: ReactNode;
};

export async function AppShell({ pathname, titleBar, children }: AppShellProps) {
  const { profile, sidebarMetric, linkedPlatformCount, isStreakAtRisk } = await getSidebarData();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#0e0e0e] px-0 py-8 lg:flex lg:flex-col">
          <div className="px-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full border border-white/20 bg-white/5 p-1">
                <LogoMark className="h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-lg font-bold uppercase tracking-tight">
                  {profile.displayName ?? profile.email?.split("@")[0] ?? "User"}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {sidebarMetric.label}: {sidebarMetric.value}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex-1 px-4">
            <Navigation pathname={pathname} />
          </div>

          <div className="border-t border-white/5 px-6 pt-6 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <p>Support</p>
            <p className="mt-4">Documentation</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#131313]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <LogoMark className="h-7 w-7 lg:hidden" />
                <p className="font-display text-base font-bold uppercase tracking-tight lg:text-xl">
                  Unified Coding Platform
                </p>
              </div>

              {titleBar ?? (
                <div className="hidden items-center gap-6 lg:flex">
                  <div
                    className={`px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                      isStreakAtRisk
                        ? "border border-red-500/40 text-red-500"
                        : "border border-white/10 text-zinc-400"
                    }`}
                  >
                    {isStreakAtRisk ? "Streak at risk" : `${linkedPlatformCount} linked`}
                  </div>
                  <div className="flex items-center gap-4 text-zinc-400">
                    <Bell className="h-4 w-4" />
                    <Circle className="h-4 w-4" />
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="app-grid px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
