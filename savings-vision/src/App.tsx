import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_THB_PER_AUD,
  EXPERIENCE_LEVELS,
  GOAL_DEFAULT,
  HOURS_DEFAULT,
  HOURS_MAX,
  HOURS_MIN,
  HOURS_STEP,
  JOBS,
  LEGAL_MIN_AUD_HR,
  LIFESTYLE_TIERS,
  type Currency,
  type ExpenseCategory,
  type ExperienceLevel,
  type Lang,
  type LifestyleTier,
} from './data';
import {
  calculate,
  formatMoney,
  formatGoalDate,
  WHV_TAX_BAND_ANNUAL,
  WHV_TAX_RATE_BAND1,
  WHV_TAX_RATE_BAND2,
  type CalcResult,
  type TaxBreakdown,
} from './calc';
import { t, tVars } from './i18n';
import { fetchAudToThb, isToday, loadCachedRate, saveCachedRate } from './exchangeRate';

const STORAGE_KEY = 'savings-vision:v2';

type Persisted = {
  lang: Lang;
  jobId: string;
  experienceLevel: ExperienceLevel;
  hourlyWage: number;
  hoursPerWeek: number;
  lifestyleId: LifestyleTier['id'];
  expenses: Record<ExpenseCategory, number>;
  weeklyRemittance: number;
  remittanceCurrency: Currency;
  goalAmount: number;
  goalCurrency: Currency;
  thbPerAud: number;
  scamBannerDismissed: boolean;
  /** ISO YYYY-MM-DD — when the user starts (or started) earning. */
  startDate: string;
};

function wageForJobAndExperience(jobId: string, level: ExperienceLevel): number {
  const job = JOBS.find((j) => j.id === jobId) ?? JOBS[0];
  const exp = EXPERIENCE_LEVELS.find((e) => e.id === level) ?? EXPERIENCE_LEVELS[0];
  return Math.round(job.baseWage * exp.multiplier);
}

/**
 * Whether an i18n key exists in the dictionary at runtime.
 * Used to safely access optional new translations without breaking older
 * persisted state with missing keys.
 */

/** Today as ISO YYYY-MM-DD using local-timezone date components. */
function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function loadPersisted(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Persisted>;
  } catch {
    return {};
  }
}

function detectInitialLang(): Lang {
  const stored = loadPersisted().lang;
  if (stored === 'th' || stored === 'en') return stored;
  // Built for Thai WAH workers — default to Thai unless the browser is
  // explicitly English-locale (e.g. someone shares the link with a friend).
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'th';
}

