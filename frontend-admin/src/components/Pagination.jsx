import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 border-2 border-black font-bold text-sm ${
            p === page ? 'bg-black text-white' : 'hover:bg-gray-100'
          } transition-all`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="p-2 border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
