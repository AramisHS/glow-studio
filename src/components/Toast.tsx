import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { Toast as ToastType } from '../types';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const styles = {
  success: 'bg-white border-l-4 border-green-500',
  error: 'bg-white border-l-4 border-red-500',
  info: 'bg-white border-l-4 border-primary-500',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-primary-500',
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full px-4">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`${styles[toast.type]} rounded-lg shadow-xl p-4 flex items-start gap-3 animate-slide-up`}
          >
            <Icon className={`${iconColors[toast.type]} w-5 h-5 mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm">{toast.title}</p>
              {toast.message && (
                <p className="text-stone-500 text-xs mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-stone-400 hover:text-stone-600 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
