import { t } from '../../i18n';
import type { Lang } from '../../data';
import { TIP_CREATOR_URL } from '../../lib/appState';

export function TipCreatorModal({
  lang,
  open,
  thanking,
  onClose,
  onDismiss,
  onDownload,
}: {
  lang: Lang;
  open: boolean;
  thanking: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onDownload: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/45 p-3 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl sm:p-5">
        {!thanking ? (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                <span aria-hidden="true">☕</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">{t(lang, 'tip_creator_title')}</h2>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  {t(lang, 'tip_creator_body')}
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-3">
              <div className="mb-3 flex items-center justify-center">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
                  {t(lang, 'tip_creator_badge')}
                </span>
              </div>
              <img
                src={TIP_CREATOR_URL}
                alt={t(lang, 'tip_creator_qr_alt')}
                className="mx-auto aspect-square w-full rounded-2xl border border-stone-200 bg-white object-contain shadow-sm"
              />
            </div>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-stone-500">
              {t(lang, 'tip_creator_qr_hint')}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
              >
                {t(lang, 'tip_creator_close')}
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
              >
                {t(lang, 'tip_creator_download')}
              </button>
            </div>
          </>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              {[0, 1, 2, 3, 4, 5].map((heart) => (
                <span
                  key={heart}
                  aria-hidden="true"
                  className="tip-heart absolute text-2xl"
                  style={{
                    left: `${12 + heart * 13}%`,
                    animationDelay: `${heart * 0.18}s`,
                  }}
                >
                  {heart % 2 === 0 ? '💚' : '🩷'}
                </span>
              ))}
              <span className="relative z-10 text-5xl animate-bounce" aria-hidden="true">☕</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-amber-800">
              {t(lang, 'tip_creator_thanks')}
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
              {t(lang, 'tip_creator_thanks_body')}
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
            >
              {t(lang, 'tip_creator_close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
