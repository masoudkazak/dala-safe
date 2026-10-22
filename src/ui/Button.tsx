import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';

interface BaseProps {
  variant?: Variant;
  size?: 'md' | 'sm';
  block?: boolean;
  icon?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: 'button--primary',
  secondary: 'button--secondary',
  ghost: 'button--ghost',
  danger: 'button--danger',
  'danger-outline': 'button--danger-outline',
};

function classes({ variant = 'primary', size = 'md', block }: BaseProps): string {
  return ['button', variantClass[variant], size === 'sm' ? 'button--sm' : '', block ? 'button--block' : '']
    .filter(Boolean)
    .join(' ');
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & BaseProps;

export function Button({ variant, size, block, icon, className, children, ...rest }: ButtonProps) {
  return (
    <button className={[classes({ variant, size, block }), className].filter(Boolean).join(' ')} {...rest}>
      {icon ? <span className="button__icon" aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
}

export type ButtonLinkProps = LinkProps & BaseProps;

export function ButtonLink({ variant, size, block, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={[classes({ variant, size, block }), className].filter(Boolean).join(' ')} {...rest}>
      {icon ? <span className="button__icon" aria-hidden="true">{icon}</span> : null}
      {children}
    </Link>
  );
}
