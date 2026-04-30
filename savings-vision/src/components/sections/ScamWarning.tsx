import { t } from '../../i18n';
import type { Lang } from '../../data';

export function ScamWarning({ lang, onDismiss }: { lang: Lang; onDismiss: () => void }) {
  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-sm font-bold text-amber-900">{t(lang, 'scam_warning_title')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
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
          className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-800 transition hover:border-amber-400"
          aria-label={t(lang, 'scam_warning_dismiss')}
        >
          {t(lang, 'scam_warning_dismiss')}
        </button>
      </div>
    </section>
  );
}
