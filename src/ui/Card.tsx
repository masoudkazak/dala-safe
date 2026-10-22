import type { ReactNode } from 'react';

export function Card({
  title,
  children,
  accent = false,
  flat = false,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  accent?: boolean;
  flat?: boolean;
  className?: string;
}) {
  return (
    <section
      className={['card', accent ? 'card--accent' : '', flat ? 'card--flat' : '', className].filter(Boolean).join(' ')}
    >
      {title ? <h2 className="card__title">{title}</h2> : null}
      {children}
    </section>
  );
}
