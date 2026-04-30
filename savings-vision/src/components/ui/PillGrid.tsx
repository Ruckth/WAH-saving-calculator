import type { ReactNode } from 'react';

export function PillGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5 sm:gap-2">{children}</div>;
}
