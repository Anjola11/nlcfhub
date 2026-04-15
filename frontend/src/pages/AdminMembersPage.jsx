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
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { MemberProfileModal } from '../components/features/MemberProfileModal';
import { SpinnerLoader } from '../components/ui/SpinnerLoader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminMembersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSubgroup, setSelectedSubgroup] = useState('All');

  const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isCSVModalOpen, setCSVModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState(null);

  const bulkBarRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(0); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Subgroups for filter dropdown
  const { data: subgroups = [] } = useQuery({
    queryKey: ['subgroups'],
    queryFn: () => api.getSubgroups()
  });

  // Fetch Members with React Query
  const { 
    data: memberResponse, 
    isLoading: loading,
    isFetching,
    isError,
    error 
  } = useQuery({
    queryKey: ['members', 'approved', page, debouncedSearch, selectedStatus, selectedSubgroup, pageSize],
    queryFn: () => api.getApprovedMembers({ 
      search: debouncedSearch, 
      status: selectedStatus === 'All' ? null : selectedStatus.toLowerCase().replace('members', 'student'),
      subgroup_id: selectedSubgroup === 'All' ? null : selectedSubgroup
    }, pageSize, page * pageSize),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, 
  });

  // Prefetch next page
  useEffect(() => {
    if (memberResponse?.meta?.total > (page + 1) * pageSize) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: ['members', 'approved', nextPage, debouncedSearch, selectedStatus, selectedSubgroup, pageSize],
        queryFn: () => api.getApprovedMembers({ 
          search: debouncedSearch,
          status: selectedStatus === 'All' ? null : selectedStatus.toLowerCase().replace('members', 'student'),
          subgroup_id: selectedSubgroup === 'All' ? null : selectedSubgroup
        }, pageSize, nextPage * pageSize),
      });
    }
  }, [memberResponse, page, debouncedSearch, selectedStatus, selectedSubgroup, pageSize, queryClient]);

  const members = memberResponse?.data || [];
  const total = memberResponse?.meta?.total || 0;
  const hasMore = (page * pageSize + members.length) < total;

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (uid) => api.deleteMember(uid),
    onSuccess: (_, variables) => {
      addToast({ message: 'Member removed successfully', type: 'success' });
      queryClient.invalidateQueries(['members', 'approved']);
      setMemberToDelete(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Failed to delete member', type: 'error' });
      setMemberToDelete(null);
    }
  });

  const upsertMutation = useMutation({
    mutationFn: (data) => {
      if (editingMember) return api.editMember(editingMember.uid, data);
      return api.createMemberByAdmin(data);
    },
    onSuccess: () => {
      addToast({ 
        message: editingMember ? 'Member updated successfully' : 'Member added successfully', 
        type: 'success' 
      });
      queryClient.invalidateQueries(['members', 'approved']);
      setAddEditModalOpen(false);
      setEditingMember(null);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Failed to save', type: 'error' });
    }
  });

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
  const getSubgroups = (m) => m.subgroups?.map(s => s.name).join(', ') || '-';
  const getPosts = (m) => m.posts_held?.map(p => p.name).join(', ') || '-';

  const bdayFormat = (month, day) => {
    if (!month || !day) return '-';
    const date = new Date(2000, month - 1, day);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const handleDeleteMember = (uid, name) => {
    setMemberToDelete({ uid, name });
  };

  const handleEditSubmit = (data) => {
    upsertMutation.mutate(data);
  };

  return (
    <div className="relative">
      <FilterBar 
        searchQuery={searchQuery} 
        onSearchQueryChange={setSearchQuery} 
        onImportCSV={() => setCSVModalOpen(true)}
        onAddMember={() => { setEditingMember(null); setAddEditModalOpen(true); }}
        memberType={selectedStatus}
        onTypeChange={(val) => { setSelectedStatus(val); setPage(0); }}
        selectedSubgroup={selectedSubgroup}
        onSubgroupChange={(val) => { setSelectedSubgroup(val); setPage(0); }}
        subgroups={subgroups}
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

      <div className={`bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] overflow-hidden transition-opacity duration-200 ${isFetching && !loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto relative">
          {isFetching && !loading && (
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--surface-gold)] overflow-hidden z-10">
              <div className="h-full bg-[var(--surface-navy)] animate-indeterminate-progress"></div>
            </div>
          )}
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
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)] text-center">Subgroup / Post</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Type</th>
                <th className="px-[20px] py-[12px] w-[140px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-24">
                    <SpinnerLoader size="lg" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16">
                    <div className="flex flex-col items-center justify-center text-[var(--text-muted)]">
                      <Users size={64} className="mb-4 text-[var(--border-subtle)]" />
                      <h3 className="font-display font-medium text-[20px] text-[var(--text-secondary)] mb-1">No members found</h3>
                      <p className="font-sans text-[14px]">Try adjusting your search or filters.</p>
                      <Button className="mt-4" onClick={() => { setSearchQuery(''); setSelectedStatus('All'); setSelectedSubgroup('All'); }}>Clear All Filters</Button>
                    </div>
                  </td>
                </tr>
              ) : members.map((m) => (
                <tr 
                  key={m.uid} 
                  onClick={() => setSelectedMemberForProfile(m)}
                  className={`h-[72px] border-b border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)] transition-colors cursor-pointer ${selectedRows.includes(m.uid) ? 'bg-[rgba(235,183,54,0.08)] border-l-[3px] border-l-[var(--surface-gold)]' : 'border-l-[3px] border-l-transparent'}`}
                >
                  <td className="px-[20px]" onClick={(e) => e.stopPropagation()}>
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
                  <td className="px-[20px] font-mono text-[14px] text-[var(--text-secondary)]">{m.phone_number || '-'}</td>
                  <td className="px-[20px] font-mono text-[14px] text-[var(--text-primary)]">{bdayFormat(m.birth_month, m.birth_day)}</td>
                  <td className="px-[20px] text-center">
                    <div className="flex flex-col items-center gap-1">
                      {getSubgroups(m) !== '-' ? (
                        <Badge variant="subgroup">{getSubgroups(m)}</Badge>
                      ) : (
                        <span className="text-[var(--text-secondary)]">-</span>
                      )}
                      
                      {getPosts(m) !== '-' && (
                        <div className="font-sans text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit">
                          {getPosts(m)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-[20px]">
                    <Badge variant={m.status === 'student' ? 'member-type-active' : 'member-type-alumni'} className="capitalize">{m.status}</Badge>
                  </td>
                  <td className="px-[20px]" onClick={(e) => e.stopPropagation()}>
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
          <div className="font-sans text-[12px] text-[var(--text-secondary)]">Showing {members.length} of {total} members</div>
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

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between px-2">
        <div className="text-[13px] text-[var(--text-secondary)] font-sans">
          Page <span className="font-semibold text-[var(--text-primary)]">{page + 1}</span> 
          {total > 0 && ` (Showing ${members.length} of ${total})`}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="h-[36px] gap-1 px-3"
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore || loading}
            className="h-[36px] gap-1 px-3"
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <AddEditMemberModal 
        isOpen={isAddEditModalOpen} 
        onClose={() => {
          setAddEditModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSubmit={handleEditSubmit}
      />
      <CSVImportModal isOpen={isCSVModalOpen} onClose={() => setCSVModalOpen(false)} />
      
      <ConfirmModal 
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => deleteMutation.mutate(memberToDelete.uid)}
        loading={deleteMutation.isLoading}
        title="Delete Member"
        message={`Are you sure you want to permanently DELETE ${memberToDelete?.name}? This action is irreversible and all profile data will be lost.`}
        confirmLabel="Delete Permanently"
      />

      <MemberProfileModal 
        isOpen={!!selectedMemberForProfile}
        onClose={() => setSelectedMemberForProfile(null)}
        member={selectedMemberForProfile}
        onEdit={(m) => {
          setEditingMember(m);
          setAddEditModalOpen(true);
        }}
      />
    </div>
  );
}
