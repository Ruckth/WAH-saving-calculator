import {
  WHV_TAX_BAND_ANNUAL,
  WHV_TAX_RATE_BAND1,
  WHV_TAX_RATE_BAND2,
  formatMoney,
  type TaxBreakdown,
} from '../../calc';
import { t } from '../../i18n';
import type { Lang } from '../../data';

export function TaxBreakdownPanel({
  breakdown,
  annualGross,
  monthlyTax,
  lang,
}: {
  breakdown: TaxBreakdown;
  annualGross: number;
  monthlyTax: number;
  lang: Lang;
}) {
  const scale = Math.max(annualGross, WHV_TAX_BAND_ANNUAL);
  const band1Pct = (breakdown.band1Income / scale) * 100;
  const band2Pct = (breakdown.band2Income / scale) * 100;
  const headroomPct = Math.max(0, 100 - band1Pct - band2Pct);
  const thresholdPct = (WHV_TAX_BAND_ANNUAL / scale) * 100;
  const band1RatePct = Math.round(WHV_TAX_RATE_BAND1 * 100);
  const band2RatePct = Math.round(WHV_TAX_RATE_BAND2 * 1000) / 10;

  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/40 p-3 sm:mt-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 sm:text-xs sm:tracking-wider">
          {t(lang, 'tax_breakdown_heading')}
        </p>
        <p className="text-xs text-stone-500">
          {t(lang, 'tax_annual_income')}:{' '}
          <span className="font-semibold tabular text-stone-700">
            {formatMoney(annualGross, lang)} {t(lang, 'baht')}
          </span>
        </p>
      </div>

      <div className="relative mt-3 h-8 overflow-hidden rounded-lg bg-stone-100 text-[11px] font-semibold">
        <div
          className="bar-fill absolute inset-y-0 left-0 flex items-center justify-center bg-amber-300 text-amber-900"
          style={{ width: `${band1Pct}%` }}
          aria-label={`${band1RatePct}% band`}
        >
          {band1Pct >= 14 && <span className="px-1">{band1RatePct}%</span>}
        </div>
        <div
          className="bar-fill absolute inset-y-0 flex items-center justify-center bg-amber-700 text-white"
          style={{ left: `${band1Pct}%`, width: `${band2Pct}%` }}
          aria-label={`${band2RatePct}% band`}
        >
          {band2Pct >= 14 && <span className="px-1">{band2RatePct}%</span>}
        </div>
        {headroomPct > 0 && (
          <div
            className="absolute inset-y-0 right-0 flex items-center justify-end pr-1.5 text-[10px] text-stone-400"
            style={{ width: `${headroomPct}%` }}
          >
            {headroomPct >= 12 && <span className="italic">…{band2RatePct}% zone</span>}
          </div>
        )}
        {headroomPct > 0 && (
          <div
            className="absolute inset-y-0 w-px bg-amber-700/70"
            style={{ left: `${thresholdPct}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        <BandRow
          color="bg-amber-300"
          income={breakdown.band1Income}
          rateLabel={`${band1RatePct}%`}
          tax={breakdown.band1Tax}
          lang={lang}
        />
        {breakdown.band2Income > 0 ? (
          <BandRow
            color="bg-amber-700"
            income={breakdown.band2Income}
            rateLabel={`${band2RatePct}%`}
            tax={breakdown.band2Tax}
            lang={lang}
          />
        ) : (
          <p className="text-[11px] italic leading-relaxed text-stone-500">
            {t(lang, 'tax_under_threshold_note')}
          </p>
        )}
        {breakdown.band3Income > 0 && (
          <BandRow
            color="bg-rose-600"
            income={breakdown.band3Income}
            rateLabel="37%"
            tax={breakdown.band3Tax}
            lang={lang}
          />
        )}
        {breakdown.band4Income > 0 && (
          <BandRow
            color="bg-rose-800"
            income={breakdown.band4Income}
            rateLabel="45%"
            tax={breakdown.band4Tax}
            lang={lang}
          />
        )}
        <div className="flex flex-col gap-1 border-t border-amber-200 pt-2 sm:flex-row sm:items-baseline sm:justify-between">
          <span className="text-sm font-semibold text-stone-700">{t(lang, 'tax_monthly_total')}</span>
          <span className="text-base font-bold tabular text-amber-800">
            {formatMoney(monthlyTax, lang)} {t(lang, 'baht')}
          </span>
        </div>
        <p className="text-right text-[11px] text-stone-500">
          {t(lang, 'tax_annual_equivalent')}:{' '}
          <span className="font-semibold tabular text-stone-700">
            {formatMoney(breakdown.totalAnnualTax, lang)} {t(lang, 'baht')}
          </span>
        </p>
      </div>

      <p className="mt-3 border-t border-amber-100 pt-2 text-[10px] italic leading-relaxed text-stone-500">
        {t(lang, 'medicare_thai_note')}
      </p>
    </div>
  );
}

function BandRow({
  color,
  income,
  rateLabel,
  tax,
  lang,
}: {
  color: string;
  income: number;
  rateLabel: string;
  tax: number;
  lang: Lang;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <span className="flex items-center gap-1.5 text-stone-600">
        <span className={'inline-block h-2 w-2 rounded-full ' + color} />
        <span className="tabular">
          {formatMoney(income, lang)} × {rateLabel}
        </span>
      </span>
      <span className="font-semibold tabular text-stone-700">
        = {formatMoney(tax, lang)}
      </span>
    </div>
  );
}