export default function App() {
  const persisted = useMemo(() => loadPersisted(), []);
  const cachedRate = useMemo(() => loadCachedRate(), []);

  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [jobId, setJobId] = useState<string>(persisted.jobId ?? JOBS[0].id);
  // Default to first-timer — most users are in their first months in Australia.
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    persisted.experienceLevel ?? 'first_timer',
  );
  const [hourlyWage, setHourlyWage] = useState<number>(
    persisted.hourlyWage ??
      wageForJobAndExperience(persisted.jobId ?? JOBS[0].id, persisted.experienceLevel ?? 'first_timer'),
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(persisted.hoursPerWeek ?? HOURS_DEFAULT);
  const [lifestyleId, setLifestyleId] = useState<LifestyleTier['id']>(persisted.lifestyleId ?? 'budget');
  const [expenses, setExpenses] = useState<Record<ExpenseCategory, number>>(
    persisted.expenses ?? LIFESTYLE_TIERS.find((tier) => tier.id === (persisted.lifestyleId ?? 'budget'))!.defaults,
  );
  const [weeklyRemittance, setWeeklyRemittance] = useState<number>(persisted.weeklyRemittance ?? 0);
  const [remittanceCurrency, setRemittanceCurrency] = useState<Currency>(persisted.remittanceCurrency ?? 'AUD');
  const [goalAmount, setGoalAmount] = useState<number>(persisted.goalAmount ?? GOAL_DEFAULT);
  const [goalCurrency, setGoalCurrency] = useState<Currency>(persisted.goalCurrency ?? 'AUD');
  const [thbPerAud, setThbPerAud] = useState<number>(
    cachedRate?.rate ?? persisted.thbPerAud ?? DEFAULT_THB_PER_AUD,
  );
  const [scamBannerDismissed, setScamBannerDismissed] = useState<boolean>(persisted.scamBannerDismissed ?? false);
  const [startDateISO, setStartDateISO] = useState<string>(persisted.startDate ?? todayISODate());

  // Track where the current rate came from (for the small label under the input).
  type RateMeta =
    | { source: 'auto'; date: string }
    | { source: 'manual' }
    | { source: 'default' };
  const [rateMeta, setRateMeta] = useState<RateMeta>(() => {
    if (cachedRate) return { source: 'auto', date: cachedRate.rateDate ?? cachedRate.fetchedDate };
    return { source: 'default' };
  });

  // Auto-fetch the AUD→THB rate once per day. Cached in localStorage so we
  // don't refetch within the same day across reloads.
  useEffect(() => {
    if (cachedRate && isToday(cachedRate.fetchedDate)) {
      return;
    }
    // Otherwise fetch fresh in the background.
    const ctrl = new AbortController();
    fetchAudToThb(ctrl.signal).then((result) => {
      if (!result) return;
      saveCachedRate(result.rate, result.rateDate);
      setThbPerAud(result.rate);
      setRateMeta({ source: 'auto', date: result.rateDate });
    });
    return () => ctrl.abort();
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const data: Persisted = {
      lang, jobId, experienceLevel, hourlyWage, hoursPerWeek, lifestyleId, expenses,
      weeklyRemittance, remittanceCurrency,
      goalAmount, goalCurrency, thbPerAud, scamBannerDismissed,
      startDate: startDateISO,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore (e.g. private mode)
    }
  }, [lang, jobId, experienceLevel, hourlyWage, hoursPerWeek, lifestyleId, expenses, weeklyRemittance, remittanceCurrency, goalAmount, goalCurrency, thbPerAud, scamBannerDismissed, startDateISO]);

  const job = JOBS.find((j) => j.id === jobId) ?? JOBS[0];
  const tier = LIFESTYLE_TIERS.find((t) => t.id === lifestyleId) ?? LIFESTYLE_TIERS[0];

  // Goal + remittance might be entered in THB; calc always works in AUD.
  const safeRate = thbPerAud > 0 ? thbPerAud : DEFAULT_THB_PER_AUD;
  const goalInAUD = goalCurrency === 'AUD' ? goalAmount : goalAmount / safeRate;
  const remittanceInAUD =
    remittanceCurrency === 'AUD' ? weeklyRemittance : weeklyRemittance / safeRate;

  // Remittance is treated mathematically identical to expenses (post-tax outflow).
  const totalExpenses =
    expenses.rent + expenses.food + expenses.transport + expenses.other + remittanceInAUD;

  const result = useMemo(
    () => calculate({
      hourlyWage,
      hoursPerWeek,
      weeklyExpenses: totalExpenses, // expenses are entered in weekly amounts
      goalAmount: goalInAUD,
      startDate: parseISODate(startDateISO),
    }),
    [hourlyWage, hoursPerWeek, totalExpenses, goalInAUD, startDateISO],
  );

  // Switch currency, auto-converting the displayed amount so the value
  // stays equivalent (e.g. 10,000 AUD ↔ 230,000 THB at rate 23).
  function switchGoalCurrency(next: Currency) {
    if (next === goalCurrency) return;
    const converted = next === 'THB'
      ? goalAmount * safeRate
      : goalAmount / safeRate;
    setGoalCurrency(next);
    setGoalAmount(Math.round(converted));
  }

  function switchRemittanceCurrency(next: Currency) {
    if (next === remittanceCurrency) return;
    const converted = next === 'THB'
      ? weeklyRemittance * safeRate
      : weeklyRemittance / safeRate;
    setRemittanceCurrency(next);
    setWeeklyRemittance(Math.round(converted));
  }

  function pickJob(id: string) {
    setJobId(id);
    setHourlyWage(wageForJobAndExperience(id, experienceLevel));
  }

  function pickExperience(level: ExperienceLevel) {
    setExperienceLevel(level);
    setHourlyWage(wageForJobAndExperience(jobId, level));
  }

  function pickLifestyle(id: LifestyleTier['id']) {
    setLifestyleId(id);
    const found = LIFESTYLE_TIERS.find((tier) => tier.id === id);
    if (found) setExpenses({ ...found.defaults });
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header lang={lang} onToggleLang={() => setLang(lang === 'th' ? 'en' : 'th')} />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-2 space-y-4">
        {!scamBannerDismissed && (
          <ScamWarning lang={lang} onDismiss={() => setScamBannerDismissed(true)} />
        )}

        {/* JOB */}
        <Card>
          <SectionLabel text={t(lang, 'section_job')} />
          <PillGrid>
            {JOBS.map((j) => (
              <Pill
                key={j.id}
                selected={j.id === jobId}
                onClick={() => pickJob(j.id)}
                label={lang === 'th' ? j.th : j.en}
                emoji={j.emoji}
              />
            ))}
          </PillGrid>

          {/* Experience level — scales the first-timer wage up to "established" */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              {t(lang, 'section_experience')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {EXPERIENCE_LEVELS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => pickExperience(opt.id)}
                  aria-pressed={opt.id === experienceLevel}
                  className={
                    'flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-sm transition ' +
                    (opt.id === experienceLevel
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300')
                  }
                >
                  <span className="text-xl mb-0.5" aria-hidden="true">{opt.emoji}</span>
                  <span className="text-xs">{lang === 'th' ? opt.th : opt.en}</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {t(lang, `experience_${opt.id === 'first_timer' ? 'first_timer' : opt.id === 'some_experience' ? 'some' : 'established'}_hint` as 'experience_first_timer_hint')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Editable hourly wage — defaults to job × experience-level multiplier */}
          <div className="mt-4">
            <p className="mb-1.5 text-xs text-stone-500">
              <span aria-hidden="true">{job.emoji}</span> {lang === 'th' ? job.th : job.en}
            </p>
            <MoneyInput
              value={hourlyWage}
              onChange={setHourlyWage}
              lang={lang}
              ariaLabel={t(lang, 'baht_per_hour')}
              suffix={t(lang, 'baht_per_hour')}
              allowDecimals
            />
            {/* Empowerment message — uses the conservative national base rate
                ($25/hr NMW), NOT a per-job estimate. Link is on its own line
                for emphasis + easier tap target on mobile. */}
            <p className="mt-2 text-[11px] text-emerald-800 leading-relaxed">
              {tVars(lang, 'wage_reality_note', {
                wage: `${LEGAL_MIN_AUD_HR} ${t(lang, 'baht_per_hour')}`,
              })}
            </p>
            <a
              href="https://calculate.fairwork.gov.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-900"
            >
              {t(lang, 'wage_reality_link')}
            </a>
          </div>
        </Card>

        {/* HOURS */}
        <Card>
          <div className="flex items-baseline justify-between">
            <SectionLabel text={t(lang, 'section_hours')} />
            <span className="text-2xl font-semibold tabular text-emerald-700">
              {hoursPerWeek}{' '}
              <span className="text-sm font-normal text-stone-500">{t(lang, 'hours_unit')}</span>
            </span>
          </div>
          <input
            type="range"
            min={HOURS_MIN}
            max={HOURS_MAX}
            step={HOURS_STEP}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="mt-4"
            aria-label={t(lang, 'section_hours')}
          />
          <div className="relative mt-1 h-4 text-xs text-stone-400 tabular">
            <span className="absolute left-0">{HOURS_MIN}</span>
            <span
              className="absolute -translate-x-1/2"
              style={{ left: `${((40 - HOURS_MIN) / (HOURS_MAX - HOURS_MIN)) * 100}%` }}
            >
              40
            </span>
            <span
              className="absolute -translate-x-1/2"
              style={{ left: `${((60 - HOURS_MIN) / (HOURS_MAX - HOURS_MIN)) * 100}%` }}
            >
              60
            </span>
            <span className="absolute right-0">{HOURS_MAX}</span>
          </div>
          <p className="mt-3 text-[11px] text-stone-400 leading-relaxed">
            {t(lang, 'six_month_cap_note')}{' '}
            <a
              href="https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/see-your-visa-conditions?product=462"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-600"
            >
              ({t(lang, 'six_month_cap_exception_link')})
            </a>
          </p>
        </Card>

        {/* LIFESTYLE */}
        <Card>
          <SectionLabel text={t(lang, 'section_lifestyle')} />
          <div className="grid grid-cols-3 gap-2">
            {LIFESTYLE_TIERS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => pickLifestyle(opt.id)}
                className={
                  'flex flex-col items-center justify-center rounded-xl border px-2 py-3 text-sm transition ' +
                  (opt.id === lifestyleId
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300')
                }
                aria-pressed={opt.id === lifestyleId}
              >
                <span className="text-2xl mb-1" aria-hidden="true">{opt.emoji}</span>
                <span>{lang === 'th' ? opt.th : opt.en}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {(['rent', 'food', 'transport', 'other'] as ExpenseCategory[]).map((cat) => (
              <div key={cat}>
                <label className="block text-xs text-stone-500 mb-1.5">
                  {t(lang, `expense_${cat}` as 'expense_rent')}
                </label>
                <MoneyInput
                  value={expenses[cat]}
                  onChange={(v) => setExpenses({ ...expenses, [cat]: v })}
                  lang={lang}
                  ariaLabel={t(lang, `expense_${cat}` as 'expense_rent')}
                  suffix={t(lang, 'baht')}
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-baseline justify-between border-t border-stone-100 pt-3">
            <span className="text-sm text-stone-500">{t(lang, 'expense_total')}</span>
            <span className="text-right">
              <span className="text-lg font-semibold tabular text-stone-700">
                {formatMoney(totalExpenses, lang)}{' '}
                <span className="text-xs font-normal text-stone-500">{t(lang, 'baht_per_week')}</span>
              </span>
              <span className="block text-[11px] text-stone-400 tabular">
                ≈ {formatMoney(totalExpenses * (52 / 12), lang)} {t(lang, 'baht_per_month')}
              </span>
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            {tier.emoji} {lang === 'th' ? tier.th : tier.en}
          </p>
        </Card>

        {/* SEND HOME / REMITTANCE — optional, common for Thai WAH workers.
            Same AUD/THB toggle as Goal so users can think in baht. */}
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <SectionLabel text={t(lang, 'section_remittance')} />
            <CurrencyToggle
              value={remittanceCurrency}
              onChange={switchRemittanceCurrency}
              labels={{ AUD: t(lang, 'baht'), THB: t(lang, 'thb') }}
            />
          </div>
          <MoneyInput
            value={weeklyRemittance}
            onChange={setWeeklyRemittance}
            lang={lang}
            ariaLabel={t(lang, 'section_remittance')}
            suffix={remittanceCurrency === 'AUD' ? t(lang, 'baht') : t(lang, 'thb')}
            placeholder="0"
          />
          {/* Equivalent in the other currency (only show when there's a value) */}
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
        </Card>

        {/* GOAL — supports AUD or THB with live conversion */}
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <SectionLabel text={t(lang, 'section_goal')} />
            <CurrencyToggle
              value={goalCurrency}
              onChange={switchGoalCurrency}
              labels={{ AUD: t(lang, 'baht'), THB: t(lang, 'thb') }}
            />
          </div>
          <MoneyInput
            value={goalAmount}
            onChange={setGoalAmount}
            lang={lang}
            ariaLabel={t(lang, 'goal_amount')}
            suffix={goalCurrency === 'AUD' ? t(lang, 'baht') : t(lang, 'thb')}
            size="lg"
          />
          {/* Equivalent in the other currency */}
          <p className="mt-2 text-xs text-stone-500 tabular">
            {t(lang, 'goal_equivalent_prefix')}{' '}
            <span className="font-semibold text-stone-700">
              {goalCurrency === 'AUD'
                ? `${formatMoney(goalAmount * safeRate, lang)} ${t(lang, 'thb')}`
                : `${formatMoney(goalInAUD, lang)} ${t(lang, 'baht')}`}
            </span>
          </p>
          {/* Editable exchange rate (auto-fetched daily, user can override) */}
          <div className="mt-3 border-t border-stone-100 pt-3">
            <div className="flex items-center gap-2">
              <label className="flex-1 text-xs text-stone-500">
                {t(lang, 'exchange_rate_label')}
              </label>
              <span className="text-xs text-stone-500 tabular">1 AUD =</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={thbPerAud}
                onChange={(e) => {
                  setThbPerAud(Math.max(0, Number(e.target.value) || 0));
                  setRateMeta({ source: 'manual' });
                }}
                className="w-20 rounded-md border border-stone-200 bg-white px-2 py-1 text-right text-sm font-semibold tabular text-stone-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                aria-label={t(lang, 'exchange_rate_label')}
              />
              <span className="text-xs text-stone-500 whitespace-nowrap">{t(lang, 'thb')}</span>
            </div>
            <p className="mt-1.5 text-[10px] text-stone-400 leading-relaxed">
              {rateMeta.source === 'auto' && (
                <>
                  {t(lang, 'rate_source_auto')} · {formatRateDate(rateMeta.date, lang)}
                </>
              )}
              {rateMeta.source === 'manual' && t(lang, 'rate_source_manual')}
              {rateMeta.source === 'default' && t(lang, 'rate_source_default')}
            </p>
          </div>
        </Card>

        {/* START DATE — defaults to today, configurable for future planning or back-dating */}
        <Card>
          <SectionLabel text={t(lang, 'section_start_date')} />
          <StartDatePicker
            valueISO={startDateISO}
            onChangeISO={setStartDateISO}
            lang={lang}
          />
          <p className="mt-1.5 text-[11px] text-stone-400">{t(lang, 'start_date_hint')}</p>
        </Card>

        {/* RESULT — always uses the AUD-equivalent goal so calculations are consistent */}
        <ResultCard result={result} lang={lang} goalAmount={goalInAUD} thbPerAud={safeRate} />

        <ResourcesPanel lang={lang} />

        <p className="pt-4 text-center text-xs text-stone-400 leading-relaxed">
          {t(lang, 'footer_note')}
        </p>
      </main>
    </div>
  );
}

/**
 * Month + year picker — two dropdowns, no day component. Goals are
 * calculated in months so day-level precision is noise. Year shows in
 * Buddhist (พ.ศ.) when the user's language is Thai.
 */
function StartDatePicker({
  valueISO,
  onChangeISO,
  lang,
}: {
  valueISO: string;
  onChangeISO: (iso: string) => void;
  lang: Lang;
}) {
  const date = parseISODate(valueISO);
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  // Localized full-name months derived once per render.
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(2024, i, 1).toLocaleDateString(
      lang === 'th' ? 'th-TH' : 'en-AU',
      { month: 'long' },
    ),
  );

  // Allow planning ±1 year in the past (already started) and ~6 years out.
  const startYear = now.getFullYear() - 1;
  const years = Array.from({ length: 8 }, (_, i) => startYear + i);

  function setMonthYear(newMonth: number, newYear: number) {
    const m = String(newMonth + 1).padStart(2, '0');
    onChangeISO(`${newYear}-${m}-01`);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => setMonthYear(Number(e.target.value), year)}
        className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-base font-semibold text-stone-900 hover:border-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer"
        aria-label={lang === 'th' ? 'เดือน' : 'Month'}
      >
        {monthNames.map((name, i) => (
          <option key={i} value={i}>{name}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => setMonthYear(month, Number(e.target.value))}
        className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-base font-semibold tabular text-stone-900 hover:border-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer"
        aria-label={lang === 'th' ? 'ปี' : 'Year'}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {lang === 'th' ? y + 543 : y}
          </option>
        ))}
      </select>
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={() => setMonthYear(now.getMonth(), now.getFullYear())}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-xs font-medium text-stone-600 hover:border-stone-300 transition whitespace-nowrap"
        >
          {t(lang, 'start_date_reset')}
        </button>
      )}
    </div>
  );
}

function ScamWarning({ lang, onDismiss }: { lang: Lang; onDismiss: () => void }) {
  // Thai-relevant official touchpoints. The Embassy page in Bangkok is the
  // actual application checklist; thaiwahclub is the Thai community guide.
  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-sm font-bold text-amber-900">{t(lang, 'scam_warning_title')}</h2>
          <p className="mt-1 text-xs text-amber-900/85 leading-relaxed">
            {t(lang, 'scam_warning_body')}
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <a
                href="https://thailand.embassy.gov.au/bkok/visa_subclass_462.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-amber-800 underline hover:text-amber-900"
              >
                {t(lang, 'scam_warning_link_embassy')} →
              </a>
            </li>
            <li>
              <a
                href="https://www.thaiwahclub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-amber-800 underline hover:text-amber-900"
              >
                {t(lang, 'scam_warning_link_community')} →
              </a>
            </li>
          </ul>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-800 hover:border-amber-400 transition"
          aria-label={t(lang, 'scam_warning_dismiss')}
        >
          {t(lang, 'scam_warning_dismiss')}
        </button>
      </div>
    </section>
  );
}

function ResourcesPanel({ lang }: { lang: Lang }) {
  const links: { href: string; key: 'resources_dha' | 'resources_thaiwahclub' | 'resources_embassy' | 'resources_ato_thai' }[] = [
    { href: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462', key: 'resources_dha' },
    { href: 'https://www.thaiwahclub.com/', key: 'resources_thaiwahclub' },
    { href: 'https://canberra.thaiembassy.org/work-holiday/', key: 'resources_embassy' },
    { href: 'https://www.ato.gov.au/other-languages/thai/tax-and-super-in-australia-what-you-need-to-know-thai', key: 'resources_ato_thai' },
  ];
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {t(lang, 'resources_heading')}
      </h2>
      <ul className="space-y-1.5">
        {links.map(({ href, key }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              → {t(lang, key)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── shared components ──────────────────────────────────────────────────── */

/** Format an ISO date (YYYY-MM-DD) as a short locale-aware label. */
function formatRateDate(iso: string, lang: Lang): string {
  // Parse as local date (avoid TZ-shift to previous day).
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

function Header({ lang, onToggleLang }: { lang: Lang; onToggleLang: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold leading-tight">{t(lang, 'appTitle')}</h1>
          <p className="text-xs text-stone-500 leading-tight">{t(lang, 'appSubtitle')}</p>
        </div>
        <button
          onClick={onToggleLang}
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:border-stone-400 hover:bg-stone-100 transition"
          aria-label="Toggle language"
        >
          {t(lang, 'lang_toggle')}
        </button>
      </div>
    </header>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      {children}
    </section>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">{text}</h2>;
}

function PillGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

/** Compact 2-segment toggle used to switch between AUD and THB on the goal. */
function CurrencyToggle({
  value,
  onChange,
  labels,
}: {
  value: Currency;
  onChange: (next: Currency) => void;
  labels: Record<Currency, string>;
}) {
  return (
    <div className="inline-flex rounded-lg bg-stone-100 p-0.5" role="radiogroup">
      {(['AUD', 'THB'] as Currency[]).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          role="radio"
          aria-checked={value === c}
          className={
            'rounded-md px-3 py-1 text-xs font-semibold transition ' +
            (value === c
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-stone-500 hover:text-stone-700')
          }
        >
          {labels[c]}
        </button>
      ))}
    </div>
  );
}

function Pill({
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
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ' +
        (selected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300')
      }
    >
      <span aria-hidden="true">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

/**
 * Unified money input used for hourly wage, expenses, and goal — same border,
 * same focus ring, same comma formatting. The display is comma-formatted
 * (e.g. "10,000") while typing is preserved verbatim and reformatted on blur.
 */
function MoneyInput({
  value,
  onChange,
  lang,
  ariaLabel,
  suffix,
  size = 'md',
  allowDecimals = false,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  lang: Lang;
  ariaLabel: string;
  suffix?: string;
  size?: 'md' | 'lg';
  allowDecimals?: boolean;
  placeholder?: string;
}) {
  const formatForDisplay = (v: number): string => {
    if (v === 0) return '';
    const locale = lang === 'th' ? 'th-TH' : 'en-AU';
    return v.toLocaleString(locale, { maximumFractionDigits: allowDecimals ? 2 : 0 });
  };

  const [text, setText] = useState<string>(() => formatForDisplay(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const displayValue = formatForDisplay(value);

  /**
   * Format with commas on every keystroke, preserving cursor position by
   * counting digit characters before the caret in the raw input and finding
   * the matching position in the freshly-formatted string.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;

    // How many digit/dot characters appeared before the caret in raw input?
    const digitsBeforeCaret = raw.slice(0, caret).replace(/[^\d.]/g, '').length;

    const cleaned = raw.replace(/[^\d.]/g, '');

    if (cleaned === '') {
      setText('');
      onChange(0);
      return;
    }
    if (cleaned === '.') {
      setText(allowDecimals ? '0.' : '');
      onChange(0);
      return;
    }

    const num = Number(cleaned);
    if (Number.isNaN(num)) return;

    let formatted = formatForDisplay(num);

    // Preserve trailing dot during decimal entry (e.g. "28." while typing "28.5")
    if (allowDecimals && cleaned.endsWith('.') && !formatted.endsWith('.')) {
      formatted += '.';
    }
    // Preserve trailing zeros in decimals (e.g. "28.50" → "28.5" loses the 0)
    if (allowDecimals) {
      const cleanedDecPart = cleaned.split('.')[1];
      const formattedDecPart = formatted.split('.')[1] ?? '';
      if (cleanedDecPart !== undefined && cleanedDecPart.length > formattedDecPart.length) {
        const trailingZeros = cleanedDecPart.slice(formattedDecPart.length).match(/0+$/)?.[0] ?? '';
        if (trailingZeros) formatted += trailingZeros;
      }
    }

    setText(formatted);
    onChange(Math.max(0, num));

    // Restore caret to a position that has the same digit count to its left.
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      let pos = 0;
      let seen = 0;
      while (pos < formatted.length && seen < digitsBeforeCaret) {
        if (/[\d.]/.test(formatted[pos])) seen++;
        pos++;
      }
      el.setSelectionRange(pos, pos);
    });
  }

  const padding = size === 'lg' ? 'px-3 py-3 text-xl' : 'px-3 py-2 text-base';

  return (
    <div className="flex items-center rounded-xl border border-stone-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
      <input
        ref={inputRef}
        type="text"
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        value={isFocused ? text : displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setText(formatForDisplay(value));
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`flex-1 bg-transparent ${padding} font-semibold tabular text-stone-900 placeholder:font-normal placeholder:text-stone-300 focus:outline-none`}
      />
      {suffix && (
        <span className="whitespace-nowrap px-3 text-sm text-stone-500">{suffix}</span>
      )}
    </div>
  );
}

/* ─── result + visualizations ────────────────────────────────────────────── */

function ResultCard({
  result,
  lang,
  goalAmount,
  thbPerAud,
}: {
  result: CalcResult;
  lang: Lang;
  goalAmount: number;
  thbPerAud: number;
}) {
  if (!result.reachable) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-bold text-amber-900">{t(lang, 'impossible_heading')}</h2>
        <p className="mt-2 text-sm text-amber-800 leading-relaxed">{t(lang, 'impossible_body')}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
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
    <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
        {t(lang, 'result_heading')}
      </p>

      <h2 className="mt-2 text-4xl sm:text-5xl font-bold leading-tight text-emerald-900 tabular">
        {result.monthsTotal === 0 ? (
          <span>{t(lang, 'months_zero')}</span>
        ) : (
          <DurationDisplay years={result.years} months={result.months} lang={lang} />
        )}
      </h2>

      {result.goalDate && (
        <p className="mt-2 text-sm text-stone-600">
          {t(lang, 'result_by_date')}{' '}
          <span className="font-semibold text-stone-800">{formatGoalDate(result.goalDate, lang)}</span>
        </p>
      )}

      {/* Save per week — primary (matches paycheck cadence). Monthly shown as hint. */}
      <div className="mt-5 rounded-xl bg-white border border-emerald-100 p-3">
        <p className="text-xs text-stone-500">{t(lang, 'result_save_per_week')}</p>
        <p className="mt-0.5 text-2xl font-bold tabular text-emerald-700">
          {formatMoney(result.weeklySavings, lang)}{' '}
          <span className="text-sm font-normal text-stone-500">{t(lang, 'baht')}</span>
        </p>
        <p className="mt-1 text-[11px] text-stone-400 tabular">
          ≈ {formatMoney(result.monthlySavings, lang)} {t(lang, 'baht')} {t(lang, 'result_per_month')}
          {' · '}
          {formatMoney(result.monthlySavings * thbPerAud, lang)} {t(lang, 'thb')} {t(lang, 'result_per_month')}
        </p>
      </div>

      {/* Income breakdown bar: Tax | Expenses | Savings — WEEKLY amounts to match paycheck cycle */}
      <div className="mt-5">
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
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-stone-600 tabular">
          <LegendItem color="bg-amber-500" label={t(lang, 'result_tax')} value={`${formatMoney(result.weeklyTax, lang)} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`} />
          <LegendItem color="bg-stone-400" label={t(lang, 'result_expenses')} value={`${formatMoney(result.weeklyExpenses, lang)} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`} />
          <LegendItem color="bg-emerald-500" label={t(lang, 'result_savings')} value={`${formatMoney(result.weeklySavings, lang)} / ${lang === 'th' ? 'สัปดาห์' : 'wk'}`} />
        </div>
      </div>

      {/* Visual tax bracket breakdown */}
      <TaxBreakdownPanel
        breakdown={result.taxBreakdown}
        annualGross={result.annualGrossIncome}
        monthlyTax={result.monthlyTax}
        lang={lang}
      />

      {/* Super + DASP — money you don't see in your weekly paycheck */}
      <SuperDaspPanel
        weeklySuper={result.weeklySuperAccrued}
        annualSuper={result.annualSuperAccrued}
        daspTax={result.daspTaxOnDeparture}
        daspNet={result.daspNetOnDeparture}
        lang={lang}
        thbPerAud={thbPerAud}
      />

      {/* Timeline */}
      <Timeline monthsTotal={result.monthsTotal} lang={lang} goalDate={result.goalDate} />

      <p className="mt-4 text-center text-xs text-stone-500">
        {t(lang, 'result_total_label')}:
        {' '}
        {formatMoney(result.monthlySavings, lang)} {t(lang, 'baht')} ×{' '}
        {result.monthsTotal} {t(lang, 'result_months')} ={' '}
        <span className="font-semibold tabular text-stone-700">
          {formatMoney(goalAmount, lang)} {t(lang, 'baht')}
        </span>
      </p>
      <p className="mt-1 text-center text-[11px] text-stone-400 tabular">
        {t(lang, 'result_equivalent_thb')}:{' '}
        <span className="font-semibold text-stone-600">
          {formatMoney(goalAmount * thbPerAud, lang)} {t(lang, 'thb')}
        </span>
      </p>
    </section>
  );
}

/**
 * Visual breakdown of WHV's two-band tax. Shows the user's annual income
 * split by the $45K threshold and the tax owed in each band.
 */
function TaxBreakdownPanel({
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
  // Bar width represents either annual income or the threshold — whichever is
  // larger — so the $45K marker is always visible (educational for low earners
  // who can see how much room they have before hitting the higher bracket).
  const scale = Math.max(annualGross, WHV_TAX_BAND_ANNUAL);
  const band1Pct = (breakdown.band1Income / scale) * 100;
  const band2Pct = (breakdown.band2Income / scale) * 100;
  const headroomPct = Math.max(0, 100 - band1Pct - band2Pct);
  const thresholdPct = (WHV_TAX_BAND_ANNUAL / scale) * 100;

  const band1RatePct = Math.round(WHV_TAX_RATE_BAND1 * 100); // 15
  const band2RatePct = Math.round(WHV_TAX_RATE_BAND2 * 1000) / 10; // 32.5

  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          {t(lang, 'tax_breakdown_heading')}
        </p>
        <p className="text-xs text-stone-500">
          {t(lang, 'tax_annual_income')}:{' '}
          <span className="font-semibold tabular text-stone-700">
            {formatMoney(annualGross, lang)} {t(lang, 'baht')}
          </span>
        </p>
      </div>

      {/* Bracket bar */}
      <div className="relative mt-3 h-8 overflow-hidden rounded-lg bg-stone-100 text-[11px] font-semibold">
        {/* 15% portion */}
        <div
          className="bar-fill absolute inset-y-0 left-0 flex items-center justify-center bg-amber-300 text-amber-900"
          style={{ width: `${band1Pct}%` }}
          aria-label={`${band1RatePct}% band`}
        >
          {band1Pct >= 14 && <span className="px-1">{band1RatePct}%</span>}
        </div>
        {/* 32.5% portion */}
        <div
          className="bar-fill absolute inset-y-0 flex items-center justify-center bg-amber-700 text-white"
          style={{ left: `${band1Pct}%`, width: `${band2Pct}%` }}
          aria-label={`${band2RatePct}% band`}
        >
          {band2Pct >= 14 && <span className="px-1">{band2RatePct}%</span>}
        </div>
        {/* Headroom (only when annual income < $45K) */}
        {headroomPct > 0 && (
          <div
            className="absolute inset-y-0 right-0 flex items-center justify-end pr-1.5 text-[10px] text-stone-400"
            style={{ width: `${headroomPct}%` }}
          >
            {headroomPct >= 12 && <span className="italic">…{band2RatePct}% zone</span>}
          </div>
        )}
        {/* $45K threshold marker — only show when there's headroom (so it's visible & meaningful) */}
        {headroomPct > 0 && (
          <div
            className="absolute inset-y-0 w-px bg-amber-700/70"
            style={{ left: `${thresholdPct}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Per-band details */}
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
          <p className="text-[11px] italic text-stone-500 leading-relaxed">
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
        {/* Monthly tax — primary, since people budget month-to-month
            and this is what ties back to the main breakdown bar above. */}
        <div className="flex items-baseline justify-between border-t border-amber-200 pt-2">
          <span className="text-sm font-semibold text-stone-700">{t(lang, 'tax_monthly_total')}</span>
          <span className="text-base font-bold tabular text-amber-800">
            {formatMoney(monthlyTax, lang)} {t(lang, 'baht')}
          </span>
        </div>
        {/* Annual total as supporting context. */}
        <p className="text-right text-[11px] text-stone-500">
          {t(lang, 'tax_annual_equivalent')}:{' '}
          <span className="font-semibold tabular text-stone-700">
            {formatMoney(breakdown.totalAnnualTax, lang)} {t(lang, 'baht')}
          </span>
        </p>
      </div>

      {/* Thai-citizen Medicare exemption note */}
      <p className="mt-3 border-t border-amber-100 pt-2 text-[10px] italic text-stone-500 leading-relaxed">
        {t(lang, 'medicare_thai_note')}
      </p>
    </div>
  );
}

function DurationDisplay({ years, months, lang }: { years: number; months: number; lang: Lang }) {
  const yearLabel = years === 1 ? t(lang, 'result_year_singular') : t(lang, 'result_years');
  const monthLabel = months === 1 ? t(lang, 'result_month_singular') : t(lang, 'result_months');
  return (
    <span>
      {years > 0 && (
        <>
          <span>{years}</span>{' '}
          <span className="text-2xl sm:text-3xl font-medium text-emerald-700/80">{yearLabel}</span>
          {months > 0 && <span className="text-emerald-700/40"> · </span>}
        </>
      )}
      {months > 0 && (
        <>
          <span>{months}</span>{' '}
          <span className="text-2xl sm:text-3xl font-medium text-emerald-700/80">{monthLabel}</span>
        </>
      )}
    </span>
  );
}

function Timeline({
  monthsTotal,
  lang,
  goalDate,
}: {
  monthsTotal: number;
  lang: Lang;
  goalDate: Date | null;
}) {
  if (!goalDate || monthsTotal === 0) return null;

  const now = new Date();
  const totalMs = goalDate.getTime() - now.getTime();

  const allYears: number[] = [];
  if (totalMs > 0) {
    const startYear = now.getFullYear();
    const endYear = goalDate.getFullYear();
    for (let y = startYear + 1; y <= endYear; y++) allYears.push(y);
  }

  const MAX_TICKS = 3;
  const stride = Math.max(1, Math.ceil(allYears.length / MAX_TICKS));
  const pickedYears = allYears.filter((_, i) => i % stride === 0);

  const ticks = pickedYears
    .map((y) => {
      const tickDate = new Date(y, 0, 1);
      const pct = ((tickDate.getTime() - now.getTime()) / totalMs) * 100;
      return {
        label: lang === 'th' ? String(y + 543) : String(y),
        pct,
      };
    })
    .filter((tk) => tk.pct > 14 && tk.pct < 80);

  return (
    <div className="mt-6">
      <div className="relative h-2 rounded-full bg-stone-100">
        <div className="bar-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500" style={{ width: '100%' }} />
        {ticks.map((tk) => (
          <div
            key={tk.label}
            className="absolute top-1/2 -translate-y-1/2 h-3 w-px bg-white"
            style={{ left: `${tk.pct}%` }}
            aria-hidden="true"
          />
        ))}
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-emerald-600 border-2 border-white shadow" />
      </div>
      <div className="mt-2 relative h-4 text-[10px] text-stone-500 tabular">
        <span className="absolute left-0">{lang === 'th' ? 'วันนี้' : 'Today'}</span>
        {ticks.map((tk) => (
          <span
            key={tk.label}
            className="absolute -translate-x-1/2"
            style={{ left: `${tk.pct}%` }}
          >
            {tk.label}
          </span>
        ))}
        <span className="absolute right-0 font-semibold text-emerald-700">
          {formatGoalDate(goalDate, lang)}
        </span>
      </div>
    </div>
  );
}

/**
 * Surfaces the "invisible" Super contributions and the DASP refund a WAH
 * worker gets back when they leave Australia. Shown as a separate panel
 * because it doesn't affect weekly take-home — it's a bonus on departure.
 */
function SuperDaspPanel({
  weeklySuper,
  annualSuper,
  daspTax,
  daspNet,
  lang,
  thbPerAud,
}: {
  weeklySuper: number;
  annualSuper: number;
  daspTax: number;
  daspNet: number;
  lang: Lang;
  thbPerAud: number;
}) {
  if (annualSuper <= 0) return null;
  return (
    <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
        {t(lang, 'super_heading')}
      </p>
      <p className="mt-1 text-[11px] text-stone-600 leading-relaxed">
        {t(lang, 'super_explainer')}
      </p>

      {/* Equation: Super  −  DASP tax  =  Take home. Right-aligned tabular
          numbers, every value forced to a single line. */}
      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-stone-600">{t(lang, 'super_accrued_label')}</dt>
          <dd className="whitespace-nowrap font-semibold tabular text-stone-800">
            +{formatMoney(annualSuper, lang)} {t(lang, 'baht')}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-stone-500">{t(lang, 'dasp_tax_label')}</dt>
          <dd className="whitespace-nowrap tabular text-stone-500">
            −{formatMoney(daspTax, lang)} {t(lang, 'baht')}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-sky-200 pt-2">
          <dt className="text-sm font-semibold text-stone-700">{t(lang, 'dasp_net_label')}</dt>
          <dd className="whitespace-nowrap text-base font-bold tabular text-sky-700">
            {formatMoney(daspNet, lang)} {t(lang, 'baht')}
          </dd>
        </div>
      </dl>
      <p className="mt-1.5 text-right text-[10px] text-stone-400 tabular">
        ≈ {formatMoney(weeklySuper, lang)} {t(lang, 'baht')} {t(lang, 'super_per_week')}
      </p>
      <p className="mt-1 text-right text-[11px] text-sky-700 tabular">
        {t(lang, 'result_equivalent_thb')}: {formatMoney(daspNet * thbPerAud, lang)} {t(lang, 'thb')}
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
    <div className="flex items-center justify-between gap-2">
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

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className={'inline-block h-2 w-2 rounded-full ' + color} />
        <span className="text-[11px] text-stone-500">{label}</span>
      </div>
      <p className="font-semibold text-stone-700 tabular">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 border border-amber-100 p-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-0.5 font-semibold tabular text-stone-800">{value}</p>
    </div>
  );
}
