import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import { gsap } from 'gsap';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'default', duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto remove handled inside the ToastItem component 
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div className="fixed sm:bottom-[24px] sm:right-[24px] bottom-[16px] left-[16px] right-[16px] sm:left-auto sm:w-auto w-[calc(100%-32px)] flex flex-col gap-[8px] z-[100] pointer-events-none">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const elRef = React.useRef(null);
  
  React.useEffect(() => {
    gsap.fromTo(elRef.current, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' });

    const timer = setTimeout(() => {
      close();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    gsap.to(elRef.current, { x: 80, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: onRemove });
  };

  const variants = {
    success: "bg-[#F0FDF4] border-l-[4px] border-l-[var(--status-success)] text-[var(--text-primary)]",
    error: "bg-[#FEF2F2] border-[4px] border-[var(--status-error)] text-[var(--status-error)]",
    default: "bg-[var(--surface-white)] border-[4px] border-[var(--surface-navy)] text-[var(--text-primary)]"
  };

  const icons = {
    success: <CheckCircle size={20} className="text-[var(--status-success)] shrink-0" />,
    error: <AlertCircle size={20} className="text-[var(--status-error)] shrink-0" />,
    default: <Info size={20} className="text-[var(--surface-navy)] shrink-0" />
  };

  return (
    <div 
      ref={elRef}
      className={cn(
        "rounded-[16px] px-[18px] py-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 pointer-events-auto",
        variants[toast.type] || variants.default
      )}
    >
      <div className="flex gap-3 items-center">
        {icons[toast.type] || icons.default}
        <span className="font-sans text-[14px] font-medium leading-tight">
          {toast.message}
        </span>
      </div>
      <button 
        onClick={close}
        className="text-[var(--text-secondary)] hover:bg-[var(--bg-canvas-dim)] p-1 rounded-full transition-colors shrink-0"
      >
        <X size={20} />
      </button>
    </div>
  );
}
