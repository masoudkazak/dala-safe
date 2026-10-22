import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'info' | 'warning' | 'danger' | 'accent';

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
