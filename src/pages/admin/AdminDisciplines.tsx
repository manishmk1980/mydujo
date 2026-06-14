/**
 * Admin: Disciplines
 * Manages martial arts styles shown in registration and assignment flows.
 * All create/edit/pause/archive operations persist to backend.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Sword, Plus, Loader2, Link as LinkIcon, X, Paperclip,
  RefreshCw, Search, MoreHorizontal, Edit, Archive, Pause, CheckCircle2,
} from 'lucide-react';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { AdminBadge } from '../../components/admin/ui/AdminBadge';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { metaService, type DisciplineOption } from '../../services/metaService';
import { storageService } from '../../services/storageService';

type DStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

function resolveStatus(d: DisciplineOption): DStatus {
  const s = (d.status || 'ACTIVE').toUpperCase();
  if (s === 'PAUSED') return 'PAUSED';
  if (s === 'ARCHIVED') return 'ARCHIVED';
  return 'ACTIVE';
}

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_15%,transparent)]';

// ─── Image picker sub-component ───────────────────────────────────────────────

interface ImagePickerProps {
  imageFile: File | null;
  pastedImage: Blob | null;
  imagePreview: string | null;
  imageUrlInput: string;
  imageSource: 'file' | 'url';
  dragOver: boolean;
  onSourceChange: (s: 'file' | 'url') => void;
  onFileChange: (f: File | null) => void;
  onPaste: (b: Blob) => void;
  onDragOver: (v: boolean) => void;
  onDrop: (f: File) => void;
  onUrlChange: (v: string) => void;
  onClear: () => void;
}

function ImagePicker({
  imageFile, pastedImage, imagePreview, imageUrlInput,
  imageSource, dragOver,
  onSourceChange, onFileChange, onPaste, onDragOver, onDrop, onUrlChange, onClear,
}: ImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items || []);
    const imgItem = items.find((i) => i.type.startsWith('image/'));
    if (imgItem) {
      e.preventDefault();
      const blob = imgItem.getAsFile();
      if (blob) { onPaste(blob); return; }
    }
    const text = e.clipboardData.getData('text');
    if (text?.startsWith('http://') || text?.startsWith('https://')) {
      e.preventDefault();
      onSourceChange('url');
      onUrlChange(text.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSourceChange('file')}
          className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
            imageSource === 'file'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Paperclip className="size-3.5" /> Attachment
        </button>
        <button
          type="button"
          onClick={() => onSourceChange('url')}
          className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
            imageSource === 'url'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LinkIcon className="size-3.5" /> From URL
        </button>
      </div>

      {imageSource === 'url' ? (
        <input
          type="url"
          value={imageUrlInput}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com/discipline-image.png"
          className={inputCls}
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Click to select image file, or drag and drop"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); onDragOver(true); }}
          onDragLeave={() => onDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            onDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) onDrop(file);
          }}
          onPaste={handlePasteEvent}
          className={`flex w-full cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/40 ${
            dragOver
              ? 'border-[var(--admin-primary)] bg-[color-mix(in_srgb,var(--admin-primary)_6%,white)]'
              : 'border-slate-200 bg-slate-50 hover:border-[var(--admin-primary)] hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm text-slate-500">
              {imageFile?.name || (pastedImage ? 'Pasted image from clipboard' : 'Click to select, drag & drop, or paste image')}
            </span>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              className="shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Select Files
            </button>
          </div>
          <p className="text-[11px] text-slate-400">Tip: paste a screenshot or image URL directly here. Supports JPG, PNG, WebP, GIF.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { onFileChange(e.target.files?.[0] || null); e.target.value = ''; }}
          />
        </div>
      )}

      {imagePreview && (
        <div className="flex items-center gap-3">
          <img src={imagePreview} alt="Discipline preview" className="size-16 rounded-xl border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
          >
            <X className="size-3.5" /> Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Discipline form panel ────────────────────────────────────────────────────

interface DisciplineFormProps {
  formValue: string;
  formLabel: string;
  onValueChange: (v: string) => void;
  onLabelChange: (v: string) => void;
  imagePicker: React.ReactNode;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  title?: string;
}

function DisciplineForm({ formValue, formLabel, onValueChange, onLabelChange, imagePicker, canSubmit, submitting, onSubmit, onCancel, title = 'New Discipline' }: DisciplineFormProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 sm:p-6">
      <h3 className="break-words font-bold text-slate-800">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Value (slug) *</label>
          <input className={inputCls} placeholder="e.g. karate_shotokan" value={formValue} onChange={(e) => onValueChange(e.target.value)} required />
        </div>
        <div className="min-w-0 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Label (display name) *</label>
          <input className={inputCls} placeholder="e.g. Karate (Shotokan)" value={formLabel} onChange={(e) => onLabelChange(e.target.value)} required />
        </div>
        <div className="min-w-0 space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Discipline picture / icon</label>
          {imagePicker}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={!canSubmit || submitting} onClick={onSubmit} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50 sm:flex-none">
          {submitting && <Loader2 className="size-4 animate-spin" />} Save
        </button>
        <button type="button" onClick={onCancel} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:flex-none">Cancel</button>
      </div>
    </div>
  );
}

// ─── Action menu ──────────────────────────────────────────────────────────────

function DisciplineMenu({ onEdit, onPause, onArchive, status }: {
  onEdit: () => void; onPause: () => void; onArchive: () => void; status: DStatus;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Actions">
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-1 w-40 overflow-visible rounded-xl border border-slate-200 bg-white shadow-lg">
          {([
            { label: 'Edit', icon: Edit, action: onEdit, show: status !== 'ARCHIVED' },
            { label: status === 'PAUSED' ? 'Reactivate' : 'Pause', icon: status === 'PAUSED' ? CheckCircle2 : Pause, action: onPause, show: status !== 'ARCHIVED' },
            { label: 'Archive', icon: Archive, action: onArchive, show: status !== 'ARCHIVED' },
          ] as const).filter((x) => x.show).map(({ label, icon: Icon, action }) => (
            <button key={label} onClick={() => { action(); setOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Icon className="size-4 text-slate-400" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hook: image picker state ─────────────────────────────────────────────────

function useImagePicker() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pastedImage, setPastedImage] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'file' | 'url'>('file');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const readBlob = (b: Blob) => {
    const r = new FileReader();
    r.onloadend = () => setImagePreview(String(r.result || ''));
    r.readAsDataURL(b);
  };

  const clear = () => { setImageFile(null); setPastedImage(null); setImagePreview(null); setImageUrlInput(''); };

  const handleFile = (f: File | null) => { setImageSource('file'); setImageFile(f); setPastedImage(null); if (f) readBlob(f); else setImagePreview(null); };
  const handlePaste = (b: Blob) => { setImageSource('file'); setImageFile(null); setPastedImage(b); readBlob(b); };
  const handleUrl = (v: string) => { setImageUrlInput(v); setImagePreview(v || null); };
  const handleDrop = (f: File) => handleFile(f);

  const hasImage = imageSource === 'url' ? Boolean(imageUrlInput.trim()) : Boolean(imageFile || pastedImage);

  return { imageFile, pastedImage, imagePreview, imageSource, imageUrlInput, dragOver,
    setImageSource, setDragOver, handleFile, handlePaste, handleUrl, handleDrop, clear, hasImage,
    fileLike: imageFile || pastedImage };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDisciplines() {
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editDiscipline, setEditDiscipline] = useState<DisciplineOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [flash, setFlash] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ value: '', label: '' });
  const addPicker = useImagePicker();
  const editPicker = useImagePicker();

  const confirm = useAdminConfirm();

  const showFlash = (text: string, type: 'success' | 'error' = 'success') => {
    setFlash({ text, type });
    setTimeout(() => setFlash(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Admin needs to see all statuses (active, paused, archived).
      const data = await metaService.getDisciplines('ALL');
      setDisciplines(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load disciplines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ─── Create ────────────────────────────────────────────────────────────────

  const performCreate = async () => {
    if (!form.value.trim() || !form.label.trim() || !addPicker.hasImage) return;
    setSubmitting(true);
    try {
      const ext = addPicker.imageFile?.name.split('.').pop() || (addPicker.pastedImage?.type?.split('/')?.[1] ?? 'png');
      const fileName = `${form.value.trim().toLowerCase().replace(/\s+/g, '_')}-${crypto.randomUUID()}.${ext}`;
      const imagePath = storageService.buildDisciplineImagePath(fileName);
      let imageUrl = '';
      if (addPicker.imageSource === 'url') {
        const imported = await storageService.uploadProfilePhotoFromUrl(addPicker.imageUrlInput.trim(), imagePath);
        imageUrl = imported.url;
      } else {
        await storageService.uploadProfilePhoto(addPicker.fileLike as Blob, imagePath);
        imageUrl = storageService.getPublicUrl(imagePath);
      }
      const created = await metaService.createDiscipline({ value: form.value.trim(), label: form.label.trim(), imageUrl });
      setForm({ value: '', label: '' });
      addPicker.clear();
      setShowAddForm(false);
      setDisciplines((prev) => [...prev, created]);
      showFlash('Discipline added.');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Failed to add discipline', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Edit ──────────────────────────────────────────────────────────────────

  const performEdit = async () => {
    if (!editDiscipline?.id || !form.value.trim() || !form.label.trim()) return;
    setSubmitting(true);
    try {
      let imageUrl: string | null | undefined = undefined; // undefined = don't update
      if (editPicker.hasImage) {
        const ext = editPicker.imageFile?.name.split('.').pop() || (editPicker.pastedImage?.type?.split('/')?.[1] ?? 'png');
        const fileName = `${form.value.trim().toLowerCase().replace(/\s+/g, '_')}-${crypto.randomUUID()}.${ext}`;
        const imagePath = storageService.buildDisciplineImagePath(fileName);
        if (editPicker.imageSource === 'url') {
          const imported = await storageService.uploadProfilePhotoFromUrl(editPicker.imageUrlInput.trim(), imagePath);
          imageUrl = imported.url;
        } else {
          await storageService.uploadProfilePhoto(editPicker.fileLike as Blob, imagePath);
          imageUrl = storageService.getPublicUrl(imagePath);
        }
      }
      const payload: Parameters<typeof metaService.updateDiscipline>[1] = {
        value: form.value.trim(),
        label: form.label.trim(),
      };
      if (imageUrl !== undefined) payload.image_url = imageUrl;

      const updated = await metaService.updateDiscipline(editDiscipline.id, payload);
      setDisciplines((prev) => prev.map((d) => d.id === editDiscipline.id ? updated : d));
      setEditDiscipline(null);
      editPicker.clear();
      showFlash('Discipline updated.');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Failed to update discipline', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Pause / Reactivate ────────────────────────────────────────────────────

  const handlePause = async (d: DisciplineOption) => {
    if (!d.id) return;
    const isReactivating = resolveStatus(d) === 'PAUSED';
    const newStatus: DStatus = isReactivating ? 'ACTIVE' : 'PAUSED';
    setSubmitting(true);
    try {
      const updated = await metaService.updateDisciplineStatus(d.id, newStatus);
      setDisciplines((prev) => prev.map((x) => x.id === d.id ? updated : x));
      showFlash(`${d.label} ${isReactivating ? 'reactivated' : 'paused'}.`);
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Status update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Archive ───────────────────────────────────────────────────────────────

  const handleArchive = async (d: DisciplineOption) => {
    if (!d.id) return;
    const ok = await confirm({
      title: 'Archive discipline?',
      description: `"${d.label}" will be archived and hidden from active flows. Students already assigned to this discipline are not affected.`,
      confirmLabel: 'Archive',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    setSubmitting(true);
    try {
      const updated = await metaService.archiveDiscipline(d.id);
      if (updated) {
        setDisciplines((prev) => prev.map((x) => x.id === d.id ? updated : x));
      } else {
        setDisciplines((prev) => prev.map((x) => x.id === d.id ? { ...x, status: 'ARCHIVED' } : x));
      }
      showFlash(`${d.label} archived.`);
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Archive failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDisciplines = disciplines.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return d.label?.toLowerCase().includes(q) || d.value?.toLowerCase().includes(q);
  });

  const counts = {
    total: disciplines.length,
    active: disciplines.filter((d) => resolveStatus(d) === 'ACTIVE').length,
    paused: disciplines.filter((d) => resolveStatus(d) === 'PAUSED').length,
  };

  const addCanSubmit = Boolean(form.value.trim() && form.label.trim() && addPicker.hasImage);

  const makePickerNode = (picker: ReturnType<typeof useImagePicker>) => (
    <ImagePicker
      imageFile={picker.imageFile}
      pastedImage={picker.pastedImage}
      imagePreview={picker.imagePreview}
      imageUrlInput={picker.imageUrlInput}
      imageSource={picker.imageSource}
      dragOver={picker.dragOver}
      onSourceChange={picker.setImageSource}
      onFileChange={picker.handleFile}
      onPaste={picker.handlePaste}
      onDragOver={picker.setDragOver}
      onDrop={picker.handleDrop}
      onUrlChange={picker.handleUrl}
      onClear={picker.clear}
    />
  );

  return (
    <div className="min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-end">
          <div className="flex w-full gap-2 sm:w-auto">
            <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RefreshCw className="size-4" />
            </button>
            <button type="button" onClick={() => { setShowAddForm((v) => !v); setEditDiscipline(null); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] sm:flex-none">
              <Plus className="size-4" /> Add discipline
            </button>
          </div>
      </div>

      {flash && (
        <div className={`rounded-2xl border p-4 text-sm font-medium ${flash.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {flash.text}
        </div>
      )}

      {error && <AdminErrorState message={error} />}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Total', value: counts.total }, { label: 'Active', value: counts.active }, { label: 'Paused', value: counts.paused }].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <DisciplineForm
          title="New Discipline"
          formValue={form.value}
          formLabel={form.label}
          onValueChange={(v) => setForm((f) => ({ ...f, value: v }))}
          onLabelChange={(v) => setForm((f) => ({ ...f, label: v }))}
          imagePicker={makePickerNode(addPicker)}
          canSubmit={addCanSubmit}
          submitting={submitting}
          onSubmit={() => void performCreate()}
          onCancel={() => { setShowAddForm(false); setForm({ value: '', label: '' }); addPicker.clear(); }}
        />
      )}

      {/* Edit form */}
      {editDiscipline && (
        <DisciplineForm
          title={`Edit: ${editDiscipline.label}`}
          formValue={form.value}
          formLabel={form.label}
          onValueChange={(v) => setForm((f) => ({ ...f, value: v }))}
          onLabelChange={(v) => setForm((f) => ({ ...f, label: v }))}
          imagePicker={
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Leave empty to keep the existing icon.</p>
              {makePickerNode(editPicker)}
            </div>
          }
          canSubmit={Boolean(form.value.trim() && form.label.trim())}
          submitting={submitting}
          onSubmit={() => void performEdit()}
          onCancel={() => { setEditDiscipline(null); editPicker.clear(); }}
        />
      )}

      {/* Search */}
      {!loading && disciplines.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search disciplines…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-[var(--admin-primary)] focus:outline-none" />
        </div>
      )}

      {/* Discipline list */}
      {loading ? (
        <AdminLoadingState label="Loading disciplines…" className="min-h-[30vh]" />
      ) : filteredDisciplines.length === 0 ? (
        <AdminEmptyState title="No disciplines found" description="Add a discipline to show it in the registration form." />
      ) : (
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <p className="text-sm font-bold text-slate-900">All disciplines</p>
            <p className="text-xs text-slate-500">{filteredDisciplines.length} shown</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredDisciplines.map((d) => {
              const status = resolveStatus(d);
              const imgUrl = d.imageUrl || d.image_url;
              return (
                <div key={d.id ?? d.value} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center sm:gap-4">
                    {imgUrl ? (
                      <img src={imgUrl} alt={d.label} className="size-12 shrink-0 rounded-2xl border border-slate-200 object-cover" />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)]">
                        <Sword className="size-6 text-[var(--admin-primary)]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">{d.label}</p>
                      <p className="truncate text-xs text-slate-500">{d.value}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    {status === 'PAUSED' && <AdminBadge variant="warning" size="sm">Paused</AdminBadge>}
                    {status === 'ARCHIVED' && <AdminBadge variant="neutral" size="sm">Archived</AdminBadge>}
                    {status === 'ACTIVE' && <AdminBadge variant="success" size="sm">Active</AdminBadge>}
                    <DisciplineMenu
                      status={status}
                      onEdit={() => { setEditDiscipline(d); setForm({ value: d.value, label: d.label }); editPicker.clear(); setShowAddForm(false); }}
                      onPause={() => void handlePause(d)}
                      onArchive={() => void handleArchive(d)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
