import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';

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


export function AddEditMemberModal({ isOpen, onClose, member = null, onSubmit }) {
  const isEdit = !!member;
  
  // Live metadata from the backend
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [postOptions, setPostOptions] = useState([]);
  
  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [changes, setChanges] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    day: '',
    month: '',
    status: 'student',
    title: '',
    subgroupIds: [],
    postIds: [],
    isActiveStatus: true,
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Original data snapshot (for change comparison)
  const [originalData, setOriginalData] = useState(null);

  // Fetch live subgroup/post metadata when modal opens
  useEffect(() => {
    if (!isOpen) return;
    api.getSubgroups().then(data => {
      setSubgroupOptions(data.map(s => ({ label: s.name, value: s.id, name: s.name })));
    }).catch(console.error);
    api.getPosts().then(data => {
      setPostOptions(data.map(p => ({ label: p.name, value: p.id, name: p.name })));
    }).catch(console.error);
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (isOpen && member) {
      // Map the member's current subgroups/posts to their UUID ids
      const currentSubgroupIds = member.subgroups?.map(s => s.id) || [];
      const currentPostIds = member.posts_held?.map(p => p.id) || [];

      const data = {
        firstName: member.first_name || '',
        lastName: member.last_name || '',
        email: member.email || '',
        phone: member.phone_number || '',
        day: member.birth_day ? String(member.birth_day).padStart(2, '0') : '',
        month: member.birth_month ? String(member.birth_month).padStart(2, '0') : '',
        status: member.status || 'student',
        title: member.title || '',
        subgroupIds: currentSubgroupIds,
        postIds: currentPostIds,
        isActiveStatus: member.account_approved !== false,
        password: '',
        confirmPassword: ''
      };

      setFormData(data);
      setOriginalData({ ...data, subgroupIds: [...currentSubgroupIds], postIds: [...currentPostIds] });
    } else if (isOpen && !member) {
      const empty = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        day: '',
        month: '',
        status: 'student',
        title: '',
        subgroupIds: [],
        postIds: [],
        isActiveStatus: true,
        password: '',
        confirmPassword: ''
      };
      setFormData(empty);
      setOriginalData(null);
    }
    setGeneratedPassword('');
    setShowConfirm(false);
  }, [isOpen, member]);

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    const passwordLength = 12;
    let password = '';

    for (let i = 0; i < passwordLength; i += 1) {
      const index = Math.floor(Math.random() * chars.length);
      password += chars[index];
    }

    setGeneratedPassword(password);
    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const copyGeneratedPassword = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
    } catch {
      // Clipboard copy can silently fail on some browsers/security contexts.
    }
  };

  // When status changes to alumni, clear subgroups and posts
  const handleStatusChange = (newStatus) => {
    if (newStatus === 'alumni') {
      setFormData(prev => ({
        ...prev,
        status: newStatus,
        subgroupIds: [],
        postIds: [],
        title: prev.title || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, status: newStatus, title: '' }));
    }
  };

  // Build a list of human-readable changes for the confirmation dialog
  const computeChanges = () => {
    if (!originalData) {
      return [
        { label: 'Action', value: 'Create new member' },
        { label: 'Name', value: `${formData.firstName} ${formData.lastName}`.trim() || '—' },
        { label: 'Email', value: formData.email || '—' },
        { label: 'Phone', value: formData.phone || '—' },
        { label: 'Birthday', value: `${formData.day || '—'}/${formData.month || '—'}` },
        { label: 'Status', value: formData.status || '—' },
        { label: 'Title', value: formData.status === 'alumni' ? (formData.title || '—') : 'N/A' },
        {
          label: 'Subgroups',
          value: formData.status === 'alumni'
            ? 'N/A'
            : (formData.subgroupIds
              .map(id => subgroupOptions.find(s => s.value === id)?.name || id)
              .join(', ') || 'None selected')
        },
        {
          label: 'Posts Held',
          value: formData.status === 'alumni'
            ? 'N/A'
            : (formData.postIds
              .map(id => postOptions.find(p => p.value === id)?.name || id)
              .join(', ') || 'None selected')
        },
      ];
    }
    
    const diff = [];

    if (formData.firstName !== originalData.firstName) 
      diff.push({ label: 'First Name', from: originalData.firstName, to: formData.firstName });
    if (formData.lastName !== originalData.lastName) 
      diff.push({ label: 'Last Name', from: originalData.lastName, to: formData.lastName });
    if (formData.email !== originalData.email)
      diff.push({ label: 'Email', from: originalData.email || '—', to: formData.email || '—' });
    if (formData.phone !== originalData.phone) 
      diff.push({ label: 'Phone', from: originalData.phone || '—', to: formData.phone || '—' });
    if (formData.day !== originalData.day || formData.month !== originalData.month) 
      diff.push({ label: 'Birthday', from: `${originalData.day}/${originalData.month}`, to: `${formData.day}/${formData.month}` });
    if (formData.status !== originalData.status) 
      diff.push({ label: 'Status', from: originalData.status, to: formData.status });
    if (formData.title !== originalData.title) 
      diff.push({ label: 'Title', from: originalData.title || '—', to: formData.title || '—' });

    // Compare subgroups
    const origSg = new Set(originalData.subgroupIds);
    const newSg = new Set(formData.subgroupIds);
    const addedSg = formData.subgroupIds.filter(id => !origSg.has(id));
    const removedSg = originalData.subgroupIds.filter(id => !newSg.has(id));
    if (addedSg.length > 0 || removedSg.length > 0) {
      const getName = (id) => subgroupOptions.find(s => s.value === id)?.name || id;
      const parts = [];
      if (addedSg.length) parts.push(`Added: ${addedSg.map(getName).join(', ')}`);
      if (removedSg.length) parts.push(`Removed: ${removedSg.map(getName).join(', ')}`);
      diff.push({ label: 'Subgroups', value: parts.join(' · ') });
    }

    // Compare posts
    const origP = new Set(originalData.postIds);
    const newP = new Set(formData.postIds);
    const addedP = formData.postIds.filter(id => !origP.has(id));
    const removedP = originalData.postIds.filter(id => !newP.has(id));
    if (addedP.length > 0 || removedP.length > 0) {
      const getName = (id) => postOptions.find(p => p.value === id)?.name || id;
      const parts = [];
      if (addedP.length) parts.push(`Added: ${addedP.map(getName).join(', ')}`);
      if (removedP.length) parts.push(`Removed: ${removedP.map(getName).join(', ')}`);
      diff.push({ label: 'Posts Held', value: parts.join(' · ') });
    }

    if (formData.isActiveStatus !== originalData.isActiveStatus)
      diff.push({ label: 'Profile Status', from: originalData.isActiveStatus ? 'Active' : 'Inactive', to: formData.isActiveStatus ? 'Active' : 'Inactive' });

    return diff.length > 0 ? diff : [{ label: 'No changes', value: 'Nothing was modified' }];
  };

  // Shows the confirmation dialog before submitting
  const handleReviewChanges = (e) => {
    e.preventDefault();

    if (!isEdit) {
      if (!formData.email) {
        setChanges([{ label: 'Validation', value: 'Email is required for creating a member.' }]);
        setShowConfirm(true);
        return;
      }

      if (!formData.password || formData.password.length < 8) {
        setChanges([{ label: 'Validation', value: 'Password must be at least 8 characters.' }]);
        setShowConfirm(true);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setChanges([{ label: 'Validation', value: 'Passwords do not match.' }]);
        setShowConfirm(true);
        return;
      }
    }

    const computed = computeChanges();
    setChanges(computed);
    setShowConfirm(true);
  };

  // Actually sends the data
  const hasValidationError = changes.some(c => c.label === 'Validation');

  const handleConfirm = async () => {
    if (hasValidationError || submitting) return;
    if (onSubmit) {
      const payload = isEdit
        ? {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phone || undefined,
            birth_day: formData.day ? parseInt(formData.day) : undefined,
            birth_month: formData.month ? parseInt(formData.month) : undefined,
            status: formData.status,
            title: formData.status === 'alumni' ? (formData.title || undefined) : undefined,
            subgroup_ids: formData.status === 'alumni' ? [] : formData.subgroupIds,
            post_ids: formData.status === 'alumni' ? [] : formData.postIds,
            account_approved: formData.isActiveStatus,
          }
        : {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone_number: formData.phone,
            birth_day: parseInt(formData.day),
            birth_month: parseInt(formData.month),
            status: formData.status,
            title: formData.status === 'alumni' ? (formData.title || null) : null,
            subgroup_ids: formData.status === 'alumni' ? [] : formData.subgroupIds,
            post_ids: formData.status === 'alumni' ? [] : formData.postIds,
            password: formData.password,
            confirm_password: formData.confirmPassword,
          };
      try {
        setSubmitting(true);
        await onSubmit(payload);
        onClose();
      } catch {
        // onSubmit already handles user-facing error toasts; keep review modal open for retry.
      } finally {
        setSubmitting(false);
      }
    }
  };

  // ── Confirmation view ──────────────────────────────────────────────
  if (showConfirm) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!submitting) setShowConfirm(false);
        }}
        title="Confirm Changes"
        footer={
          hasValidationError ? (
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>Go Back</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={submitting}>Go Back</Button>
              <Button onClick={handleConfirm} loading={submitting} disabled={submitting}>
                {!submitting && <Check size={16} className="mr-1.5" />}
                {submitting ? 'Saving...' : 'Confirm'}
              </Button>
            </>
          )
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 bg-[rgba(235,183,54,0.08)] border border-[rgba(235,183,54,0.3)] rounded-[14px] p-4">
            <AlertTriangle size={20} className="text-[var(--surface-gold)] shrink-0 mt-0.5" />
            <p className="font-sans text-[13px] text-[var(--text-primary)]">
              Please review the following changes before applying them to <strong>{member?.first_name} {member?.last_name}</strong>.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
            {changes.map((c, i) => (
              <div key={i} className="py-3 flex flex-col">
                <span className="font-mono text-[11px] uppercase text-[var(--text-secondary)] tracking-[0.06em] mb-1">{c.label}</span>
                {c.from !== undefined ? (
                  <div className="flex items-center gap-2 text-[14px] font-sans">
                    <span className="text-[var(--status-error)] line-through">{c.from}</span>
                    <span className="text-[var(--text-muted)]">→</span>
                    <span className="text-[var(--status-success)] font-semibold">{c.to}</span>
                  </div>
                ) : (
                  <span className="font-sans text-[14px] text-[var(--text-primary)]">{c.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  // ── Main form view ─────────────────────────────────────────────────
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? `Edit: ${member.first_name} ${member.last_name}` : "Add Member"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleReviewChanges}>{isEdit ? "Review Changes" : "Add Member"}</Button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleReviewChanges} className="flex flex-col gap-5">
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
        
        <Input 
          label="PHONE NUMBER" 
          type="tel"
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
          required
          leftNode={<div className="bg-[var(--bg-canvas-dim)] border-r border-[var(--border-subtle)] h-full flex items-center px-3 rounded-l-[13px] font-mono text-[14px] text-[var(--text-secondary)]">+234</div>}
          className="pl-2"
        />

        {!isEdit && (
          <Input
            label="EMAIL"
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
        )}

        <div className="flex flex-col gap-1.5 w-full">
          <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">BIRTHDAY</label>
          <div className="flex gap-3 w-full">
            <Select 
              className="w-[40%]" 
              placeholder="Day"
              options={DAYS} 
              value={formData.day} 
              onChange={e => setFormData({...formData, day: e.target.value})} 
            />
            <Select 
              className="flex-1" 
              placeholder="Month"
              options={MONTHS} 
              value={formData.month} 
              onChange={e => setFormData({...formData, month: e.target.value})} 
            />
          </div>
        </div>

        <div className="w-full">
          <Select 
            label="STATUS"
            options={STATUSES}
            value={formData.status}
            onChange={e => handleStatusChange(e.target.value)}
            required
          />
        </div>

        {formData.status === 'alumni' && (
          <div className="w-full">
            <Select 
              label="TITLE"
              options={TITLES}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
        )}

        {formData.status === 'student' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)]">
                SUBGROUPS (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {subgroupOptions.map(sg => (
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
                {postOptions.map(post => (
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

        {!isEdit && (
          <>
            <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-sans font-semibold text-[14px] text-[var(--text-primary)]">Temporary password</p>
                  <p className="font-sans text-[12px] text-[var(--text-secondary)]">Generate and share with the new member. It appears here once.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={generateTemporaryPassword}>
                  Generate Password
                </Button>
              </div>

              {generatedPassword && (
                <div className="mt-3 rounded-[10px] bg-[var(--surface-white)] border border-[var(--border-subtle)] px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[13px] text-[var(--text-primary)] break-all">{generatedPassword}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={copyGeneratedPassword}>Copy</Button>
                </div>
              )}
            </div>

            <Input
              label="PASSWORD"
              type={showPassword ? "text" : "password"}
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

            <Input
              label="CONFIRM PASSWORD"
              type={showConfirmPassword ? "text" : "password"}
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
          </>
        )}

        {isEdit && (
          <div className="flex items-center justify-between p-4 rounded-[14px] border border-[var(--border-subtle)] mt-2">
            <div>
              <div className="font-sans font-semibold text-[14px]">Profile Status</div>
              <div className="font-sans text-[12px] text-[var(--text-secondary)]">Deactivate to hide from birthday lists</div>
            </div>
            <Toggle 
              isOn={formData.isActiveStatus} 
              onToggle={(v) => setFormData({...formData, isActiveStatus: v})} 
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
