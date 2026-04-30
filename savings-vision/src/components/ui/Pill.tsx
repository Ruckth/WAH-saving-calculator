export function Pill({
  selected,
  onClick,
  label,
  emoji,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={
        'flex min-h-11 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition sm:px-3 sm:text-sm ' +
        (selected
          ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-800'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300')
      }
    >
      <span className="text-sm sm:text-base" aria-hidden="true">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
