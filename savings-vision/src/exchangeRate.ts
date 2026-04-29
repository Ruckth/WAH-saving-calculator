/**
 * AUD → THB exchange rate, fetched once a day from frankfurter.dev.
 *
 * Why Frankfurter?
 *   • Free, no API key, no rate limit for casual use
 *   • ECB-sourced (trusted central-bank data)
 *   • CORS-enabled, HTTPS, returns clean JSON
 *   • Updated each business day around 16:00 CET
 *
 * Cache strategy: store the rate + ISO date in localStorage. On app mount we
 * check the date; if it's not today, we re-fetch. On failure we silently fall
 * back to the cached value (any age) or the hard-coded default.
 */

const STORAGE_KEY = 'savings-vision:rate';
const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=AUD&symbols=THB';

export type CachedRate = {
  rate: number;
  /** ISO date "YYYY-MM-DD" — when WE fetched it, not the ECB publish date. */
  fetchedDate: string;
  /** ISO date the rate is for, as reported by Frankfurter. */
  rateDate?: string;
};

export async function fetchAudToThb(signal?: AbortSignal): Promise<{ rate: number; rateDate: string } | null> {
  try {
    const res = await fetch(FRANKFURTER_URL, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.rates?.THB;
    const rateDate = typeof data?.date === 'string' ? data.date : todayISO();
    if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) return null;
    return { rate, rateDate };
  } catch {
    return null;
  }
}

export function loadCachedRate(): CachedRate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data?.rate === 'number' && typeof data?.fetchedDate === 'string') {
      return data;
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveCachedRate(rate: number, rateDate?: string) {
  const data: CachedRate = {
    rate,
    fetchedDate: todayISO(),
    rateDate,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore (private mode, etc.)
  }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(isoDate: string): boolean {
  return isoDate === todayISO();
}
