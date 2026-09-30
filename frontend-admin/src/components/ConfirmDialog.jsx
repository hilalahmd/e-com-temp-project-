export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4 animate-[fadeIn_0.2s_ease-out]">
        <h3 className="text-xl font-black uppercase tracking-widest mb-4">{title}</h3>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border-2 border-black font-bold uppercase tracking-widest text-sm hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 text-white border-2 border-black font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
