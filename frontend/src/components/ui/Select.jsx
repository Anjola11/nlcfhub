import React, { forwardRef } from 'react';
import { cn } from "../../lib/utils";
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({ label, hint, error, className, id, options, placeholder, ...props }, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={selectId} className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full appearance-none bg-[var(--surface-white)] border rounded-[var(--radius-input)] font-sans text-[16px] text-[var(--text-primary)] h-[52px] pl-[16px] pr-[40px]",
            "focus:outline-none focus:border-[2px] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(235,183,54,0.2)] transition-all",
            error ? "border-[var(--status-error)] border-[1.5px]" : "border-[var(--border-subtle)]"
          )}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-[var(--surface-navy)]">
          <ChevronDown size={20} />
        </div>
      </div>
      {(hint || error) && (
        <span className={cn("font-sans text-[12px] font-medium", error ? "text-[var(--status-error)]" : "text-[var(--text-muted)]")}>
          {error || hint}
        </span>
      )}
    </div>
  );
});
Select.displayName = 'Select';
