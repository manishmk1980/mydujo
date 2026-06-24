import React, { useEffect, useState } from 'react';
import { Sword, Plus, Loader2, Upload, Link as LinkIcon, Clipboard, XCircle } from 'lucide-react';
import { metaService, type DisciplineOption } from '../../services/metaService';
import { storageService } from '../../services/storageService';

export default function AdminDisciplines() {
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ value: '', label: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pastedImage, setPastedImage] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'file' | 'url'>('file');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const clearImageSelection = () => {
    setImageFile(null);
    setPastedImage(null);
    setImagePreview(null);
    setImageUrlInput('');
  };

  const setPreviewFromBlob = (blob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(String(reader.result || ''));
    reader.readAsDataURL(blob);
  };

  const handleImageFile = (file: File | null) => {
    setImageSource('file');
    setImageFile(file);
    setPastedImage(null);
    if (!file) {
      setImagePreview(null);
      return;
    }
    setPreviewFromBlob(file);
  };

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
    if (imageSource === 'file' && !imageFile && !pastedImage) return;
    if (imageSource === 'url' && !imageUrlInput.trim()) return;
    setSubmitting(true);
    try {
      const fileLike = imageFile || pastedImage;
      const ext = imageFile?.name.split('.').pop()
        || (fileLike?.type?.split('/')?.[1] ? fileLike.type.split('/')[1] : 'png');
      const fileName = `${form.value.trim().toLowerCase().replace(/\s+/g, '_')}-${crypto.randomUUID()}.${ext}`;
      const imagePath = storageService.buildDisciplineImagePath(fileName);
      let imageUrl = '';
      if (imageSource === 'url') {
        const imported = await storageService.uploadProfilePhotoFromUrl(imageUrlInput.trim(), imagePath);
        imageUrl = imported.url;
      } else {
        await storageService.uploadProfilePhoto(fileLike as Blob, imagePath);
        imageUrl = storageService.getPublicUrl(imagePath);
      }

      await metaService.createDiscipline({
        value: form.value.trim(),
        label: form.label.trim(),
        imageUrl,
      });
      setForm({ value: '', label: '' });
      clearImageSelection();
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
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Recommended: add a discipline picture/icon. You can select files, drag-and-drop, paste from clipboard, or import from URL.
          </div>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-600 mb-1">Discipline picture/icon *</label>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageSource('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${imageSource === 'file' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  <Upload className="size-3.5 inline mr-1" /> Attachment
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${imageSource === 'url' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  <LinkIcon className="size-3.5 inline mr-1" /> From URL
                </button>
              </div>

              {imageSource === 'url' ? (
                <input
                  type="url"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="https://example.com/discipline-image.png"
                  value={imageUrlInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setImageUrlInput(v);
                    setImagePreview(v || null);
                  }}
                />
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0] || null;
                    handleImageFile(file);
                  }}
                  onPaste={(e) => {
                    const items = Array.from(e.clipboardData.items || []);
                    const imageItem = items.find((item) => item.type.startsWith('image/'));
                    if (imageItem) {
                      e.preventDefault();
                      const blob = imageItem.getAsFile();
                      if (blob) {
                        setImageSource('file');
                        setImageFile(null);
                        setPastedImage(blob);
                        setPreviewFromBlob(blob);
                        return;
                      }
                    }
                    const text = e.clipboardData.getData('text');
                    if (text?.startsWith('http://') || text?.startsWith('https://')) {
                      e.preventDefault();
                      setImageSource('url');
                      setImageUrlInput(text.trim());
                    }
                  }}
                  tabIndex={0}
                  className={`w-full rounded-xl border border-dashed px-4 py-5 text-sm bg-white focus:outline-none ${dragOver ? 'border-primary bg-primary/5' : 'border-slate-300'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-slate-600">
                      {imageFile?.name || (pastedImage ? 'Pasted image from clipboard' : 'Drop image here, paste image, or select file')}
                    </span>
                    <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Upload className="size-3.5" /> Select Files
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2"><Clipboard className="size-3.5 inline mr-1" /> Tip: paste screenshot or image URL directly here.</p>
                </div>
              )}

              {imagePreview && (
                <img src={imagePreview} alt="Discipline preview" className="mt-2 size-16 rounded-xl object-cover border border-slate-200" />
              )}
              {(imagePreview || imageUrlInput) && (
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                >
                  <XCircle className="size-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={
                submitting ||
                !form.value.trim() ||
                !form.label.trim() ||
                (imageSource === 'url' ? !imageUrlInput.trim() : (!imageFile && !pastedImage))
              }
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({ value: '', label: '' });
                clearImageSelection();
              }}
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
                {d.imageUrl || d.image_url ? (
                  <img
                    src={d.imageUrl || d.image_url || ''}
                    alt={d.label}
                    className="size-14 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sword className="size-7 text-primary" />
                  </div>
                )}
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
