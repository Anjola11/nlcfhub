import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const leftColRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already logged in as admin, redirect
    const token = window.localStorage.getItem('hub_token');
    const role = window.localStorage.getItem('hub_role');
    if (token && role === 'admin') {
      navigate('/console-7x');
      return;
    }

    if (leftColRef.current) {
      const els = leftColRef.current.querySelectorAll('.stagger-item');
      gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.6, clearProps: 'all' });
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.adminLogin(email, password);
      window.localStorage.setItem('hub_token', res.token);
      window.localStorage.setItem('hub_uid', res.uid);
      window.localStorage.setItem('hub_role', 'admin');
      navigate('/console-7x');
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
      gsap.to(formRef.current, { keyframes: { x: [-8, 8, -6, 6, 0] }, duration: 0.4, ease: 'power2.out' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <div 
        ref={leftColRef}
        className="hidden lg:flex w-1/2 bg-[var(--surface-navy)] relative flex-col items-center justify-start pt-[20vh]"
      >
        <div className="flex flex-col items-center z-10 w-full max-w-[320px]">
          <div className="w-[80px] h-[80px] rounded-full border-[3px] border-white overflow-hidden mb-4 stagger-item bg-white">
            <img src="https://ui-avatars.com/api/?name=Hub&background=1A1C3B&color=fff" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display font-extrabold text-[40px] text-[var(--text-inverse)] tracking-[-0.01em] leading-none mb-2 stagger-item">
            NLCFHUB
          </h1>
          <p className="font-sans text-[18px] text-[rgba(253,251,247,0.55)] stagger-item">
            Manage birthdays. Celebrate people.
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-[120px] opacity-10 overflow-hidden flex items-end justify-center pointer-events-none">
          <svg viewBox="0 0 1440 320" className="w-full h-auto text-[var(--surface-gold)] fill-current" preserveAspectRatio="none">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-[var(--bg-canvas)] flex items-center justify-center p-[40px] sm:p-[48px]">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex justify-center mb-6 w-full">
            <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-[var(--surface-navy)] border-[2px] border-white">
              <img src="https://ui-avatars.com/api/?name=Hub&background=1A1C3B&color=fff" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="font-display font-bold text-[28px] text-[var(--text-primary)] mb-1">Admin Sign In</h2>
          <p className="font-sans text-[14px] text-[var(--text-secondary)] mb-[36px]">NLCFOAU Media Team only.</p>

          <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
            <Input 
              label="EMAIL ADDRESS" 
              type="email" 
              placeholder="admin@nlcf.org" 
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="PASSWORD" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••••" 
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              rightNode={
                <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />
            
            <div className="mt-2">
              <Button type="submit" className="w-full h-[56px]" loading={loading}>
                Sign In
              </Button>
              {error && (
                <p className="font-sans text-[12px] text-[var(--status-error)] text-center mt-3 font-medium">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
