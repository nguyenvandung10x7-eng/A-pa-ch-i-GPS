import characterCopyJson from '../data/challengeCharacterCopy.json';
import type { ChallengeTask } from '../types/task';

type CharacterCopyPatch = Partial<Pick<ChallengeTask, 'title' | 'description' | 'experienceNote'>>;
type CharacterCopyCatalog = Record<string, CharacterCopyPatch>;

const characterCopyCatalog = characterCopyJson as CharacterCopyCatalog;

export const applyChallengeCharacterCopy = (tasks: ChallengeTask[]): ChallengeTask[] =>
  tasks.map((task) => {
    const patch = characterCopyCatalog[task.id];
    if (!patch) return task;

    return {
      ...task,
      ...(patch.title ? { title: { ...patch.title } } : {}),
      ...(patch.description ? { description: { ...patch.description } } : {}),
      ...(patch.experienceNote ? { experienceNote: { ...patch.experienceNote } } : {}),
    };
  });
