import { formatMoney } from '../../calc';
import { t } from '../../i18n';
import type { Lang } from '../../data';

export function SuperDaspPanel({
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
    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/50 p-3 sm:mt-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 sm:text-xs sm:tracking-wider">
        {t(lang, 'super_heading')}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
        {t(lang, 'super_explainer')}
      </p>

      <div className="mt-3 rounded-lg border border-sky-100 bg-white/70 p-3">
        <dl className="space-y-2 text-xs">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <dt className="text-stone-600">{t(lang, 'super_accrued_label')}</dt>
            <dd className="whitespace-nowrap font-semibold tabular text-stone-800">
              {formatMoney(annualSuper, lang)} {t(lang, 'baht')}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <dt className="text-stone-500">{t(lang, 'dasp_tax_label')}</dt>
            <dd className="whitespace-nowrap tabular text-rose-400">
              - {formatMoney(daspTax, lang)} {t(lang, 'baht')}
            </dd>
          </div>
          <div className="border-t border-dashed border-sky-200 pt-2">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
              <dt className="text-sm font-semibold text-stone-700">{t(lang, 'dasp_net_label')}</dt>
              <dd className="whitespace-nowrap text-base font-bold tabular text-sky-700">
                {formatMoney(daspNet, lang)} {t(lang, 'baht')}
              </dd>
            </div>
          </div>
        </dl>
      </div>
      <p className="mt-1.5 text-right text-[10px] tabular text-stone-400">
        ≈ {formatMoney(weeklySuper, lang)} {t(lang, 'baht')} {t(lang, 'super_per_week')}
      </p>
      <p className="mt-1 text-right text-[11px] tabular text-sky-700">
        {t(lang, 'result_equivalent_thb')}: {formatMoney(daspNet * thbPerAud, lang)} {t(lang, 'thb')}
      </p>
    </div>
  );
}
