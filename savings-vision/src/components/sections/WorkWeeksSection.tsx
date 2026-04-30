import { t, tVars } from '../../i18n';
import type { Lang } from '../../data';
import { Card } from '../ui/Card';
import { SectionLabel } from '../ui/SectionLabel';

export function WorkWeeksSection({
  lang,
  workWeeksPerYear,
  onSetWorkWeeksPerYear,
}: {
  lang: Lang;
  workWeeksPerYear: number;
  onSetWorkWeeksPerYear: (value: number) => void;
}) {
  return (
    <Card>
      <SectionLabel text={t(lang, 'section_work_weeks')} />
      <div className="mt-4">
        <label className="mb-1.5 block text-[11px] text-stone-500 sm:text-xs">
          {t(lang, 'work_weeks_custom')}
        </label>
        <div className="flex items-center rounded-xl border border-stone-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={52}
            step={1}
            value={workWeeksPerYear}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isNaN(next)) return;
              onSetWorkWeeksPerYear(next);
            }}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base font-semibold tabular text-stone-900 focus:outline-none"
            aria-label={t(lang, 'section_work_weeks')}
          />
          <span className="shrink-0 whitespace-nowrap px-3 text-sm text-stone-500">
            {t(lang, 'work_weeks_per_year_suffix')}
          </span>
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-[11px] text-stone-400">{t(lang, 'work_weeks_hint')}</p>
        <span className="text-right text-[11px] text-stone-400">
          {tVars(lang, 'work_weeks_rest_hint', { weeks: Math.max(0, 52 - workWeeksPerYear) })}
        </span>
      </div>
    </Card>
  );
}
