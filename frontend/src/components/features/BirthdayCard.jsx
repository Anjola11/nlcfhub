import React, { useRef } from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { cardLift, cardDrop } from '../../lib/gsap';

export function BirthdayCard({ member, onClick }) {
  const cardRef = useRef(null);
  
  const days = member.daysUntil;
  const daysText = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
  const typeLabel = member.member_type === 'active' ? 'Student' : 'Alumni';
  const typeVariant = member.member_type === 'active' ? 'member-type-active' : 'member-type-alumni';
  
  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => cardLift(cardRef.current)}
      onMouseLeave={() => cardDrop(cardRef.current)}
      onClick={onClick}
      className="w-[160px] h-[292px] shrink-0 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-[16px] p-[16px] cursor-pointer flex flex-col"
    >
      <Avatar size="lg" name={member.full_name} photoUrl={member.photoUrl} className="mx-auto mb-3" />
      <h3 className="font-sans text-[12px] font-semibold text-[var(--text-primary)] text-center line-clamp-2 leading-tight mb-1 min-h-[32px]">
        {member.full_name}
      </h3>
      <p className="font-sans text-[12px] text-[var(--text-secondary)] text-center mb-2 line-clamp-2 min-h-[36px]">
        {member.subgroup}
      </p>
      <div className="flex justify-center flex-wrap gap-1 mt-auto">
        <Badge variant={typeVariant}>{typeLabel}</Badge>
        <Badge variant={days <= 1 ? "days" : "days-light"}>{daysText}</Badge>
      </div>
    </div>
  );
}
