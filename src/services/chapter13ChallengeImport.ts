import type { ChallengeTask } from '../types/task';

const OVERNIGHT_MOTORBIKE_TASK_ID = 'de-xe-may-ngoai-troi-qua-dem';

/** Editorial bridge for Chapter 13: “Sự nổi loạn và thành phố ban đêm”.
 * The Literary workbook marks this task as BOTH (Book + Challenge) and fixes its GPS.
 */
export const applyChapter13ChallengeImport = (tasks: ChallengeTask[]): ChallengeTask[] =>
  tasks.map((task) => task.id === OVERNIGHT_MOTORBIKE_TASK_ID
    ? {
        ...task,
        gps: { lat: 21.394221, lng: 103.020336, radius: 100 },
        enabled: true,
        experienceNote: {
          vi: 'Challenge BOTH của Chương 13 “Sự nổi loạn và thành phố ban đêm”. Đỗ xe ở vị trí hợp pháp trong khu vực GPS, khóa xe bình thường, không để tài sản giá trị; chụp một ảnh lúc để xe và một ảnh khi quay lại sáng hôm sau.',
          en: 'A BOTH challenge for Chapter 13, “Rebellion and the City at Night”. Park legally within the GPS area, lock the bike normally, leave no valuables, take one photo when parking and another when you return the next morning.',
        },
      }
    : task);
