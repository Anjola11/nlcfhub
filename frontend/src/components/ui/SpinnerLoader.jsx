import React from 'react';

export function SpinnerLoader({ size = 'md' }) {
  const containerSize = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const logoSize = size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  
  return (
    <div className="min-h-[200px] w-full flex flex-col items-center justify-center bg-transparent">
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {/* Animated Outer Spinner (Using animate-spin-fast from index.css) */}
        <div className="absolute inset-0 border-[3px] border-[var(--surface-gold)] border-t-transparent rounded-full animate-spin-fast"></div>
        
        {/* Oscillating Logo Container (Using animate-pulse-slow from index.css) */}
        <div className="animate-pulse-slow">
           <img 
            src="/nlcf_logo_no_bg.svg" 
            alt="NLCF Logo" 
            className={`${logoSize} h-auto object-contain pointer-events-none`}
            style={{ filter: 'drop-shadow(0 0 8px rgba(235,183,54,0.3))' }}
          />
        </div>
      </div>
    </div>
  );
}

export default SpinnerLoader;
