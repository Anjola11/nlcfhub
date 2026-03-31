import React, { useRef, useState, useEffect } from 'react';
import { Search, ChevronDown, Upload, UserPlus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { gsap } from 'gsap';

export function FilterBar({ searchQuery, onSearchQueryChange, onImportCSV, onAddMember }) {
  const [memberType, setMemberType] = useState('All');
  const typeOptions = ['All', 'Members', 'Alumni'];
  const searchContainerRef = useRef(null);

  const handleFocus = () => {
    if (window.innerWidth >= 1024 && searchContainerRef.current) {
      gsap.to(searchContainerRef.current, { width: 320, duration: 0.3, ease: 'power2.out' });
    }
  };

  const handleBlur = () => {
    if (window.innerWidth >= 1024 && searchContainerRef.current) {
      gsap.to(searchContainerRef.current, { width: 280, duration: 0.3, ease: 'power2.out' });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center mb-6">
      <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
        <div ref={searchContainerRef} className="w-full sm:w-auto lg:w-[280px]">
          <Input 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            leftNode={<Search size={16} className="text-[var(--text-muted)] mt-0.5" />}
            containerClassName="mb-0"
            className="h-[44px]"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div className="flex bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] rounded-full p-1 relative">
          {typeOptions.map((opt) => {
            const isActive = memberType === opt;
            return (
              <button
                key={opt}
                onClick={() => setMemberType(opt)}
                className={cn(
                  "relative font-sans text-[14px] font-medium px-[16px] py-[6px] rounded-full z-10 transition-colors duration-200",
                  isActive ? "bg-[var(--surface-navy)] text-[var(--text-inverse)]" : "text-[var(--text-secondary)] hover:bg-[rgba(26,28,59,0.06)]"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <button className="flex items-center gap-2 font-sans font-medium text-[14px] px-[16px] py-[9px] rounded-full border border-[var(--border-subtle)] bg-[var(--surface-white)] hover:bg-[var(--bg-canvas-dim)] transition-colors">
          All Subgroups <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3 lg:ml-auto w-full sm:w-auto sm:ml-auto md:ml-0 md:mt-0">
        <Button variant="secondary" className="px-[16px] h-[44px] flex-1 sm:flex-none text-[14px] gap-2" onClick={onImportCSV}>
          <Upload size={16} /> Import CSV
        </Button>
        <Button variant="primary" className="px-[16px] h-[44px] flex-1 sm:flex-none text-[14px] gap-2" onClick={onAddMember}>
          <UserPlus size={16} /> Add Member
        </Button>
      </div>
    </div>
  );
}
