export function ToggleField({
  label,
  name,
  defaultChecked
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between border border-white/5 bg-[#0e0e0e] px-4 py-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">{label}</span>
      <span className="relative inline-flex h-5 w-10 items-center">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="absolute inset-0 bg-white/10 peer-checked:bg-white" />
        <span className="absolute left-0 top-0 h-5 w-5 bg-white peer-checked:left-5 peer-checked:bg-black transition-all" />
      </span>
    </label>
  );
}
