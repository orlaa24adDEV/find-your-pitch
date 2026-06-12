import { useToast } from "../context/ToastContext";

const bgMap = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-ink-700",
};

const iconMap = {
  success: "✓",
  error: "✕",
  info: "i",
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${bgMap[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-in`}
        >
          <span className="text-lg font-bold shrink-0">{iconMap[toast.type]}</span>
          <span className="text-sm flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white shrink-0 text-lg leading-none"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
