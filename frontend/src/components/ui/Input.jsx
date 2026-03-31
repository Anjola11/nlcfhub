import React, { forwardRef } from 'react';
import { cn } from "../../lib/utils";

export const Input = forwardRef(({ label, hint, error, className, id, leftNode, rightNode, containerClassName, ...props }, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className={cn("relative flex items-center rounded-[var(--radius-input)] border bg-[var(--surface-white)] transition-all", 
        error ? "border-[var(--status-error)] border-[1.5px]" : "border-[var(--border-subtle)] focus-within:border-[2px] focus-within:border-[var(--border-focus)] focus-within:shadow-[0_0_0_3px_rgba(235,183,54,0.2)]"
      )}>
        {leftNode && (
          <div className="pl-[16px] pr-2 flex items-center justify-center shrink-0">
            {leftNode}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent font-sans text-[16px] text-[var(--text-primary)] placeholder-[var(--text-muted)] h-[52px]",
            !leftNode && "pl-[16px]",
            !rightNode && "pr-[16px]",
            "focus:outline-none",
            className
          )}
          {...props}
        />
        {rightNode && (
          <div className="pr-[16px] pl-2 flex items-center justify-center shrink-0">
            {rightNode}
          </div>
        )}
      </div>
      {(hint || error) && (
        <span className={cn("font-sans text-[12px] font-medium", error ? "text-[var(--status-error)]" : "text-[var(--text-muted)]")}>
          {error || hint}
        </span>
      )}
    </div>
  );
});
Input.displayName = 'Input';
