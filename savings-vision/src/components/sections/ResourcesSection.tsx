import { t } from '../../i18n';
import type { Lang } from '../../data';

const RESOURCE_LINKS: { href: string; key: 'resources_dha' | 'resources_thaiwahclub' | 'resources_embassy' | 'resources_ato_thai' }[] = [
  { href: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462', key: 'resources_dha' },
  { href: 'https://www.thaiwahclub.com/', key: 'resources_thaiwahclub' },
  { href: 'https://canberra.thaiembassy.org/work-holiday/', key: 'resources_embassy' },
  { href: 'https://www.ato.gov.au/other-languages/thai/tax-and-super-in-australia-what-you-need-to-know-thai', key: 'resources_ato_thai' },
];

export function ResourcesSection({ lang }: { lang: Lang }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {t(lang, 'resources_heading')}
      </h2>
      <ul className="space-y-1.5">
        {RESOURCE_LINKS.map(({ href, key }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              → {t(lang, key)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
