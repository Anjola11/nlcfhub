import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { KeyRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mocked request to /api/v1/auth/forgot-password
      await new Promise(r => setTimeout(r, 1000));
      // Assume the backend returns UID of the user so we can route to OTP
      navigate('/verify-otp?type=forgotpassword&uid=dummy-uid-1234');
    } catch (err) {
      gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse 800px 600px at 50% -100px, rgba(235,183,54,0.08), transparent), var(--bg-canvas)' }}>
      <div className="w-[140px] mb-8 relative z-10 flex flex-col justify-center items-center gap-2">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-[var(--surface-navy)] border border-[var(--border-subtle)]">
            <img src="https://ui-avatars.com/api/?name=Hub&background=1A1C3B&color=fff" alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      <div ref={cardRef} className="w-full max-w-[440px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] sm:px-[40px] px-[24px] sm:py-[48px] py-[32px] relative z-10 shadow-sm">
        <div className="flex flex-col items-center text-center mb-[32px]">
          <KeyRound className="w-12 h-12 text-[var(--surface-gold)] mb-4" />
          <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] leading-tight mb-2">
            Reset Password
          </h1>
          <p className="font-sans text-[14px] text-[var(--text-secondary)]">
            Enter your email and we'll send you a secure code to reset your password.
          </p>
        </div>

        <form onSubmit={handleRequest} className="flex flex-col gap-5">
          <Input 
            autoFocus
            label="EMAIL ADDRESS" 
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full h-[52px] mt-2" loading={loading}>
            Send Reset Code
          </Button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/login" className="font-sans font-semibold text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Back to log in
            </Link>
        </div>
      </div>
    </div>
  );
}
