import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_THB_PER_AUD,
  GOAL_DEFAULT,
  HOURS_MAX,
  LIFESTYLE_TIERS,
  WORK_WEEKS_PER_YEAR_DEFAULT,
  type Currency,
  type ExpenseCategory,
  type Lang,
  type LifestyleTier,
} from '../data';
import { calculate } from '../calc';
import { fetchAudToThb, isToday, loadCachedRate, saveCachedRate } from '../exchangeRate';
import {
  MAX_JOBS,
  STORAGE_KEY,
  TIP_CREATOR_DOWNLOAD_NAME,
  TIP_CREATOR_URL,
  type JobPlan,
  type RateMeta,
  type Persisted,
  createJobPlan,
  detectInitialLang,
  getSafeRate,
  loadPersisted,
  normalizePersistedJobs,
  parseISODate,
  todayISODate,
  wageForJobAndExperience,
} from '../lib/appState';

export type CalculatorState = {
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
  startDateISO: string;
  tipModalOpen: boolean;
  tipThankYou: boolean;
  rateMeta: RateMeta;
};

export type CalculatorDerived = {
  tier: LifestyleTier;
  safeRate: number;
  goalInAUD: number;
  remittanceInAUD: number;
  totalExpenses: number;
  totalHoursPerWeek: number;
  totalWeeklyGrossIncome: number;
  hoursOverSoftLimit: boolean;
  result: ReturnType<typeof calculate>;
};

export type CalculatorActions = {
  toggleLang: () => void;
  dismissScamBanner: () => void;
  pickJob: (jobEntryId: string, nextJobId: string) => void;
  pickExperience: (jobEntryId: string, level: JobPlan['experienceLevel']) => void;
  setJobHourlyWage: (jobEntryId: string, wage: number) => void;
  setJobHours: (jobEntryId: string, hours: number) => void;
  addJob: () => void;
  removeJob: (jobEntryId: string) => void;
  pickLifestyle: (id: LifestyleTier['id']) => void;
  updateExpense: (category: ExpenseCategory, value: number) => void;
  setWeeklyRemittance: (value: number) => void;
  switchRemittanceCurrency: (next: Currency) => void;
  setGoalAmount: (value: number) => void;
  switchGoalCurrency: (next: Currency) => void;
  setThbPerAudManual: (value: number) => void;
  setStartDateISO: (iso: string) => void;
  setWorkWeeksPerYear: (value: number) => void;
  openTipModal: () => void;
  closeTipModal: () => void;
  dismissTipModalImmediately: () => void;
  downloadTipQr: () => void;
};

