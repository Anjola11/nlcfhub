import React, { useRef } from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { cardLift, cardDrop } from '../../lib/gsap';

export function BirthdayCard({ member, onClick }) {
  const cardRef = useRef(null);
  
  const days = member.daysUntil;
  const daysText = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
  
  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => cardLift(cardRef.current)}
      onMouseLeave={() => cardDrop(cardRef.current)}
      onClick={onClick}
      className="w-[160px] shrink-0 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[16px] p-[16px] cursor-pointer"
    >
      <Avatar size="lg" name={member.full_name} photoUrl={member.photoUrl} className="mx-auto mb-3" />
      <h3 className="font-sans text-[12px] font-semibold text-[var(--text-primary)] text-center line-clamp-2 leading-tight mb-1">
        {member.full_name}
      </h3>
      <p className="font-sans text-[12px] text-[var(--text-secondary)] text-center mb-1.5">
        {member.subgroup}
      </p>
      <div className="flex justify-center flex-wrap gap-1">
        <Badge variant={days <= 1 ? "days" : "days-light"}>{daysText}</Badge>
      </div>
    </div>
  );
}
