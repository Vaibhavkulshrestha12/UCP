import { cn } from "@/lib/utils/cn";

export function Field({
  label,
  name,
  defaultValue,
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className={cn(
          "w-full border border-white/10 bg-[#0e0e0e] px-4 py-4 text-sm text-white outline-none transition-colors",
          "focus:border-white"
        )}
      />
    </label>
  );
}
