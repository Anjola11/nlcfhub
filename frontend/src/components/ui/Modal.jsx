import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export function Modal({ isOpen, onClose, title, children, footer, className }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const isClosing = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isClosing.current = false;
      document.body.style.overflow = 'hidden';
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        gsap.fromTo(panelRef.current, { y: '100%', opacity: 1 }, { y: '0%', duration: 0.4, Math: 'power3.out' });
      } else {
        gsap.fromTo(panelRef.current, { scale: 0.94, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' });
      }
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.18 });
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      gsap.to(panelRef.current, { y: '100%', duration: 0.4, ease: 'power3.in', onComplete: onClose });
    } else {
      gsap.to(panelRef.current, { scale: 0.94, opacity: 0, y: 16, duration: 0.25, ease: 'power2.in', onComplete: onClose });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 px-0 pb-0">
      <div 
        ref={backdropRef} 
        className="absolute inset-0 bg-[var(--surface-overlay)]"
        onClick={handleClose}
      />
      
      <div 
        ref={panelRef}
        className={cn(
          "relative bg-[var(--surface-white)] flex flex-col w-full sm:max-w-[560px] sm:rounded-[var(--radius-modal)] rounded-t-[24px] rounded-b-none sm:max-h-[85vh] max-h-[90vh] overflow-hidden mt-auto sm:mt-0 shadow-2xl",
          className
        )}
      >
        {title && (
          <div className="pt-[24px] px-[24px] pb-[16px] flex items-center justify-between shrink-0">
            <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)] tracking-[-0.01em]">{title}</h2>
            <Button variant="gold-icon" onClick={handleClose} aria-label="Close modal">
              <X size={20} className="text-[var(--surface-navy)]" />
            </Button>
          </div>
        )}
        
        <div className="p-[24px] overflow-y-auto flex-1">
          {children}
        </div>
        
        {footer && (
          <div className="px-[24px] pb-[24px] pt-4 flex gap-3 justify-end shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
