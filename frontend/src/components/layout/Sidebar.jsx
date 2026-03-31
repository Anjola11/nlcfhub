import React, { useRef, useEffect } from 'react';
import { LayoutDashboard, Users, UserCheck, Bell, ScrollText, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { gsap } from 'gsap';

export function Sidebar({ isOpen, onClose }) {
  const drawerRef = useRef(null);
  
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;
    
    if (isOpen) {
      gsap.fromTo(drawerRef.current, { x: -280 }, { x: 0, duration: 0.35, ease: 'power3.out' });
      gsap.fromTo('.sidebar-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  }, [isOpen]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
    { icon: Users, label: "All Members", to: "/admin/members" },
    { icon: UserCheck, label: "Approvals", to: "/admin/approvals" },
    { icon: Bell, label: "Settings", to: "/admin/settings" },
    { icon: ScrollText, label: "Log", to: "/admin/log" },
  ];

  const content = (
    <div ref={drawerRef} className="w-[240px] h-full bg-[var(--surface-navy)] flex flex-col fixed top-0 left-0 z-50">
      <div className="h-[72px] flex items-center px-6 justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-[32px] h-[32px] rounded-full border-2 border-white overflow-hidden bg-white">
            <img src="https://ui-avatars.com/api/?name=NLCF&background=1A1C3B&color=fff" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-extrabold text-[18px] text-[var(--text-inverse)] tracking-[-0.01em]">NLCFHUB</span>
        </div>
        <button className="lg:hidden text-white/50 hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto mt-4 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-[20px] py-[12px] rounded-[12px] transition-all duration-200 group text-[14px]",
              isActive 
                ? "bg-[#EBB73626] border-l-[3px] border-[var(--surface-gold)] text-[var(--surface-gold)]"
                : "text-[rgba(253,251,247,0.5)] hover:bg-[rgba(253,251,247,0.06)] hover:text-[rgba(253,251,247,0.8)]"
            )}
            onMouseEnter={(e) => {
              const iconEl = e.currentTarget.querySelector('svg');
              if(iconEl) gsap.to(iconEl, { scale: 1.1, duration: 0.2 });
            }}
            onMouseLeave={(e) => {
              const iconEl = e.currentTarget.querySelector('svg');
              if(iconEl) gsap.to(iconEl, { scale: 1, duration: 0.2 });
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "text-[var(--surface-gold)]" : ""} />
                <span className="font-sans font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4 shrink-0">
        <div className="px-2 mb-3">
          <p className="font-sans text-[12px] text-[rgba(253,251,247,0.4)] truncate">admin@nlcf.org</p>
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-[16px] py-[8px] rounded-[var(--radius-button)] text-[rgba(253,251,247,0.5)] font-medium hover:text-[var(--status-error)] hover:bg-white/5 transition-colors">
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        {content}
      </div>
      
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="sidebar-backdrop absolute inset-0 bg-[var(--surface-overlay)]" onClick={onClose} />
          {content}
        </div>
      )}
    </>
  );
}
