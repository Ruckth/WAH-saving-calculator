import { useRef, useState, type ChangeEvent } from 'react';
import type { Lang } from '../../data';

export function MoneyInput({
  value,
  onChange,
  lang,
  ariaLabel,
  suffix,
  size = 'md',
  allowDecimals = false,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  lang: Lang;
  ariaLabel: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  allowDecimals?: boolean;
  placeholder?: string;
}) {
  const formatForDisplay = (nextValue: number): string => {
    if (nextValue === 0) return '';
    const locale = lang === 'th' ? 'th-TH' : 'en-AU';
    return nextValue.toLocaleString(locale, { maximumFractionDigits: allowDecimals ? 2 : 0 });
  };

  const [text, setText] = useState<string>(() => formatForDisplay(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const displayValue = formatForDisplay(value);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    const digitsBeforeCaret = raw.slice(0, caret).replace(/[^\d.]/g, '').length;
    const cleaned = raw.replace(/[^\d.]/g, '');

    if (cleaned === '') {
      setText('');
      onChange(0);
      return;
    }
    if (cleaned === '.') {
      setText(allowDecimals ? '0.' : '');
      onChange(0);
      return;
    }

    const num = Number(cleaned);
    if (Number.isNaN(num)) return;

    let formatted = formatForDisplay(num);

    if (allowDecimals && cleaned.endsWith('.') && !formatted.endsWith('.')) {
      formatted += '.';
    }
    if (allowDecimals) {
      const cleanedDecPart = cleaned.split('.')[1];
      const formattedDecPart = formatted.split('.')[1] ?? '';
      if (cleanedDecPart !== undefined && cleanedDecPart.length > formattedDecPart.length) {
        const trailingZeros = cleanedDecPart.slice(formattedDecPart.length).match(/0+$/)?.[0] ?? '';
        if (trailingZeros) formatted += trailingZeros;
      }
    }

    setText(formatted);
    onChange(Math.max(0, num));

    requestAnimationFrame(() => {
      const element = inputRef.current;
      if (!element) return;
      let pos = 0;
      let seen = 0;
      while (pos < formatted.length && seen < digitsBeforeCaret) {
        if (/[\d.]/.test(formatted[pos])) seen++;
        pos++;
      }
      element.setSelectionRange(pos, pos);
    });
  }

  const padding =
    size === 'lg'
      ? 'px-3 py-3 text-xl'
      : size === 'sm'
        ? 'px-2 py-1.5 text-[13px] sm:px-3 sm:py-2 sm:text-base'
        : 'px-3 py-2 text-base';

  return (
    <div className="flex items-center rounded-xl border border-stone-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
      <input
        ref={inputRef}
        type="text"
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        value={isFocused ? text : displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setText(formatForDisplay(value));
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`min-w-0 flex-1 bg-transparent ${padding} font-semibold tabular text-stone-900 placeholder:font-normal placeholder:text-stone-300 focus:outline-none`}
      />
      {suffix && (
        <span className={`shrink-0 whitespace-nowrap px-2 text-stone-500 sm:px-3 ${size === 'sm' ? 'text-[10px] sm:text-sm' : 'text-sm'}`}>{suffix}</span>
      )}
    </div>
  );
}
