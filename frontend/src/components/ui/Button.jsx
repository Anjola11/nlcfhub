import React, { forwardRef } from 'react';
import { cn } from "../../lib/utils";
import { flashGold } from "../../lib/gsap";

const variants = {
  primary: "bg-[var(--surface-navy)] text-[var(--text-inverse)] font-sans font-semibold text-[16px] px-[24px] py-[12px] rounded-[var(--radius-button)] hover:bg-[#2D3060] active:scale-97 transition-all duration-200",
  secondary: "bg-transparent text-[var(--text-primary)] border-[1.5px] border-[var(--surface-navy)] font-sans font-medium px-[24px] py-[12px] rounded-[var(--radius-button)] hover:bg-[var(--surface-navy)] hover:text-[var(--text-inverse)] transition-all duration-200",
  ghost: "bg-transparent text-[var(--text-secondary)] font-sans font-medium px-[16px] py-[8px] rounded-[var(--radius-button)] hover:bg-[var(--bg-canvas-dim)] transition-all duration-200",
  danger: "bg-[var(--status-error)] text-white font-sans font-medium px-[24px] py-[12px] rounded-[var(--radius-button)] transition-all duration-200 hover:opacity-90 active:scale-97",
  "gold-icon": "bg-[var(--surface-gold)] text-[var(--text-primary)] w-[40px] h-[40px] rounded-[12px] flex items-center justify-center transition-all duration-200 hover:opacity-90 active:scale-95"
};

export const Button = forwardRef(({ 
  variant = 'primary', 
  loading = false, 
  children, 
  className, 
  onClick, 
  ...props 
}, ref) => {

  const baseClass = variants[variant];
  const isLoading = loading;

  const handleClick = (e) => {
    if (isLoading) return;
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center shrink-0 disabled:opacity-70 disabled:cursor-not-allowed",
        baseClass,
        className
      )}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-[18px] w-[18px] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      <span className={cn("flex items-center justify-center gap-2", isLoading && "opacity-80")}>
        {isLoading && typeof children === 'string' ? `${children.replace('...', '')}…` : children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';
