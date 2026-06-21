import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2, Plus, Users } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { useFlashToast } from '../../components/ui/FlashToast';
import { instructorService, type DashboardStats } from '../../services/instructorService';

type ClassRow = Awaited<ReturnType<typeof instructorService.getMyClasses>>[number];

export default function InstructorClasses() {
  const toast = useFlashToast();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', trainingCenterId: '', sessionDate: '', startTime: '', endTime: '', discipline: '', notes: '' });
  const manageableCenters = useMemo(
    () => stats?.assignedCenters?.filter((center) => center.authorities.canManageClasses) || [],
    [stats],
  );

  const load = async () => {
    try {
      const [rows, dashboard] = await Promise.all([
        instructorService.getMyClasses(),
        instructorService.getDashboardStats(),
      ]);
      setClasses(rows);
      setStats(dashboard);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const create = async () => {
    setSaving(true);
    try {
      const toDateTime = (date: string, time: string) => time ? new Date(`${date}T${time}`).toISOString() : null;
      await instructorService.createMyClass({
        title: form.title.trim(),
        trainingCenterId: form.trainingCenterId,
        sessionDate: new Date(`${form.sessionDate}T00:00:00`).toISOString(),
        startTime: toDateTime(form.sessionDate, form.startTime),
        endTime: toDateTime(form.sessionDate, form.endTime),
        discipline: form.discipline.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm({ title: '', trainingCenterId: '', sessionDate: '', startTime: '', endTime: '', discipline: '', notes: '' });
      setShowForm(false);
      await load();
      toast.success('Class session created.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Classes" description="Plan and review sessions only for centers where Super Admin granted class management authority." />
      <div className="mb-6 flex justify-end">
        <button type="button" disabled={!manageableCenters.length} onClick={() => setShowForm((value) => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-black text-white disabled:opacity-40">
          <Plus className="size-4" /> Schedule class
        </button>
      </div>
      {!manageableCenters.length && !loading && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          Class management has not been assigned for any center. Ask Super Admin through Messages if this responsibility is expected.
        </div>
      )}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-bold text-slate-700">Class title<input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} className="block w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <label className="space-y-1 text-sm font-bold text-slate-700">Training center<select value={form.trainingCenterId} onChange={(e) => setForm((v) => ({ ...v, trainingCenterId: e.target.value }))} className="block w-full rounded-xl border border-slate-200 px-4 py-3"><option value="">Select center</option>{manageableCenters.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}</select></label>
            <label className="space-y-1 text-sm font-bold text-slate-700">Date<input type="date" value={form.sessionDate} onChange={(e) => setForm((v) => ({ ...v, sessionDate: e.target.value }))} className="block w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <label className="space-y-1 text-sm font-bold text-slate-700">Discipline / style<input value={form.discipline} onChange={(e) => setForm((v) => ({ ...v, discipline: e.target.value }))} className="block w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <label className="space-y-1 text-sm font-bold text-slate-700">Start time<input type="time" value={form.startTime} onChange={(e) => setForm((v) => ({ ...v, startTime: e.target.value }))} className="block w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <label className="space-y-1 text-sm font-bold text-slate-700">End time<input type="time" value={form.endTime} onChange={(e) => setForm((v) => ({ ...v, endTime: e.target.value }))} className="block w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <label className="space-y-1 text-sm font-bold text-slate-700 sm:col-span-2">Notes<textarea value={form.notes} onChange={(e) => setForm((v) => ({ ...v, notes: e.target.value }))} className="block min-h-20 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
          </div>
          <div className="mt-4 flex justify-end gap-2"><button onClick={() => setShowForm(false)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold">Cancel</button><button disabled={saving || !form.title.trim() || !form.trainingCenterId || !form.sessionDate} onClick={() => void create()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white disabled:opacity-40">{saving && <Loader2 className="size-4 animate-spin" />} Create class</button></div>
        </div>
      )}
      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-7 animate-spin text-orange-600" /></div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((row) => <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-900">{row.title}</h2><p className="mt-1 text-sm text-slate-500">{row.trainingCenter?.name || 'Unassigned center'}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600">{row.status}</span></div>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-700"><CalendarDays className="size-4 text-orange-600" /> {new Date(row.sessionDate).toLocaleDateString()}</p>
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Users className="size-4" /> {row._count?.attendance || 0} attendance records</p>
          </article>)}
          {!classes.length && <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">No class sessions yet.</div>}
        </div>
      )}
    </PageContainer>
  );
}
