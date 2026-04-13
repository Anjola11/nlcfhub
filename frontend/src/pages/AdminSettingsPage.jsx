import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mail } from 'lucide-react';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { gsap } from 'gsap';
import { useToast } from '../hooks/useToast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    alert7Day: true,
    alert3Day: false,
    alert1Day: true,
    alert0Day: true,
    whatsapp: true,
    email: false,
    whatsappNumbers: '+2348012345678, +2348087654321',
    emailAddresses: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  
  const pageRef = useRef(null);
  const whatsappRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pageRef.current) {
        const sections = pageRef.current.querySelectorAll('.settings-section');
        gsap.fromTo(sections, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: 'power2.out', clearProps: 'all' });
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let ctx;
    if (settings.whatsapp && whatsappRef.current) {
      ctx = gsap.context(() => {
        gsap.fromTo(whatsappRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });
      });
    }
    return () => ctx?.revert();
  }, [settings.whatsapp]);

  useEffect(() => {
    let ctx;
    if (settings.email && emailRef.current) {
      ctx = gsap.context(() => {
        gsap.fromTo(emailRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });
      });
    }
    return () => ctx?.revert();
  }, [settings.email]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({ message: "Settings saved successfully", type: "success" });
    }, 800);
  };

  return (
    <div className="w-full max-w-[680px] mx-auto" ref={pageRef}>
      
      <div className="settings-section bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] p-[24px] sm:p-[28px] mb-[16px]">
        <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)] mb-1">Alert Timing</h2>
        <p className="font-sans text-[14px] text-[var(--text-secondary)] mb-[24px]">Choose when to notify the media team before a birthday.</p>

        <div className="flex flex-col">
          {[
            { id: 'alert7Day', label: '7 days before', sub: 'Notification sent one week in advance' },
            { id: 'alert3Day', label: '3 days before', sub: 'Notification sent three days in advance' },
            { id: 'alert1Day', label: '1 day before', sub: 'Notification sent the day before' },
            { id: 'alert0Day', label: 'On the day', sub: 'Notification sent on the birthday' }
          ].map((item, idx, arr) => (
            <div key={item.id} className={`flex items-center justify-between py-[14px] ${idx !== arr.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''}`}>
              <div>
                <div className="font-sans font-semibold text-[14px] text-[var(--text-primary)]">{item.label}</div>
                <div className="font-sans text-[12px] text-[var(--text-secondary)]">{item.sub}</div>
              </div>
              <Toggle isOn={settings[item.id]} onToggle={(v) => setSettings({...settings, [item.id]: v})} />
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[22px] p-[24px] sm:p-[28px] mb-[16px]">
        <h2 className="font-display font-bold text-[20px] text-[var(--text-primary)] mb-1">Delivery Channels</h2>
        <p className="font-sans text-[14px] text-[var(--text-secondary)] mb-[24px]">Configure how and where notifications are delivered.</p>

        <div className="flex flex-col">
          <div className="py-[14px] border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-[#25D366]" />
                <span className="font-sans font-semibold text-[14px] text-[var(--text-primary)]">WhatsApp</span>
              </div>
              <Toggle isOn={settings.whatsapp} onToggle={(v) => setSettings({...settings, whatsapp: v})} />
            </div>
            
            {settings.whatsapp && (
              <div ref={whatsappRef} className="overflow-hidden mt-4">
                <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)] block mb-1.5">
                  RECIPIENT NUMBERS
                </label>
                <textarea 
                  className="w-full bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-input)] font-mono text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] h-[96px] p-[16px] resize-none focus:outline-none focus:border-[2px] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(235,183,54,0.2)] transition-all"
                  placeholder="+2348012345678, +2348087654321"
                  value={settings.whatsappNumbers}
                  onChange={(e) => setSettings({...settings, whatsappNumbers: e.target.value})}
                />
                <p className="font-sans text-[12px] text-[var(--text-muted)] mt-1.5">
                  Comma-separated E.164 format numbers. Maximum 5 numbers for the free tier.
                </p>
              </div>
            )}
          </div>

          <div className="py-[14px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-[var(--surface-navy)]" />
                <span className="font-sans font-semibold text-[14px] text-[var(--text-primary)]">Email</span>
              </div>
              <Toggle isOn={settings.email} onToggle={(v) => setSettings({...settings, email: v})} />
            </div>
            
            {settings.email && (
              <div ref={emailRef} className="overflow-hidden mt-4">
                <label className="font-sans text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--text-primary)] block mb-1.5">
                  RECIPIENT EMAILS
                </label>
                <textarea 
                  className="w-full bg-[var(--surface-white)] border border-[var(--border-subtle)] rounded-[var(--radius-input)] font-mono text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] h-[96px] p-[16px] resize-none focus:outline-none focus:border-[2px] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(235,183,54,0.2)] transition-all"
                  placeholder="media@nlcf.org, pastor@nlcf.org"
                  value={settings.emailAddresses}
                  onChange={(e) => setSettings({...settings, emailAddresses: e.target.value})}
                />
                <p className="font-sans text-[12px] text-[var(--text-muted)] mt-1.5">
                  Comma-separated email addresses. 300 emails/day on free tier.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="settings-section flex justify-end mt-[32px]">
        <Button className="w-[180px] h-[48px]" loading={loading} onClick={handleSave}>
          Save Settings
        </Button>
      </div>

    </div>
  );
}
