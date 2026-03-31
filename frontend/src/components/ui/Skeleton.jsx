import React from 'react';
import { cn } from "../../lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("bg-[var(--border-subtle)] animate-pulse rounded-[14px]", className)}
      {...props}
    />
  );
}
