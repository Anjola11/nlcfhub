import { gsap } from 'gsap';

// Page-enter default: fade + translate Y
export const pageEnter = (el) =>
  gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'all' });

// Stagger children on mount
export const staggerReveal = (parent, selector = ':scope > *') => {
  if (!parent) return;
  return gsap.fromTo(parent.querySelectorAll(selector),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', clearProps: 'all' }
  );
};

// Card hover lift — attach to onMouseEnter/onMouseLeave
export const cardLift = (el) => gsap.to(el, { y: -6, duration: 0.25, ease: 'power2.out' });
export const cardDrop = (el) => gsap.to(el, { y: 0, duration: 0.25, ease: 'power2.out' });

// Button gold flash (copy success)
export const flashGold = (el, cb) => {
  gsap.to(el, { backgroundColor: '#EBB736', duration: 0.15, ease: 'power1.out',
    onComplete: () => setTimeout(() => { gsap.to(el, { backgroundColor: '', duration: 0.3 }); if (cb) cb(); }, 1400)
  });
};
