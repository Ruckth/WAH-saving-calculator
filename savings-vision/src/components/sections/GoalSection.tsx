import { t } from '../../i18n';
import type { Currency, Lang } from '../../data';
import { formatMoney } from '../../calc';
import type { RateMeta } from '../../lib/appState';
import { Card } from '../ui/Card';
import { CurrencyToggle } from '../ui/CurrencyToggle';
import { MoneyInput } from '../ui/MoneyInput';
import { SectionLabel } from '../ui/SectionLabel';
import { StartDatePicker } from '../ui/StartDatePicker';

export function GoalSection({
  lang,
  goalAmount,
  goalCurrency,
  goalInAUD,
  safeRate,
  thbPerAud,
  rateMeta,
  startDateISO,
  onSetGoalAmount,
  onSwitchGoalCurrency,
  onSetThbPerAudManual,
  onSetStartDateISO,
}: {
  lang: Lang;
  goalAmount: number;
  goalCurrency: Currency;
  goalInAUD: number;
  safeRate: number;
  thbPerAud: number;
  rateMeta: RateMeta;
  startDateISO: string;
  onSetGoalAmount: (value: number) => void;
  onSwitchGoalCurrency: (next: Currency) => void;
  onSetThbPerAudManual: (value: number) => void;
  onSetStartDateISO: (iso: string) => void;
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <SectionLabel text={t(lang, 'section_goal')} icon="🎯" />
        <CurrencyToggle
          value={goalCurrency}
          onChange={onSwitchGoalCurrency}
          labels={{ AUD: t(lang, 'baht'), THB: t(lang, 'thb') }}
        />
      </div>
      <MoneyInput
        value={goalAmount}
        onChange={onSetGoalAmount}
        lang={lang}
        ariaLabel={t(lang, 'goal_amount')}
        suffix={goalCurrency === 'AUD' ? t(lang, 'baht') : t(lang, 'thb')}
        size="lg"
      />
      <p className="mt-2 text-xs text-stone-500 tabular">
        {t(lang, 'goal_equivalent_prefix')}{' '}
        <span className="font-semibold text-stone-700">
          {goalCurrency === 'AUD'
            ? `${formatMoney(goalAmount * safeRate, lang)} ${t(lang, 'thb')}`
            : `${formatMoney(goalInAUD, lang)} ${t(lang, 'baht')}`}
        </span>
      </p>

      <div className="mt-3 border-t border-stone-100 pt-3">
        <div className="flex items-center gap-2">
          <label className="flex-1 text-xs text-stone-500">
            {t(lang, 'exchange_rate_label')}
          </label>
          <span className="text-xs tabular text-stone-500">1 AUD =</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={thbPerAud}
            onChange={(event) => onSetThbPerAudManual(Number(event.target.value) || 0)}
            className="w-18 rounded-md border border-stone-200 bg-white px-2 py-1 text-right text-xs font-semibold tabular text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:w-20 sm:text-sm"
            aria-label={t(lang, 'exchange_rate_label')}
          />
          <span className="whitespace-nowrap text-xs text-stone-500">{t(lang, 'thb')}</span>
        </div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-stone-400">
          {rateMeta.source === 'auto' && (
            <>
              {t(lang, 'rate_source_auto')} · {formatRateDate(rateMeta.date, lang)}
            </>
          )}
          {rateMeta.source === 'manual' && t(lang, 'rate_source_manual')}
          {rateMeta.source === 'default' && t(lang, 'rate_source_default')}
        </p>
      </div>

      <div className="mt-4 border-t border-stone-100 pt-4">
        <SectionLabel text={t(lang, 'section_start_date')} />
        <StartDatePicker
          valueISO={startDateISO}
          onChangeISO={onSetStartDateISO}
          lang={lang}
        />
        <p className="mt-1.5 text-[11px] text-stone-400">{t(lang, 'start_date_hint')}</p>
      </div>
    </Card>
  );
}

function formatRateDate(iso: string, lang: Lang): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-AU', {
    day: 'numeric',
    month: 'short',
  });
}
