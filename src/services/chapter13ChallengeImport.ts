import type { ChallengeTask } from '../types/task';

const OVERNIGHT_MOTORBIKE_TASK_ID = 'de-xe-may-ngoai-troi-qua-dem';

/** Editorial bridge for Chapter 13: “Sự nổi loạn và thành phố ban đêm”.
 * The Literary workbook marks this task as BOTH (Book + Challenge) and fixes its GPS.
 * Runtime completion remains disabled until the overnight two-step verification exists.
 */
export const applyChapter13ChallengeImport = (tasks: ChallengeTask[]): ChallengeTask[] =>
  tasks.map((task) => task.id === OVERNIGHT_MOTORBIKE_TASK_ID
    ? {
        ...task,
        gps: { lat: 21.394221, lng: 103.020336, radius: 100 },
        enabled: false,
        experienceNote: {
          vi: 'Challenge BOTH của Chương 13 “Sự nổi loạn và thành phố ban đêm”. Tọa độ đã chốt, nhưng gameplay tạm khóa cho đến khi có xác minh hai bước: ảnh lúc để xe và ảnh khi quay lại sáng hôm sau.',
          en: 'A BOTH challenge for Chapter 13, “Rebellion and the City at Night”. The GPS is fixed, but gameplay stays locked until two-step verification exists: one photo when parking and another on the following morning.',
        },
      }
    : task);
