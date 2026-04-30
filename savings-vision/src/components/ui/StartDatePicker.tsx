import { t } from '../../i18n';
import type { Lang } from '../../data';
import { parseISODate } from '../../lib/appState';
import { SelectChevron } from './SelectChevron';

export function StartDatePicker({
  valueISO,
  onChangeISO,
  lang,
}: {
  valueISO: string;
  onChangeISO: (iso: string) => void;
  lang: Lang;
}) {
  const date = parseISODate(valueISO);
  const month = date.getMonth();
  const year = date.getFullYear();
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    new Date(2024, index, 1).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-AU', { month: 'long' }),
  );
  const startYear = now.getFullYear() - 1;
  const years = Array.from({ length: 8 }, (_, index) => startYear + index);

  function setMonthYear(newMonth: number, newYear: number) {
    const nextMonth = String(newMonth + 1).padStart(2, '0');
    onChangeISO(`${newYear}-${nextMonth}-01`);
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="relative flex-1">
        <select
          value={month}
          onChange={(event) => setMonthYear(Number(event.target.value), year)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white px-3 py-2 pr-10 text-sm font-semibold text-stone-900 hover:border-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:py-2.5 sm:text-base"
          aria-label={lang === 'th' ? 'เดือน' : 'Month'}
        >
          {monthNames.map((name, index) => (
            <option key={index} value={index}>{name}</option>
          ))}
        </select>
        <SelectChevron />
      </div>
      <div className="relative">
        <select
          value={year}
          onChange={(event) => setMonthYear(month, Number(event.target.value))}
          className="w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white px-3 py-2 pr-10 text-sm font-semibold tabular text-stone-900 hover:border-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:py-2.5 sm:text-base"
          aria-label={lang === 'th' ? 'ปี' : 'Year'}
        >
          {years.map((value) => (
            <option key={value} value={value}>
              {lang === 'th' ? value + 543 : value}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={() => setMonthYear(now.getMonth(), now.getFullYear())}
          className="whitespace-nowrap rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-[11px] font-medium text-stone-600 transition hover:border-stone-300 sm:px-3 sm:py-2.5 sm:text-xs"
        >
          {t(lang, 'start_date_reset')}
        </button>
      )}
    </div>
  );
}
