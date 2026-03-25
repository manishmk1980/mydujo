import React from 'react';
import { Bell } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { notificationsService, type NotificationDTO } from '../services/notificationsService';

export default function Notifications() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<NotificationDTO[]>([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await notificationsService.getMyNotifications();
        if (!alive) return;
        setItems(rows);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load notifications');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader title="Notifications" description="Updates about your fees and payments." />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}

      {!loading && items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="We’ll show updates here when something needs your attention." />
      ) : !loading ? (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900">{n.title}</div>
                  <div className="mt-1 text-sm text-slate-700">{n.message}</div>
                  <div className="mt-2 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                {n.read_at ? (
                  <span className="text-xs font-semibold text-slate-500">Read</span>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const updated = await notificationsService.markRead(n.id);
                        setItems((prev) => prev.map((x) => (x.id === n.id ? updated : x)));
                        window.dispatchEvent(new CustomEvent('notifications-updated'));
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Failed to mark read');
                      }
                    }}
                    className="text-xs font-bold text-primary hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </PageContainer>
  );
}

