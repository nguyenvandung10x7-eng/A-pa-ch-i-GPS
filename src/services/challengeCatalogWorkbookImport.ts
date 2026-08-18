import type { ChallengeTask } from '../types/task';

/**
 * Editorial catalog import derived from BOOK_OF_DIEN_BIEN_CHALLENGE_TASK_EDITOR_COMPLETED.xlsx.
 *
 * Keep this as a narrow import layer while the catalog is being reviewed. Existing task
 * objects are patched instead of replaced so rich fields such as locationIntro, images,
 * externalUrl, and legacy compatibility metadata remain intact.
 */

const DISABLED_TASK_IDS = new Set<string>([
  'ruong-bac-thang-ta-leng-mthen',
  'thac-ke-nenh-mthen',
  'doi-a1-chuyen-tau-thoi-gian-1954',
  'canh-dong-muong-thanh-cat-banh',
  'quang-truong-7-5-mthen',
  'bao-tang-chien-thang-dien-bien-phu-trai-nghiem',
  'ho-huoi-pha-mthen',
  'khu-du-lich-him-lam-trai-ban',
  'ho-pa-khoang-trai-ban',
  'cong-vien-vu-a-dinh-trai-ban',
  'phadin-coffee-cat-banh',
  'cong-vien-noong-bua-mthen',
  'cho-noong-bua-trai-ban',
  'cong-vien-hoa-ban-mthen',
  'ca-phe-ke-nenh-cat-banh',
]);

type TaskPatch = Partial<Omit<ChallengeTask, 'id'>>;

// Existing users may already have customized category/difficulty/points/image fields.
// Match the former Chapter 13 bridge exactly: patch only the editorial fields that must
// change to support the GPS-only BOTH challenge.
const overnightMotorbikeExistingPatch: TaskPatch = {
  title: {
    vi: 'Niềm tin Điện Biên – Để xe máy ngoài trời qua đêm',
    en: 'Dien Bien Trust Test – Leave a Motorbike Outside Overnight',
  },
  description: {
    vi: 'Đến điểm đã chốt trong thành phố ban đêm. Khi bạn vào trong bán kính 100 m, GPS xác nhận bạn đã tới nơi và Challenge được hoàn thành. Ý tưởng để xe máy ngoài trời qua đêm là phần trải nghiệm mà Chapter 13 gợi ra; app không yêu cầu ảnh, không bắt chờ đến sáng và không cố xác minh bạn có thực sự để xe qua đêm hay không.',
    en: 'Reach the fixed point in the city at night. Once you enter the 100 m radius, GPS confirms your arrival and the Challenge is complete. Leaving a motorbike outside overnight is the experience Chapter 13 invites you to consider; the app does not require photos, make you wait until morning, or try to prove that you actually left the bike overnight.',
  },
  gps: { lat: 21.394221, lng: 103.020336, radius: 100 },
  enabled: true,
  experienceNote: {
    vi: 'Challenge BOTH của Chương 13 “Sự nổi loạn và thành phố ban đêm”. Chỉ cần đến trong bán kính 100 m để hoàn thành; việc để xe qua đêm là lời mời trải nghiệm, không phải điều app cố xác minh.',
    en: 'A BOTH challenge for Chapter 13, “Rebellion and the City at Night”. Reaching the 100 m radius completes it; leaving the motorbike overnight is an invitation to experience, not something the app tries to verify.',
  },
};

