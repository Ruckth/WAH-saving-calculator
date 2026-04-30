import type { Lang } from './data';

/**
 * Lightweight TH/EN dictionary. No i18n library — flat keys, easy to scan.
 * Add a key to BOTH languages or TypeScript will complain.
 */
export const DICT = {
  th: {
    appTitle: 'ฝันเก็บเงิน',
    appSubtitle: 'เก็บเงินช่วง Work And Holiday ที่ออสเตรเลีย',

    section_job: 'ฉันทำงานเป็น',
    section_experience: 'ระดับประสบการณ์',
    experience_first_timer_hint: 'L1 casual',
    experience_some_hint: 'L2-L3 มีทักษะ',
    experience_established_hint: 'ต่อรองได้',
    wage_reality_note: 'ค่าจ้างขั้นต่ำตามกฎหมาย ~{wage} (Part-time / Full-time) ถ้า Casual บวก 25% เช็คอัตราตามอาชีพ:',
    wage_reality_link: 'เครื่องคำนวณ Fair Work →',
    section_hours: 'ทำงานสัปดาห์ละ',
    hours_unit: 'ชั่วโมง',
    section_lifestyle: 'ใช้ชีวิตแบบ',
    section_goal: 'เป้าหมายเงินออม',

    expense_rent: 'ค่าเช่า',
    expense_food: 'ค่าอาหาร',
    expense_transport: 'ค่าเดินทาง',
    expense_other: 'อื่นๆ',
    expense_total: 'รวมค่าใช้จ่าย',

    goal_amount: 'จำนวนเงินเป้าหมาย',
    baht: 'AUD',
    baht_per_month: 'AUD / เดือน',
    baht_per_week: 'AUD / สัปดาห์',
    baht_per_hour: 'AUD / ชั่วโมง',
    thb: 'บาท',
    exchange_rate_label: 'อัตราแลกเปลี่ยน',
    exchange_rate_unit: 'บาท / 1 AUD',
    goal_equivalent_prefix: 'เทียบเท่า',
    result_total_label: 'รวมเป้าหมาย',
    result_equivalent_thb: 'คิดเป็นเงินไทย',
    rate_source_auto: '🔄 อัปเดตอัตโนมัติจาก frankfurter.dev',
    rate_source_manual: '✏️ แก้ไขเอง',
    rate_source_default: 'ใช้อัตราเริ่มต้น',

    result_heading: 'คุณจะเก็บเงินครบใน',
    result_years: 'ปี',
    result_months: 'เดือน',
    result_year_singular: 'ปี',
    result_month_singular: 'เดือน',
    result_by_date: 'ภายใน',
    result_save_per_month: 'เก็บเงินเดือนละ',
    result_save_per_week: 'เก็บเงินสัปดาห์ละ',
    result_per_month: 'ต่อเดือน',
    result_per_week: 'ต่อสัปดาห์',
    result_gross: 'รายได้รวม',
    result_tax: 'ภาษี',
    result_net: 'รายได้สุทธิ',
    result_expenses: 'ค่าใช้จ่าย',
    result_savings: 'เงินออม',
    tax_note: 'ภาษี WAH 15% (รายได้ไม่เกิน $45K/ปี)',
    tax_breakdown_heading: 'การคำนวณภาษี WAH',
    tax_annual_income: 'รายได้ต่อปี',
    tax_band1_label: 'ส่วนแรก × 15%',
    tax_band2_label: 'ส่วนเกิน $45,000 × 30%',
    tax_band3_label: 'ส่วนเกิน $135,000 × 37%',
    tax_band4_label: 'ส่วนเกิน $190,000 × 45%',
    tax_threshold_marker: 'เพดาน $45,000/ปี',
    tax_monthly_total: 'ภาษีต่อเดือน',
    tax_annual_equivalent: 'รวมต่อปี',
    tax_under_threshold_note: 'รายได้คุณยังไม่ถึง $45,000/ปี เลยเสียภาษีแค่ 15% เท่านั้น',
    medicare_thai_note: '💡 คนไทยขอยกเว้น Medicare Levy 2% ได้ — ขอใบ Medicare Entitlement Statement จาก Services Australia แล้วเคลมตอนยื่นภาษี',
    super_heading: 'Super + เงินคืนตอนกลับไทย',
    super_explainer: 'นายจ้างจ่าย Super 12% บนค่าจ้าง (ไม่หักจากเงินเดือน) ขอคืนได้ตอนกลับ แต่โดนภาษี 65%',
    super_accrued_label: 'Super สะสม / ปี',
    super_per_week: '/ สัปดาห์',
    dasp_tax_label: 'ภาษี DASP (65%)',
    dasp_net_label: '🎁 รับจริงตอนกลับ',

    impossible_heading: 'ยังไปไม่ถึงเป้าหมาย',
    impossible_body: 'หลังหักภาษีและค่าใช้จ่ายแล้ว ยังไม่มีเงินเหลือเก็บ ลองเพิ่มชั่วโมงทำงาน หรือใช้ชีวิตประหยัดกว่านี้',

    months_zero: 'ไม่ถึงหนึ่งเดือน',

    lang_toggle: 'EN',

    footer_note: 'ตัวเลขทั้งหมดเป็นค่าโดยประมาณสำหรับวางแผน Work And Holiday ไม่รวมประกันสุขภาพและค่าใช้จ่ายอื่นๆ ที่อาจเกิดขึ้น',
    section_remittance: 'ส่งกลับบ้าน (ถ้ามี)',
    remittance_hint: 'จำนวนเงินที่ส่งให้ครอบครัวต่อสัปดาห์',
    section_start_date: 'วันเริ่มทำงาน',
    start_date_hint: 'ตั้งเป็นวันที่จะเริ่ม (ยังไม่มาออสเตรเลียก็ได้) หรือวันที่เริ่มแล้ว',
    start_date_reset: 'วันนี้',
    scam_warning_title: '⚠️ ระวังเอเจนซี่ปลอม',
    scam_warning_body: 'สมัคร WAH เองได้ฟรี ไม่ต้องผ่านเอเจนซี่ ดูขั้นตอนจริงสำหรับคนไทย:',
    scam_warning_link_embassy: '🇦🇺 สถานทูตออสเตรเลีย กรุงเทพฯ',
    scam_warning_link_community: '🇹🇭 thaiwahclub (คู่มือภาษาไทย)',
    scam_warning_dismiss: 'รับทราบ',
    six_month_cap_note: '⏱️ วีซ่า 462 จำกัด 6 เดือนกับนายจ้างเดียวกัน',
    six_month_cap_exception_link: 'ยกเว้น อ่าน →',
    resources_heading: 'แหล่งข้อมูลที่มีประโยชน์',
    resources_dha: 'รัฐบาลออสเตรเลีย — วีซ่า 462',
    resources_thaiwahclub: 'thaiwahclub — ชุมชนคนไทย WAH',
    resources_embassy: 'สถานทูตไทย ณ แคนเบอร์รา',
    resources_ato_thai: 'ATO ภาษีสำหรับคนไทย (TH)',
  },
  en: {
    appTitle: 'Savings Vision',
    appSubtitle: 'Save up during your Work And Holiday in Australia',

    section_job: 'I work as',
    section_experience: 'Skill level',
    experience_first_timer_hint: 'L1 casual',
    experience_some_hint: 'L2-L3 skilled',
    experience_established_hint: 'Negotiated',
    wage_reality_note: 'Legal minimum ~{wage} (Part-time / Full-time). Casual = +25% loading. Find your award:',
    wage_reality_link: 'Fair Work pay calculator →',
    section_hours: 'Hours per week',
    hours_unit: 'hours',
    section_lifestyle: 'I live',
    section_goal: 'My savings goal',

    expense_rent: 'Rent',
    expense_food: 'Food',
    expense_transport: 'Transport',
    expense_other: 'Other',
    expense_total: 'Total expenses',

    goal_amount: 'Goal amount',
    baht: 'AUD',
    baht_per_month: 'AUD / mo',
    baht_per_week: 'AUD / wk',
    baht_per_hour: 'AUD / hr',
    thb: 'THB',
    exchange_rate_label: 'Exchange rate',
    exchange_rate_unit: 'THB per 1 AUD',
    goal_equivalent_prefix: '≈',
    result_total_label: 'Goal total',
    result_equivalent_thb: 'In THB',
    rate_source_auto: '🔄 Auto-updated from frankfurter.dev',
    rate_source_manual: '✏️ Manual override',
    rate_source_default: 'Default rate',

    result_heading: "You'll reach your goal in",
    result_years: 'years',
    result_months: 'months',
    result_year_singular: 'year',
    result_month_singular: 'month',
    result_by_date: 'by',
    result_save_per_month: 'Save per month',
    result_save_per_week: 'Save per week',
    result_per_month: 'per month',
    result_per_week: 'per week',
    result_gross: 'Gross income',
    result_tax: 'Tax',
    result_net: 'Net income',
    result_expenses: 'Expenses',
    result_savings: 'Savings',
    tax_note: 'WAH tax 15% (on income up to $45K/yr)',
    tax_breakdown_heading: 'WAH tax calculation',
    tax_annual_income: 'Annual income',
    tax_band1_label: 'First slice × 15%',
    tax_band2_label: 'Above $45,000 × 30%',
    tax_band3_label: 'Above $135,000 × 37%',
    tax_band4_label: 'Above $190,000 × 45%',
    tax_threshold_marker: '$45,000/yr line',
    tax_monthly_total: 'Monthly tax',
    tax_annual_equivalent: 'Annual total',
    tax_under_threshold_note: "You're under the $45K/yr line — flat 15% on every dollar.",
    medicare_thai_note: '💡 Thai citizens can claim Medicare levy exemption (2%) — request a Medicare Entitlement Statement from Services Australia and claim it on your tax return.',
    super_heading: 'Super + DASP refund',
    super_explainer: 'Employer adds 12% Super on top of wages (not deducted). Claimable on departure but taxed at 65%.',
    super_accrued_label: 'Super accrued / yr',
    super_per_week: '/ wk',
    dasp_tax_label: 'DASP tax (65%)',
    dasp_net_label: '🎁 Take home on departure',

    impossible_heading: 'Not reachable yet',
    impossible_body: 'After tax and living costs, nothing is left to save. Try working more hours or choosing a more budget lifestyle.',

    months_zero: 'Less than a month',

    lang_toggle: 'ไทย',

    footer_note: 'All figures are estimates for planning. Excludes health insurance and other variable costs.',
    section_remittance: 'Send home (optional)',
    remittance_hint: 'Money you send to family each week',
    section_start_date: 'Start date',
    start_date_hint: 'Set to a future arrival date, or back-date if you\'ve already started.',
    start_date_reset: 'Today',
    scam_warning_title: '⚠️ Watch out for fake agents',
    scam_warning_body: 'You can apply for WAH yourself, free — never pay unknown agents. The official process for Thai citizens:',
    scam_warning_link_embassy: '🇦🇺 Australian Embassy Bangkok',
    scam_warning_link_community: '🇹🇭 thaiwahclub (Thai-language guide)',
    scam_warning_dismiss: 'Got it',
    six_month_cap_note: '⏱️ Subclass 462 caps you at 6 months with the same employer',
    six_month_cap_exception_link: 'see exceptions →',
    resources_heading: 'Helpful resources',
    resources_dha: 'Australian Government — visa 462',
    resources_thaiwahclub: 'thaiwahclub — Thai WAH community',
    resources_embassy: 'Royal Thai Embassy, Canberra',
    resources_ato_thai: 'ATO tax info in Thai',
  },
} as const;

// Make sure the two dictionaries stay in sync at compile time.
type ThKeys = keyof typeof DICT.th;
type EnKeys = keyof typeof DICT.en;
type _AssertSame = ThKeys extends EnKeys ? (EnKeys extends ThKeys ? true : never) : never;
const _check: _AssertSame = true;
void _check;

export type DictKey = ThKeys;

export function t(lang: Lang, key: DictKey): string {
  return DICT[lang][key];
}

/**
 * Like t() but substitutes {placeholders} with the given values.
 * e.g. tVars(lang, 'wage_reality_note', { wage: '$31/hr' })
 */
export function tVars(lang: Lang, key: DictKey, vars: Record<string, string | number>): string {
  let s: string = DICT[lang][key];
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(`{${k}}`, String(v));
  }
  return s;
}
