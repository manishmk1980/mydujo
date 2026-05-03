import React, { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface AdminAuthLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
}

export default function AdminAuthLink({
  to,
  children,
  iconLeft,
  iconRight,
  className = '',
  ...props
}: AdminAuthLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-[var(--admin-primary)] ${className}`}
      {...props}
    >
      {iconLeft && <span>{iconLeft}</span>}
      {children}
      {iconRight && <span>{iconRight}</span>}
    </Link>
  );
}