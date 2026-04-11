import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';

export function TopBar({ onMenuClick }) {
  const location = useLocation();
  
  let pageTitle = "Dashboard";
  if (location.pathname.includes('/members')) pageTitle = "Members";
  else if (location.pathname.includes('/approvals')) pageTitle = "Approvals";
  else if (location.pathname.includes('/settings')) pageTitle = "Notification Settings";
  else if (location.pathname.includes('/log')) pageTitle = "Notification Log";

  return (
    <div className="h-[64px] sticky top-0 z-10 bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] px-[16px] sm:px-[32px] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-[var(--text-primary)]" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <h1 className="font-display font-bold text-[20px] text-[var(--text-primary)]">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {pageTitle === 'Members' && (
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-canvas-dim)] text-[var(--text-secondary)] transition-colors">
            <Search size={20} />
          </button>
        )}
        <Avatar size="sm" name="Admin" />
      </div>
    </div>
  );
}
