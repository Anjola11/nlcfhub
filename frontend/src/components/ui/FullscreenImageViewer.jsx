import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

export function FullscreenImageViewer({ isOpen, imageUrl, alt, onClose }) {
  const backdropRef = useRef(null);
  const imageRef = useRef(null);
  const isClosing = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    isClosing.current = false;
    document.body.style.overflow = 'hidden';

    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(imageRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.28, ease: 'power2.out' });

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;

    gsap.to(backdropRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(imageRef.current, {
      opacity: 0,
      scale: 0.97,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/85"
        onClick={handleClose}
      />

      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-[12px] bg-white/90 text-[var(--surface-navy)] flex items-center justify-center"
        aria-label="Close full image"
      >
        <X size={20} />
      </button>

      <img
        ref={imageRef}
        src={imageUrl}
        alt={alt || 'Member image'}
        className="relative z-10 max-h-[92vh] max-w-[96vw] object-contain rounded-[14px]"
      />
    </div>,
    document.body
  );
}
