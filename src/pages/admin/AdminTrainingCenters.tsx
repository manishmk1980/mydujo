import React, { useEffect, useState } from 'react';
import { MapPin, Plus, ListFilter, Trash2, Loader2 } from 'lucide-react';
import { trainingCenterService, type TrainingCenter } from '../../services/trainingCenterService';
import { instructorService } from '../../services/instructorService';

export default function AdminTrainingCenters() {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [instructorNames, setInstructorNames] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', address: '', instructorName: '', pincode: '', city: '', state: '' });

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingCenterService.getAllTrainingCenters();
      setCenters(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training centers');
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorNames = async () => {
    try {
      const list = await instructorService.getAllInstructorsAdmin();
      const names = (list || [])
        .map((i) => i.fullName?.trim())
        .filter((v): v is string => Boolean(v));
      setInstructorNames(Array.from(new Set(names)));
    } catch {
      setInstructorNames([]);
    }
  };

  useEffect(() => {
    fetchCenters();
    fetchInstructorNames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await trainingCenterService.createTrainingCenter({
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        address: form.address.trim() || undefined,
        instructor_name: form.instructorName.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
      });
      setForm({ name: '', slug: '', address: '', instructorName: '', pincode: '', city: '', state: '' });
      setShowForm(false);
      await fetchCenters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add center');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TRAINING CENTERS</h1>
          <p className="text-slate-500 mt-1">Manage physical academy locations. These appear in the student registration form.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-6 py-3.5 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
        >
          <Plus className="size-5" />
          Add Center
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">New Training Center</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Name *</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                placeholder="e.g. Kolkata North Dojo"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Slug (optional)</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                placeholder="e.g. kolkata_north_dojo"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Address</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                placeholder="Full address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Center Instructor Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                placeholder="e.g. Sensei Arjun"
                value={form.instructorName}
                onChange={(e) => setForm((f) => ({ ...f, instructorName: e.target.value }))}
                list="instructor-name-options"
              />
              <datalist id="instructor-name-options">
                {instructorNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Pin Code</label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="6-digit PIN"
                  value={form.pincode}
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">State</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm({ name: '', slug: '', address: '', instructorName: '', pincode: '', city: '', state: '' }); }}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b flex justify-between items-center px-8">
          <h3 className="font-bold text-slate-700">All Locations ({centers.length})</h3>
          <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl" title="Filter">
            <ListFilter className="size-5" />
          </button>
        </div>
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {centers.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-500">
                No training centers yet. Add one above to show in the registration form.
              </div>
            ) : (
              centers.map((c) => (
                <div key={c.id} className="px-8 py-6 hover:bg-slate-50/50 transition-colors flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <MapPin className="size-7 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-none">{c.name}</h4>
                      <p className="text-sm font-bold text-slate-400 mt-1.5">
                        {[c.address, c.pincode, c.city, c.state].filter(Boolean).join(' • ') || c.slug || '—'}
                      </p>
                      {c.instructor_name && (
                        <p className="text-xs text-slate-500 mt-1">
                          Instructor: {c.instructor_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                    active
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
