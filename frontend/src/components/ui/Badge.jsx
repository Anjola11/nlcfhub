import React from 'react';
import { cn } from "../../lib/utils";

export function Badge({ variant = "subgroup", children, className }) {
  const variants = {
    subgroup: "bg-[var(--surface-navy)] text-[var(--text-inverse)] font-sans text-[12px] font-medium px-[10px] py-[4px] rounded-[var(--radius-badge)]",
    "member-type-active": "bg-[#EBB7361A] text-[#B8860B] border border-[#EBB736] font-sans text-[12px] font-medium px-[8px] py-[2px] rounded-[var(--radius-badge)]",
    "member-type-alumni": "bg-[#1A1C3B1A] text-[#1A1C3B] border border-[#1A1C3B] font-sans text-[12px] font-medium px-[8px] py-[2px] rounded-[var(--radius-badge)]",
    status: "flex items-center gap-1.5 font-sans text-[12px]",
    days: "bg-[var(--surface-gold)] text-[var(--text-primary)] font-mono text-[12px] font-bold px-[12px] py-[4px] rounded-[var(--radius-badge)]",
    "days-light": "bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-[12px] font-bold px-[12px] py-[4px] rounded-[var(--radius-badge)]"
  };

  if (variant === 'status-active') {
    return (
      <div className={cn(variants.status, className)}>
        <span className="w-2 h-2 rounded-full bg-[var(--status-success)] block shrink-0" />
        <span className="font-medium text-[var(--text-primary)]">Active</span>
      </div>
    );
  }
  if (variant === 'status-inactive') {
    return (
      <div className={cn(variants.status, className)}>
        <span className="w-2 h-2 rounded-full bg-slate-400 block shrink-0" />
        <span className="font-medium text-[var(--text-secondary)]">Inactive</span>
      </div>
    );
  }

  const baseClass = variants[variant] || variants.subgroup;

  return (
    <span className={cn("inline-flex items-center justify-center shrink-0 whitespace-nowrap", baseClass, className)}>
      {children}
    </span>
  );
}