export function useCalculatorState(): {
  state: CalculatorState;
  derived: CalculatorDerived;
  actions: CalculatorActions;
} {
  const persisted = useMemo(() => loadPersisted(), []);
  const cachedRate = useMemo(() => loadCachedRate(), []);
  const initialJobs = useMemo(() => normalizePersistedJobs(persisted), [persisted]);

  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [jobs, setJobs] = useState<JobPlan[]>(initialJobs);
  const [lifestyleId, setLifestyleId] = useState<LifestyleTier['id']>(persisted.lifestyleId ?? 'budget');
  const [expenses, setExpenses] = useState<Record<ExpenseCategory, number>>(
    persisted.expenses ?? LIFESTYLE_TIERS.find((tier) => tier.id === (persisted.lifestyleId ?? 'budget'))!.defaults,
  );
  const [weeklyRemittance, setWeeklyRemittance] = useState<number>(persisted.weeklyRemittance ?? 0);
  const [remittanceCurrency, setRemittanceCurrency] = useState<Currency>(persisted.remittanceCurrency ?? 'AUD');
  const [workWeeksPerYear, setWorkWeeksPerYear] = useState<number>(
    persisted.workWeeksPerYear ?? WORK_WEEKS_PER_YEAR_DEFAULT,
  );
  const [goalAmount, setGoalAmount] = useState<number>(persisted.goalAmount ?? GOAL_DEFAULT);
  const [goalCurrency, setGoalCurrency] = useState<Currency>(persisted.goalCurrency ?? 'AUD');
  const [thbPerAud, setThbPerAud] = useState<number>(
    cachedRate?.rate ?? persisted.thbPerAud ?? DEFAULT_THB_PER_AUD,
  );
  const [scamBannerDismissed, setScamBannerDismissed] = useState<boolean>(persisted.scamBannerDismissed ?? false);
  const [startDateISO, setStartDateISO] = useState<string>(persisted.startDate ?? todayISODate());
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipThankYou, setTipThankYou] = useState(false);
  const [rateMeta, setRateMeta] = useState<RateMeta>(() => {
    if (cachedRate) return { source: 'auto', date: cachedRate.rateDate ?? cachedRate.fetchedDate };
    return { source: 'default' };
  });

  useEffect(() => {
    if (cachedRate && isToday(cachedRate.fetchedDate)) return;

    const controller = new AbortController();
    fetchAudToThb(controller.signal).then((result) => {
      if (!result) return;
      saveCachedRate(result.rate, result.rateDate);
      setThbPerAud(result.rate);
      setRateMeta({ source: 'auto', date: result.rateDate });
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tipThankYou) return;
    const timer = window.setTimeout(() => {
      setTipThankYou(false);
      setTipModalOpen(false);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [tipThankYou]);

  useEffect(() => {
    const data: Persisted = {
      lang,
      jobs,
      lifestyleId,
      expenses,
      weeklyRemittance,
      remittanceCurrency,
      workWeeksPerYear,
      goalAmount,
      goalCurrency,
      thbPerAud,
      scamBannerDismissed,
      startDate: startDateISO,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [
    lang,
    jobs,
    lifestyleId,
    expenses,
    weeklyRemittance,
    remittanceCurrency,
    workWeeksPerYear,
    goalAmount,
    goalCurrency,
    thbPerAud,
    scamBannerDismissed,
    startDateISO,
  ]);

  const tier = useMemo(
    () => LIFESTYLE_TIERS.find((item) => item.id === lifestyleId) ?? LIFESTYLE_TIERS[0],
    [lifestyleId],
  );
  const safeRate = useMemo(() => getSafeRate(thbPerAud), [thbPerAud]);
  const goalInAUD = useMemo(
    () => (goalCurrency === 'AUD' ? goalAmount : goalAmount / safeRate),
    [goalAmount, goalCurrency, safeRate],
  );
  const remittanceInAUD = useMemo(
    () => (remittanceCurrency === 'AUD' ? weeklyRemittance : weeklyRemittance / safeRate),
    [weeklyRemittance, remittanceCurrency, safeRate],
  );
  const totalExpenses = useMemo(
    () => expenses.rent + expenses.food + expenses.transport + expenses.other + remittanceInAUD,
    [expenses, remittanceInAUD],
  );
  const totalHoursPerWeek = useMemo(
    () => jobs.reduce((sum, job) => sum + job.hoursPerWeek, 0),
    [jobs],
  );
  const totalWeeklyGrossIncome = useMemo(
    () => jobs.reduce((sum, job) => sum + job.hourlyWage * job.hoursPerWeek, 0),
    [jobs],
  );
  const hoursOverSoftLimit = totalHoursPerWeek > 60;
  const result = useMemo(
    () =>
      calculate({
        jobs,
        workWeeksPerYear,
        weeklyExpenses: totalExpenses,
        goalAmount: goalInAUD,
        startDate: parseISODate(startDateISO),
      }),
    [jobs, workWeeksPerYear, totalExpenses, goalInAUD, startDateISO],
  );

  function switchGoalCurrency(next: Currency) {
    if (next === goalCurrency) return;
    const converted = next === 'THB' ? goalAmount * safeRate : goalAmount / safeRate;
    setGoalCurrency(next);
    setGoalAmount(Math.round(converted));
  }

  function switchRemittanceCurrency(next: Currency) {
    if (next === remittanceCurrency) return;
    const converted = next === 'THB' ? weeklyRemittance * safeRate : weeklyRemittance / safeRate;
    setRemittanceCurrency(next);
    setWeeklyRemittance(Math.round(converted));
  }

  function updateJob(jobId: string, updater: (job: JobPlan) => JobPlan) {
    setJobs((current) => current.map((job) => (job.id === jobId ? updater(job) : job)));
  }

  function pickJob(jobEntryId: string, nextJobId: string) {
    updateJob(jobEntryId, (job) => ({
      ...job,
      jobId: nextJobId,
      hourlyWage: wageForJobAndExperience(nextJobId, job.experienceLevel),
    }));
  }

  function pickExperience(jobEntryId: string, level: JobPlan['experienceLevel']) {
    updateJob(jobEntryId, (job) => ({
      ...job,
      experienceLevel: level,
      hourlyWage: wageForJobAndExperience(job.jobId, level),
    }));
  }

  function setJobHourlyWage(jobEntryId: string, wage: number) {
    updateJob(jobEntryId, (job) => ({ ...job, hourlyWage: wage }));
  }

  function setJobHours(jobEntryId: string, hours: number) {
    setJobs((current) => {
      const otherHours = current.reduce(
        (sum, job) => (job.id === jobEntryId ? sum : sum + job.hoursPerWeek),
        0,
      );
      const maxForJob = Math.max(0, HOURS_MAX - otherHours);
      const nextHours = Math.min(maxForJob, Math.max(0, hours));
      return current.map((job) => (job.id === jobEntryId ? { ...job, hoursPerWeek: nextHours } : job));
    });
  }

  function addJob() {
    setJobs((current) => {
      if (current.length >= MAX_JOBS) return current;
      const remainingHours = Math.max(0, HOURS_MAX - current.reduce((sum, job) => sum + job.hoursPerWeek, 0));
      if (remainingHours <= 0) return current;
      return [...current, createJobPlan({ hoursPerWeek: Math.min(20, remainingHours) })];
    });
  }

  function removeJob(jobEntryId: string) {
    setJobs((current) => (current.length === 1 ? current : current.filter((job) => job.id !== jobEntryId)));
  }

  function pickLifestyle(id: LifestyleTier['id']) {
    setLifestyleId(id);
    const found = LIFESTYLE_TIERS.find((tierItem) => tierItem.id === id);
    if (found) setExpenses({ ...found.defaults });
  }

  function updateExpense(category: ExpenseCategory, value: number) {
    setExpenses((current) => ({ ...current, [category]: value }));
  }

  function setThbPerAudManual(value: number) {
    setThbPerAud(Math.max(0, value || 0));
    setRateMeta({ source: 'manual' });
  }

  function setClampedWorkWeeks(value: number) {
    setWorkWeeksPerYear(Math.min(52, Math.max(1, value)));
  }

  function openTipModal() {
    setTipThankYou(false);
    setTipModalOpen(true);
  }

  function closeTipModal() {
    setTipThankYou(true);
  }

  function dismissTipModalImmediately() {
    setTipThankYou(false);
    setTipModalOpen(false);
  }

  function downloadTipQr() {
    const link = document.createElement('a');
    link.href = new URL(TIP_CREATOR_URL, window.location.origin).toString();
    link.download = TIP_CREATOR_DOWNLOAD_NAME;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTipThankYou(true);
  }

  return {
    state: {
      lang,
      jobs,
      lifestyleId,
      expenses,
      weeklyRemittance,
      remittanceCurrency,
      workWeeksPerYear,
      goalAmount,
      goalCurrency,
      thbPerAud,
      scamBannerDismissed,
      startDateISO,
      tipModalOpen,
      tipThankYou,
      rateMeta,
    },
    derived: {
      tier,
      safeRate,
      goalInAUD,
      remittanceInAUD,
      totalExpenses,
      totalHoursPerWeek,
      totalWeeklyGrossIncome,
      hoursOverSoftLimit,
      result,
    },
    actions: {
      toggleLang: () => setLang((current) => (current === 'th' ? 'en' : 'th')),
      dismissScamBanner: () => setScamBannerDismissed(true),
      pickJob,
      pickExperience,
      setJobHourlyWage,
      setJobHours,
      addJob,
      removeJob,
      pickLifestyle,
      updateExpense,
      setWeeklyRemittance,
      switchRemittanceCurrency,
      setGoalAmount,
      switchGoalCurrency,
      setThbPerAudManual,
      setStartDateISO,
      setWorkWeeksPerYear: setClampedWorkWeeks,
      openTipModal,
      closeTipModal,
      dismissTipModalImmediately,
      downloadTipQr,
    },
  };
}
