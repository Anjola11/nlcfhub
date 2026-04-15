import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X, Mail, Phone, CalendarDays, ClipboardList, Eye, Pencil, User, Users } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { FullscreenImageViewer } from '../ui/FullscreenImageViewer';
import { Avatar } from '../ui/Avatar';

export function MemberProfileModal({ isOpen, onClose, member, onEdit }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const isClosing = useRef(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    isClosing.current = false;
    document.body.style.overflow = 'hidden';

    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(
      panelRef.current,
      { scale: 0.95, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }
    );

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(panelRef.current, {
      scale: 0.96,
      opacity: 0,
      y: 20,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const name = member.fullname || member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
  const photoUrl = member.profile_picture_url || member.photoUrl;
  const fullViewPhotoUrl = member.birthday_picture_url || photoUrl;
  const subgroups = member.subgroups?.map((s) => s.name).join(', ') || 'None';
  const posts = member.posts_held?.map((p) => p.name).join(', ') || 'None';
  
  const bdayFormat = (month, day) => {
    if (!month || !day) return 'Not set';
    return new Date(2000, month - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[var(--surface-overlay)]"
        onClick={handleClose}
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[28px] bg-[var(--surface-white)] shadow-2xl z-10 scrollbar-hide"
      >
        {/* Header with Background/Photo */}
        <div className="relative h-[240px] bg-[var(--surface-navy)] overflow-hidden">
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(26,28,59,0.8)]" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-navy)]">
                <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center">
                    <Users size={40} className="text-white/40" />
                </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {fullViewPhotoUrl && (
              <button
                onClick={() => setIsImageViewerOpen(true)}
                className="w-10 h-10 rounded-[12px] bg-white/90 text-[var(--surface-navy)] flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95"
                title="View full picture"
              >
                <Eye size={18} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-[12px] bg-[var(--surface-gold)] text-[var(--surface-navy)] flex items-center justify-center hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute bottom-5 left-6 right-6 text-white">
            <Badge variant={member.status === 'student' ? 'member-type-active' : 'member-type-alumni'} className="mb-2 uppercase !text-[10px] tracking-widest border-white/20 bg-white/10 backdrop-blur-sm">
                {member.status}
            </Badge>
            <h2 className="font-display font-bold text-[30px] leading-tight line-clamp-2">{name}</h2>
            {member.title && <p className="font-sans text-[14px] opacity-80 mt-1">{member.title}</p>}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Email</label>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <Mail size={14} className="text-[var(--text-secondary)]" />
                <span className="font-sans text-[14px] truncate">{member.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Phone</label>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <Phone size={14} className="text-[var(--text-secondary)]" />
                <span className="font-mono text-[14px]">{member.phone_number || '—'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Birthday</label>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <CalendarDays size={14} className="text-[var(--text-secondary)]" />
                <span className="font-sans text-[14px] font-medium">{bdayFormat(member.birth_month, member.birth_day)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Joined</label>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <ClipboardList size={14} className="text-[var(--text-secondary)]" />
                <span className="font-sans text-[14px]">{member.created_at ? new Date(member.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-[18px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">Subgroup</label>
                <div className="flex flex-wrap gap-2">
                    {member.subgroups?.length > 0 ? (
                        member.subgroups.map(sg => <Badge key={sg.id} variant="subgroup">{sg.name}</Badge>)
                    ) : <span className="text-[var(--text-muted)] text-sm">No subgroup assigned</span>}
                </div>
            </div>

            <div className="p-4 rounded-[18px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">Posts Held</label>
                <div className="flex flex-wrap gap-2">
                    {member.posts_held?.length > 0 ? (
                        member.posts_held.map(p => <Badge key={p.id} className="bg-amber-50 text-amber-700 border-amber-100">{p.name}</Badge>)
                    ) : <span className="text-[var(--text-muted)] text-sm">No specific posts</span>}
                </div>
            </div>
          </div>

          {onEdit && (
            <button 
              onClick={() => {
                handleClose();
                onEdit(member);
              }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[18px] bg-[var(--surface-gold)]/10 text-[var(--text-primary)] font-sans font-bold text-[14px] hover:bg-[var(--surface-gold)]/20 transition-all active:scale-[0.98]"
            >
              <Pencil size={16} className="text-[var(--surface-navy)]" />
              Edit Member Profile
            </button>
          )}
        </div>

        <FullscreenImageViewer
          isOpen={isImageViewerOpen}
          imageUrl={fullViewPhotoUrl}
          alt={name}
          onClose={() => setIsImageViewerOpen(false)}
        />
      </div>
    </div>,
    document.body
  );
}
