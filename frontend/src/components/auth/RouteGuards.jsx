import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

function GuardLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
      <div className="font-sans text-[14px] text-[var(--text-secondary)]">Checking session...</div>
    </div>
  );
}

export function AdminRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        await api.checkAdminSession();
        if (mounted) setReady(true);
      } catch {
        if (mounted) navigate('/console-7x/login', { replace: true, state: { from: location.pathname } });
      }
    };

    check();

    return () => {
      mounted = false;
    };
    // Disabled location.pathname to avoid re-validating on every internal navigation.
    // The session check is only required on entrance to the admin shell.
  }, [navigate]);

  if (!ready) return <GuardLoader />;
  return children;
}

export function MemberRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        await api.checkMemberSession();
        if (mounted) setReady(true);
      } catch (err) {
        const message = (err?.message || '').toLowerCase();
        if (!mounted) return;
        if (message.includes('pending approval')) {
          navigate('/pending', { replace: true, state: { from: location.pathname } });
        } else {
          navigate('/login', { replace: true, state: { from: location.pathname } });
        }
      }
    };

    check();

    return () => {
      mounted = false;
    };
    // Disabled location.pathname to avoid re-validating on every internal navigation.
  }, [navigate]);

  if (!ready) return <GuardLoader />;
  return children;
}
