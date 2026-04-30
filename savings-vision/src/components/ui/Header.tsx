import { t } from '../../i18n';
import type { Lang } from '../../data';

export function Header({ lang, onToggleLang }: { lang: Lang; onToggleLang: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
        <div>
          <h1 className="text-base font-bold leading-tight sm:text-lg">{t(lang, 'appTitle')}</h1>
          <p className="text-[11px] leading-tight text-stone-500 sm:text-xs">{t(lang, 'appSubtitle')}</p>
        </div>
        <button
          onClick={onToggleLang}
          className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 sm:px-3 sm:py-1.5 sm:text-sm"
          aria-label="Toggle language"
        >
          {t(lang, 'lang_toggle')}
        </button>
      </div>
    </header>
  );
}
