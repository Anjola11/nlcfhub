import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { gsap } from 'gsap';

export function Toggle({ isOn, onToggle, className }) {
  const thumbRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    gsap.to(thumbRef.current, { x: isOn ? 20 : 0, duration: 0.2, ease: 'power2.out' });
    gsap.to(trackRef.current, { backgroundColor: isOn ? '#1A1C3B' : '#CBD5E1', duration: 0.2 });
  }, [isOn]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      className={cn("w-[44px] h-[24px] rounded-full relative flex items-center p-[2px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2", className)}
      ref={trackRef}
      style={{ backgroundColor: '#CBD5E1' }}
      onClick={() => onToggle(!isOn)}
    >
      <span
        className="bg-white w-[20px] h-[20px] rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.15)] block"
        ref={thumbRef}
      />
    </button>
  );
}
