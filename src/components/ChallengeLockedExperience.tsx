import { ChevronRight, Lock } from 'lucide-react';
import type { LanguageCode } from '../types/task';

export const ChallengeLockedExperience = ({ language, onReturn }: { language: LanguageCode; onReturn: () => void }) => {
  const copy = language === 'vi' ? {
    level: 'LEVEL 2',
    title: 'Lời mời này vẫn đang khóa.',
    description: 'Chọn một thử thách mở màn ở Level 1 và hoàn thành nó. Phần còn lại sẽ mở hết.',
    action: 'Về Level 1',
  } : {
    level: 'LEVEL 2',
    title: 'This invitation is still locked.',
    description: 'Choose one opening challenge in Level 1 and finish it. Everything else will open.',
    action: 'Go to Level 1',
  };

  return (
    <div className="challenge-locked-experience">
      <span aria-hidden="true"><Lock /></span>
      <small>{copy.level}</small>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      <button type="button" onClick={onReturn}>{copy.action}<ChevronRight aria-hidden="true" /></button>
    </div>
  );
};
