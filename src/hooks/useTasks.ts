import { useEffect, useMemo, useState } from 'react';
import { defaultTasks, enabledTasks, loadTasks, saveTasks } from '../services/tasks';
import { migrateAllGameplayStorageTaskIds } from '../services/gameplay';
import { applyChallengeCatalogWorkbookImport } from '../services/challengeCatalogWorkbookImport';
import { applyChallengeCharacterCopy } from '../services/challengeCharacterCopy';
import type { ChallengeTask } from '../types/task';

const CATALOG_IMPORT_VERSION_KEY = 'book-of-dien-bien-challenge-catalog-import-version';
const CATALOG_IMPORT_VERSION = '2026-08-25-gender-neutral-copy-v2';
const OVERNIGHT_MOTORBIKE_TASK_ID = 'de-xe-may-ngoai-troi-qua-dem';
const OLD_OVERNIGHT_MOTORBIKE_COVER_IMAGE = '/images/challenges/de-xe-may-ngoai-troi-qua-dem/cover-01.jpg';
const OVERNIGHT_MOTORBIKE_COVER_IMAGE = '/images/tasks/de-xe-may-di-ngoai-troi-qua-dem.webp';

const withCanonicalImageFallbacks = (tasks: ChallengeTask[]): ChallengeTask[] =>
  tasks.map((task) => {
    if (task.id !== OVERNIGHT_MOTORBIKE_TASK_ID) return task;
    const image = task.image?.trim();
    if (image && image !== OLD_OVERNIGHT_MOTORBIKE_COVER_IMAGE) return task;
    return { ...task, image: OVERNIGHT_MOTORBIKE_COVER_IMAGE };
  });

const applyCurrentCatalogMigration = (tasks: ChallengeTask[]): ChallengeTask[] =>
  applyChallengeCharacterCopy(
    withCanonicalImageFallbacks(applyChallengeCatalogWorkbookImport(tasks)),
  );

const loadImportedTasks = (): ChallengeTask[] => {
  const tasks = loadTasks();
  if (localStorage.getItem(CATALOG_IMPORT_VERSION_KEY) === CATALOG_IMPORT_VERSION) return tasks;

  const imported = applyCurrentCatalogMigration(tasks);
  saveTasks(imported);
  localStorage.setItem(CATALOG_IMPORT_VERSION_KEY, CATALOG_IMPORT_VERSION);
  return imported;
};

const isCanonicalDefaultsReset = (tasks: ChallengeTask[]): boolean =>
  JSON.stringify(tasks) === JSON.stringify(defaultTasks);

export const useTasks = () => {
  const [tasks, setTasksState] = useState<ChallengeTask[]>(() => loadImportedTasks());

  useEffect(() => {
    let disposed = false;

    migrateAllGameplayStorageTaskIds()
      .then(() => {
        if (disposed) return;
        setTasksState(loadImportedTasks());
      })
      .catch(() => {
        // Ignore lock/migration errors here and keep best-effort task loading.
      });

    return () => {
      disposed = true;
    };
  }, []);

  const setTasks = (next: ChallengeTask[]) => {
    // Admin "Restore defaults" returns the canonical pre-workbook tasks.json array.
    // Restore the current editorial catalog immediately so the version marker and saved
    // catalog cannot drift apart, while ordinary Admin edits remain untouched.
    const tasksToSave = isCanonicalDefaultsReset(next) ? applyCurrentCatalogMigration(next) : next;
    if (tasksToSave !== next) {
      localStorage.setItem(CATALOG_IMPORT_VERSION_KEY, CATALOG_IMPORT_VERSION);
    }
    setTasksState(tasksToSave);
    saveTasks(tasksToSave);
  };
  const activeTasks = useMemo(() => enabledTasks(tasks), [tasks]);
  return { tasks, setTasks, activeTasks };
};