const TASK_PATCHES: Record<string, TaskPatch> = {
  'cho-muong-nhe-tang-banh-trung-thu': {
    title: {
      vi: 'Chợ Mường Nhé – Một chiếc bánh, một lời chào',
      en: 'Mường Nhé Market – A Mooncake and a Hello',
    },
    description: {
      vi: 'Đến Chợ Mường Nhé. Tìm một gia đình có trẻ em đi cùng và hỏi người lớn trước khi tặng một chiếc bánh Trung thu còn nguyên bao bì, còn hạn sử dụng. Không cần trẻ ăn bánh, tạo dáng hay nói trước máy quay; một lời chào và một cuộc gặp ngắn là đủ.',
      en: 'Go to Mường Nhé Market. Find a family with children and ask an accompanying adult before offering one sealed, unexpired mooncake. The child does not need to eat it, pose, or speak on camera; a greeting and a brief encounter are enough.',
    },
    difficulty: 'medium',
    points: 200,
    gps: { lat: 22.1908, lng: 102.45994, radius: 160 },
    enabled: true,
    experienceNote: {
      vi: 'Có thể ghi một khung cảnh chung; không quay cận mặt trẻ em nếu chưa được người giám hộ đồng ý. Chỉ tặng bánh còn nguyên bao bì, còn hạn sử dụng; không gây áp lực nhận quà hoặc ghi hình.',
      en: 'You may record a wide scene, but do not film a child close-up without a guardian’s permission. Offer only sealed, unexpired food and never pressure anyone to accept a gift or be recorded.',
    },
  },
  'cau-ta-ko-khu-tang-banh-trung-thu': {
    title: {
      vi: 'Cầu Tả Kó Khừ – Chia bánh giữa đường',
      en: 'Tả Kó Khừ Bridge – Share a Mooncake on the Road',
    },
    description: {
      vi: 'Dừng tại vị trí an toàn gần Cầu Tả Kó Khừ và chia một chiếc bánh Trung thu với người đang đi cùng bạn. Không cần tìm trẻ em hay người lạ để hoàn thành nhiệm vụ; điểm chính là một khoảng dừng nhỏ trên quãng đường rất dài về phía Tây.',
      en: 'Stop at a safe place near Tả Kó Khừ Bridge and share a mooncake with someone travelling with you. You do not need to approach children or strangers; the challenge is simply a small pause on the long road west.',
    },
    difficulty: 'hard',
    points: 240,
    gps: { lat: 22.37424, lng: 102.25375, radius: 200 },
    enabled: true,
    experienceNote: {
      vi: 'Một ảnh hoặc clip ngắn của chiếc bánh và không gian dừng chân. Chỉ dừng ở vị trí hợp pháp, không đứng trên phần xe chạy hoặc sát mép nguy hiểm.',
      en: 'Take one short photo or clip of the mooncake and the stopping place. Stop only where it is legal and safe, away from traffic lanes and dangerous edges.',
    },
  },
  'ban-a-pa-chai-tang-banh-trung-thu': {
    title: {
      vi: 'Bản A Pa Chải – Mang theo một món quà',
      en: 'A Pa Chải Village – Bring a Small Gift',
    },
    description: {
      vi: 'Đến Bản A Pa Chải với một chiếc bánh Trung thu còn nguyên bao bì. Nếu trong một cuộc gặp tự nhiên có người địa phương sẵn lòng trò chuyện, hãy tặng chiếc bánh như một món quà nhỏ. Không cần chủ động tìm trẻ em, không biến việc tặng quà thành màn trình diễn.',
      en: 'Arrive at A Pa Chải Village with one sealed mooncake. If a natural conversation happens with a local resident who is comfortable engaging, offer the cake as a small gift. Do not seek out children or turn the gift into a performance.',
    },
    difficulty: 'hard',
    points: 260,
    gps: { lat: 22.39102, lng: 102.23009, radius: 250 },
    enabled: true,
    experienceNote: {
      vi: 'Không bắt buộc quay người nhận; có thể chỉ chụp món quà hoặc cảnh đường, bản. Tôn trọng quyền từ chối và không ghi hình người khác khi chưa được đồng ý.',
      en: 'You do not need to film the recipient; the gift, road, or village scene is enough. Respect refusal and do not record people without permission.',
    },
  },
  'cot-co-a-pa-chai-mthen': {
    title: {
      vi: 'Cột cờ A Pa Chải – MThen trong gió',
      en: 'A Pa Chải Flag Tower – MThen in the Wind',
    },
    description: {
      vi: 'Đến Cột cờ A Pa Chải và quay một clip khoảng 10 giây. Không cần diễn nhiều: đứng yên, để gió làm phần còn lại, rồi thực hiện đúng một động tác MThen bạn thấy buồn cười nhất. Kết thúc trước khi nó biến thành một màn tạo dáng dài.',
      en: 'At A Pa Chải Flag Tower, record a clip of about ten seconds. Keep it minimal: stand still, let the wind do most of the work, then make one MThen gesture you find funniest. Stop before it turns into a long photo shoot.',
    },
    difficulty: 'hard',
    points: 480,
    gps: { lat: 22.39102, lng: 102.23009, radius: 250 },
    enabled: true,
    experienceNote: {
      vi: 'Clip khoảng 10 giây. Chỉ đứng ở khu vực dành cho khách; không trèo, vượt lan can hoặc tạo dáng ở mép dốc.',
      en: 'Record a clip of about ten seconds. Stay in visitor areas and do not climb, cross barriers, or pose near exposed edges.',
    },
  },
  'cot-co-a-pa-chai-trai-ban-lanh-lung': {
    title: {
      vi: 'Cột cờ A Pa Chải – Chàng trai bản quay về phía Tây',
      en: 'A Pa Chải Flag Tower – Village Boy Turns West',
    },
    description: {
      vi: 'Đứng ở khu vực an toàn tại Cột cờ A Pa Chải. Nhìn thẳng vào máy quay trong vài giây với vẻ nghiêm trọng quá mức cần thiết, sau đó quay lưng nhìn về phía Tây và giữ nguyên tư thế. Tuyệt đối không cười cho đến khi người quay hạ máy.',
      en: 'Stand in a safe visitor area at A Pa Chải Flag Tower. Look into the camera for a few seconds with an unnecessarily serious expression, then turn west and hold the pose. Do not smile until the camera is lowered.',
    },
    difficulty: 'hard',
    points: 480,
    gps: { lat: 22.39102, lng: 102.23009, radius: 250 },
    enabled: true,
    experienceNote: {
      vi: 'Clip ngắn hoặc hai ảnh trước và sau khi quay lưng. Không lùi khi đang nhìn máy quay; giữ khoảng cách an toàn với lan can và mép dốc.',
      en: 'Use a short clip or two photos before and after turning away. Do not step backward while facing the camera; keep a safe distance from barriers and edges.',
    },
  },
  'ban-phieng-loi-mthen': {
    title: {
      vi: 'Phiêng Lơi – Tìm một chi tiết của bản',
      en: 'Phiêng Lơi – Find One Detail of the Village',
    },
    description: {
      vi: 'Đi bộ một đoạn ngắn ở khu vực công cộng của Bản Phiêng Lơi và tìm đúng một chi tiết khiến bạn chú ý: mái nhà, hàng rào, vật dụng, cây cối, mặt đường hoặc một thứ rất bình thường khác. Chụp lại chi tiết đó mà không cần biến người dân thành đối tượng của thử thách.',
      en: 'Walk a short distance through the public area of Phiêng Lơi Village and find exactly one detail that catches your eye: a roof, fence, object, plant, road surface, or something equally ordinary. Photograph that detail without turning residents into subjects of the challenge.',
    },
    category: 'reflection',
    difficulty: 'medium',
    points: 180,
    gps: { lat: 21.4280674, lng: 103.0467659, radius: 250 },
    enabled: true,
    experienceNote: {
      vi: 'Chụp một chi tiết không phải chân dung người. Không vào sân hoặc nhà riêng nếu chưa được mời và không chụp cận người khác khi chưa xin phép.',
      en: 'Photograph one detail rather than a portrait. Do not enter private yards or homes unless invited, and do not photograph people close-up without permission.',
    },
  },
  'de-xe-may-ngoai-troi-qua-dem': overnightMotorbikeExistingPatch,
};

