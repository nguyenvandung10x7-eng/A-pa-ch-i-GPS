import type { ChallengeTask } from '../types/task';

const OVERNIGHT_MOTORBIKE_TASK_ID = 'de-xe-may-ngoai-troi-qua-dem';

/** Editorial bridge for Chapter 13: “Sự nổi loạn và thành phố ban đêm”.
 * The Literary workbook marks this task as BOTH (Book + Challenge) and fixes its GPS.
 * GPS arrival is intentionally the only completion signal: the app invites the overnight
 * experience but does not try to prove that the user actually left a motorbike overnight.
 */
export const applyChapter13ChallengeImport = (tasks: ChallengeTask[]): ChallengeTask[] =>
  tasks.map((task) => task.id === OVERNIGHT_MOTORBIKE_TASK_ID
    ? {
        ...task,
        gps: { lat: 21.394221, lng: 103.020336, radius: 100 },
        enabled: true,
        experienceNote: {
          vi: 'Challenge BOTH của Chương 13 “Sự nổi loạn và thành phố ban đêm”. Chỉ cần đến trong bán kính 100 m để hoàn thành; việc để xe qua đêm là lời mời trải nghiệm, không phải điều app cố xác minh.',
          en: 'A BOTH challenge for Chapter 13, “Rebellion and the City at Night”. Reaching the 100 m radius completes it; leaving the motorbike overnight is an invitation to experience, not something the app tries to verify.',
        },
      }
    : task);
