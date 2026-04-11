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
  const progressRef = React.useRef(null);
  
  React.useEffect(() => {
    // Premium float and fade in
    gsap.fromTo(elRef.current, 
      { y: 30, opacity: 0, scale: 0.98 }, 
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }
    );

    // Progress bar animation
    gsap.fromTo(progressRef.current,
      { scaleX: 1 },
      { scaleX: 0, duration: toast.duration / 1000, ease: 'none', transformOrigin: 'left' }
    );

    const timer = setTimeout(() => {
      close();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    gsap.to(elRef.current, { 
      opacity: 0, 
      y: -10,
      scale: 0.98,
      duration: 0.3, 
      ease: 'power2.in', 
      onComplete: onRemove 
    });
  };

  const variants = {
    success: "bg-white/90 text-[var(--text-primary)] border-white/40",
    error: "bg-[#1A1C3B] text-white border-white/10",
    info: "bg-white/90 text-[var(--text-primary)] border-white/40",
    default: "bg-white/90 text-[var(--text-primary)] border-white/40"
  };

  const progressColors = {
    success: "bg-[var(--status-success)]",
    error: "bg-[var(--status-error)]",
    info: "bg-[#3B82F6]",
    default: "bg-[var(--surface-gold)]"
  };

  const icons = {
    success: <CheckCircle size={16} className="text-[var(--status-success)]" />,
    error: <AlertCircle size={16} className="text-[#EF4444]" />,
    info: <Info size={16} className="text-[#3B82F6]" />,
    default: <Info size={16} className="text-[var(--surface-gold)]" />
  };

  return (
    <div 
      ref={elRef}
      className={cn(
        "relative overflow-hidden backdrop-blur-xl rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border flex items-center justify-between gap-6 p-[16px] min-w-[320px] pointer-events-auto group",
        variants[toast.type] || variants.default
      )}
    >
      <div className="flex gap-4 items-center">
        <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center shadow-inner">
          {icons[toast.type] || icons.default}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="font-sans text-[14px] font-bold tracking-tight leading-tight uppercase opacity-50 text-[10px]">
            {toast.type || 'Notification'}
          </p>
          <p className="font-sans text-[14px] font-semibold tracking-tight">
            {toast.message}
          </p>
        </div>
      </div>
      
      <button 
        onClick={close}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded-full transition-all shrink-0 hover:bg-black/5 active:scale-90"
      >
        <X size={16} />
      </button>

      {/* Subtle Progress Bar */}
      <div 
        ref={progressRef}
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[3px] opacity-40",
          progressColors[toast.type] || progressColors.default
        )} 
      />
    </div>
  );
}
