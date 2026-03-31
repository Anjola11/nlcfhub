import React from 'react';
import { cn } from "../../lib/utils";

const sizeClasses = {
  sm: "w-[32px] h-[32px] text-[12px]",
  md: "w-[48px] h-[48px] text-[19px]",
  lg: "w-[80px] h-[80px] text-[32px]",
  xl: "w-[120px] h-[120px] text-[48px]",
  "2xl": "w-[160px] h-[160px] text-[64px]"
};

export function Avatar({ size = "md", photoUrl, name, className, bordered = false }) {
  const initials = name 
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className={cn(
      "relative rounded-[var(--radius-avatar)] overflow-hidden shrink-0 flex items-center justify-center",
      sizeClasses[size],
      bordered ? "border-[3px] border-[var(--surface-white)]" : "",
      "bg-[var(--surface-navy)] text-[var(--text-inverse)]",
      className
    )}>
      {photoUrl ? (
        <img src={photoUrl} alt={name || "Avatar"} className="w-full h-full object-cover object-center" />
      ) : (
        <span className="font-display font-bold leading-none">{initials}</span>
      )}
    </div>
  );
}
