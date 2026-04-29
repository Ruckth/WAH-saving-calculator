/**
 * Curated catalogs for Thai Working Holiday Visa (WAH) workers in Australia (2026).
 *
 * The app's central question is: "If I take a typical WAH job, work N hours/week,
 * and live at [Budget/Average/Comfortable] tier — when will I reach my savings goal?"
 *
 * Numbers are realistic but rounded for clarity. Users can override expense
 * amounts and the goal; jobs and tier presets are fixed starting points.
 */

export type Lang = 'th' | 'en';

export type Job = {
  id: string;
  emoji: string;
  /** Legal casual minimum hourly wage in AUD (entry-level, post-July 2025
   *  award rates incl. 25% casual loading). Multiplied by EXPERIENCE_LEVELS
   *  to project pay as the worker gains skills / negotiating power.
   *
   *  Principle: never default below the legal minimum. Many WAH workers are
   *  underpaid in practice, but anchoring users to sub-minimum normalises
   *  wage theft. We show the legal floor as the goal — and link to Fair
   *  Work Ombudsman so they can claim back if paid less.
   */
  baseWage: number;
  th: string;
  en: string;
};

// All rates are LEGAL BASE MINIMUMS (Part-time / Full-time) verified against
// Fair Work pay guides (post-1 July 2025 Annual Wage Review). These are the
// HOURLY rates BEFORE any casual loading. Casual workers add +25% on top.
//
// Why base rates and not casual? Workers don't always know their contract type.
// Showing the base rate is the universally applicable "no employer can pay below
// this for any contract" floor — and it matches the number on a part-time or
// full-time payslip. Casual workers see this number, know they get +25% more,
// and edit the wage up.
//
//   National Minimum Wage base: $24.95/hr → rounded to $25
//   Casual = base × 1.25 (e.g. NMW casual = $31.19/hr)
//
// Award                                       | L1 base /hr  | Casual /hr
// --------------------------------------------|--------------|------------
// Hospitality MA000009 L1                     | $24.95 → $25 | $31.19
// Hospitality MA000009 L2 (waiter, barista)   | $25.85 → $26 | $32.31
// Horticulture MA000028 L1                    | $24.28 → $25 | $30.35
// Cleaning Services MA000022 L1               | $25.85 → $26 | $32.31
// General Retail MA000004 L1                  | $26.55 → $27 | $33.19
// Storage Services MA000084 grade 1           | $25.85 → $26 | $32.31
// Building & Construction MA000020 CW1        | $27.06 → $27 | $33.83
// Meat Industry MA000059 MI1                  | $24.28 → $25 | $30.35
// Children's Services MA000120 CSE 1          | $24.95 → $25 | $31.19
// Nanny (private household, unregulated)      | NMW $24.95 → $25 | $31.19
//
// Source: https://calculate.fairwork.gov.au/ (each award's pay guide PDF)
export const JOBS: Job[] = [
  { id: 'thai_resto',   emoji: '🥢', baseWage: 25, th: 'ร้านอาหารไทย',             en: 'Thai restaurant' },
  { id: 'farm',         emoji: '🍓', baseWage: 25, th: 'คนงานฟาร์ม / เก็บผลไม้',  en: 'Farm work / fruit picking' },
  { id: 'hospitality',  emoji: '🍳', baseWage: 25, th: 'ผู้ช่วยในครัว',           en: 'Kitchen hand / hospitality' },
  { id: 'waiter',       emoji: '🍽️', baseWage: 26, th: 'พนักงานเสิร์ฟ',           en: 'Waiter / bartender' },
  { id: 'cleaner',      emoji: '🧹', baseWage: 26, th: 'พนักงานทำความสะอาด',      en: 'Cleaner' },
  { id: 'retail',       emoji: '🛍️', baseWage: 27, th: 'พนักงานขายในร้าน',        en: 'Retail assistant' },
  { id: 'warehouse',    emoji: '📦', baseWage: 26, th: 'พนักงานคลังสินค้า',        en: 'Warehouse / packer' },
  { id: 'construction', emoji: '🔨', baseWage: 27, th: 'คนงานก่อสร้าง',           en: 'Construction labour' },
  { id: 'barista',      emoji: '☕', baseWage: 26, th: 'บาริสต้า',                 en: 'Cafe barista' },
  { id: 'housekeeping', emoji: '🛏️', baseWage: 25, th: 'แม่บ้านโรงแรม',           en: 'Hotel housekeeping' },
  { id: 'meatworks',    emoji: '🥩', baseWage: 25, th: 'พนักงานโรงงานเนื้อสัตว์', en: 'Meat processing' },
  { id: 'childcare',    emoji: '🧒', baseWage: 25, th: 'พี่เลี้ยงเด็ก',           en: 'Childcare / nanny' },
  // Catch-all for jobs not in the curated list — user types their own wage.
  { id: 'other',        emoji: '💼', baseWage: 25, th: 'อื่นๆ',                    en: 'Other' },
];

