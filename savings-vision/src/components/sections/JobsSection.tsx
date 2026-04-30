import { EXPERIENCE_LEVELS, HOURS_MAX, HOURS_STEP, JOBS, LEGAL_MIN_AUD_HR, type Lang } from '../../data';
import { formatMoney } from '../../calc';
import { t, tVars } from '../../i18n';
import { MAX_JOBS, type JobPlan } from '../../lib/appState';
import { Card } from '../ui/Card';
import { MoneyInput } from '../ui/MoneyInput';
import { Pill } from '../ui/Pill';
import { PillGrid } from '../ui/PillGrid';
import { SectionLabel } from '../ui/SectionLabel';

export function JobsSection({
  lang,
  jobs,
  totalHoursPerWeek,
  totalWeeklyGrossIncome,
  hoursOverSoftLimit,
  onPickJob,
  onPickExperience,
  onSetJobHourlyWage,
  onSetJobHours,
  onAddJob,
  onRemoveJob,
}: {
  lang: Lang;
  jobs: JobPlan[];
  totalHoursPerWeek: number;
  totalWeeklyGrossIncome: number;
  hoursOverSoftLimit: boolean;
  onPickJob: (jobEntryId: string, nextJobId: string) => void;
  onPickExperience: (jobEntryId: string, level: JobPlan['experienceLevel']) => void;
  onSetJobHourlyWage: (jobEntryId: string, wage: number) => void;
  onSetJobHours: (jobEntryId: string, hours: number) => void;
  onAddJob: () => void;
  onRemoveJob: (jobEntryId: string) => void;
}) {
  return (
    <Card>
      <SectionLabel text={t(lang, 'section_jobs')} />
      <p className="mb-4 text-[11px] leading-relaxed text-stone-500">
        {t(lang, 'jobs_intro')}
      </p>

      <div className="space-y-4">
        {jobs.map((jobPlan, index) => {
          const job = JOBS.find((item) => item.id === jobPlan.jobId) ?? JOBS[0];
          const maxHoursForJob = Math.max(0, HOURS_MAX - (totalHoursPerWeek - jobPlan.hoursPerWeek));
          return (
            <section
              key={jobPlan.id}
              className={index === 0 ? '' : 'rounded-2xl border border-stone-200 bg-stone-50/70 p-3 sm:p-4'}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-stone-800">
                    {index === 0 ? t(lang, 'primary_job') : tVars(lang, 'job_number', { number: index + 1 })}
                  </h3>
                  <p className="mt-1 text-[11px] text-stone-500">
                    <span aria-hidden="true">{job.emoji}</span> {lang === 'th' ? job.th : job.en}
                  </p>
                </div>
                {jobs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveJob(jobPlan.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:text-xs"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                    {t(lang, 'remove_job')}
                  </button>
                )}
              </div>

              <div className="mt-3">
                <PillGrid>
                  {JOBS.map((item) => (
                    <Pill
                      key={item.id}
                      selected={item.id === jobPlan.jobId}
                      onClick={() => onPickJob(jobPlan.id, item.id)}
                      label={lang === 'th' ? item.th : item.en}
                      emoji={item.emoji}
                    />
                  ))}
                </PillGrid>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t(lang, 'section_experience')}
                </p>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {EXPERIENCE_LEVELS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onPickExperience(jobPlan.id, option.id)}
                      aria-pressed={option.id === jobPlan.experienceLevel}
                      className={
                        'flex min-h-[72px] flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-xs transition sm:min-h-[92px] sm:px-2 sm:py-2.5 sm:text-sm ' +
                        (option.id === jobPlan.experienceLevel
                          ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-800'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300')
                      }
                    >
                      <span className="mb-0.5 text-lg sm:text-xl" aria-hidden="true">{option.emoji}</span>
                      <span className="text-[11px] leading-tight sm:text-xs">{lang === 'th' ? option.th : option.en}</span>
                      <span className="text-[9px] font-normal text-stone-400 sm:text-[10px]">
                        {t(
                          lang,
                          `experience_${option.id === 'first_timer' ? 'first_timer' : option.id === 'some_experience' ? 'some' : 'established'}_hint` as 'experience_first_timer_hint',
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <label className="mb-1.5 block text-[11px] text-stone-500">
                    {t(lang, 'job_hourly_rate')}
                  </label>
                  <MoneyInput
                    value={jobPlan.hourlyWage}
                    onChange={(value) => onSetJobHourlyWage(jobPlan.id, value)}
                    lang={lang}
                    ariaLabel={t(lang, 'job_hourly_rate')}
                    suffix={t(lang, 'baht_per_hour')}
                    allowDecimals
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <label className="text-[11px] text-stone-500">
                      {t(lang, 'section_hours')}
                    </label>
                    <span className="text-base font-semibold tabular text-emerald-700">
                      {jobPlan.hoursPerWeek}{' '}
                      <span className="text-xs font-normal text-stone-500">{t(lang, 'hours_unit')}</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxHoursForJob}
                    step={HOURS_STEP}
                    value={jobPlan.hoursPerWeek}
                    onChange={(event) => onSetJobHours(jobPlan.id, Number(event.target.value))}
                    className="mt-3 w-full"
                    aria-label={`${t(lang, 'section_hours')} ${index + 1}`}
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-700">
              {t(lang, 'total_hours')}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular text-emerald-900">
              {totalHoursPerWeek}{' '}
              <span className="text-sm font-normal text-emerald-700">{t(lang, 'hours_unit')}</span>
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-700">
              {t(lang, 'total_weekly_income')}
            </p>
            <p className="mt-1 text-xl font-semibold tabular text-emerald-900">
              {formatMoney(totalWeeklyGrossIncome, lang)}{' '}
              <span className="text-xs font-normal text-emerald-700">{t(lang, 'baht_per_week')}</span>
            </p>
          </div>
        </div>
        {hoursOverSoftLimit && (
          <p className="mt-3 text-[11px] leading-relaxed text-amber-800">
            {t(lang, 'hours_warning')}
          </p>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
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
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-emerald-800">
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

      {jobs.length < MAX_JOBS && totalHoursPerWeek < HOURS_MAX && (
        <div className="mt-4 border-t border-dashed border-stone-200 pt-4">
          <button
            type="button"
            onClick={onAddJob}
            className="flex w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            + {t(lang, 'add_job')}
          </button>
          <p className="mt-2 text-center text-[11px] text-stone-500">
            {t(lang, 'jobs_limit_hint')}
          </p>
        </div>
      )}
    </Card>
  );
}
