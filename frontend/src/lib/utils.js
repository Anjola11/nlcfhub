import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatBirthday(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bd = new Date(dateStr);
  let nextBd = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  if (nextBd < today) {
    nextBd.setFullYear(today.getFullYear() + 1);
  }
  return Math.ceil((nextBd - today) / 86400000);
}
