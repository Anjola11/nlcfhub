import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
].map((m, i) => ({ label: m, value: String(i + 1).padStart(2, '0') }));
const DAYS = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1).padStart(2, '0') }));
const SUBGROUPS = [
  { label: 'Choir (TKW)', value: 'Choir (TKW)' },
  { label: 'Media and Editorial', value: 'Media and Editorial' },
  { label: 'Ushering subgroup', value: 'Ushering subgroup' },
  { label: 'Prayer subgroup', value: 'Prayer subgroup' },
  { label: 'Academic subgroup', value: 'Academic subgroup' },
  { label: 'Sanctuary and Decorating', value: 'Sanctuary and Decorating' },
  { label: 'Drama subgroup', value: 'Drama subgroup' },
  { label: 'Evangelism subgroup', value: 'Evangelism subgroup' },
  { label: 'Organising and Technical', value: 'Organising and Technical' },
  { label: 'Bible Study subgroup', value: 'Bible Study subgroup' },
  { label: 'Foundation Bible School (FBS)', value: 'Foundation Bible School (FBS)' },
  { label: 'Welfare subgroup', value: 'Welfare subgroup' }
];

const POSTS = [
  { label: 'President', value: 'President' },
  { label: 'Vice President', value: 'Vice President' },
  { label: 'General Secretary', value: 'General Secretary' },
  { label: 'Workers Coordinator', value: 'Workers Coordinator' },
  { label: 'Sisters Coordinator', value: 'Sisters Coordinator' },
  { label: 'Financial Secretary', value: 'Financial Secretary' },
  { label: 'Treasurer', value: 'Treasurer' },
  { label: 'Asst. General Secretary', value: 'Asst. General Secretary' },
  { label: 'Welfare Coordinator', value: 'Welfare Coordinator' },
  { label: 'Bible Study Coordinator', value: 'Bible Study Coordinator' },
  { label: 'FBS Principal', value: 'FBS Principal' },
  { label: 'Evangelism Coordinator', value: 'Evangelism Coordinator' },
  { label: 'Media and Editorial Head', value: 'Media and Editorial Head' },
  { label: 'Choir Coordinator', value: 'Choir Coordinator' },
  { label: 'Sanctuary and Decorating Head', value: 'Sanctuary and Decorating Head' },
  { label: 'Drama Coordinator', value: 'Drama Coordinator' },
  { label: 'Prayer Coordinator', value: 'Prayer Coordinator' },
  { label: 'Academic Head', value: 'Academic Head' },
  { label: 'Ushering Head and Librarian', value: 'Ushering Head and Librarian' },
  { label: 'Organising and Technical Head', value: 'Organising and Technical Head' },
  { label: 'A.R.O 1', value: 'A.R.O 1' },
  { label: 'A.R.O 2', value: 'A.R.O 2' },
  { label: 'UJCM Representative', value: 'UJCM Representative' }
];

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
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    day: '',
    month: '',
    status: 'student',
    title: '',
    subgroupIds: [],
    postIds: [],
    isActiveStatus: true
  });

  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        firstName: member.first_name || '',
        lastName: member.last_name || '',
        phone: member.phone_number || '',
        day: member.birth_day ? String(member.birth_day).padStart(2, '0') : '',
        month: member.birth_month ? String(member.birth_month).padStart(2, '0') : '',
        status: member.status || 'student',
        title: member.title || '',
        subgroupIds: member.subgroup_ids || [],
        postIds: member.post_ids || [],
        isActiveStatus: member.account_approved !== false
      });
    } else if (isOpen && !member) {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        day: '',
        month: '',
        status: 'student',
        title: '',
        subgroupIds: [],
        postIds: [],
        isActiveStatus: true
      });
    }
  }, [isOpen, member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? `Edit: ${member.first_name} ${member.last_name}` : "Add Member"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? "Save Changes" : "Add Member"}</Button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            onChange={e => setFormData({...formData, status: e.target.value})}
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
