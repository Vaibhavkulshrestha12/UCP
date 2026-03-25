import { cn } from "@/lib/utils/cn";

export function Heatmap({
  rows = 7,
  columns = 12,
  active = [],
  levels,
  monthLabels,
  summary,
  className
}: {
  rows?: number;
  columns?: number;
  active?: number[];
  levels?: number[];
  monthLabels?: string[];
  summary?: {
    totalLabel: string;
    activeDaysLabel?: string;
    peakLabel?: string;
  };
  className?: string;
}) {
  const total = rows * columns;
  const intensityClasses = [
    "bg-white/10",
    "bg-emerald-900/80",
    "bg-emerald-700/90",
    "bg-emerald-500/90 shadow-[0_0_12px_rgba(52,211,153,0.22)]",
    "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.32)]"
  ];

  return (
    <div className={cn("space-y-5", className)}>
      {summary ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xl font-semibold text-zinc-100">{summary.totalLabel}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
            {summary.activeDaysLabel ? <span>{summary.activeDaysLabel}</span> : null}
            {summary.peakLabel ? <span>{summary.peakLabel}</span> : null}
          </div>
        </div>
      ) : null}

      {monthLabels ? (
        <div className="grid grid-flow-col gap-[6px] pl-0.5 text-xs text-zinc-500">
          {monthLabels.map((label, index) => (
            <div key={`${label}-${index}`} className="min-h-4">
              {label ? <span>{label}</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-flow-col gap-[6px]">
        {Array.from({ length: columns }).map((_, columnIndex) => (
          <div key={columnIndex} className="grid gap-[6px]">
            {Array.from({ length: rows }).map((__, rowIndex) => {
              const index = columnIndex * rows + rowIndex;
              const isActive = active.includes(index);
              const level = Math.max(0, Math.min(levels?.[index] ?? (isActive ? 4 : 0), 4));

              return (
                <div
                  key={index}
                  className={cn(
                    "h-3 w-3 rounded-[2px] border border-white/5",
                    index > total ? "bg-white/5" : undefined,
                    intensityClasses[level]
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      {summary ? (
        <div className="flex items-center justify-end gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            {intensityClasses.map((color, index) => (
              <span key={index} className={cn("h-3 w-3 rounded-[2px] border border-white/5", color)} />
            ))}
          </div>
          <span>More</span>
        </div>
      ) : null}
    </div>
  );
}
