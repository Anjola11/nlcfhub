import React, { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { gsap } from 'gsap';

export default function AdminShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const pageWrapperRef = useRef(null);

  useEffect(() => {
    setIsSidebarOpen(false);
    const ctx = gsap.context(() => {
      gsap.fromTo(pageWrapperRef.current, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
      );
    });
    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-canvas)]">
      <Helmet>
        <title>Admin Console - NLCF Hub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-[240px]">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto sm:p-[32px] p-[16px] relative" ref={pageWrapperRef}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
