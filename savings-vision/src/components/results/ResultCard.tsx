import { formatGoalDate, formatMoney, type CalcResult } from '../../calc';
import { t } from '../../i18n';
import type { Lang } from '../../data';
import { DurationDisplay } from './DurationDisplay';
import { SuperDaspPanel } from './SuperDaspPanel';
import { TaxBreakdownPanel } from './TaxBreakdownPanel';
import { VisaTimeline } from './VisaTimeline';

export function ResultCard({
  result,
  lang,
  goalAmount,
  thbPerAud,
  startDateISO,
  workWeeksPerYear,
}: {
  result: CalcResult;
  lang: Lang;
  goalAmount: number;
  thbPerAud: number;
  startDateISO: string;
  workWeeksPerYear: number;
}) {
  if (!result.reachable) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
        <h2 className="text-base font-bold text-amber-900 sm:text-lg">{t(lang, 'impossible_heading')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">{t(lang, 'impossible_body')}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 sm:gap-3">
          <Stat label={t(lang, 'result_gross')} value={`${formatMoney(result.monthlyGrossIncome, lang)}`} />
          <Stat label={t(lang, 'result_tax')} value={`−${formatMoney(result.monthlyTax, lang)}`} />
          <Stat label={t(lang, 'result_net')} value={`${formatMoney(result.monthlyNetIncome, lang)}`} />
          <Stat label={t(lang, 'result_expenses')} value={`−${formatMoney(result.monthlyExpenses, lang)}`} />
        </div>
      </section>
    );
  }

  const gross = Math.max(1, result.monthlyGrossIncome);
  const taxPct = (result.monthlyTax / gross) * 100;
  const expensesPct = (result.monthlyExpenses / gross) * 100;
  const savingsPct = Math.max(0, 100 - taxPct - expensesPct);

  return (
    <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:text-xs sm:tracking-wider">
        {t(lang, 'result_heading')}
      </p>

      <h2 className="mt-2 text-3xl font-bold leading-tight tabular text-emerald-900 sm:text-5xl">
        {result.monthsTotal === 0 ? <span>{t(lang, 'months_zero')}</span> : <DurationDisplay years={result.years} months={result.months} lang={lang} />}
      </h2>

      {result.goalDate && (
        <p className="mt-2 text-sm text-stone-600">
          {t(lang, 'result_by_date')}{' '}
          <span className="font-semibold text-stone-800">{formatGoalDate(result.goalDate, lang)}</span>
        </p>
      )}

      <div className="mt-4 border-t border-emerald-200/70 pt-4 sm:mt-5 sm:pt-5">
        <p className="text-xs text-stone-500">{t(lang, 'result_save_per_week')}</p>
        <p className="mt-0.5 text-xl font-bold tabular text-emerald-700 sm:text-2xl">
          {formatMoney(result.weeklySavings, lang)}{' '}
          <span className="text-xs font-normal text-stone-500 sm:text-sm">{t(lang, 'baht')}</span>
        </p>
        <p className="mt-1 text-[11px] leading-relaxed tabular text-stone-400">
          <span className="block sm:inline">
            ≈ {formatMoney(result.monthlySavings, lang)} {t(lang, 'baht')} {t(lang, 'result_per_month')}
          </span>
          <span className="block sm:ml-1 sm:inline">
            ≈ {formatMoney(result.monthlySavings * thbPerAud, lang)} {t(lang, 'thb')} {t(lang, 'result_per_month')}
          </span>
        </p>
      </div>

      <div className="mt-4 border-t border-emerald-200/70 pt-4 sm:mt-5 sm:pt-5">
        <div className="flex h-9 overflow-hidden rounded-xl bg-stone-100 text-xs font-semibold text-white">
          <div
            className="bar-fill flex items-center justify-center bg-amber-500"
            style={{ width: `${Math.min(100, taxPct)}%` }}
            aria-label={t(lang, 'result_tax')}
          >
            {taxPct >= 12 && <span className="px-2">{Math.round(taxPct)}%</span>}
          </div>
          <div
            className="bar-fill flex items-center justify-center bg-stone-400"
            style={{ width: `${Math.min(100, expensesPct)}%` }}
            aria-label={t(lang, 'result_expenses')}
          >
            {expensesPct >= 12 && <span className="px-2">{Math.round(expensesPct)}%</span>}
          </div>
          <div
            className="bar-fill flex items-center justify-center bg-emerald-500"
            style={{ width: `${savingsPct}%` }}
            aria-label={t(lang, 'result_savings')}
          >
            {savingsPct >= 12 && <span className="px-2">{Math.round(savingsPct)}%</span>}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs tabular text-stone-600 sm:grid-cols-3">
          <LegendItem
            color="bg-amber-500"
            label={t(lang, 'result_tax')}
            value={`${formatMoney(result.weeklyTax, lang)} ${t(lang, 'baht')} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`}
            subvalue={`${formatMoney(result.weeklyTax * thbPerAud, lang)} ${t(lang, 'thb')} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`}
          />
          <LegendItem
            color="bg-stone-400"
            label={t(lang, 'result_expenses')}
            value={`${formatMoney(result.weeklyExpenses, lang)} ${t(lang, 'baht')} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`}
            subvalue={`${formatMoney(result.weeklyExpenses * thbPerAud, lang)} ${t(lang, 'thb')} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`}
          />
          <LegendItem
            color="bg-emerald-500"
            label={t(lang, 'result_savings')}
            value={`${formatMoney(result.weeklySavings, lang)} ${t(lang, 'baht')} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`}
            subvalue={`${formatMoney(result.weeklySavings * thbPerAud, lang)} ${t(lang, 'thb')} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`}
          />
        </div>
      </div>

      <TaxBreakdownPanel
        breakdown={result.taxBreakdown}
        annualGross={result.annualGrossIncome}
        monthlyTax={result.monthlyTax}
        lang={lang}
      />

      <SuperDaspPanel
        weeklySuper={result.weeklySuperAccrued}
        annualSuper={result.annualSuperAccrued}
        daspTax={result.daspTaxOnDeparture}
        daspNet={result.daspNetOnDeparture}
        lang={lang}
        thbPerAud={thbPerAud}
      />

      <VisaTimeline
        monthsTotal={result.monthsTotal}
        lang={lang}
        goalDate={result.goalDate}
        startDateISO={startDateISO}
        workWeeksPerYear={workWeeksPerYear}
      />

      <p className="mt-4 text-center text-xs leading-relaxed text-stone-500">
        {t(lang, 'result_total_label')}:{' '}
        {formatMoney(result.monthlySavings, lang)} {t(lang, 'baht')} × {result.monthsTotal} {t(lang, 'result_months')} ={' '}
        <span className="font-semibold tabular text-stone-700">
          {formatMoney(goalAmount, lang)} {t(lang, 'baht')}
        </span>
      </p>
      <p className="mt-1 text-center text-[11px] tabular text-stone-400">
        {t(lang, 'result_equivalent_thb')}:{' '}
        <span className="font-semibold text-stone-600">
          {formatMoney(goalAmount * thbPerAud, lang)} {t(lang, 'thb')}
        </span>
      </p>
    </section>
  );
}

function LegendItem({
  color,
  label,
  value,
  subvalue,
}: {
  color: string;
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="rounded-lg bg-white/60 p-2 sm:bg-transparent sm:p-0">
      <div className="flex items-center gap-1.5">
        <span className={'inline-block h-2 w-2 rounded-full ' + color} />
        <span className="text-[11px] text-stone-500">{label}</span>
      </div>
      <p className="font-semibold tabular text-stone-700">
        {value}
        {subvalue && <span className="ml-3 text-[11px] font-normal text-stone-400">· {subvalue}</span>}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-amber-100 bg-white/60 p-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular text-stone-800 sm:text-base">{value}</p>
    </div>
  );
}
