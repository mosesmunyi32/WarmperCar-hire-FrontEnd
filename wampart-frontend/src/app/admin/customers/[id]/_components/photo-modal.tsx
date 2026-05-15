import { XCircle } from "lucide-react";

export function PhotoModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm flex items-center gap-1"
        >
          <XCircle className="h-5 w-5" /> Close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Document"
          className="w-full rounded-xl shadow-2xl object-contain max-h-[80vh]"
        />
      </div>
    </div>
  );
}
