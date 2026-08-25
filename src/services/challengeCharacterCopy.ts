import characterCopyJson from '../data/challengeCharacterCopy.json';
import type { ChallengeTask } from '../types/task';

type CharacterCopyPatch = Pick<ChallengeTask, 'title' | 'description'>;
type CharacterCopyCatalog = Record<string, CharacterCopyPatch>;

const characterCopyCatalog = characterCopyJson as CharacterCopyCatalog;

export const applyChallengeCharacterCopy = (tasks: ChallengeTask[]): ChallengeTask[] =>
  tasks.map((task) => {
    const patch = characterCopyCatalog[task.id];
    if (!patch) return task;

    return {
      ...task,
      title: { ...patch.title },
      description: { ...patch.description },
    };
  });
