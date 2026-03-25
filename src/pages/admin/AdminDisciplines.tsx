import React, { useEffect, useState } from 'react';
import { Sword, Plus, Loader2 } from 'lucide-react';
import { metaService, type DisciplineOption } from '../../services/metaService';

export default function AdminDisciplines() {
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ value: '', label: '' });

  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await metaService.getDisciplines();
      setDisciplines(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disciplines');
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value.trim() || !form.label.trim()) return;
    setSubmitting(true);
    try {
      await metaService.createDiscipline({ value: form.value.trim(), label: form.label.trim() });
      setForm({ value: '', label: '' });
      setShowForm(false);
      await fetchDisciplines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add discipline');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">PREFERRED DISCIPLINES</h1>
          <p className="text-slate-500 mt-1">Manage disciplines. These appear in the student registration form dropdown.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-6 py-3.5 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
        >
          <Plus className="size-5" />
          Add Discipline
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">New Discipline</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Value (slug) *</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                placeholder="e.g. karate_shotokan"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Label (display name) *</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                placeholder="e.g. Karate (Shotokan)"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !form.value.trim() || !form.label.trim()}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm({ value: '', label: '' }); }}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      ) : disciplines.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          No disciplines yet. Add one above to show in the registration form.
        </div>
      ) : (
        <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {disciplines.map((d) => (
              <div key={d.value} className="px-8 py-6 hover:bg-slate-50/50 transition-colors flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sword className="size-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900">{d.label}</h4>
                  <p className="text-sm text-slate-500">{d.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
