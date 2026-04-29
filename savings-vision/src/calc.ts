import type { Lang } from './data';

/** Average weeks per month (52/12). */
export const WEEKS_PER_MONTH = 52 / 12;

/**
 * Working Holiday Maker (WAH / subclass 462) tax — Australia, 2025–26 ATO
 * schedule. Stage 3 tax cuts (1 July 2024) reduced the 32.5% rate to 30%.
 * Brackets remain in place for 2025–26 unchanged.
 *
 *   • 15%  on the first      AUD $45,000/year
 *   • 30%  on $45,001  →     $135,000
 *   • 37%  on $135,001 →     $190,000
 *   • 45%  on $190,001 →     and above
 *
 * No tax-free threshold (unlike residents).
 * Source: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-working-holiday-makers
 */
export const WHV_TAX_RATE_BAND1 = 0.15;
export const WHV_TAX_RATE_BAND2 = 0.30;  // was 0.325 pre Stage 3 cuts
export const WHV_TAX_RATE_BAND3 = 0.37;
export const WHV_TAX_RATE_BAND4 = 0.45;
export const WHV_TAX_BAND_ANNUAL = 45000;   // band1 → band2 threshold
export const WHV_TAX_BAND2_CEIL = 135000;   // band2 → band3 threshold
export const WHV_TAX_BAND3_CEIL = 190000;   // band3 → band4 threshold
/** @deprecated kept for back-compat — alias of WHV_TAX_RATE_BAND1. */
export const WHV_TAX_RATE = WHV_TAX_RATE_BAND1;

/**
 * Super Guarantee — 12% from 1 July 2025. Paid by the employer ON TOP of
 * the wage (not deducted from take-home). Goes into a super fund the worker
 * can claim back as DASP when they leave Australia.
 * Source: https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee
 */
export const SUPER_GUARANTEE_RATE = 0.12;

/**
 * Departing Australia Superannuation Payment (DASP) tax for WHMs: 65% on the
 * taxed taxable component. So a Thai WAH worker only nets ~35% of their super
 * on departure — the rest is lost to tax.
 * Source: https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/temporary-residents-and-superannuation/departing-australia-superannuation-payment-dasp
 */
export const DASP_TAX_RATE_WHM = 0.65;

export type CalcInput = {
  hourlyWage: number;
  hoursPerWeek: number;
  /** Weekly expenses in AUD (Australian convention — rent quoted per week). */
  weeklyExpenses: number;
  goalAmount: number;
  /** When earning starts. Defaults to today; can be future-dated if planning
   *  ahead, or back-dated if already started. */
  startDate?: Date;
};

export type TaxBreakdown = {
  /** Income in the 15% band (≤ $45K). */
  band1Income: number;
  band1Tax: number;
  /** Income in the 30% band ($45K–$135K). 0 if income ≤ $45K. */
  band2Income: number;
  band2Tax: number;
  /** Income in the 37% band ($135K–$190K). Rare for WAH. */
  band3Income: number;
  band3Tax: number;
  /** Income in the 45% band (>$190K). Rare for WAH. */
  band4Income: number;
  band4Tax: number;
  totalAnnualTax: number;
};

export type CalcResult = {
  // Weekly figures — primary unit (matches paycheck + Australian rent cycle).
  weeklyGrossIncome: number;
  weeklyTax: number;
  weeklyNetIncome: number;
  weeklyExpenses: number;
  weeklySavings: number;
  // Monthly figures — kept for users who think monthly + tax framing.
  monthlyGrossIncome: number;
  monthlyTax: number;
  monthlyNetIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  // Annual — required for tax bracket math.
  annualGrossIncome: number;
  taxBreakdown: TaxBreakdown;
  // Super (paid by employer, not deducted from take-home pay).
  weeklySuperAccrued: number;
  annualSuperAccrued: number;
  // DASP — what you get back when you leave Australia.
  daspNetOnDeparture: number;
  daspTaxOnDeparture: number;
  reachable: boolean;
  monthsTotal: number; // 0 if not reachable
  years: number;
  months: number;
  goalDate: Date | null;
};

