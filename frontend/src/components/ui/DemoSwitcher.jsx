import React, { useState, useEffect } from 'react';
import { Settings, User, UserCheck, ShieldAlert, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/useToast';

export function DemoSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [activeRole, setActiveRole] = useState('guest'); // 'guest', 'pending', 'member', 'admin'

  useEffect(() => {
    if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') setActiveRole('admin');
    else if (location.pathname === '/pending') setActiveRole('pending');
    else if (location.pathname === '/profile') setActiveRole('member');
    else if (location.pathname === '/login' || location.pathname === '/register') setActiveRole('guest');
  }, [location.pathname]);

  const switchRole = async (role) => {
    setActiveRole(role);
    setIsOpen(false);
    
    if (role === 'admin') {
      window.localStorage.setItem('hub_role', 'admin');
      navigate('/admin');
      addToast({ message: "Switched to Admin View", type: "success" });
    } else if (role === 'member') {
      window.localStorage.setItem('hub_role', 'member');
      navigate('/profile');
      addToast({ message: "Switched to Verified Member View", type: "success" });
    } else if (role === 'pending') {
      window.localStorage.setItem('hub_role', 'pending');
      navigate('/pending');
      addToast({ message: "Switched to Pending Member View", type: "success" });
    } else {
      window.localStorage.removeItem('hub_role');
      navigate('/register');
      addToast({ message: "Switched to Guest/New User View", type: "success" });
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[999]">
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-2xl p-2 flex flex-col gap-1 w-[220px] shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
          <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest">Demo Switcher</span>
          </div>
          
          <button onClick={() => switchRole('guest')} className={cn("flex flex-col text-left px-3 py-2 rounded-[10px] hover:bg-[var(--bg-canvas-dim)] transition-colors", activeRole === 'guest' && "bg-[rgba(26,28,59,0.05)]")}>
            <div className="flex items-center gap-2 font-sans font-semibold text-[13px] text-[var(--text-primary)]">
              <User size={14} /> New User
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] ml-6">Starts at Registration</span>
          </button>
          
          <button onClick={() => switchRole('pending')} className={cn("flex flex-col text-left px-3 py-2 rounded-[10px] hover:bg-[var(--bg-canvas-dim)] transition-colors", activeRole === 'pending' && "bg-[rgba(26,28,59,0.05)]")}>
            <div className="flex items-center gap-2 font-sans font-semibold text-[13px] text-[var(--text-primary)]">
              <ShieldAlert size={14} className="text-[var(--status-warning)]" /> Pending Valid
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] ml-6">Waiting admin approval</span>
          </button>

          <button onClick={() => switchRole('member')} className={cn("flex flex-col text-left px-3 py-2 rounded-[10px] hover:bg-[var(--bg-canvas-dim)] transition-colors", activeRole === 'member' && "bg-[rgba(26,28,59,0.05)]")}>
            <div className="flex items-center gap-2 font-sans font-semibold text-[13px] text-[var(--text-primary)]">
              <UserCheck size={14} className="text-[var(--status-success)]" /> Verified Member
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] ml-6">Access full profile</span>
          </button>

          <button onClick={() => switchRole('admin')} className={cn("flex flex-col text-left px-3 py-2 rounded-[10px] hover:bg-[var(--bg-canvas-dim)] transition-colors", activeRole === 'admin' && "bg-[rgba(26,28,59,0.05)]")}>
            <div className="flex items-center gap-2 font-sans font-semibold text-[13px] text-[var(--text-primary)]">
              <Shield size={14} className="text-[var(--surface-gold)]" /> System Admin
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] ml-6">Manage approvals & stats</span>
          </button>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-[48px] h-[48px] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-300 border-2",
          isOpen ? "bg-[var(--surface-navy)] text-white border-transparent rotate-90" : "bg-[var(--surface-white)] text-[var(--surface-navy)] border-[var(--border-subtle)] hover:scale-105"
        )}
      >
        <Settings size={22} className={isOpen ? "opacity-100" : "opacity-80"} />
      </button>
    </div>
  );
}
