import React, { useState, useEffect, useRef } from 'react';
import { FilterBar } from '../components/features/FilterBar';
import { api } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Pencil, Copy, UserX, ChevronLeft, ChevronRight, ChevronDown, Users } from 'lucide-react';
import { AddEditMemberModal } from '../components/features/AddEditMemberModal';
import { CSVImportModal } from '../components/features/CSVImportModal';
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
  
  useEffect(() => {
    api.getActiveMembers().then(data => {
      setMembers(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedRows.length > 0 && bulkBarRef.current) {
      gsap.fromTo(bulkBarRef.current, { y: -32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
    }
  }, [selectedRows.length]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(members.map(m => m.id));
    else setSelectedRows([]);
  };

  const toggleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bdayFormat = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

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
            <button className="text-[var(--status-error)] hover:opacity-80 font-sans text-[12px] font-semibold transition-opacity" onClick={() => addToast({message:"Deactivated selected members", type:"success"})}>
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
                         checked={selectedRows.length === members.length && members.length > 0} 
                         onChange={toggleSelectAll} />
                </th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)] w-[70px]">Photo</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)] group cursor-pointer hover:text-[var(--text-primary)] transition-colors">Name <ChevronDown size={14} className="inline opacity-0 group-hover:opacity-100 transition-opacity" /></th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Phone</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Birthday</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Subgroup</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Type</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Status</th>
                <th className="px-[20px] py-[12px] w-[140px]"></th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && !loading ? (
                <tr>
                  <td colSpan={9} className="py-16">
                    <div className="flex flex-col items-center justify-center text-[var(--text-muted)]">
                      <Users size={64} className="mb-4 text-[var(--border-subtle)]" />
                      <h3 className="font-display font-medium text-[20px] text-[var(--text-secondary)] mb-1">No members yet</h3>
                      <p className="font-sans text-[14px]">Start by adding the first member or importing a CSV.</p>
                      <Button className="mt-4" onClick={() => setAddEditModalOpen(true)}>Add Member</Button>
                    </div>
                  </td>
                </tr>
              ) : members.map((m) => (
                <tr key={m.id} className={`h-[72px] border-b border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)] transition-colors ${selectedRows.includes(m.id) ? 'bg-[rgba(235,183,54,0.08)] border-l-[3px] border-l-[var(--surface-gold)]' : 'border-l-[3px] border-l-transparent'}`}>
                  <td className="px-[20px]">
                    <input type="checkbox" className="w-[16px] h-[16px] accent-[var(--surface-gold)] rounded-[4px]" 
                           checked={selectedRows.includes(m.id)} 
                           onChange={() => toggleSelectRow(m.id)} />
                  </td>
                  <td className="px-[20px]">
                    <Avatar size="sm" name={m.full_name} photoUrl={m.photoUrl} />
                  </td>
                  <td className="px-[20px]">
                    <div className="font-sans font-semibold text-[14px] text-[var(--text-primary)]">{m.title ? `${m.title} ` : ''}{m.full_name}</div>
                  </td>
                  <td className="px-[20px] font-mono text-[14px] text-[var(--text-secondary)]">{m.phone}</td>
                  <td className="px-[20px] font-mono text-[14px] text-[var(--text-primary)]">{bdayFormat(m.birthday)}</td>
                  <td className="px-[20px]">
                    <Badge variant="subgroup">{m.subgroup}</Badge>
                  </td>
                  <td className="px-[20px]">
                    <Badge variant={m.member_type === 'active' ? 'member-type-active' : 'member-type-alumni'} className="capitalize">{m.member_type}</Badge>
                  </td>
                  <td className="px-[20px]">
                    <Badge variant={m.status === 'active' ? 'status-active' : 'status-inactive'} />
                  </td>
                  <td className="px-[20px]">
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas-dim)] transition-all" onClick={() => { setEditingMember(m); setAddEditModalOpen(true); }}>
                        <Pencil size={16} />
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas-dim)] transition-all" onClick={(e) => {
                        navigator.clipboard.writeText(`https://nlcfhub.org/me/${m.id}?token=abc`);
                        flashGold(e.currentTarget);
                        addToast({message: "Edit link copied", type: "success"});
                      }}>
                        <Copy size={16} />
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[#FEF2F2] transition-colors" onClick={() => addToast({message: "Member deactivated", type: "success"})}>
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
          <div className="font-sans text-[12px] text-[var(--text-secondary)]">Showing 1–{members.length} of {members.length} members</div>
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
        onSubmit={(data) => {
          addToast({ message: `Member ${editingMember ? 'updated' : 'added'} successfully`, type: 'success' });
        }}
      />
      <CSVImportModal isOpen={isCSVModalOpen} onClose={() => setCSVModalOpen(false)} />
    </div>
  );
}
