import Link from "next/link";
import { BarChart3, ChevronsLeftRight, Code2, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leetcode", label: "LeetCode", icon: ChevronsLeftRight },
  { href: "/codeforces", label: "Codeforces", icon: Code2 },
  { href: "/atcoder", label: "AtCoder", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Navigation({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.28em] transition-colors",
              active
                ? "bg-white/5 text-white border-l-2 border-white pl-[14px]"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
