import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Camera, X, Check, Copy } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { flashGold, staggerReveal } from '../lib/gsap';
import { api } from '../lib/api';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
].map((m, i) => ({ label: m, value: String(i + 1).padStart(2, '0') }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1).padStart(2, '0') }));
const SUBGROUPS = [
  { label: 'Choir', value: 'Choir' }, { label: 'Ushers', value: 'Ushers' },
  { label: 'Media', value: 'Media' }, { label: 'Welfare', value: 'Welfare' },
  { label: 'Workers', value: 'Workers' }, { label: 'Exco', value: 'Exco' },
  { label: 'General', value: 'General' }
];

export default function MemberRegistrationPage() {
  const cardRef = useRef(null);
  const formRef = useRef(null);
  const formContentRef = useRef(null);
  const successContentRef = useRef(null);
  const checkmarkPathRef = useRef(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    day: '',
    month: '',
    subgroup: ''
  });

  const copyBtnRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
    if (formRef.current) {
      staggerReveal(formRef.current, '.field-wrapper');
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (isSuccess && successContentRef.current) {
      gsap.fromTo(successContentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      
      if (checkmarkPathRef.current) {
        const length = checkmarkPathRef.current.getTotalLength() || 100;
        gsap.fromTo(checkmarkPathRef.current, 
          { strokeDashoffset: length, strokeDasharray: length }, 
          { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
        );
      }
    }
  }, [isSuccess]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register(formData);
      gsap.to(formContentRef.current, { opacity: 0, y: -16, duration: 0.3, onComplete: () => {
        setIsSuccess(true);
      }});
    } catch (err) {
      gsap.to(cardRef.current, { keyframes: { x: [-8, 8, -6, 6, -4, 4, 0] }, duration: 0.45, ease: 'power2.out' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://nlcfhub.org/me/12345?token=abc`);
    flashGold(copyBtnRef.current);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12 relative overflow-hidden" 
         style={{ background: 'radial-gradient(ellipse 800px 600px at 50% -100px, rgba(235,183,54,0.08), transparent), var(--bg-canvas)' }}>
      
      <div 
        ref={cardRef} 
        className="w-full max-w-[480px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] sm:px-[36px] px-[20px] sm:py-[40px] py-[28px] relative z-10"
      >
        {!isSuccess ? (
          <div ref={formContentRef}>
            <div className="flex flex-col items-center mb-[32px]">
              <div className="w-[48px] h-[48px] rounded-full overflow-hidden mb-2">
                <img src="https://ui-avatars.com/api/?name=NLCF&background=1A1C3B&color=fff" alt="NLCF" className="w-full h-full object-cover bg-[var(--surface-navy)]" />
              </div>
              <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] text-center max-w-[320px] leading-tight mb-1">
                Register for NLCFHUB
              </h1>
              <p className="font-sans text-[14px] text-[var(--text-secondary)] text-center">
                Join the NLCF birthday registry. Takes less than 2 minutes.
              </p>
            </div>

            <div className="relative w-[160px] h-[160px] mx-auto mb-[28px] group">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} />
              
              {!photoPreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer group-hover:border-[var(--surface-gold)] group-hover:bg-[#EBB7360A] transition-colors"
                >
                  <Camera size={32} className="text-[var(--text-muted)] group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-sans text-[12px] font-medium text-[var(--text-muted)] mt-2">Add photo</span>
                </div>
              ) : (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-[var(--surface-overlay)] opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200"
                  >
                    <Camera size={24} className="text-white" />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--status-error)] text-white flex items-center justify-center z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5 mt-8">
              <div className="field-wrapper">
                <Input 
                  label="FULL NAME" 
                  placeholder="e.g. Adewale Johnson" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              
              <div className="field-wrapper">
                <Input 
                  label="PHONE NUMBER" 
                  type="tel"
                  placeholder="080 1234 5678" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                  leftNode={
                    <div className="bg-[var(--bg-canvas-dim)] border-r border-[var(--border-subtle)] h-full flex items-center px-3 rounded-l-[13px] font-mono text-[14px] text-[var(--text-secondary)]">
                      +234
                    </div>
                  }
                  className="pl-2"
                />
              </div>

              <div className="field-wrapper flex flex-col gap-1.5 w-full">
                <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
                  BIRTHDAY
                </label>
                <div className="flex gap-3 w-full">
                  <Select 
                    className="w-[40%]"
                    placeholder="Day"
                    options={DAYS}
                    value={formData.day}
                    onChange={e => setFormData({...formData, day: e.target.value})}
                    required
                  />
                  <Select 
                    className="flex-1"
                    placeholder="Month"
                    options={MONTHS}
                    value={formData.month}
                    onChange={e => setFormData({...formData, month: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="field-wrapper">
                <Select 
                  label="SUBGROUP"
                  placeholder="Select subgroup"
                  options={SUBGROUPS}
                  value={formData.subgroup}
                  onChange={e => setFormData({...formData, subgroup: e.target.value})}
                  required
                />
              </div>

              <div className="field-wrapper mt-4">
                <Button type="submit" className="w-full h-[56px]" loading={loading}>
                  Complete Registration
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div ref={successContentRef} className="flex flex-col items-center py-6 mx-auto w-full">
            <div className="w-[80px] h-[80px] rounded-full border-2 border-[var(--surface-gold)] flex items-center justify-center mb-6 relative">
              <svg className="w-10 h-10 text-[var(--surface-gold)] absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path ref={checkmarkPathRef} d="M20 6L9 17l-5-5" strokeDasharray="100" strokeDashoffset="100" />
              </svg>
            </div>
            
            <h2 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] text-center mb-2">
              Registration received! 🎉
            </h2>
            <p className="font-sans text-[14px] text-[var(--text-secondary)] text-center mb-8">
              Your account has been created. An admin will review your details shortly.
            </p>

            <div className="w-full flex flex-col items-center mt-2">
              <Button onClick={() => window.location.href = '/login'} className="w-full h-[56px]">
                Continue to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
