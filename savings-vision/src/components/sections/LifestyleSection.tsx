import { LIFESTYLE_TIERS, type ExpenseCategory, type Lang, type LifestyleTier } from '../../data';
import { formatMoney } from '../../calc';
import { t } from '../../i18n';
import { Card } from '../ui/Card';
import { CurrencyToggle } from '../ui/CurrencyToggle';
import { MoneyInput } from '../ui/MoneyInput';
import { SectionLabel } from '../ui/SectionLabel';

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['rent', 'food', 'transport', 'other'];

export function LifestyleSection({
  lang,
  lifestyleId,
  tier,
  expenses,
  totalExpenses,
  safeRate,
  weeklyRemittance,
  remittanceCurrency,
  remittanceInAUD,
  onPickLifestyle,
  onUpdateExpense,
  onSetWeeklyRemittance,
  onSwitchRemittanceCurrency,
}: {
  lang: Lang;
  lifestyleId: LifestyleTier['id'];
  tier: LifestyleTier;
  expenses: Record<ExpenseCategory, number>;
  totalExpenses: number;
  safeRate: number;
  weeklyRemittance: number;
  remittanceCurrency: 'AUD' | 'THB';
  remittanceInAUD: number;
  onPickLifestyle: (id: LifestyleTier['id']) => void;
  onUpdateExpense: (category: ExpenseCategory, value: number) => void;
  onSetWeeklyRemittance: (value: number) => void;
  onSwitchRemittanceCurrency: (next: 'AUD' | 'THB') => void;
}) {
  return (
    <Card>
      <SectionLabel text={t(lang, 'section_lifestyle')} />
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {LIFESTYLE_TIERS.map((option) => (
          <button
            key={option.id}
            onClick={() => onPickLifestyle(option.id)}
            className={
              'flex min-h-[72px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 text-xs transition sm:min-h-[84px] sm:px-2 sm:py-2 sm:text-sm ' +
              (option.id === lifestyleId
                ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-800'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300')
            }
            aria-pressed={option.id === lifestyleId}
          >
            <span className="mb-0.5 text-lg sm:text-xl" aria-hidden="true">{option.emoji}</span>
            <span className="text-[10px] leading-tight sm:text-[13px]">{lang === 'th' ? option.th : option.en}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        {EXPENSE_CATEGORIES.map((category) => (
          <div key={category}>
            <label className="mb-1 block text-[11px] text-stone-500 sm:mb-1.5 sm:text-xs">
              {t(lang, `expense_${category}` as 'expense_rent')}
            </label>
            <MoneyInput
              value={expenses[category]}
              onChange={(value) => onUpdateExpense(category, value)}
              lang={lang}
              ariaLabel={t(lang, `expense_${category}` as 'expense_rent')}
              suffix={t(lang, 'baht')}
              size="sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-stone-100 pt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 sm:text-xs sm:tracking-wider">
            {t(lang, 'section_remittance')}
          </p>
          <CurrencyToggle
            value={remittanceCurrency}
            onChange={onSwitchRemittanceCurrency}
            labels={{ AUD: t(lang, 'baht'), THB: t(lang, 'thb') }}
          />
        </div>
        <MoneyInput
          value={weeklyRemittance}
          onChange={onSetWeeklyRemittance}
          lang={lang}
          ariaLabel={t(lang, 'section_remittance')}
          suffix={remittanceCurrency === 'AUD' ? t(lang, 'baht') : t(lang, 'thb')}
          placeholder="0"
          size="sm"
        />
        {weeklyRemittance > 0 && (
          <p className="mt-2 text-xs text-stone-500 tabular">
            {t(lang, 'goal_equivalent_prefix')}{' '}
            <span className="font-semibold text-stone-700">
              {remittanceCurrency === 'AUD'
                ? `${formatMoney(weeklyRemittance * safeRate, lang)} ${t(lang, 'thb')}`
                : `${formatMoney(remittanceInAUD, lang)} ${t(lang, 'baht')}`}
            </span>
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-stone-400">{t(lang, 'remittance_hint')}</p>
      </div>

      <div className="mt-4 border-t border-stone-100 pt-3">
        <span className="text-sm text-stone-500">{t(lang, 'expense_total')}</span>
        <span className="mt-1.5 block text-left sm:mt-0 sm:text-right">
          <span className="text-base font-semibold tabular text-stone-700 sm:text-lg">
            {formatMoney(totalExpenses, lang)}{' '}
            <span className="text-xs font-normal text-stone-500">{t(lang, 'baht_per_week')}</span>
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed text-stone-400 tabular">
            <span className="block sm:inline">
              ≈ {formatMoney(totalExpenses * (52 / 12), lang)} {t(lang, 'baht_per_month')}
            </span>
            <span className="block sm:ml-1 sm:inline">
              ≈ {formatMoney(totalExpenses * (52 / 12) * safeRate, lang)} {t(lang, 'thb')} / {lang === 'th' ? 'เดือน' : 'mo'}
            </span>
          </span>
        </span>
      </div>
      <p className="mt-1 text-xs text-stone-400">
        {tier.emoji} {lang === 'th' ? tier.th : tier.en}
      </p>
    </Card>
  );
}
