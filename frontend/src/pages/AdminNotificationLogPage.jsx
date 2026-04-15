import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { ChevronDown, MessageCircle, Mail, ScrollText } from 'lucide-react';
import { gsap } from 'gsap';
import { useQuery } from '@tanstack/react-query';

export default function AdminNotificationLogPage() {
  const [status, setStatus] = useState('All');
  const [channel, setChannel] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: logs = [], isLoading: loading } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: api.getLogs,
  });

  const toggleRow = (id) => {
    const el = document.getElementById(`err-${id}`);
    if (el) {
      if (el.style.height === '0px' || !el.style.height) {
        gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.25, ease: 'power2.out' });
      } else {
        gsap.to(el, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' });
      }
    }
  };

  const statusOptions = ['All', 'Sent', 'Failed'];
  const channelOptions = ['All', 'WhatsApp', 'Email'];

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <label className="flex flex-col">
          <span className="font-sans text-[12px] font-semibold text-[var(--text-secondary)] mb-1">Status</span>
          <div className="flex bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] rounded-full p-1 relative">
            {statusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setStatus(opt)}
                className={cn(
                  "relative font-sans text-[14px] font-medium px-[16px] py-[6px] rounded-full z-10 transition-colors duration-200",
                  status === opt ? "bg-[var(--surface-navy)] text-[var(--text-inverse)]" : "text-[var(--text-secondary)] hover:bg-[rgba(26,28,59,0.06)]"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </label>

        <label className="flex flex-col">
          <span className="font-sans text-[12px] font-semibold text-[var(--text-secondary)] mb-1">Channel</span>
          <div className="flex bg-[var(--bg-canvas-dim)] border border-[var(--border-subtle)] rounded-full p-1 relative">
            {channelOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setChannel(opt)}
                className={cn(
                  "relative font-sans text-[14px] font-medium px-[16px] py-[6px] rounded-full z-10 transition-colors duration-200",
                  channel === opt ? "bg-[var(--surface-navy)] text-[var(--text-inverse)]" : "text-[var(--text-secondary)] hover:bg-[rgba(26,28,59,0.06)]"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </label>

        <div className="flex flex-wrap items-end gap-2 sm:ml-auto w-full sm:w-auto">
          <label className="flex flex-col flex-1 sm:w-auto">
            <span className="font-sans text-[12px] font-semibold text-[var(--text-secondary)] mb-1">From</span>
            <input type="date" className="h-[44px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[12px] px-3 font-mono text-[14px]" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </label>
          <label className="flex flex-col flex-1 sm:w-auto">
            <span className="font-sans text-[12px] font-semibold text-[var(--text-secondary)] mb-1">To</span>
            <input type="date" className="h-[44px] bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[12px] px-3 font-mono text-[14px]" value={toDate} onChange={e => setToDate(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)]">
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Timestamp</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Member</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Trigger</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Channel</th>
                <th className="px-[20px] py-[12px] font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-secondary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="py-16">
                    <div className="flex flex-col items-center justify-center text-[var(--text-muted)]">
                      <ScrollText size={64} className="mb-4 text-[var(--border-subtle)]" />
                      <h3 className="font-display font-medium text-[20px] text-[var(--text-secondary)] mb-1">No notifications sent</h3>
                      <p className="font-sans text-[14px]">Run the scheduler or configure settings to start sending alerts.</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map(log => (
                <React.Fragment key={log.id}>
                  <tr 
                    className={`h-[64px] ${!log.error ? 'border-b border-[var(--border-subtle)]' : ''} hover:bg-[var(--bg-canvas)] transition-colors ${log.status === 'failed' ? 'cursor-pointer' : ''}`}
                    onClick={() => log.status === 'failed' && toggleRow(log.id)}
                  >
                    <td className="px-[20px] font-mono text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} WAT
                    </td>
                    <td className="px-[20px] font-sans font-semibold text-[14px] text-[var(--text-primary)] whitespace-nowrap">
                      {log.memberName}
                    </td>
                    <td className="px-[20px] whitespace-nowrap">
                      <span className={`font-sans text-[12px] font-medium px-2.5 py-1 rounded-full ${
                              log.trigger === '1-day' ? 'bg-[rgba(26,28,59,0.15)] text-[var(--surface-navy)]' : 
                              log.trigger === '7-day' ? 'bg-[#EBB73626] text-[#92610A] border border-[var(--surface-gold)]' : 
                              'bg-[var(--surface-navy)] text-[var(--text-inverse)]'
                            }`}>{log.trigger}</span>
                    </td>
                    <td className="px-[20px] whitespace-nowrap">
                      <div className="flex items-center gap-2 font-sans text-[14px]">
                        {log.channel === 'whatsapp' ? <MessageCircle size={16} className="text-[#25D366]" /> : <Mail size={16} className="text-[var(--surface-navy)]" />}
                        <span className="capitalize">{log.channel}</span>
                      </div>
                    </td>
                    <td className="px-[20px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-sans text-[14px] font-medium">
                        <span className={`w-2 h-2 rounded-full ${log.status === 'sent' ? 'bg-[var(--status-success)]' : 'bg-[var(--status-error)]'}`} />
                        <span className={log.status === 'sent' ? 'text-[var(--text-primary)]' : 'text-[var(--status-error)]'}>
                          {log.status === 'sent' ? 'Sent' : 'Failed'}
                        </span>
                        {log.status === 'failed' && <ChevronDown size={14} className="text-[var(--text-secondary)] ml-1 pointer-events-none" />}
                      </div>
                    </td>
                  </tr>
                  {log.error && (
                    <tr className="bg-[#FEF2F2]">
                      <td colSpan={5} className="p-0 border-b border-[var(--border-subtle)]">
                        <div id={`err-${log.id}`} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
                          <div className="px-[20px] py-[10px] sm:pl-[76px] font-mono text-[12px] text-[var(--status-error)] text-wrap">
                            {log.error}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
