import React, { useState, useEffect, useRef } from 'react';
import { FilterBar } from '../components/features/FilterBar';
import { api } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Pencil, Copy, UserX, ChevronLeft, ChevronRight, ChevronDown, Users } from 'lucide-react';
import { AddEditMemberModal } from '../components/features/AddEditMemberModal';
import { CSVImportModal } from '../components/features/CSVImportModal';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { gsap } from 'gsap';
import { flashGold } from '../lib/gsap';

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isCSVModalOpen, setCSVModalOpen] = useState(false);
  const { addToast } = useToast();

  const bulkBarRef = useRef(null);
  
  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getApprovedMembers();
      setMembers(data);
    } catch (err) {
      addToast({ message: err.message || 'Failed to load members', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (selectedRows.length > 0 && bulkBarRef.current) {
      gsap.fromTo(bulkBarRef.current, { y: -32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
    }
  }, [selectedRows.length]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(members.map(m => m.uid));
    else setSelectedRows([]);
  };

  const toggleSelectRow = (uid) => {
    setSelectedRows(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);
  };

  const getMemberName = (m) => m.fullname || m.full_name || `${m.first_name} ${m.last_name}`;
  const getSubgroups = (m) => m.subgroups?.map(s => s.name).join(', ') || '—';
  const getPosts = (m) => m.posts_held?.map(p => p.name).join(', ') || '—';

  const bdayFormat = (month, day) => {
    if (!month || !day) return '—';
    const date = new Date(2000, month - 1, day);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const handleDeleteMember = async (uid, name) => {
    try {
      await api.deleteMember(uid);
      addToast({ message: `${name} has been removed`, type: 'success' });
      loadMembers();
    } catch (err) {
      addToast({ message: err.message || 'Failed to delete member', type: 'error' });
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      if (editingMember) {
        await api.editMember(editingMember.uid, data);
        addToast({ message: 'Member updated successfully', type: 'success' });
      } else {
        // Add member is not yet wired (no backend route for admin-create)
        addToast({ message: 'Member added (UI only — backend route pending)', type: 'success' });
      }
      loadMembers();
    } catch (err) {
      addToast({ message: err.message || 'Failed to save', type: 'error' });
    }
  };

  // Client-side search filter
  const filtered = members.filter(m => {
    if (!searchQuery) return true;
    const name = getMemberName(m).toLowerCase();
    const email = (m.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="relative">
      <FilterBar 
        searchQuery={searchQuery} 
        onSearchQueryChange={setSearchQuery} 
        onImportCSV={() => setCSVModalOpen(true)}
        onAddMember={() => { setEditingMember(null); setAddEditModalOpen(true); }}
      />

      {selectedRows.length > 0 && (
        <div ref={bulkBarRef} className="sticky top-[64px] z-20 bg-[var(--surface-navy)] px-[32px] py-[12px] flex items-center justify-between -mx-[16px] sm:-mx-[32px] mb-6">
          <div className="font-sans font-semibold text-[14px] text-[var(--text-inverse)]">
            {selectedRows.length} member(s) selected
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[var(--status-error)] hover:opacity-80 font-sans text-[12px] font-semibold transition-opacity" onClick={() => addToast({message:"Bulk actions coming soon", type:"success"})}>
              Deactivate selected
            </button>
            <button className="text-white/60 hover:text-white font-sans text-[12px] font-semibold transition-colors" onClick={() => setSelectedRows([])}>
              Clear selection
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)]">
                <th className="px-[20px] py-[12px] w-[60px]">
                  <input type="checkbox" className="w-[16px] h-[16px] accent-[var(--surface-gold)] rounded-[4px]" 
                         checked={selectedRows.length === filtered.length && filtered.length > 0} 
                         onChange={toggleSelectAll} />
                </th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)] w-[70px]">Photo</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)] group cursor-pointer hover:text-[var(--text-primary)] transition-colors">Name <ChevronDown size={14} className="inline opacity-0 group-hover:opacity-100 transition-opacity" /></th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Phone</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Birthday</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Subgroup</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Type</th>
                <th className="px-[20px] py-[12px] w-[140px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="py-16">
                    <div className="flex flex-col items-center justify-center text-[var(--text-muted)]">
                      <Users size={64} className="mb-4 text-[var(--border-subtle)]" />
                      <h3 className="font-display font-medium text-[20px] text-[var(--text-secondary)] mb-1">No members yet</h3>
                      <p className="font-sans text-[14px]">Start by adding the first member or importing a CSV.</p>
                      <Button className="mt-4" onClick={() => setAddEditModalOpen(true)}>Add Member</Button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((m) => (
                <tr key={m.uid} className={`h-[72px] border-b border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)] transition-colors ${selectedRows.includes(m.uid) ? 'bg-[rgba(235,183,54,0.08)] border-l-[3px] border-l-[var(--surface-gold)]' : 'border-l-[3px] border-l-transparent'}`}>
                  <td className="px-[20px]">
                    <input type="checkbox" className="w-[16px] h-[16px] accent-[var(--surface-gold)] rounded-[4px]" 
                           checked={selectedRows.includes(m.uid)} 
                           onChange={() => toggleSelectRow(m.uid)} />
                  </td>
                  <td className="px-[20px]">
                    <Avatar size="sm" name={getMemberName(m)} photoUrl={m.profile_picture_url} />
                  </td>
                  <td className="px-[20px]">
                    <div className="font-sans font-semibold text-[14px] text-[var(--text-primary)]">{m.title ? `${m.title} ` : ''}{getMemberName(m)}</div>
                    <div className="font-sans text-[12px] text-[var(--text-secondary)]">{m.email}</div>
                  </td>
                  <td className="px-[20px] font-mono text-[14px] text-[var(--text-secondary)]">{m.phone_number || '—'}</td>
                  <td className="px-[20px] font-mono text-[14px] text-[var(--text-primary)]">{bdayFormat(m.birth_month, m.birth_day)}</td>
                  <td className="px-[20px]">
                    <Badge variant="subgroup">{getSubgroups(m)}</Badge>
                  </td>
                  <td className="px-[20px]">
                    <Badge variant={m.status === 'student' ? 'member-type-active' : 'member-type-alumni'} className="capitalize">{m.status}</Badge>
                  </td>
                  <td className="px-[20px]">
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas-dim)] transition-all" onClick={() => { setEditingMember(m); setAddEditModalOpen(true); }}>
                        <Pencil size={16} />
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas-dim)] transition-all" onClick={(e) => {
                        navigator.clipboard.writeText(m.email || '');
                        flashGold(e.currentTarget);
                        addToast({message: "Email copied", type: "success"});
                      }}>
                        <Copy size={16} />
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[#FEF2F2] transition-colors" onClick={() => handleDeleteMember(m.uid, getMemberName(m))}>
                        <UserX size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-[20px] py-[16px] border-t border-[var(--border-subtle)] bg-[var(--surface-white)]">
          <div className="font-sans text-[12px] text-[var(--text-secondary)]">Showing 1–{filtered.length} of {filtered.length} members</div>
          <div className="flex items-center gap-1">
            <button className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[var(--text-secondary)] disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[var(--text-inverse)] bg-[var(--surface-navy)] font-sans font-medium text-[14px]">
              1
            </button>
            <button className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[var(--text-secondary)] disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <AddEditMemberModal 
        isOpen={isAddEditModalOpen} 
        onClose={() => setAddEditModalOpen(false)} 
        member={editingMember}
        onSubmit={handleEditSubmit}
      />
      <CSVImportModal isOpen={isCSVModalOpen} onClose={() => setCSVModalOpen(false)} />
    </div>
  );
}
