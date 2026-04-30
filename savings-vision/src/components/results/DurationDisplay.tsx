import { t } from '../../i18n';
import type { Lang } from '../../data';

export function DurationDisplay({ years, months, lang }: { years: number; months: number; lang: Lang }) {
  const yearLabel = years === 1 ? t(lang, 'result_year_singular') : t(lang, 'result_years');
  const monthLabel = months === 1 ? t(lang, 'result_month_singular') : t(lang, 'result_months');
  return (
    <span>
      {years > 0 && (
        <>
          <span>{years}</span>{' '}
          <span className="text-2xl font-medium text-emerald-700/80 sm:text-3xl">{yearLabel}</span>
          {months > 0 && <span className="text-emerald-700/40"> · </span>}
        </>
      )}
      {months > 0 && (
        <>
          <span>{months}</span>{' '}
          <span className="text-2xl font-medium text-emerald-700/80 sm:text-3xl">{monthLabel}</span>
        </>
      )}
    </span>
  );
}
