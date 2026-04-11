import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Mail, Lock } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { staggerReveal } from '../lib/gsap';

export default function MemberLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorAnimation, setErrorAnimation] = useState(false);
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const cardRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    // If already logged in, redirect
    const token = window.localStorage.getItem('hub_token');
    const role = window.localStorage.getItem('hub_role');
    if (token && role === 'member') {
      navigate('/profile');
      return;
    }

    gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
    if (formRef.current) {
      staggerReveal(formRef.current, '.stagger-item');
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorAnimation(false);
    
    try {
      const res = await api.login(email, password);
      
      // Store token and UID for cookie-based auth
      window.localStorage.setItem('hub_token', res.token);
      window.localStorage.setItem('hub_uid', res.uid);

      if (!res.account_approved) {
        window.localStorage.setItem('hub_role', 'pending');
        navigate('/pending');
      } else {
         window.localStorage.setItem('hub_role', 'member');
         navigate('/profile');
      }
    } catch (err) {
      setErrorAnimation(true);
      gsap.to(cardRef.current, { keyframes: { x: [-8, 8, -6, 6, -4, 4, 0] }, duration: 0.45, ease: 'power2.out' });
      
      if (err.message && err.message.toLowerCase().includes('verify')) {
         addToast({ message: "Verification Required. Redirecting...", type: "info" });
         
         // Extract UID from message if present: "Please verify... [UID:uuid]"
         const uidMatch = err.message.match(/\[UID:(.*?)\]/);
         const extractedUid = uidMatch ? uidMatch[1] : '';
         
         const target = `/verify-otp?type=signup&email=${encodeURIComponent(email)}${extractedUid ? `&uid=${extractedUid}` : ''}`;
         setTimeout(() => navigate(target), 1200);
      } else {
         addToast({ message: err.message || "Invalid email or password", type: "error" });
      }
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" 
         style={{ background: 'radial-gradient(ellipse 800px 600px at 50% -100px, rgba(235,183,54,0.08), transparent), var(--bg-canvas)' }}>
      
      <div 
        ref={cardRef} 
        className="w-full max-w-[420px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] sm:px-[40px] px-[24px] sm:py-[48px] py-[36px] relative z-10 shadow-[0_8px_30px_rgba(26,28,59,0.04)]"
      >
        <div className="flex flex-col items-center mb-[32px]">
          <div className="w-[48px] h-[48px] rounded-full overflow-hidden mb-4">
            <img src="https://ui-avatars.com/api/?name=Hub&background=1A1C3B&color=fff" alt="NLCFOAU" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] text-center mb-1">
            Welcome back
          </h1>
          <p className="font-sans text-[14px] text-[var(--text-secondary)] text-center">
            Sign in to access your NLCFHUB profile.
          </p>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="stagger-item">
            <Input 
              placeholder="Email address" 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              leftNode={<Mail size={18} className="text-[var(--text-muted)]" />}
              error={errorAnimation && !email}
            />
          </div>
            
          <div className="stagger-item flex flex-col gap-1 w-full">
            <Input 
              placeholder="Password" 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              leftNode={<Lock size={18} className="text-[var(--text-muted)]" />}
              error={errorAnimation && !password}
            />
            <div className="text-right mt-1 w-full">
               <button 
                 type="button" 
                 onClick={() => navigate('/forgot-password')} 
                 className="font-sans text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--surface-gold)] transition-colors"
               >
                 Forgot password?
               </button>
            </div>
          </div>

          <div className="stagger-item mt-4">
            <Button type="submit" className="w-full h-[52px] text-[16px]" loading={loading}>
              Sign In
            </Button>
          </div>
          
          <div className="stagger-item mt-6 text-center text-[var(--text-secondary)] text-[14px]">
            Don't have an account? <br />
            <button type="button" onClick={() => navigate('/register')} className="text-[var(--surface-navy)] font-semibold hover:underline mt-1">Register here</button>
          </div>
        </form>
      </div>
    </div>
  );
}
