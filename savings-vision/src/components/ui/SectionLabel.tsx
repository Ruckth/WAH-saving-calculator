export function SectionLabel({ text, icon }: { text: string; icon?: string }) {
  return (
    <h2 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 sm:mb-3 sm:text-xs sm:tracking-wider">
      {icon && (
        <span aria-hidden="true" className="text-sm normal-case sm:text-base">
          {icon}
        </span>
      )}
      <span>{text}</span>
    </h2>
  );
}
