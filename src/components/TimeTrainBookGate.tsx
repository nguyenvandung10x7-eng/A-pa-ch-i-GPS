import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useTimeTrainUnlock } from '../hooks/useTimeTrainUnlock';

export const TimeTrainBookGate = ({ children }: { children: ReactElement }) => {
  const unlocked = useTimeTrainUnlock();
  return unlocked ? children : <Navigate to="/" replace />;
};
