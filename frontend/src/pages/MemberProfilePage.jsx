import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { LogOut, Camera, Save, Calendar, Phone, Hash, UserCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useToast } from '../hooks/useToast';
import { staggerReveal } from '../lib/gsap';

export default function MemberProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState({
    firstName: 'Chioma',
    lastName: 'Okafor',
    phone: '08087654321',
    birthday: '1995-10-15',
    subgroup: 'Choir',
    photoUrl: null
  });

  const cardRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    // In a real app, verify they have the 'hub_role' === 'member'
    const role = window.localStorage.getItem('hub_role');
    if (role !== 'member') {
      navigate('/login');
    }

    gsap.fromTo(cardRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' });
    if (formRef.current) {
      staggerReveal(formRef.current, '.form-item');
    }
  }, [navigate]);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({ message: "Profile updated successfully!", type: "success" });
    }, 800);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('hub_role');
    navigate('/login');
    addToast({ message: "Logged out successfully", type: "success" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-[40px] px-4">
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-[32px]">
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=NLCF&background=1A1C3B&color=fff" alt="NLCF" className="w-full h-full object-cover" />
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--status-error)] transition-colors font-sans text-[14px] font-semibold">
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <div ref={cardRef} className="bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(26,28,59,0.04)]">
          
          <div className="h-[120px] bg-[var(--surface-navy)] relative">
            <div className="absolute top-[20px] left-[24px]">
              <Badge variant="subgroup" className="bg-[rgba(255,255,255,0.15)] border-transparent text-white mix-blend-screen">{member.subgroup}</Badge>
            </div>
          </div>

          <div className="px-[32px] sm:px-[40px] pb-[40px]">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-[48px] mb-[32px]">
              <div className="relative group">
                <Avatar size="xl" className="border-[4px] border-[var(--surface-white)] bg-[var(--surface-white)] text-[36px] w-[110px] h-[110px]" name={`${member.firstName} ${member.lastName}`} photoUrl={member.photoUrl} />
                <button className="absolute bottom-0 right-0 w-[36px] h-[36px] bg-[var(--surface-gold)] border-2 border-[var(--surface-white)] rounded-full flex items-center justify-center text-[var(--surface-navy)] hover:scale-110 active:scale-95 transition-transform shadow-md">
                  <Camera size={16} />
                </button>
              </div>

              <div className="flex-1 pb-1">
                <h1 className="font-display font-extrabold text-[32px] text-[var(--text-primary)] leading-tight mb-1">
                  {member.firstName} {member.lastName}
                </h1>
                <p className="font-sans text-[15px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Badge variant="member-type-active">Verified Member</Badge> Active since 2026
                </p>
              </div>
            </div>

            <hr className="border-[var(--border-subtle)] mb-[32px]" />

            <form ref={formRef} onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              <div className="form-item col-span-1 md:col-span-2 mb-2">
                <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)]">Personal Details</h2>
                <p className="font-sans text-[13px] text-[var(--text-secondary)]">Update your profile information.</p>
              </div>

              <div className="form-item">
                <label className="block font-sans text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">First Name</label>
                <Input 
                  value={member.firstName} 
                  onChange={e => setMember({...member, firstName: e.target.value})}
                  leftNode={<UserCircle size={16} className="text-[var(--text-muted)]" />}
                />
              </div>

              <div className="form-item">
                <label className="block font-sans text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Last Name</label>
                <Input 
                  value={member.lastName} 
                  onChange={e => setMember({...member, lastName: e.target.value})}
                  leftNode={<UserCircle size={16} className="text-[var(--text-muted)]" />}
                />
              </div>

              <div className="form-item">
                <label className="block font-sans text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Phone Number</label>
                <Input 
                  value={member.phone} 
                  onChange={e => setMember({...member, phone: e.target.value})}
                  leftNode={<Phone size={16} className="text-[var(--text-muted)]" />}
                />
              </div>

              <div className="form-item">
                <label className="block font-sans text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Birthday</label>
                <Input 
                  type="date"
                  value={member.birthday} 
                  onChange={e => setMember({...member, birthday: e.target.value})}
                  leftNode={<Calendar size={16} className="text-[var(--text-muted)] mt-0.5" />}
                />
              </div>

              <div className="form-item col-span-1 md:col-span-2 pt-[16px]">
                <Button type="submit" loading={loading} className="w-full md:w-auto min-w-[160px] h-[48px] px-[32px] ml-auto block">
                  <div className="flex items-center justify-center gap-2">
                    <Save size={18} /> Save Changes
                  </div>
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
