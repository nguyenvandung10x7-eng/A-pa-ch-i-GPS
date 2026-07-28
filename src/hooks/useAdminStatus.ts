import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkCurrentUserIsAdmin } from '../services/moderation';

export const useAdminStatus = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const activeUserId = user?.id ?? null;
  const checkingAdmin = loading || (activeUserId !== null && checkedUserId !== activeUserId);
  const resolvedIsAdmin = activeUserId !== null && checkedUserId === activeUserId ? isAdmin : false;

  useEffect(() => {
    if (loading || !activeUserId) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const runCheck = async () => {
      try {
        const allowed = await checkCurrentUserIsAdmin();
        if (requestIdRef.current !== requestId) return;
        setIsAdmin(allowed);
        setCheckedUserId(activeUserId);
      } catch {
        if (requestIdRef.current !== requestId) return;
        setIsAdmin(false);
        setCheckedUserId(activeUserId);
      }
    };

    void runCheck();
  }, [activeUserId, loading]);

  return { isAdmin: resolvedIsAdmin, checkingAdmin };
};
