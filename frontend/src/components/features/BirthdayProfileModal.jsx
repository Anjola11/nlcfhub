import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X, Users, Calendar, Phone, Download, User, Copy, Link, Pencil } from 'lucide-react';
import { flashGold } from '../../lib/gsap';
import { Badge } from '../ui/Badge';
import { useToast } from '../../hooks/useToast';

export function BirthdayProfileModal({ isOpen, onClose, member }) {
  const backdropRef = useRef(null);
  const modalPanelRef = useRef(null);
  const photoEl = useRef(null);
  const isClosing = useRef(false);
  const { addToast } = useToast();
  
  const [downloading, setDownloading] = useState(false);
  const scopeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      isClosing.current = false;
      document.body.style.overflow = 'hidden';
      
      const ctx = gsap.context(() => {
        // Fade in backdrop
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        
        // Final position/scale for panel
        gsap.fromTo(modalPanelRef.current, 
          { scale: 0.92, opacity: 0, y: 24 }, 
          { scale: 1, opacity: 1, y: 0, duration: 0.38, ease: 'back.out(1.4)' }
        );
        
        // Animate photo
        if (photoEl.current) {
          gsap.fromTo(photoEl.current, 
            { opacity: 0, scale: 1.04 }, 
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
          );
        }

        // Animate content items
        gsap.fromTo('.info-row-item', 
          { opacity: 0, y: 8 }, 
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.3, delay: 0.2 }
        );
        
        gsap.fromTo('.btn-grid-item', 
          { opacity: 0, y: 12 }, 
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.3, delay: 0.35 }
        );
      }, scopeRef);

      return () => ctx.revert();
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(modalPanelRef.current, { scale: 0.94, opacity: 0, y: 16, duration: 0.25, ease: 'power2.in', onComplete: onClose });
  };

  const copyToClipboard = (text, e, successMessage) => {
    navigator.clipboard.writeText(text);
    flashGold(e.currentTarget);
    addToast({ message: successMessage, type: 'success' });
  };

  if (!isOpen || !member) return null;

  const bdayFormat = new Date(member.birthday).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const initials = member.full_name ? member.full_name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '?';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" ref={scopeRef}>
      <div ref={backdropRef} className="absolute inset-0 bg-[var(--surface-overlay)]" onClick={handleClose} />
      
      <div ref={modalPanelRef} className="relative w-full max-w-[480px] bg-[var(--surface-white)] rounded-[24px] overflow-hidden shadow-2xl z-10">
        
        <div className="relative h-[280px] bg-[var(--surface-navy)] overflow-hidden rounded-t-[24px] flex items-center justify-center">
          {member.photoUrl ? (
            <>
              <img ref={photoEl} src={member.photoUrl} alt={member.full_name} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(26,28,59,0.7) 100%)' }} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              <span className="font-display font-bold text-[80px] text-[var(--surface-gold)] opacity-40 z-10">{initials}</span>
              <Users size={48} className="absolute text-white/15" />
            </div>
          )}

          <div className="absolute top-4 left-4">
            <Badge variant={member.daysUntil === 0 ? "subgroup" : "days"} className="!rounded-full shadow-md">
              {member.daysUntil === 0 ? "TODAY 🎂" : `In ${member.daysUntil} days`}
            </Badge>
          </div>

          <button onClick={handleClose} className="absolute top-4 right-4 w-10 h-10 rounded-[12px] bg-[var(--surface-gold)] text-[var(--surface-navy)] flex items-center justify-center hover:opacity-90 transition-opacity z-20 shadow-md">
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-5 right-5 z-20">
            <h2 className="font-display font-extrabold text-[26px] text-white line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {member.full_name}
            </h2>
          </div>
        </div>

        <div className="px-[24px] pt-[20px]">
          <div className="flex items-center flex-wrap gap-3">
            <Badge variant="subgroup" className="info-row-item">{member.subgroup}</Badge>
            {member.posts && (
              <Badge variant="subgroup" className="info-row-item bg-amber-100 !text-amber-900 border border-amber-200">
                {member.posts}
              </Badge>
            )}
            <Badge variant={member.member_type === 'active' ? "member-type-active" : "member-type-alumni"} className="info-row-item text-capitalize">
              {member.member_type}
            </Badge>
            <div className="info-row-item flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Calendar size={14} />
              <span className="font-sans text-[14px] font-medium text-[var(--text-primary)]">{bdayFormat}</span>
            </div>
            <div className="info-row-item flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Phone size={14} />
              <span className="font-mono text-[14px]">{member.phone}</span>
            </div>
          </div>
        </div>

        <div className="p-[24px] pt-[16px]">
          <div className="grid grid-cols-2 gap-[10px] mb-4">
            <button 
              className="btn-grid-item h-[48px] rounded-full font-sans font-semibold text-[14px] flex items-center justify-center gap-2 bg-[var(--surface-navy)] text-white disabled:opacity-40 transition-colors"
              disabled={!member.photoUrl || downloading}
              onClick={() => setDownloading(true)}
            >
              {downloading ? <span className="animate-spin w-4 h-4 rounded-full border-2 border-white/30 border-t-white" /> : <Download size={18} />}
              {member.photoUrl ? "Download Photo" : "No photo"}
            </button>
            <button 
              className="btn-grid-item h-[48px] rounded-full font-sans font-semibold text-[14px] flex items-center justify-center gap-2 bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-focus)] transition-colors"
              onClick={(e) => copyToClipboard(member.full_name, e, "Name copied")}
            >
              <User size={18} /> Copy Name
            </button>
            <button 
              className="btn-grid-item h-[48px] rounded-full font-sans font-semibold text-[14px] flex items-center justify-center gap-2 bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-focus)] transition-colors col-span-2"
              onClick={(e) => copyToClipboard(`Happy Birthday ${member.full_name}! | ${member.subgroup} | ${member.member_type === 'active' ? 'Member' : 'Alumni'}`, e, "Caption copied")}
            >
              <Copy size={18} /> Copy Caption
            </button>
          </div>
          <button className="w-full flex justify-center items-center gap-2 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-sans font-semibold text-[14px] transition-colors">
            <Pencil size={14} /> Edit Member →
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
