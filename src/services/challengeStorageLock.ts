const CHALLENGE_STORAGE_LOCK = 'gps-challenge-storage-lock';

type LockRequest = <T>(
  name: string,
  options: { mode: 'exclusive' },
  callback: () => Promise<T> | T,
) => Promise<T>;

class ChallengeStorageLockUnavailableError extends Error {
  constructor() {
    super('Web Locks API is not available in this browser.');
    this.name = 'ChallengeStorageLockUnavailableError';
  }
}

const getLockRequest = (): LockRequest => {
  const request = (navigator as Navigator & { locks?: { request?: LockRequest } }).locks?.request;
  if (!request) {
    throw new ChallengeStorageLockUnavailableError();
  }
  return request.bind(navigator.locks);
};

export const withChallengeStorageLock = async <T>(callback: () => Promise<T> | T): Promise<T> => {
  const request = getLockRequest();
  return request(CHALLENGE_STORAGE_LOCK, { mode: 'exclusive' }, async () => callback());
};

export { ChallengeStorageLockUnavailableError };
