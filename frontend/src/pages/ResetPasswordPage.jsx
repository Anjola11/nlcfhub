import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { KeyRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { useToast } from '../hooks/useToast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const resetToken = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    if (!resetToken) {
        setError('Reset token is missing. Please try the reset process again.');
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.resetPassword({ reset_token: resetToken, new_password: password });
      
      setSuccess(true);
      addToast({ message: "Password updated successfully!", type: "success" });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      addToast({ message: err.message || "Failed to reset password. Please try again.", type: "error" });
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
        
        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-[24px] text-[var(--text-primary)] mb-2">Password reset successfully</h2>
            <p className="font-sans text-[14px] text-[var(--text-secondary)]">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-[32px]">
              <KeyRound className="w-12 h-12 text-[var(--surface-gold)] mb-4" />
              <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] leading-tight mb-2">
                Create new password
              </h1>
              <p className="font-sans text-[14px] text-[var(--text-secondary)]">
                Please enter your new strong password below.
              </p>
            </div>

            {error && (
              <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[var(--status-error)] p-4 rounded-xl mb-6 text-center font-sans text-[13px] font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-5">
              <Input 
                label="NEW PASSWORD" 
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input 
                label="CONFIRM PASSWORD" 
                type="password"
                placeholder="Re-enter to confirm"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full h-[52px] mt-2" loading={loading}>
                Save Password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
