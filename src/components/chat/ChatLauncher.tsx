import { MessageCircle, X } from 'lucide-react';

export function ChatLauncher({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={open ? 'Close chat' : 'Open chat'}
      className="fixed bottom-5 right-5 z-[70] flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl transition hover:bg-orange-600">
      {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
    </button>
  );
}
