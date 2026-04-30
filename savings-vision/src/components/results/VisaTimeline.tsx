import { formatGoalDate } from '../../calc';
import { t, tVars } from '../../i18n';
import type { Lang } from '../../data';
import { parseISODate } from '../../lib/appState';

export function VisaTimeline({
  monthsTotal,
  lang,
  goalDate,
  startDateISO,
  workWeeksPerYear,
}: {
  monthsTotal: number;
  lang: Lang;
  goalDate: Date | null;
  startDateISO: string;
  workWeeksPerYear: number;
}) {
  if (!goalDate || monthsTotal === 0) return null;

  const markerPct = Math.min((monthsTotal / 36) * 100, 100);
  const firstYearRemaining = Math.max(0, 12 - monthsTotal);
  const overFirstYear = Math.max(0, monthsTotal - 12);
  const statusKey =
    monthsTotal <= 12
      ? 'visa_within_first'
      : monthsTotal <= 24
        ? 'visa_needs_second'
        : monthsTotal <= 36
          ? 'visa_needs_third'
          : 'visa_beyond_third';

  return (
    <div className="mt-5 rounded-xl border border-emerald-100 bg-white p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-xs sm:tracking-wider">
          {t(lang, 'visa_timeline_heading')}
        </p>
        <p className="text-xs text-stone-500">
          {tVars(lang, 'visa_goal_eta', { months: monthsTotal })}
        </p>
      </div>

      <div className="mt-3">
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-stone-200 text-center text-[11px] font-semibold">
          <div className={`border-r border-stone-200 px-2 py-2 ${monthsTotal <= 12 ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-50 text-stone-500'}`}>
            {t(lang, 'visa_first_year')}
          </div>
          <div className={`border-r border-stone-200 px-2 py-2 ${monthsTotal > 12 && monthsTotal <= 24 ? 'bg-amber-50 text-amber-700' : 'bg-stone-50 text-stone-500'}`}>
            {t(lang, 'visa_second_year')}
          </div>
          <div className={`px-2 py-2 ${monthsTotal > 24 ? 'bg-rose-50 text-rose-700' : 'bg-stone-50 text-stone-500'}`}>
            {t(lang, 'visa_third_year')}
          </div>
        </div>
        <div className="relative mt-3 h-2 rounded-full bg-stone-100">
          <div
            className="bar-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500"
            style={{ width: `${markerPct}%` }}
          />
          <div className="absolute inset-y-0 left-1/3 w-px bg-white/90" aria-hidden="true" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white/90" aria-hidden="true" />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-600 shadow"
            style={{ left: `calc(${markerPct}% - 8px)` }}
          />
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs text-stone-600">
        <p className="font-semibold text-emerald-700">{t(lang, statusKey as 'visa_within_first')}</p>
        <p>{tVars(lang, 'visa_year_one_left', { months: firstYearRemaining })}</p>
        {overFirstYear > 0 && (
          <>
            <p>{tVars(lang, 'visa_over_by', { months: overFirstYear })}</p>
            <p className="text-[11px] leading-relaxed text-stone-500">{t(lang, 'visa_specified_note')}</p>
          </>
        )}
        <p className="text-[11px] text-stone-400">
          {formatGoalDate(parseISODate(startDateISO), lang)} → {formatGoalDate(goalDate, lang)} · {workWeeksPerYear} {t(lang, 'work_weeks_per_year_suffix')}
        </p>
      </div>
    </div>
  );
}
