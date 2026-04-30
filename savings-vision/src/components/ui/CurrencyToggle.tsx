import type { Currency } from '../../data';

export function CurrencyToggle({
  value,
  onChange,
  labels,
}: {
  value: Currency;
  onChange: (next: Currency) => void;
  labels: Record<Currency, string>;
}) {
  return (
    <div className="inline-flex rounded-lg bg-stone-100 p-0.5" role="radiogroup">
      {(['AUD', 'THB'] as Currency[]).map((currency) => (
        <button
          key={currency}
          onClick={() => onChange(currency)}
          role="radio"
          aria-checked={value === currency}
          className={
            'rounded-md px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs ' +
            (value === currency
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-stone-500 hover:text-stone-700')
          }
        >
          {labels[currency]}
        </button>
      ))}
    </div>
  );
}
