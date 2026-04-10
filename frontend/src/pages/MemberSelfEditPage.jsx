import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Camera, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
].map((m, i) => ({ label: m, value: String(i + 1).padStart(2, '0') }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1).padStart(2, '0') }));
const SUBGROUPS = [
  { label: 'Choir (Living Voices)', value: 'Choir' }, { label: 'Media/IT Hub', value: 'Media' },
  { label: 'Ushering Unit', value: 'Ushers' }, { label: 'Prayer Band', value: 'Prayer' },
  { label: 'Academic Committee', value: 'Academic' }
];
const POSTS = [
  { label: 'President', value: 'President' }, { label: 'Secretary', value: 'Secretary' },
  { label: 'Financial Secretary', value: 'FinSec' }, { label: 'PRO', value: 'PRO' },
  { label: 'Welfare Officer', value: 'Welfare' }, { label: 'Choir Coordinator', value: 'ChoirCoord' }
];
const TITLES = [
  { label: 'Mr.', value: 'Mr.' },
  { label: 'Mrs.', value: 'Mrs.' },
  { label: 'Miss', value: 'Miss' },
  { label: 'Dr.', value: 'Dr.' },
  { label: 'Prof.', value: 'Prof.' },
  { label: 'Pastor', value: 'Pastor' }
];

export default function MemberSelfEditPage() {
  const cardRef = useRef(null);
  const bannerRef = useRef(null);
  
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    phone: '',
    birthDay: '',
    birthMonth: '',
    status: 'student',
    subgroupIds: [],
    postIds: []
  });

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
    
    // Simulate token validation fetch
    setTimeout(() => {
      // Simulate valid token
      setIsValid(true);
      setFormData({
        firstName: 'Chioma',
        lastName: 'Okafor',
        title: '',
        phone: '08087654321',
        birthDay: '15',
        birthMonth: '04',
        status: 'student',
        subgroupIds: ['Choir'],
        postIds: ['ChoirCoord']
      });
      setIsValidating(false);
    }, 1200);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile('123', formData);
      setShowSuccess(true);
      if (bannerRef.current) {
        gsap.fromTo(bannerRef.current, { y: -48 }, { y: 0, duration: 0.35, ease: 'power3.out', clearProps: 'all' });
      }
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      gsap.to(cardRef.current, { keyframes: { x: [-8, 8, -6, 6, -4, 4, 0] }, duration: 0.45, ease: 'power2.out' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12 relative overflow-hidden" 
         style={{ background: 'radial-gradient(ellipse 800px 600px at 50% -100px, rgba(235,183,54,0.08), transparent), var(--bg-canvas)' }}>
      
      {showSuccess && (
        <div ref={bannerRef} className="fixed top-6 bg-[var(--status-success)] text-white px-6 py-3 rounded-full shadow-lg font-sans font-medium z-50 flex items-center gap-2">
          ✓ Profile updated
        </div>
      )}

      <div 
        ref={cardRef} 
        className="w-full max-w-[480px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] sm:px-[36px] px-[20px] sm:py-[40px] py-[28px] relative z-10"
      >
        <div className="flex flex-col items-center mb-[32px]">
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden mb-2">
            <img src="https://ui-avatars.com/api/?name=NLCF&background=1A1C3B&color=fff" alt="NLCF" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display font-bold text-[28px] text-[var(--text-primary)] text-center mb-1">
            Edit your profile
          </h1>
          <p className="font-sans text-[14px] text-[var(--text-secondary)] text-center">
            Changes save immediately to NLCFHUB.
          </p>
        </div>

        {isValidating ? (
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="w-[160px] h-[160px] rounded-full" />
            <Skeleton className="w-[60%] h-[24px]" />
            <Skeleton className="w-[40%] h-[20px]" />
            <div className="w-full flex flex-col gap-4 mt-4">
              <Skeleton className="w-full h-[52px]" />
              <Skeleton className="w-full h-[52px]" />
              <Skeleton className="w-full h-[52px]" />
            </div>
          </div>
        ) : !isValid ? (
          <div className="flex flex-col items-center py-6">
            <AlertCircle size={48} className="text-[var(--status-error)] mb-4" />
            <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)] mb-2">Link not valid</h2>
            <p className="font-sans text-[14px] text-[var(--text-secondary)] text-center">
              This edit link has expired or is incorrect. Ask an admin to share your link again.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center mb-[28px]">
              <div className="w-[160px] h-[160px] rounded-full overflow-hidden border-2 border-[var(--border-subtle)] bg-[var(--surface-navy)] text-[var(--text-inverse)] flex items-center justify-center font-display text-[64px] font-bold mb-4">
                CO
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="h-[38px] px-4 py-0 text-[14px]">Change photo</Button>
                <Button variant="ghost" className="h-[38px] px-4 py-0 text-[14px] hover:text-[var(--status-error)] hover:bg-[#FEF2F2]">Remove photo</Button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 w-full">
                <Input 
                  label="FIRST NAME" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                <Input 
                  label="LAST NAME" 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>

              {formData.status === 'alumni' && (
                <Select 
                  label="TITLE"
                  options={TITLES}
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              )}

              <Input 
                label="PHONE NUMBER" 
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                required
                leftNode={<div className="bg-[var(--bg-canvas-dim)] border-r border-[var(--border-subtle)] h-full flex items-center px-3 rounded-l-[13px] font-mono text-[14px] text-[var(--text-secondary)]">+234</div>}
                className="pl-2"
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">BIRTHDAY</label>
                <div className="flex gap-3 w-full">
                  <Select className="w-[40%]" options={DAYS} value={formData.birthDay} onChange={e => setFormData({...formData, birthDay: e.target.value})} />
                  <Select className="flex-1" options={MONTHS} value={formData.birthMonth} onChange={e => setFormData({...formData, birthMonth: e.target.value})} />
                </div>
              </div>

              {formData.status === 'student' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
                      SUBGROUPS (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SUBGROUPS.map(sg => (
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

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
                      POSTS HELD (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {POSTS.map(post => (
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
              <Button type="submit" className="w-full h-[56px] mt-4" loading={loading}>
                Save changes
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
