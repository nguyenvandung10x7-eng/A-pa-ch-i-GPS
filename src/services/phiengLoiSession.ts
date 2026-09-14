export const PHIENG_LOI_SAVE_KEY = 'book-of-dien-bien:phieng-loi-closed-world:v1';
export const PHIENG_LOI_SOUND_KEY = 'book-of-dien-bien:phieng-loi-muted:v1';

export const hasPhiengLoiSave = () => {
  if (typeof window === 'undefined') return false;
  try {
    const value = window.localStorage.getItem(PHIENG_LOI_SAVE_KEY);
    if (!value) return false;
    const parsed = JSON.parse(value) as { version?: number; complete?: boolean };
    return parsed.version === 1 && !parsed.complete;
  } catch {
    return false;
  }
};

export const readPhiengLoiMuted = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(PHIENG_LOI_SOUND_KEY) === 'true';
  } catch {
    return false;
  }
};

export const persistPhiengLoiMuted = (muted: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PHIENG_LOI_SOUND_KEY, String(muted));
  } catch {
    // Sound remains usable for the current session when storage is unavailable.
  }
};

export const clearPhiengLoiSave = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PHIENG_LOI_SAVE_KEY);
  } catch {
    // A blocked storage backend should never prevent a fresh run.
  }
};
