import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function MemberPendingPage() {
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 24, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.2)', clearProps: 'all' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" 
         style={{ background: 'radial-gradient(ellipse 800px 600px at 50% -100px, rgba(235,183,54,0.08), transparent), var(--bg-canvas)' }}>
      
      <div 
        ref={cardRef} 
        className="w-full max-w-[420px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] px-[32px] py-[40px] text-center relative z-10 shadow-[0_8px_30px_rgba(26,28,59,0.04)]"
      >
        <div className="w-[80px] h-[80px] rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center mx-auto mb-6 relative">
          <Clock size={32} strokeWidth={2.5} />
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#F59E0B] rounded-full border-2 border-white animate-pulse" />
        </div>

        <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] mb-2 leading-tight">
          Awaiting Approval
        </h1>
        <p className="font-sans text-[14px] text-[var(--text-secondary)] leading-relaxed mb-8">
          Your NLCFHUB registration was received successfully! An administrator must review and approve your account before you can access your profile.
        </p>

        <div className="bg-[var(--bg-canvas-dim)] text-[var(--text-secondary)] font-mono text-[12px] p-4 rounded-[12px] border border-[var(--border-subtle)] mb-8">
          Status: <span className="text-[#D97706] font-semibold">PENDING_VERIFICATION</span>
        </div>

        <Button variant="secondary" className="w-full" onClick={() => {
            window.localStorage.removeItem('hub_role');
            navigate('/login');
          }}>
          <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Button>
      </div>
    </div>
  );
}
