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
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
].map((m, i) => ({ label: m, value: String(i + 1).padStart(2, '0') }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1).padStart(2, '0') }));

export default function MemberProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [member, setMember] = useState({
    uid: null,
    firstName: '', lastName: '', title: '', phone: '',
    birthDay: '', birthMonth: '', subgroups: [], posts: [],
    member_type: 'student', photoUrl: null, birthdayPhotoUrl: null,
    email_verified: false, account_approved: false, created_at: null,
  });

  const [originalMember, setOriginalMember] = useState(null);
  const [pendingFiles, setPendingFiles] = useState({ profile: null, birthday: null });
  const [previews, setPreviews] = useState({ profile: null, birthday: null });
  const [errors, setErrors] = useState({});

  const birthdayFileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);

  const cardRef = useRef(null);
  const formRef = useRef(null);

  const memberId = window.localStorage.getItem('hub_uid'); // Assume we store UID on login


  const joinYear = member.created_at ? new Date(member.created_at).getFullYear() : new Date().getFullYear();

  useEffect(() => {
    const role = window.localStorage.getItem('hub_role');
    if (role !== 'member') {
      navigate('/login');
      return;
    }

    // Fetch full member profile from /me
    const fetchProfile = async () => {
      try {
        const data = await api.getMe();
        const memberData = {
          uid: data.uid || data.id,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          title: data.title || '',
          phone: data.phone_number || '',
          birthDay: String(data.birth_day || '').padStart(2, '0'),
          birthMonth: String(data.birth_month || '').padStart(2, '0'),
          subgroups: data.subgroups || [],
          posts: data.posts_held || [],
          member_type: data.status || 'student',
          photoUrl: data.profile_picture_url || null,
          birthdayPhotoUrl: data.birthday_picture_url || null,
          email_verified: data.email_verified || false,
          account_approved: data.account_approved || false,
          created_at: data.created_at || null,
        };
        setMember(memberData);
        setOriginalMember(memberData);
      } catch (err) {
        window.localStorage.removeItem('hub_role');
        window.localStorage.removeItem('hub_token');
        window.localStorage.removeItem('hub_uid');
        addToast({ message: err.message || 'Session expired. Please login again.', type: 'error' });
        navigate('/login');
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();

    gsap.fromTo(cardRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' });
    if (formRef.current) {
      staggerReveal(formRef.current, '.form-item');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!member.firstName?.trim()) newErrors.firstName = "First name is required";
    else if (member.firstName.length < 3) newErrors.firstName = "First name must be at least 3 characters";
    else if (member.firstName.length > 50) newErrors.firstName = "First name must be under 50 characters";

    if (!member.lastName?.trim()) newErrors.lastName = "Last name is required";
    else if (member.lastName.length < 3) newErrors.lastName = "Last name must be at least 3 characters";
    else if (member.lastName.length > 50) newErrors.lastName = "Last name must be under 50 characters";

    if (!member.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (member.phone.length < 11) newErrors.phone = "Phone number is too short (min 11 characters)";
    else if (member.phone.length > 20) newErrors.phone = "Phone number must be under 20 characters";
    else if (!/^[0-9+\- ]+$/.test(member.phone)) newErrors.phone = "Invalid phone format (digits, +, -, spaces only)";
    
    // Custom business logic: Title mandatory for alumni
    if (member.member_type === 'alumni' && !member.title) {
      newErrors.title = "Title is mandatory for alumni members";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const uid = memberId || member.uid;
      let currentMember = { ...member };

      // 1. Upload Pending Profile Picture
      if (pendingFiles.profile) {
        const data = await api.uploadProfilePicture(uid, pendingFiles.profile);
        currentMember.photoUrl = data.profile_picture_url;
      }

      // 2. Upload Pending Birthday Picture
      if (pendingFiles.birthday) {
        const data = await api.uploadBirthdayPicture(uid, pendingFiles.birthday);
        currentMember.birthdayPhotoUrl = data.birthday_picture_url;
      }

      // 3. Update Text Details
      await api.updateProfile(uid, currentMember);
      
      setMember(currentMember);
      setOriginalMember(currentMember);
      setPendingFiles({ profile: null, birthday: null });
      setPreviews({ profile: null, birthday: null });
      addToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      addToast({ message: err.message || "Failed to update profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file, maxSizeMB) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      addToast({ message: "Invalid file type. Only JPEG, PNG and WEBP allowed.", type: "error" });
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      addToast({ message: `File is too large. Max size is ${maxSizeMB}MB`, type: "error" });
      return false;
    }
    return true;
  };

  const handleProfilePictureSelect = (file) => {
    if (validateFile(file, 8)) {
      setPendingFiles(prev => ({ ...prev, profile: file }));
      setPreviews(prev => ({ ...prev, profile: URL.createObjectURL(file) }));
    }
  };

  const handleBirthdayPictureSelect = (file) => {
    if (validateFile(file, 10)) {
      setPendingFiles(prev => ({ ...prev, birthday: file }));
      setPreviews(prev => ({ ...prev, birthday: URL.createObjectURL(file) }));
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('hub_role');
    window.localStorage.removeItem('hub_token');
    navigate('/login');
    addToast({ message: "Logged out successfully", type: "success" });
  };

  const isFormValid = (
    member.firstName?.trim().length >= 3 && 
    member.firstName.length <= 50 &&
    member.lastName?.trim().length >= 3 && 
    member.lastName.length <= 50 &&
    member.phone?.trim().length >= 11 && 
    member.phone.length <= 20 &&
    /^[0-9+\- ]+$/.test(member.phone) &&
    member.birthDay > 0 &&
    member.birthMonth > 0 &&
    (member.member_type !== 'alumni' || !!member.title)
  );

  const hasChanges = originalMember ? 
    (JSON.stringify(member) !== JSON.stringify(originalMember)) || 
    !!pendingFiles.profile || 
    !!pendingFiles.birthday : false;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
        <div className="w-full max-w-[700px]">
           <Skeleton className="w-full h-[400px] rounded-[24px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-[40px] px-4">
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-[32px]">
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Hub&background=1A1C3B&color=fff" alt="NLCFOAU" className="w-full h-full object-cover" />
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--status-error)] transition-colors font-sans text-[14px] font-semibold">
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <div ref={cardRef} className="bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(26,28,59,0.04)]">
          
          <div className="h-[120px] bg-[var(--surface-navy)] relative"></div>

          <div className="px-[32px] sm:px-[40px] pb-[40px]">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end -mt-[48px] mb-[32px]">
              <div className="relative group shrink-0">
                <Avatar 
                  size="xl" 
                  className="border-[4px] border-[var(--surface-white)] bg-[var(--surface-white)] text-[36px] w-[110px] h-[110px]" 
                  name={`${member.firstName} ${member.lastName}`} 
                  photoUrl={previews.profile || member.photoUrl} 
                />
                <input 
                  type="file" 
                  className="hidden" 
                  ref={profileFileInputRef} 
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProfilePictureSelect(file);
                  }}
                />
                <button 
                  type="button"
                  onClick={() => profileFileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-[36px] h-[36px] bg-[var(--surface-gold)] border-2 border-[var(--surface-white)] rounded-full flex items-center justify-center text-[var(--surface-navy)] hover:scale-110 active:scale-95 transition-transform shadow-md"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="flex-1 pb-1 pt-12 sm:pt-[48px]">
                <h1 className="font-display font-extrabold text-[32px] text-[var(--text-primary)] leading-tight mb-1">
                  {member.member_type === 'alumni' && member.title ? `${member.title} ` : ''}{member.firstName} {member.lastName}
                </h1>
                <p className="font-sans text-[15px] font-medium text-[var(--text-secondary)] flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant={member.account_approved ? "member-type-active" : "days"}>{member.account_approved ? 'Verified Member' : 'Pending Approval'}</Badge> <span className="whitespace-nowrap">Active since {joinYear}</span>
                </p>
                {member.posts?.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-4">
                    <span className="font-sans text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Posts Held</span>
                    <div className="flex gap-2 flex-wrap">
                      {member.posts.map(post => (
                        <Badge key={post.id || post} variant="days" className="text-[12px] px-2 py-0.5">{post.name || post}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {member.subgroups?.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-3">
                    <span className="font-sans text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Subgroups</span>
                    <div className="flex gap-2 flex-wrap">
                      {member.subgroups.map(sg => (
                        <Badge key={sg.id || sg} variant="subgroup">{sg.name || sg}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-[32px] p-4 bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] rounded-[14px]">
              <h2 className="font-sans font-bold text-[14px] text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <Camera size={16} className="text-[var(--text-secondary)]" /> Birthday Picture (Max 10MB)
              </h2>
              <p className="font-sans text-[13px] text-[var(--text-secondary)] mb-4">
                Your profile picture will automatically be used for flyers if a birthday picture is not available.
              </p>
              
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,image/jpg" 
                className="hidden" 
                ref={birthdayFileInputRef} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBirthdayPictureSelect(file);
                }} 
              />
              
              {previews.birthday || member.birthdayPhotoUrl ? (
                <div className="relative w-full max-w-[200px] h-[240px] rounded-[10px] overflow-hidden border border-[var(--border-subtle)] group">
                  <img src={previews.birthday || member.birthdayPhotoUrl} alt="Birthday" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button type="button" variant="secondary" className="h-[38px] text-[13px] px-4" onClick={() => birthdayFileInputRef.current?.click()}>Change Photo</Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="secondary" className="h-[38px] text-[13px] px-4" onClick={() => birthdayFileInputRef.current?.click()}>
                   Upload Birthday Picture
                </Button>
              )}
            </div>

            <hr className="border-[var(--border-subtle)] mb-[32px]" />

            <form ref={formRef} onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              <div className="form-item col-span-1 md:col-span-2 mb-2">
                <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)]">Personal Details</h2>
                <p className="font-sans text-[13px] text-[var(--text-secondary)]">Update your profile information.</p>
              </div>

              <div className="form-item">
                <Input 
                  label="First Name"
                  value={member.firstName} 
                  onChange={e => setMember({...member, firstName: e.target.value})}
                  error={errors.firstName}
                  maxLength={50}
                  leftNode={<UserCircle size={16} className="text-[var(--text-muted)]" />}
                />
              </div>

              <div className="form-item">
                <Input 
                  label="Last Name"
                  value={member.lastName} 
                  onChange={e => setMember({...member, lastName: e.target.value})}
                  error={errors.lastName}
                  maxLength={50}
                  leftNode={<UserCircle size={16} className="text-[var(--text-muted)]" />}
                />
              </div>

              <div className="form-item">
                <Input 
                  label="Phone Number"
                  value={member.phone} 
                  onChange={e => setMember({...member, phone: e.target.value})}
                  error={errors.phone}
                  maxLength={20}
                  leftNode={<Phone size={16} className="text-[var(--text-muted)]" />}
                />
              </div>

              <div className="form-item">
                <label className="block font-sans text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex justify-between">
                  Birthday {member.member_type === 'alumni' && "/ Title"} {errors.title && <span className="text-[var(--status-error)] lowercase font-normal italic">*{errors.title}</span>}
                </label>
                <div className="flex gap-2 w-full">
                  <Select className={member.member_type === 'alumni' ? "w-[25%]" : "w-[30%]"} options={DAYS} value={member.birthDay} onChange={e => setMember({...member, birthDay: e.target.value})} />
                  <Select className="flex-1" options={MONTHS} value={member.birthMonth} onChange={e => setMember({...member, birthMonth: e.target.value})} />
                  
                  {member.member_type === 'alumni' && (
                    <Select 
                      className="w-[35%]" 
                      options={[
                        { label: 'Title', value: '' },
                        { label: 'Mr.', value: 'Mr.' },
                        { label: 'Mrs.', value: 'Mrs.' },
                        { label: 'Miss', value: 'Miss' },
                        { label: 'Dr.', value: 'Dr.' },
                        { label: 'Prof.', value: 'Prof.' },
                        { label: 'Pastor', value: 'Pastor' }
                      ]} 
                      value={member.title || ''} 
                      onChange={e => setMember({...member, title: e.target.value})} 
                    />
                  )}
                </div>
              </div>

              <div className="form-item col-span-1 md:col-span-2 pt-[16px] flex justify-end">
                <Button type="submit" loading={loading} disabled={!hasChanges || !isFormValid} className="w-full md:w-auto min-w-[160px] h-[48px] px-[32px]">
                  {loading ? "Saving..." : (
                    <div className="flex items-center justify-center gap-2">
                      <Save size={18} /> Save Changes
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
