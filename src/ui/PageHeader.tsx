import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  lead,
  actions,
  id,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <header className="page-header">
      {eyebrow ? <div className="page-header__eyebrow">{eyebrow}</div> : null}
      <h1 id={id}>{title}</h1>
      {lead ? <p className="page-header__lead">{lead}</p> : null}
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
