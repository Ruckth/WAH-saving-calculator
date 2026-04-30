import {
  DEFAULT_THB_PER_AUD,
  EXPERIENCE_LEVELS,
  HOURS_DEFAULT,
  HOURS_MAX,
  JOBS,
  type Currency,
  type ExpenseCategory,
  type ExperienceLevel,
  type Lang,
  type LifestyleTier,
} from '../data';

export const STORAGE_KEY = 'savings-vision:v2';
export const MAX_JOBS = 3;
export const TIP_CREATOR_URL = 'https://6ef1uc7a62.ufs.sh/f/YuAp8ZPhEJz2JS6FsdqN4ZUqynLQS3MClrTz8RHuY5Vxje2D';

export type JobPlan = {
  id: string;
  jobId: string;
  experienceLevel: ExperienceLevel;
  hourlyWage: number;
  hoursPerWeek: number;
};

export type Persisted = {
  lang: Lang;
  jobs: JobPlan[];
  lifestyleId: LifestyleTier['id'];
  expenses: Record<ExpenseCategory, number>;
  weeklyRemittance: number;
  remittanceCurrency: Currency;
  workWeeksPerYear: number;
  goalAmount: number;
  goalCurrency: Currency;
  thbPerAud: number;
  scamBannerDismissed: boolean;
  startDate: string;
};

export type RateMeta =
  | { source: 'auto'; date: string }
  | { source: 'manual' }
  | { source: 'default' };

export function wageForJobAndExperience(jobId: string, level: ExperienceLevel): number {
  const job = JOBS.find((item) => item.id === jobId) ?? JOBS[0];
  const experience = EXPERIENCE_LEVELS.find((item) => item.id === level) ?? EXPERIENCE_LEVELS[0];
  return Math.round(job.baseWage * experience.multiplier);
}

export function todayISODate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function makeJobId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createJobPlan(overrides: Partial<JobPlan> = {}): JobPlan {
  const jobId = overrides.jobId ?? JOBS[0].id;
  const experienceLevel = overrides.experienceLevel ?? 'first_timer';
  return {
    id: overrides.id ?? makeJobId(),
    jobId,
    experienceLevel,
    hourlyWage: overrides.hourlyWage ?? wageForJobAndExperience(jobId, experienceLevel),
    hoursPerWeek: overrides.hoursPerWeek ?? HOURS_DEFAULT,
  };
}

export function clampJobsToHoursMax(jobs: JobPlan[]): JobPlan[] {
  let remainingHours = HOURS_MAX;
  return jobs.map((job) => {
    const hoursPerWeek = Math.min(Math.max(0, job.hoursPerWeek), remainingHours);
    remainingHours -= hoursPerWeek;
    return { ...job, hoursPerWeek };
  });
}

export function normalizePersistedJobs(persisted: Partial<Persisted>): JobPlan[] {
  if (Array.isArray(persisted.jobs) && persisted.jobs.length > 0) {
    return clampJobsToHoursMax(persisted.jobs.slice(0, MAX_JOBS).map((job) => createJobPlan(job)));
  }

  const legacyJobId = (persisted as Partial<{ jobId: string }>).jobId ?? JOBS[0].id;
  const legacyExperience =
    (persisted as Partial<{ experienceLevel: ExperienceLevel }>).experienceLevel ?? 'first_timer';
  const legacyHourlyWage =
    (persisted as Partial<{ hourlyWage: number }>).hourlyWage ??
    wageForJobAndExperience(legacyJobId, legacyExperience);
  const legacyHours = (persisted as Partial<{ hoursPerWeek: number }>).hoursPerWeek ?? HOURS_DEFAULT;

  return clampJobsToHoursMax([
    createJobPlan({
      jobId: legacyJobId,
      experienceLevel: legacyExperience,
      hourlyWage: legacyHourlyWage,
      hoursPerWeek: legacyHours,
    }),
  ]);
}

export function loadPersisted(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Persisted>;
  } catch {
    return {};
  }
}

export function detectInitialLang(): Lang {
  const stored = loadPersisted().lang;
  if (stored === 'th' || stored === 'en') return stored;
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'th';
}

export function getSafeRate(rate: number): number {
  return rate > 0 ? rate : DEFAULT_THB_PER_AUD;
}
