import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-premium border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
                isSuccess
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                  : isError
                  ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                  : isWarning
                  ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                  : 'bg-navy-900/95 border-navy-700 text-white'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-navy-300 shrink-0 mt-0.5" />}

              <p className="text-sm font-medium leading-relaxed flex-1">{toast.message}</p>

              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5 -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
