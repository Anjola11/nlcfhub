import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, XCircle, Search, UserCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { gsap } from 'gsap';
import { staggerReveal } from '../lib/gsap';

export default function AdminApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // uid of member being acted on
  const { addToast } = useToast();
  
  const tableRef = useRef(null);

  const loadPending = async (targetPage = page, targetSearch = debouncedSearch) => {
    setLoading(true);
    try {
      const offset = targetPage * pageSize;
      const response = await api.getPendingMembers({
        search: targetSearch,
        limit: pageSize,
        offset
      });
      const data = response.data || [];
      const meta = response.meta || {};

      setPending(data);
      setTotal(meta.total || 0);
      setHasMore((offset + data.length) < (meta.total || 0));

      setTimeout(() => {
        if (tableRef.current) staggerReveal(tableRef.current, 'tbody tr');
      }, 50);
    } catch (err) {
      addToast({ message: err.message || 'Failed to load pending members', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadPending(page, debouncedSearch);
  }, [page, debouncedSearch]);

  const handleApprove = async (uid, name) => {
    setActionLoading(uid);
    try {
      await api.approveMember(uid);
      addToast({ message: `Approved ${name}'s registration`, type: 'success' });
      loadPending(page, debouncedSearch);
    } catch (err) {
      addToast({ message: err.message || 'Failed to approve', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uid, name) => {
    setActionLoading(uid);
    try {
      await api.rejectMember(uid);
      addToast({ message: `Rejected ${name}'s registration`, type: 'success' });
      loadPending(page, debouncedSearch);
    } catch (err) {
      addToast({ message: err.message || 'Failed to reject', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const getMemberName = (p) => p.fullname || p.full_name || `${p.first_name} ${p.last_name}`;
  const getSubgroups = (p) => p.subgroups?.map(s => s.name).join(', ') || '—';
  const getPosts = (p) => p.posts_held?.map(post => post.name).join(', ') || '—';

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="font-display font-bold text-[24px] text-[var(--text-primary)]">Pending Approvals</h1>
          <p className="font-sans text-[14px] text-[var(--text-secondary)] mt-1">Review and verify new member registrations before granting access.</p>
        </div>
        <div className="w-full md:w-[320px]">
          <Input 
            placeholder="Search pending registrations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftNode={<Search size={16} className="text-[var(--text-muted)] mt-0.5" />}
            containerClassName="mb-0"
          />
        </div>
      </div>

      <div className="bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)]">
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)] w-[60px]">Applicant</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Name & Email</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Subgroup</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Phone</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Date applied</th>
                <th className="px-[20px] py-[12px] text-right font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <div className="flex flex-col items-center justify-center text-[var(--text-muted)]">
                      <ShieldCheck size={64} className="mb-4 text-[var(--border-subtle)]" />
                      <h3 className="font-display font-medium text-[20px] text-[var(--text-secondary)] mb-1">All caught up!</h3>
                      <p className="font-sans text-[14px]">There are no pending registrations waiting for approval.</p>
                    </div>
                  </td>
                </tr>
              ) : pending.map((p) => (
                <tr key={p.uid} className="h-[72px] border-b border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)] transition-colors border-l-[3px] border-l-transparent hover:border-l-[var(--surface-navy)]">
                   <td className="px-[20px]">
                    <Avatar size="sm" name={getMemberName(p)} photoUrl={p.profile_picture_url} />
                  </td>
                  <td className="px-[20px]">
                    <div className="font-sans font-semibold text-[14px] text-[var(--text-primary)]">{getMemberName(p)}</div>
                    <div className="font-sans text-[12px] text-[var(--text-secondary)]">{p.email}</div>
                  </td>
                  <td className="px-[20px]">
                    <div className="flex flex-col gap-1">
                      <Badge variant="subgroup">{getSubgroups(p)}</Badge>
                      {getPosts(p) !== '—' && (
                        <div className="font-sans text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit">
                          {getPosts(p)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-[20px] font-mono text-[14px] text-[var(--text-secondary)]">{p.phone_number || '—'}</td>
                  <td className="px-[20px] font-sans text-[13px] text-[var(--text-secondary)]">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td className="px-[20px] text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                         variant="ghost" 
                         className="text-[var(--status-error)] hover:bg-[#FEF2F2] px-[12px] h-[36px]" 
                         onClick={() => handleReject(p.uid, getMemberName(p))}
                         loading={actionLoading === p.uid}
                         disabled={!!actionLoading}
                       >
                         <XCircle size={14} className="mr-1.5" /> Reject
                       </Button>
                       <Button 
                         className="px-[16px] h-[36px]" 
                         onClick={() => handleApprove(p.uid, getMemberName(p))}
                         loading={actionLoading === p.uid}
                         disabled={!!actionLoading}
                       >
                         <UserCheck size={14} className="mr-1.5" /> Approve
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between px-2">
        <div className="text-[13px] text-[var(--text-secondary)] font-sans">
          Page <span className="font-semibold text-[var(--text-primary)]">{page + 1}</span>
          {total > 0 && ` (Showing ${pending.length} of ${total})`}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="h-[36px] gap-1 px-3"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore || loading}
            className="h-[36px] gap-1 px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
