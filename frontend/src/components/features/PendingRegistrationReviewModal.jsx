import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X, Mail, Phone, CalendarDays, ClipboardList, Eye, Download } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { FullscreenImageViewer } from '../ui/FullscreenImageViewer';
import { downloadImage } from '../../lib/utils';

function formatBirthday(month, day) {
  if (!month || !day) return 'Not provided';
  return new Date(2000, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

function formatAppliedDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PendingRegistrationReviewModal({ isOpen, onClose, submission }) {
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
      { scale: 0.95, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !submission) return null;

  const name = submission.fullname || submission.full_name || `${submission.first_name || ''} ${submission.last_name || ''}`.trim() || 'Unknown applicant';
  const subgroups = submission.subgroups?.map((s) => s.name).join(', ') || 'None selected';
  const posts = submission.posts_held?.map((p) => p.name).join(', ') || 'None selected';
  const statusLabel = submission.status === 'student' ? 'Student' : submission.status === 'alumni' ? 'Alumni' : 'Not specified';
  const fullViewPhotoUrl = submission.birthday_picture_url || submission.profile_picture_url;

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(panelRef.current, {
      scale: 0.96,
      opacity: 0,
      y: 14,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: onClose,
    });
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
        className="relative w-full max-w-[560px] max-h-[88vh] overflow-y-auto rounded-[24px] bg-[var(--surface-white)] shadow-2xl z-10"
      >
        <div className="relative h-[210px] bg-[var(--surface-navy)]">
          {submission.profile_picture_url ? (
            <>
              <img
                src={submission.profile_picture_url}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(26,28,59,0.72)]" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar size="xl" name={name} photoUrl={submission.profile_picture_url} />
            </div>
          )}

          <div className="absolute top-4 left-4">
            <Badge variant="days">Pending Approval</Badge>
          </div>

          {fullViewPhotoUrl && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(fullViewPhotoUrl, `${name?.replace(/\s+/g, '_')}_Registration.jpg`);
                }}
                className="absolute top-4 right-28 w-10 h-10 rounded-[12px] bg-white/90 text-[var(--surface-navy)] flex items-center justify-center hover:opacity-95 transition-opacity z-20 shadow-md"
                aria-label="Download image"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setIsImageViewerOpen(true)}
                className="absolute top-4 right-16 w-10 h-10 rounded-[12px] bg-white/90 text-[var(--surface-navy)] flex items-center justify-center hover:opacity-95 transition-opacity z-20 shadow-md"
                aria-label="View full image"
              >
                <Eye size={18} />
              </button>
            </>
          )}

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-[12px] bg-[var(--surface-gold)] text-[var(--surface-navy)] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <h2 className="font-display font-bold text-[28px] leading-tight line-clamp-2">{name}</h2>
            <p className="font-sans text-[14px] opacity-90">Registration submission details</p>
          </div>
        </div>

        <div className="px-[24px] py-[20px] border-b border-[var(--border-subtle)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[var(--text-primary)]">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-[var(--text-secondary)]" />
              <span className="font-sans text-[14px]">{submission.email || 'No email submitted'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-[var(--text-secondary)]" />
              <span className="font-mono text-[14px]">{submission.phone_number || 'No phone submitted'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-[var(--text-secondary)]" />
              <span className="font-sans text-[14px]">Birthday: {formatBirthday(submission.birth_month, submission.birth_day)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList size={15} className="text-[var(--text-secondary)]" />
              <span className="font-sans text-[14px]">Applied: {formatAppliedDate(submission.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="px-[24px] py-[20px] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)] mb-1">Status</p>
            <p className="font-sans text-[15px] font-semibold text-[var(--text-primary)]">{statusLabel}</p>
          </div>

          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)] mb-1">Title</p>
            <p className="font-sans text-[15px] font-semibold text-[var(--text-primary)]">{submission.title || 'Not provided'}</p>
          </div>

          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 sm:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)] mb-1">Subgroups selected</p>
            <p className="font-sans text-[15px] font-semibold text-[var(--text-primary)]">{subgroups}</p>
          </div>

          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 sm:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)] mb-1">Posts selected</p>
            <p className="font-sans text-[15px] font-semibold text-[var(--text-primary)]">{posts}</p>
          </div>
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
