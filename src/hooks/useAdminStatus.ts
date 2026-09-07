import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkCurrentUserIsAdmin } from '../services/moderation';

export const useAdminStatus = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const [adminCheckFailed, setAdminCheckFailed] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestIdRef = useRef(0);
  const activeUserId = user?.id ?? null;
  const checkingAdmin = loading || (activeUserId !== null && checkedUserId !== activeUserId);
  const resolvedIsAdmin = activeUserId !== null && checkedUserId === activeUserId ? isAdmin : false;
  const resolvedAdminCheckFailed = activeUserId !== null
    && checkedUserId === activeUserId
    && adminCheckFailed;

  const retryAdminCheck = useCallback(() => {
    setCheckedUserId(null);
    setAdminCheckFailed(false);
    setRetryVersion((current) => current + 1);
  }, []);

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
        setAdminCheckFailed(false);
      } catch {
        if (requestIdRef.current !== requestId) return;
        setIsAdmin(false);
        setCheckedUserId(activeUserId);
        setAdminCheckFailed(true);
      }
    };

    void runCheck();

    return () => {
      if (requestIdRef.current === requestId) {
        requestIdRef.current += 1;
      }
    };
  }, [activeUserId, loading, retryVersion]);

  return {
    isAdmin: resolvedIsAdmin,
    checkingAdmin,
    adminCheckFailed: resolvedAdminCheckFailed,
    retryAdminCheck,
  };
};