/**
 * Experience tiers represent skill/seniority progression on top of the legal
 * casual minimum. Conservative multipliers: even "established" stays grounded
 * in award realities (not negotiated salaried roles).
 */
export type ExperienceLevel = 'first_timer' | 'some_experience' | 'established';

export const EXPERIENCE_LEVELS: { id: ExperienceLevel; emoji: string; multiplier: number; th: string; en: string }[] = [
  { id: 'first_timer',     emoji: '🌱', multiplier: 1.0,  th: 'มือใหม่',         en: 'Entry level' },
  { id: 'some_experience', emoji: '🌿', multiplier: 1.15, th: 'พอมีประสบการณ์',  en: 'Some experience' },
  { id: 'established',     emoji: '🌳', multiplier: 1.30, th: 'มีทักษะ',         en: 'Skilled / senior' },
];

export type ExpenseCategory = 'rent' | 'food' | 'transport' | 'other';

export type LifestyleTier = {
  id: 'budget' | 'average' | 'comfortable';
  emoji: string;
  th: string;
  en: string;
  defaults: Record<ExpenseCategory, number>;
};

// WEEKLY AUD for a single adult living in a major Australian city
// (Sydney/Melbourne/Brisbane/Perth scale, 2026).
//
// Why weekly? Australian casual jobs pay weekly, rent is quoted weekly
// ("$200/week"), and WAH workers naturally think in weekly cadence — the
// paycheck cycle matches the bill cycle.
export const LIFESTYLE_TIERS: LifestyleTier[] = [
  {
    id: 'budget',
    emoji: '🌱',
    th: 'ประหยัด',
    en: 'Budget',
    // Shared room in hostel/sharehouse, cook own meals, public transport.
    defaults: { rent: 200, food: 100, transport: 25, other: 50 },
  },
  {
    id: 'average',
    emoji: '🌿',
    th: 'ปานกลาง',
    en: 'Average',
    // Own room in sharehouse, mix cook + eat out, occasional Uber.
    defaults: { rent: 320, food: 140, transport: 50, other: 90 },
  },
  {
    id: 'comfortable',
    emoji: '🌳',
    th: 'สบาย',
    en: 'Comfortable',
    // Studio apartment, eat out often, full transport access.
    defaults: { rent: 500, food: 210, transport: 80, other: 175 },
  },
];

// 12 hours × 7 days = 84 — the realistic WAH grind ceiling.
// Note: subclass 462 caps you at 6 months with the same employer.
export const HOURS_MIN = 10;
export const HOURS_MAX = 84;
export const HOURS_STEP = 1;
export const HOURS_DEFAULT = 40;

// AUD 10,000 ≈ a year of solid WAH savings — meaningful but achievable.
export const GOAL_DEFAULT = 10000;

// Default AUD→THB rate (~2026). Editable in-app so users can refresh
// to whatever the bank/Wise gives them on the day they're planning.
export const DEFAULT_THB_PER_AUD = 23;

export type Currency = 'AUD' | 'THB';

/**
 * Australian National Minimum Wage BASE hourly rate (post-1 July 2025):
 * $24.95/hr — applies to part-time and full-time employees. Casual workers
 * receive this rate + 25% casual loading = $31.19/hr.
 *
 * We surface the BASE rate as "the legal floor" so it works for all contract
 * types. Workers who don't know if they're casual or part-time can rely on
 * this as the universal minimum. Casual workers get +25% on top — mentioned
 * in the empowerment message so they don't accept the base when entitled
 * to the loading.
 *
 * Source: https://www.fairwork.gov.au/pay-and-wages/minimum-wages
 */
export const LEGAL_MIN_AUD_HR = 25;
/** @deprecated kept for back-compat — alias of LEGAL_MIN_AUD_HR. */
export const LEGAL_MIN_CASUAL_AUD_HR = LEGAL_MIN_AUD_HR;
