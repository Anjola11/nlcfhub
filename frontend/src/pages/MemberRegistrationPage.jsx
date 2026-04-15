import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gsap } from 'gsap';
import { Camera, X, Check, Copy, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { flashGold, staggerReveal } from '../lib/gsap';
import { api } from '../lib/api';
import { useToast } from '../hooks/useToast';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
].map((m, i) => ({ label: m, value: String(i + 1).padStart(2, '0') }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1).padStart(2, '0') }));
const STATUSES = [
  { label: 'Student', value: 'student' },
  { label: 'Alumni', value: 'alumni' }
];
const TITLES = [
  { label: 'Mr.', value: 'Mr.' },
  { label: 'Mrs.', value: 'Mrs.' },
  { label: 'Miss', value: 'Miss' },
  { label: 'Dr.', value: 'Dr.' },
  { label: 'Prof.', value: 'Prof.' },
  { label: 'Pastor', value: 'Pastor' }
];


export default function MemberRegistrationPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const cardRef = useRef(null);
  const formRef = useRef(null);
  const formContentRef = useRef(null);
  const successContentRef = useRef(null);
  const checkmarkPathRef = useRef(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [newUid, setNewUid] = useState(null);

  const [subgroups, setSubgroups] = useState([]);
  const [posts, setPosts] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    day: '',
    month: '',
    status: 'student',
    title: '',
    subgroupIds: [],
    postIds: []
  });

  useEffect(() => {
    // Fetch live metadata
    api.getSubgroups().then(res => {
      if(res.success) setSubgroups(res.data.map(s => ({label: s.name, value: s.id})));
    }).catch(console.error);

    api.getPosts().then(res => {
      if(res.success) setPosts(res.data.map(p => ({label: p.name, value: p.id})));
    }).catch(console.error);
  }, []);

  const copyBtnRef = useRef(null);

  useEffect(() => {
    api.checkMemberSession()
      .then(() => navigate('/profile'))
      .catch(() => {});

    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
      if (formRef.current) {
        staggerReveal(formRef.current, '.field-wrapper');
      }
    });

    return () => ctx.revert();
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (isSuccess && successContentRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(successContentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        
        if (checkmarkPathRef.current) {
          const length = checkmarkPathRef.current.getTotalLength() || 100;
          gsap.fromTo(checkmarkPathRef.current, 
            { strokeDashoffset: length, strokeDasharray: length }, 
            { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
          );
        }
      });
      return () => ctx.revert();
    }
  }, [isSuccess]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || formData.password.length < 8) {
      addToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(formData);
      const uid = res?.data?.uid;
      
      if (uid) {
        setNewUid(uid);
        
        // If a photo was selected, upload it now
        if (photoFile) {
          try {
            await api.uploadProfilePicture(uid, photoFile);
          } catch (uploadErr) {
            console.error("Failed to upload profile picture:", uploadErr);
            addToast({ 
              message: 'Account created, but photo upload failed. You can update it later in your profile.', 
              type: 'warning' 
            });
          }
        }
      }
      
      gsap.to(formContentRef.current, { opacity: 0, y: -16, duration: 0.3, onComplete: () => {
        setIsSuccess(true);
      }});
    } catch (err) {
      addToast({ message: err.message || 'Registration failed', type: 'error' });
      gsap.to(cardRef.current, { keyframes: { x: [-8, 8, -6, 6, -4, 4, 0] }, duration: 0.45, ease: 'power2.out' });
    } finally {
      setLoading(false);
    }
  };

  const passwordHasMinLength = (formData.password || '').length >= 8;
  const passwordsMatch =
    !!formData.password &&
    !!formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://nlcfhub.org/me/12345?token=abc`);
    flashGold(copyBtnRef.current);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12 relative overflow-hidden" 
         style={{ background: 'radial-gradient(ellipse 800px 600px at 50% -100px, rgba(235,183,54,0.08), transparent), var(--bg-canvas)' }}>
      <Helmet>
        <title>Register - NLCF Hub</title>
        <meta name="description" content="Create your NLCF Hub account to join the official birthday registry for New Life Campus Fellowship, OAU." />
        <link rel="canonical" href="https://nlcfhub.vercel.app/register" />
      </Helmet>
      
      <div 
        ref={cardRef} 
        className="w-full max-w-[480px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] sm:px-[36px] px-[20px] sm:py-[40px] py-[28px] relative z-10"
      >
        {!isSuccess ? (
          <div ref={formContentRef}>
            <div className="flex flex-col items-center mb-[32px]">
              <div className="w-[48px] h-[48px] rounded-full overflow-hidden mb-2">
                <img src="/nlcf_logo_no_bg.svg" alt="NLCFOAU" className="w-full h-full object-cover bg-[var(--surface-navy)]" />
              </div>
              <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] text-center max-w-[320px] leading-tight mb-1">
                Register for NLCFOAU Hub
              </h1>
              <p className="font-sans text-[14px] text-[var(--text-secondary)] text-center">
                Join the NLCFOAU Hub registry. Takes less than 2 minutes.
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
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--status-error)] text-white flex items-center justify-center z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-center font-sans text-[12px] text-[var(--status-error)] mb-5">
              * Optional (Max profile size is 8MB)
            </p>

            <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5 mt-8">
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="field-wrapper">
                  <Input 
                    label="FIRST NAME" 
                    placeholder="e.g. Adewale" 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="field-wrapper">
                  <Input 
                    label="LAST NAME" 
                    placeholder="e.g. Johnson" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
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

              <div className="field-wrapper">
                <Input 
                  label="EMAIL ADDRESS" 
                  type="email"
                  placeholder="e.g. member@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="field-wrapper">
                <Input 
                  label="PASSWORD" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  rightNode={
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  required
                />
              </div>

              <div className="field-wrapper">
                <Input 
                  label="CONFIRM PASSWORD" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  rightNode={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  required
                />
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className={`flex items-center gap-2 font-sans text-[12px] ${passwordHasMinLength ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}`}>
                    <Check size={14} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 font-sans text-[12px] ${passwordsMatch ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}`}>
                    <Check size={14} />
                    <span>Passwords match</span>
                  </div>
                </div>
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
                  label="STATUS"
                  placeholder="Select status"
                  options={STATUSES}
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  required
                />
              </div>

              {formData.status === 'alumni' && (
                <div className="field-wrapper">
                  <Select 
                    label="TITLE"
                    placeholder="Select title"
                    options={TITLES}
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
              )}

              {formData.status === 'student' && (
                <>
                  <div className="field-wrapper flex flex-col gap-2">
                    <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
                      SUBGROUPS (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {subgroups.map(sg => (
                        <label key={sg.value} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-[var(--border-subtle)] text-[var(--surface-gold)] focus:ring-[var(--surface-gold)]"
                            checked={formData.subgroupIds.includes(sg.value)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                subgroupIds: checked 
                                  ? [...prev.subgroupIds, sg.value]
                                  : prev.subgroupIds.filter(id => id !== sg.value)
                              }));
                            }}
                          />
                          <span className="font-sans text-[14px]">{sg.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field-wrapper flex flex-col gap-2">
                    <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
                      POSTS HELD (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {posts.map(post => (
                        <label key={post.value} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-[var(--border-subtle)] text-[var(--surface-gold)] focus:ring-[var(--surface-gold)]"
                            checked={formData.postIds.includes(post.value)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                postIds: checked 
                                  ? [...prev.postIds, post.value]
                                  : prev.postIds.filter(id => id !== post.value)
                              }));
                            }}
                          />
                          <span className="font-sans text-[14px]">{post.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="field-wrapper mt-4">
                <Button type="submit" className="w-full h-[56px]" loading={loading}>
                  Complete Registration
                </Button>
              </div>

              <div className="field-wrapper mt-6 text-center text-[var(--text-secondary)] text-[14px]">
                Already have an account? <br />
                <button type="button" onClick={() => navigate('/login')} className="text-[var(--surface-navy)] font-semibold hover:underline mt-1">Login here</button>
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
            
            <h2 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] text-center mb-2 leading-tight">
              Verify your email
            </h2>
            <p className="font-sans text-[14px] text-[var(--text-secondary)] text-center mb-8 px-4">
              Your account has been created! We've sent a 6-digit confirmation code to your email. You must verify your email before an admin can approve your access.
            </p>

            <div className="w-full flex flex-col items-center mt-2">
              <Button onClick={() => navigate(`/verify-otp?uid=${newUid}&type=signup`)} className="w-full h-[56px]">
                Enter Verification Code
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
