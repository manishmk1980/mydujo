import { API_BASE } from '../config';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64 ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to decode image'));
      image.src = objectUrl;
    });
    return { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function compressImageFile(file: File): Promise<Blob> {
  const { width, height } = await readImageDimensions(file);
  if (!width || !height) return file;

  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image for compression'));
      image.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const quality = outputMime === 'image/jpeg' ? 0.8 : undefined;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputMime, quality));
    return blob ?? file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function preparePaymentProof(file: File | Blob): Promise<{ blob: Blob; mimeType: string }> {
  if (!(file instanceof File)) {
    return { blob: file, mimeType: '' };
  }

  const mimeType = (file.type || '').toLowerCase();
  if (!isImageMimeType(mimeType)) {
    return { blob: file, mimeType };
  }

  const compressed = await compressImageFile(file);
  const nextMime = compressed.type || mimeType || 'image/jpeg';
  return { blob: compressed, mimeType: nextMime };
}

export const storageService = {
  buildInstructorPhotoPath(filename: string, onboarding = false): string {
    return onboarding ? `instructors/onboarding/${filename}` : `instructors/${filename}`;
  },
  buildDisciplineImagePath(filename: string): string {
    return `discipline-options/${filename}`;
  },

  async uploadProfilePhoto(file: File | Blob, path: string): Promise<{ path: string }> {
    const content = await blobToBase64(file);
    const res = await fetch(`${API_BASE}/upload/profile-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ path, content }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? 'Upload failed');
    }
    const data = await res.json();
    return { path: (data as { url?: string }).url ? path : path };
  },

  async uploadProfilePhotoFromUrl(sourceUrl: string, path: string): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/upload/profile-photo-from-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ path, sourceUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? 'Import from URL failed');
    }
    const url = (data as { url?: string }).url;
    if (!url) throw new Error('Import from URL failed: missing url');
    return { url };
  },

  async uploadPaymentProof(file: File | Blob, path: string): Promise<{ url: string }> {
    const prepared = await preparePaymentProof(file);
    const content = await blobToBase64(prepared.blob);
    const mimeType = prepared.mimeType;
    const res = await fetch(`${API_BASE}/upload/payment-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ path, content, mimeType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? 'Upload failed');
    }
    const url = (data as { url?: string }).url;
    if (!url) throw new Error('Upload failed: missing url');
    return { url };
  },

  getPublicUrl(path: string): string {
    const base = API_BASE.replace(/\/$/, '');
    const clean = path.replace(/^\//, '');
    return `${base}/uploads/profile-photos/${clean}`;
  },
};
