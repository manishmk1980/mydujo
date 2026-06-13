import { Paperclip } from 'lucide-react';

export function ChatAttachmentUploader({ onUpload, busy }: { onUpload: (file: File) => void; busy?: boolean }) {
  return (
    <label className={`cursor-pointer rounded-xl p-2 text-slate-500 hover:bg-slate-100 ${busy ? 'pointer-events-none opacity-50' : ''}`} title="Attach file">
      <Paperclip className="size-5" />
      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.mp4,.mp3,.wav" onChange={(e) => {
        const file = e.target.files?.[0]; if (file) onUpload(file); e.target.value = '';
      }} />
    </label>
  );
}
