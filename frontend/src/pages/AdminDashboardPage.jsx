import React, { useEffect, useState, useRef } from 'react';
import { Gift, Users, GraduationCap, UserPlus, Upload, Bell, RefreshCw, MessageCircle, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { api } from '../lib/api';
import { staggerReveal, flashGold } from '../lib/gsap';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';
import { BirthdayCard } from '../components/features/BirthdayCard';
import { BirthdayProfileModal } from '../components/features/BirthdayProfileModal';
import { Link } from 'react-router-dom';

function StatCard({ label, value, sub, icon: Icon, dark = false }) {
  const counterRef = useRef(null);
  
  useEffect(() => {
    if (value !== undefined && counterRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, { 
        val: value, 
        duration: 1.2, 
        ease: 'power2.out',
        onUpdate: () => { if (counterRef.current) counterRef.current.textContent = Math.round(obj.val); }
      });
    }
  }, [value]);

  return (
    <div className={`p-[24px] rounded-[22px] relative ${dark ? 'bg-[var(--surface-navy)] text-[var(--text-inverse)]' : 'bg-[var(--surface-white)] border border-[var(--border-subtle)]'}`}>
      <div className="font-mono text-[12px] uppercase mb-2" style={{ color: dark ? 'rgba(253,251,247,0.5)' : 'var(--text-secondary)' }}>
        {label}
      </div>
      <div ref={counterRef} className="font-display font-extrabold text-[36px] leading-tight mb-1">
        0
      </div>
      <div className="font-sans text-[12px]" style={{ color: dark ? 'rgba(253,251,247,0.4)' : 'var(--text-muted)' }}>
        {sub}
      </div>
      <Icon size={24} className="absolute top-[24px] right-[24px]" style={{ color: dark ? 'rgba(235,183,54,0.5)' : 'var(--text-muted)' }} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const bentoRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch real approved members for birthday data
        let approvedMembers = [];
        try {
          approvedMembers = await api.getApprovedMembers();
        } catch (e) {
          // If admin API fails, show empty state
          console.warn('Could not fetch members for dashboard:', e);
        }

        // Fetch real stats from the database-aggregated endpoint
        let s = { total_approved: 0, total_students: 0, total_alumni: 0, total_pending: 0 };
        try {
          s = await api.getStats();
        } catch (e) {
          console.warn('Could not fetch stats:', e);
        }

        const l = await api.getLogs();

        setStats(s);
        
        // Map members to birthday card format
        const today = new Date();
        const mappedM = approvedMembers.map(x => {
          const nextBd = new Date(today.getFullYear(), (x.birth_month || 1) - 1, x.birth_day || 1);
          if (nextBd < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
             nextBd.setFullYear(today.getFullYear() + 1);
          }
          const daysUntil = Math.ceil((nextBd - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
          return { 
            ...x, 
            id: x.uid,
            full_name: x.fullname || `${x.first_name} ${x.last_name}`,
            daysUntil,
            subgroup: x.subgroups?.map(s => s.name).join(', ') || '—',
            member_type: x.status === 'student' ? 'active' : 'alumni',
            photoUrl: x.profile_picture_url,
          };
        }).sort((a, b) => a.daysUntil - b.daysUntil);
        
        setMembers(mappedM);
        setLogs(l);
        setLoading(false);
        
        setTimeout(() => {
          if (bentoRef.current) {
            staggerReveal(bentoRef.current, ':scope > .bento-cell');
          }
        }, 50);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const minDays = members.length > 0 ? members[0].daysUntil : null;
  const nextBirthdays = members.filter(m => m.daysUntil === minDays);
  const primaryBirthday = nextBirthdays[activeSlide] || nextBirthdays[0];

  const quickActions = [
    { icon: UserPlus, label: "Add Member", sub: "Register manually", to: "/console-7x/members" },
    { icon: Upload, label: "Import CSV", sub: "Bulk add alumni", to: "/console-7x/members" },
    { icon: Bell, label: "Notification Settings", sub: "Configure alerts", to: "/console-7x/settings" },
    { icon: RefreshCw, label: "Run Scheduler", sub: "Manual trigger (coming soon)", to: "#", onClick: () => {
      addToast({ message: "Scheduler not yet implemented", type: "success" });
    }}
  ];

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Skeleton className="md:col-span-12 lg:col-span-5 h-[220px]" />
          <Skeleton className="md:col-span-6 lg:col-span-3 h-[220px]" />
          <Skeleton className="md:col-span-6 lg:col-span-4 h-[220px]" />
          <Skeleton className="col-span-12 lg:col-span-8 h-[300px]" />
          <Skeleton className="col-span-12 lg:col-span-4 h-[300px]" />
          <Skeleton className="col-span-12 h-[300px]" />
        </div>
      ) : (
        <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min">
          
          <div 
            className="bento-cell col-span-12 md:col-span-6 lg:col-span-5 bg-[var(--surface-gold)] rounded-[22px] p-[28px] flex flex-col min-h-[220px] relative overflow-hidden touch-pan-y"
            onTouchStart={(e) => {
              e.currentTarget._touchStartX = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const startX = e.currentTarget._touchStartX;
              const endX = e.changedTouches[0].clientX;
              const diff = startX - endX;
              if (Math.abs(diff) > 50 && nextBirthdays.length > 1) {
                if (diff > 0) {
                  setActiveSlide(prev => (prev < nextBirthdays.length - 1 ? prev + 1 : 0));
                } else {
                  setActiveSlide(prev => (prev > 0 ? prev - 1 : nextBirthdays.length - 1));
                }
              }
            }}
          >
            {members.length > 0 && primaryBirthday ? (
              <>
                <div className="flex justify-between items-start relative z-10">
                  <span className="font-mono text-[12px] font-medium text-[rgba(26,28,59,0.6)] tracking-[0.08em] uppercase flex items-center gap-2">
                    NEXT BIRTHDAY{nextBirthdays.length > 1 ? ` (${activeSlide + 1}/${nextBirthdays.length})` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {nextBirthdays.length > 1 && (
                      <div className="hidden md:flex bg-[rgba(26,28,59,0.08)] rounded-full mr-2">
                        <button 
                          onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : nextBirthdays.length - 1))}
                          className="p-1.5 rounded-full hover:bg-[rgba(26,28,59,0.15)] transition-colors text-[var(--text-primary)] active:scale-95"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          onClick={() => setActiveSlide(prev => (prev < nextBirthdays.length - 1 ? prev + 1 : 0))}
                          className="p-1.5 rounded-full hover:bg-[rgba(26,28,59,0.15)] transition-colors text-[var(--text-primary)] active:scale-95"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                    <Badge variant={minDays === 0 ? "subgroup" : "days"} className="!rounded-full border border-black/10">
                      {minDays === 0 ? "TODAY 🎂" : `In ${minDays} days`}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center mt-[20px] relative z-10 slide-content" key={primaryBirthday?.id}>
                  <Avatar size="lg" className="border-[3px] border-[rgba(26,28,59,0.2)] shrink-0" name={primaryBirthday?.full_name} photoUrl={primaryBirthday?.photoUrl} />
                  <div>
                    <h2 className="font-display font-bold text-[28px] text-[var(--text-primary)] leading-tight mb-2">
                      {primaryBirthday?.full_name}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <span className="bg-[rgba(26,28,59,0.12)] text-[var(--text-primary)] font-sans text-[12px] font-medium px-[10px] py-[3px] rounded-full">
                        {primaryBirthday?.subgroup}
                      </span>
                      <span className="font-sans text-[12px] text-[rgba(26,28,59,0.55)]">
                        {primaryBirthday?.member_type === 'active' ? 'Active Member' : 'Alumni'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-5 flex gap-2 flex-wrap relative z-10">
                  <button 
                    className="bg-[var(--surface-navy)] text-[var(--text-inverse)] font-sans text-[12px] font-semibold px-[18px] py-[9px] rounded-full hover:bg-opacity-90 transition-colors"
                    onClick={() => setSelectedMember(primaryBirthday)}
                  >
                    Open profile
                  </button>
                  <button 
                    className="bg-[rgba(26,28,59,0.1)] border border-[rgba(26,28,59,0.2)] text-[var(--text-primary)] font-sans text-[12px] font-semibold px-[18px] py-[9px] rounded-full hover:bg-[rgba(26,28,59,0.15)] transition-colors"
                    onClick={(e) => {
                      navigator.clipboard.writeText(`Happy Birthday ${primaryBirthday?.full_name}! | ${primaryBirthday?.subgroup}`);
                      flashGold(e.currentTarget);
                      addToast({ message: "Caption copied", type: "success" });
                    }}
                  >
                    Copy caption
                  </button>
                </div>
                
                {nextBirthdays.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {nextBirthdays.map((_, idx) => (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'bg-[var(--surface-navy)] w-3' : 'bg-[rgba(26,28,59,0.2)]'}`} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Gift size={40} className="text-[rgba(26,28,59,0.3)] mb-3" />
                <p className="font-sans text-[14px] text-[rgba(26,28,59,0.6)]">No members registered yet</p>
              </div>
            )}
          </div>

          <div className="bento-cell col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
            <StatCard dark label="TOTAL MEMBERS" value={stats?.total_approved} sub="Approved members" icon={Users} />
          </div>
          <div className="bento-cell col-span-12 sm:col-span-6 md:col-span-12 lg:col-span-4">
            <StatCard label="ALUMNI" value={stats?.total_alumni} sub="Past members" icon={GraduationCap} />
          </div>

          <div className="bento-cell col-span-12 md:col-span-12 lg:col-span-8 bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] p-[24px] overflow-hidden">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)]">Upcoming Birthdays</h2>
              <span className="font-sans text-[12px] font-medium bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] px-[12px] py-[4px] rounded-full text-[var(--text-secondary)]">Next 7 days</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 -mb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
              {members.length > 0 ? members.filter(m => m.daysUntil <= 7).map(m => (
                <div key={m.id} style={{ scrollSnapAlign: 'start' }}>
                  <BirthdayCard member={m} onClick={() => setSelectedMember(m)} />
                </div>
              )) : (
                <div className="w-full py-10 flex flex-col items-center justify-center">
                  <Gift size={40} className="text-[var(--border-subtle)] mb-2" />
                  <p className="font-sans text-[14px] text-[var(--text-muted)]">No upcoming birthdays</p>
                </div>
              )}
            </div>
          </div>

          <div className="bento-cell col-span-12 md:col-span-12 lg:col-span-4 bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] p-[24px]">
            <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)] mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {quickActions.map((action, i) => (
                <Link 
                  key={i} 
                  to={action.to}
                  className="flex items-center gap-3 p-[12px] px-[14px] rounded-[14px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] cursor-pointer group hover:border-[var(--border-focus)] transition-colors"
                  onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 4, duration: 0.2, ease: 'power2.out' })}
                  onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.2, ease: 'power2.out' })}
                  onClick={(e) => {
                    if(action.onClick) {
                      e.preventDefault();
                      action.onClick();
                    }
                  }}
                >
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-[var(--surface-gold)] flex items-center justify-center shrink-0">
                    <action.icon size={18} className="text-[var(--surface-navy)]" />
                  </div>
                  <div>
                    <div className="font-sans text-[14px] font-semibold text-[var(--text-primary)]">{action.label}</div>
                    <div className="font-sans text-[12px] text-[var(--text-secondary)]">{action.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bento-cell col-span-12 bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] p-[24px] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)]">Recent Scheduler Activity</h2>
              <Link to="/console-7x/log" className="font-sans text-[12px] font-semibold text-[var(--surface-navy)] hover:underline">View full log →</Link>
            </div>
            
            <div className="w-full overflow-x-auto scrollbar-hide">
              {logs.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center">
                  <MessageCircle size={40} className="text-[var(--border-subtle)] mb-2" />
                  <p className="font-sans text-[14px] text-[var(--text-muted)]">No scheduler activity yet</p>
                  <p className="font-sans text-[12px] text-[var(--text-muted)] mt-1">Notification logs will appear here once the scheduler is configured.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[var(--bg-canvas)] border-y border-[var(--border-subtle)]">
                      <th className="px-[16px] py-[10px] font-sans text-[12px] uppercase text-[var(--text-secondary)] font-semibold tracking-[0.05em]">Time</th>
                      <th className="px-[16px] py-[10px] font-sans text-[12px] uppercase text-[var(--text-secondary)] font-semibold tracking-[0.05em]">Member</th>
                      <th className="px-[16px] py-[10px] font-sans text-[12px] uppercase text-[var(--text-secondary)] font-semibold tracking-[0.05em]">Trigger</th>
                      <th className="px-[16px] py-[10px] font-sans text-[12px] uppercase text-[var(--text-secondary)] font-semibold tracking-[0.05em]">Channel</th>
                      <th className="px-[16px] py-[10px] font-sans text-[12px] uppercase text-[var(--text-secondary)] font-semibold tracking-[0.05em]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <React.Fragment key={log.id}>
                        <tr className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)] transition-colors">
                          <td className="px-[16px] py-[12px] font-mono text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-[16px] py-[12px] font-sans text-[14px] font-semibold text-[var(--text-primary)] whitespace-nowrap">
                            {log.memberName}
                          </td>
                          <td className="px-[16px] py-[12px] whitespace-nowrap">
                            <span className={`font-sans text-[12px] font-medium px-2.5 py-1 rounded-full ${
                              log.trigger === '1-day' ? 'bg-[rgba(26,28,59,0.15)] text-[var(--surface-navy)]' : 
                              log.trigger === '7-day' ? 'bg-[#EBB73626] text-[#92610A] border border-[var(--surface-gold)]' : 
                              'bg-[var(--surface-navy)] text-[var(--text-inverse)]'
                            }`}>{log.trigger}</span>
                          </td>
                          <td className="px-[16px] py-[12px] whitespace-nowrap">
                            <div className="flex items-center gap-2 font-sans text-[14px]">
                              {log.channel === 'whatsapp' ? <MessageCircle size={16} className="text-[#25D366]" /> : <Mail size={16} className="text-[var(--surface-navy)]" />}
                              <span className="capitalize">{log.channel}</span>
                            </div>
                          </td>
                          <td className="px-[16px] py-[12px] whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-sans text-[14px] font-medium">
                              <span className={`w-2 h-2 rounded-full ${log.status === 'sent' ? 'bg-[var(--status-success)]' : 'bg-[var(--status-error)]'}`} />
                              <span className={log.status === 'sent' ? 'text-[var(--text-primary)]' : 'text-[var(--status-error)]'}>
                                {log.status === 'sent' ? 'Sent' : 'Failed'}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {log.error && (
                          <tr>
                            <td colSpan={5} className="bg-[#FEF2F2] px-[16px] py-[8px] pl-[56px] font-mono text-[12px] text-[var(--status-error)]">
                              {log.error}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
        </div>
      )}

      {selectedMember && (
        <BirthdayProfileModal 
          isOpen={true} 
          onClose={() => setSelectedMember(null)} 
          member={selectedMember} 
        />
      )}
    </>
  );
}
