import { t } from '../../i18n';
import type { Lang } from '../../data';

export function TipCreatorSection({ lang, onOpen }: { lang: Lang; onOpen: () => void }) {
  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between gap-3 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-rose-50 px-4 py-3 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-amber-100" aria-hidden="true">
            ☕
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-stone-800">{t(lang, 'tip_creator_button')}</span>
            <span className="text-[11px] text-stone-500">{t(lang, 'tip_creator_caption')}</span>
          </span>
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
          {t(lang, 'tip_creator_chip')}
        </span>
      </button>
    </div>
  );
}
