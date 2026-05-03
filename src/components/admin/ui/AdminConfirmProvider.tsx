import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AdminConfirmDialog, type AdminConfirmVariant } from './AdminConfirmDialog';

export interface AdminConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AdminConfirmVariant;
}

type Resolver = (value: boolean) => void;

interface Pending {
  options: {
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    variant: AdminConfirmVariant;
  };
  resolver: Resolver;
}

const AdminConfirmContext = createContext<(opts: AdminConfirmOptions) => Promise<boolean> | null>(null);

export function AdminConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback((opts: AdminConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPending({
        options: {
          title: opts.title,
          description: opts.description,
          confirmLabel: opts.confirmLabel ?? 'Confirm',
          cancelLabel: opts.cancelLabel ?? 'Cancel',
          variant: opts.variant ?? 'default',
        },
        resolver: resolve,
      });
    });
  }, []);

  const finish = useCallback((result: boolean) => {
    setPending((p) => {
      if (p) p.resolver(result);
      return null;
    });
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <AdminConfirmContext.Provider value={value}>
      {children}
      {pending ? (
        <AdminConfirmDialog
          open
          title={pending.options.title}
          description={pending.options.description}
          confirmLabel={pending.options.confirmLabel}
          cancelLabel={pending.options.cancelLabel}
          variant={pending.options.variant}
          onOpenChange={(o) => {
            if (!o) finish(false);
          }}
          onConfirm={() => finish(true)}
        />
      ) : null}
    </AdminConfirmContext.Provider>
  );
}

export function useAdminConfirm(): (opts: AdminConfirmOptions) => Promise<boolean> {
  const ctx = useContext(AdminConfirmContext);
  if (!ctx) {
    throw new Error('useAdminConfirm must be used within AdminConfirmProvider');
  }
  return ctx;
}
