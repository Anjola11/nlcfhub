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
  { label: 'Choir', value: 'Choir' }, { label: 'Ushers', value: 'Ushers' },
  { label: 'Media', value: 'Media' }, { label: 'Welfare', value: 'Welfare' },
  { label: 'Workers', value: 'Workers' }, { label: 'Exco', value: 'Exco' },
  { label: 'General', value: 'General' }
];
const MEMBER_TYPES = [
  { label: 'Active Member', value: 'active' },
  { label: 'Alumni', value: 'alumni' }
];

export function AddEditMemberModal({ isOpen, onClose, member = null, onSubmit }) {
  const isEdit = !!member;
  
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    day: '',
    month: '',
    subgroup: '',
    memberType: 'active',
    isActiveStatus: true
  });

  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        firstName: member.full_name || '',
        phone: member.phone || '',
        day: member.birthday ? new Date(member.birthday).getDate().toString().padStart(2, '0') : '',
        month: member.birthday ? (new Date(member.birthday).getMonth() + 1).toString().padStart(2, '0') : '',
        subgroup: member.subgroup || '',
        memberType: member.member_type || 'active',
        isActiveStatus: member.status === 'active'
      });
    } else if (isOpen && !member) {
      setFormData({
        firstName: '',
        phone: '',
        day: '',
        month: '',
        subgroup: '',
        memberType: 'active',
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
      title={isEdit ? `Edit: ${member.full_name}` : "Add Member"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? "Save Changes" : "Add Member"}</Button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input 
          label="FULL NAME" 
          value={formData.firstName}
          onChange={e => setFormData({...formData, firstName: e.target.value})}
          required
        />
        
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

        <div className="grid grid-cols-2 gap-3 w-full">
          <Select 
            label="SUBGROUP"
            options={SUBGROUPS}
            value={formData.subgroup}
            onChange={e => setFormData({...formData, subgroup: e.target.value})}
            required
          />
          <Select 
            label="MEMBER TYPE"
            options={MEMBER_TYPES}
            value={formData.memberType}
            onChange={e => setFormData({...formData, memberType: e.target.value})}
            required
          />
        </div>

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