function computeTaxBreakdown(annualGross: number): TaxBreakdown {
  const safeGross = Math.max(0, annualGross);

  // Band 1: 15% on income up to $45K
  const band1Income = Math.min(safeGross, WHV_TAX_BAND_ANNUAL);
  const band1Tax = band1Income * WHV_TAX_RATE_BAND1;

  // Band 2: 30% on income $45K–$135K (post-Stage-3-cuts rate)
  const band2Income = Math.max(0, Math.min(safeGross, WHV_TAX_BAND2_CEIL) - WHV_TAX_BAND_ANNUAL);
  const band2Tax = band2Income * WHV_TAX_RATE_BAND2;

  // Bands 3 + 4 — almost no WAH worker hits these but include for correctness.
  const band3Income = Math.max(0, Math.min(safeGross, WHV_TAX_BAND3_CEIL) - WHV_TAX_BAND2_CEIL);
  const band3Tax = band3Income * WHV_TAX_RATE_BAND3;
  const band4Income = Math.max(0, safeGross - WHV_TAX_BAND3_CEIL);
  const band4Tax = band4Income * WHV_TAX_RATE_BAND4;

  return {
    band1Income,
    band1Tax,
    band2Income,
    band2Tax,
    band3Income,
    band3Tax,
    band4Income,
    band4Tax,
    totalAnnualTax: band1Tax + band2Tax + band3Tax + band4Tax,
  };
}

export function calculate(input: CalcInput): CalcResult {
  // Weekly figures (primary)
  const weeklyGrossIncome = input.hourlyWage * input.hoursPerWeek;
  const weeklyExpenses = Math.max(0, input.weeklyExpenses);

  // Monthly + annual derived from weekly
  const monthlyGrossIncome = weeklyGrossIncome * WEEKS_PER_MONTH;
  const annualGrossIncome = weeklyGrossIncome * 52;
  const taxBreakdown = computeTaxBreakdown(annualGrossIncome);
  const monthlyTax = taxBreakdown.totalAnnualTax / 12;
  const weeklyTax = taxBreakdown.totalAnnualTax / 52;
  const monthlyNetIncome = monthlyGrossIncome - monthlyTax;
  const weeklyNetIncome = weeklyGrossIncome - weeklyTax;
  const monthlyExpenses = weeklyExpenses * WEEKS_PER_MONTH;
  const monthlySavings = monthlyNetIncome - monthlyExpenses;
  const weeklySavings = weeklyNetIncome - weeklyExpenses;

  // Super accrued by employer (on top of wages, not from take-home).
  const annualSuperAccrued = annualGrossIncome * SUPER_GUARANTEE_RATE;
  const weeklySuperAccrued = annualSuperAccrued / 52;
  // DASP — claimable on departure, but taxed at 65% for WHMs.
  const daspTaxOnDeparture = annualSuperAccrued * DASP_TAX_RATE_WHM;
  const daspNetOnDeparture = annualSuperAccrued - daspTaxOnDeparture;

  const baseFields = {
    weeklyGrossIncome,
    weeklyTax,
    weeklyNetIncome,
    weeklyExpenses,
    weeklySavings,
    monthlyGrossIncome,
    monthlyTax,
    monthlyNetIncome,
    monthlyExpenses,
    monthlySavings,
    annualGrossIncome,
    taxBreakdown,
    weeklySuperAccrued,
    annualSuperAccrued,
    daspNetOnDeparture,
    daspTaxOnDeparture,
  };

  if (weeklySavings <= 0 || input.goalAmount <= 0) {
    return {
      ...baseFields,
      reachable: weeklySavings > 0,
      monthsTotal: 0,
      years: 0,
      months: 0,
      goalDate: null,
    };
  }

  const monthsTotal = Math.ceil(input.goalAmount / monthlySavings);
  const years = Math.floor(monthsTotal / 12);
  const months = monthsTotal % 12;

  // Goal date = startDate + monthsTotal. Lets users plan for a future
  // arrival or back-date if they've already started saving.
  const startDate = input.startDate ?? new Date();
  const goalDate = new Date(startDate);
  goalDate.setDate(1);
  goalDate.setMonth(goalDate.getMonth() + monthsTotal);

  return {
    ...baseFields,
    reachable: true,
    monthsTotal,
    years,
    months,
    goalDate,
  };
}

export function formatMoney(amount: number, lang: Lang): string {
  const rounded = Math.round(amount);
  // Both locales render numbers with comma thousand separators (e.g. "10,000").
  return rounded.toLocaleString(lang === 'th' ? 'th-TH' : 'en-AU');
}

export function formatGoalDate(date: Date, lang: Lang): string {
  if (lang === 'th') {
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
  }
  return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
}