const ADDED_TASKS: readonly ChallengeTask[] = [
  {
    id: 'quan-com-hung-ha-thuoc-lao-free',
    title: {
      vi: 'Quán cơm Hưng Hà – Xin một bi thuốc lào free',
      en: 'Hưng Hà Eatery – Ask for a Free Thuốc Lào Puff',
    },
    description: {
      vi: 'Đến quán cơm Hưng Hà đối diện khu khách sạn Mường Thanh Luxury và gặp chủ quán. Nếu bạn là người trưởng thành và vốn đã lựa chọn hút thuốc lào, có thể hỏi vui xem có được mời một bi miễn phí hay không. Nếu không hút thuốc, chỉ cần ngồi nói chuyện vài phút; nhiệm vụ vẫn được tính là hoàn thành. Vui thì ủng hộ quán một suất cơm.',
      en: 'Visit Hưng Hà eatery opposite the Mường Thanh Luxury area and meet the owner. If you are an adult who already chooses to smoke thuốc lào, you may jokingly ask whether a free puff is on offer. If you do not smoke, simply have a short conversation; the challenge still counts. If you enjoy the place, support the eatery with a meal.',
    },
    category: 'surprise',
    difficulty: 'easy',
    points: 100,
    gps: { lat: 21.392328, lng: 103.010909, radius: 90 },
    image: '',
    enabled: true,
    experienceNote: {
      vi: 'Không bắt buộc quay chủ quán; chỉ ghi hình khi được đồng ý. Không khuyến khích bắt đầu hút thuốc: nếu không hút, chỉ cần trò chuyện để hoàn thành nhiệm vụ.',
      en: 'Filming the owner is optional and requires permission. This challenge does not encourage starting tobacco use: if you do not smoke, a short conversation is enough to complete it.',
    },
  },
  {
    id: 'de-xe-may-ngoai-troi-qua-dem',
    title: overnightMotorbikeExistingPatch.title!,
    description: overnightMotorbikeExistingPatch.description!,
    category: 'surprise',
    difficulty: 'medium',
    points: 180,
    gps: overnightMotorbikeExistingPatch.gps!,
    image: '',
    enabled: true,
    experienceNote: overnightMotorbikeExistingPatch.experienceNote,
  },
  {
    id: 'nhin-xuong-long-chao-cua-chung-ta',
    title: {
      vi: 'Nhìn xuống lòng chảo của chúng ta',
      en: 'Look Down at Our Valley',
    },
    description: {
      vi: 'Đi đến điểm nhìn này và tìm một chỗ đứng an toàn. Không cần làm gì đặc biệt: nhìn xuống lòng chảo Mường Thanh trong vài phút, thử nhận ra những con đường, ruộng, mái nhà và khoảng trống bên dưới. Chụp đúng một tấm ảnh về thứ khiến bạn chú ý nhất rồi cất điện thoại đi.',
      en: 'Go to this viewpoint and find a safe place to stand. You do not need to perform anything: look down over the Mường Thanh valley for a few minutes and notice the roads, fields, roofs, and open spaces below. Take exactly one photo of what catches your attention most, then put the phone away.',
    },
    category: 'reflection',
    difficulty: 'easy',
    points: 140,
    gps: { lat: 21.389481, lng: 103.067382, radius: 180 },
    image: '',
    enabled: true,
    experienceNote: {
      vi: 'Chụp đúng một ảnh từ điểm nhìn. Đứng ở vị trí quan sát an toàn; không trèo qua lan can, mép taluy hoặc xuống khu vực dốc để lấy góc ảnh.',
      en: 'Take exactly one photo from the viewpoint. Stay at a safe observation point and do not cross barriers or descend exposed slopes for a better angle.',
    },
  },
  {
    id: 'tim-cay-xoai-co-thu',
    title: {
      vi: 'Tìm cây xoài cổ thụ',
      en: 'Find the Old Mango Tree',
    },
    description: {
      vi: "Tọa độ chỉ đưa bạn đến khu vực gần đúng. Hãy tự tìm cây xoài già khiến bạn nghĩ rằng 'chắc là nó'. Khi tìm được, ngồi dưới gốc khoảng 10 phút và không làm gì cả: không tạo dáng, không lướt điện thoại, không cố biến nó thành một khoảnh khắc sâu sắc. Chỉ ngồi đó. Nếu cuối cùng bạn phát hiện mình tìm nhầm cây, nhiệm vụ vẫn tính.",
      en: "The coordinates only take you to the approximate area. Find the old mango tree that makes you think, 'this must be it.' Once you find it, sit beneath it for about ten minutes and do nothing: no posing, no scrolling, and no attempt to manufacture a profound moment. Just sit there. If you later discover it was the wrong tree, the challenge still counts.",
    },
    category: 'reflection',
    difficulty: 'medium',
    points: 220,
    gps: { lat: 21.37784, lng: 103.068867, radius: 250 },
    image: '',
    enabled: true,
    experienceNote: {
      vi: 'Không bắt buộc quay hoặc chụp; nếu muốn, chỉ chụp cây hoặc tán cây. Tọa độ là gần đúng, chỉ đi theo lối tiếp cận an toàn và không tự ý vào đất hoặc vườn riêng.',
      en: 'No photo or video is required; if you want one, photograph only the tree or canopy. The coordinates are approximate, so use safe public access and do not enter private land without permission.',
    },
  },
] as const;

export const applyChallengeCatalogWorkbookImport = (tasks: ChallengeTask[]): ChallengeTask[] => {
  const existingIds = new Set(tasks.map((task) => task.id));

  const importedExisting = tasks.map((task) => {
    const patch = TASK_PATCHES[task.id];
    const disabled = DISABLED_TASK_IDS.has(task.id);

    if (!patch && !disabled) return task;

    return {
      ...task,
      ...patch,
      enabled: disabled ? false : patch?.enabled ?? task.enabled,
    };
  });

  const additions = ADDED_TASKS
    .filter((task) => !existingIds.has(task.id))
    .map((task) => structuredClone(task));

  return [...importedExisting, ...additions];
};
