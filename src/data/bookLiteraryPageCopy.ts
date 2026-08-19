import type { BookLocalizedText, BookPage } from '../types/book';

type LiteraryPageCopy = {
  intro: BookLocalizedText;
  body: BookLocalizedText;
};

export const BOOK_PAGE_LITERARY_COPY: Record<string, LiteraryPageCopy> = {
  'nam-rom-buoi-chieu': {
    intro: {
      vi: 'Nậm Rốm vẫn chảy qua thành phố. Chỉ có bờ sông trong trí nhớ là không còn ở đúng chỗ cũ.',
      en: 'Nam Rom still runs through the city. Only the riverbank in memory is no longer quite where it used to be.',
    },
    body: {
      vi: 'Ngày ấy, con sông không phải phong cảnh. Nó là một lối trốn khỏi người lớn, là đám bạn rủ nhau xuống nước, là những trò nghịch dại tưởng rồi sẽ quên. Nhiều năm sau, nước vẫn đi qua Điện Biên như chưa từng biết những đứa trẻ ấy đã lớn. Chỉ cần đứng gần bờ một lúc, đôi khi một buổi chiều cũ lại nổi lên rất rõ.',
      en: 'Back then the river was not scenery. It was a way of slipping away from adults, friends calling one another into the water, and foolish games everyone assumed would be forgotten. Years later, the river still passes through Dien Bien as though it never knew those children grew up. Stand near the bank long enough and an old afternoon can sometimes surface intact.',
    },
  },
  'mua-hoa-nhan-hoa-vai': {
    intro: {
      vi: 'Có một mùa hè không cần ngày tháng: chỉ cần hoa nhãn, hoa vải và tiếng ve là biết nó đã về.',
      en: 'There was a summer that needed no dates: longan blossom, lychee blossom, and cicadas were enough to know it had arrived.',
    },
    body: {
      vi: 'Hoa nở rồi quả lớn dần trong cái nắng rất dài. Có chuối xanh chấm muối ớt, có nhãn vừa bóc vừa ăn, có những ngày đi bóc nong thuê chỉ để đổi lấy ít tiền chơi game. Khi còn nhỏ, mùa hè tưởng như một thứ không bao giờ hết. Sau này nhớ lại, nó chỉ còn vài mùi, vài vị và một khoảng sáng rất xa.',
      en: 'Blossom came first, then fruit slowly filled out through the long heat. There was green banana dipped in chili salt, longan eaten while it was being peeled, and days of paid tray work exchanged for a little game money. As a child, summer seemed incapable of ending. Later it survives as a few smells, a few tastes, and a distant field of light.',
    },
  },
  'vuon-nha-ba-noi': {
    intro: {
      vi: 'Một căn nhà nhỏ có thể rộng hơn cả thành phố, nếu đó là nơi tuổi thơ từng sống.',
      en: 'A small house can be larger than a city when it is where childhood once lived.',
    },
    body: {
      vi: 'Nhà ngói ba gian, cái giếng với bơm tay, nhà tắm ngoài trời, vườn rau, cây bưởi, chuồng gà, bếp củi. Có mùi lông chó, mùi cám lợn — những thứ khi ấy chẳng ai nghĩ là đáng nhớ. Phía sau là vườn nhãn gần bờ sông; trẻ con có thể đi từ sân nhà này sang sân nhà khác qua lớp lá khô. Một thế giới rất nhỏ, nhưng lúc ở trong đó chẳng ai thấy nó nhỏ.',
      en: 'A three-bay tiled house, the well and hand pump, an outdoor wash area, vegetable beds, a pomelo tree, chicken coop, and wood stove. There was the smell of dog fur and pig feed—things nobody then considered worth remembering. Behind the house stood a longan garden near the river, and children could pass from one yard to another over dry leaves. It was a very small world, though nobody living inside it thought so.',
    },
  },
  'pho-cu': {
    intro: {
      vi: 'Con đường vẫn còn đâu đó trên bản đồ. Con đường một đứa trẻ từng biết thì đã mất.',
      en: 'The road may still exist on a map. The road a child once knew is gone.',
    },
    body: {
      vi: 'Đường vào nhà bà từng là đường đất. Hai bên là nhà nhỏ, hàng rào cây găng và những ô đất trống nơi trẻ con tụ lại, rồi từ đó len sang xóm khác như thể cả khu phố không có ranh giới. Sau này đường rộng hơn, nhà kín hơn, các khoảng trống dần biến mất. Đô thị hóa không chỉ đổi mặt đường; nó khép lại những lối đi mà người lớn chưa bao giờ biết trẻ con từng có.',
      en: 'The road to grandmother’s house used to be dirt. Small homes, living hedges, and empty plots lined it, places where children gathered and then slipped into the next neighborhood as though the whole quarter had no borders. Later the road widened, houses closed in, and the open ground disappeared. Urbanization changed more than the surface; it sealed paths adults may never have known children possessed.',
    },
  },
  'thcs-so-1-dien-bien': {
    intro: {
      vi: 'Tên một ngôi trường đôi khi giữ nguyên cả quãng đời mà người trong đó đã đổi khác hoàn toàn.',
      en: 'The name of a school can remain unchanged while everyone who passed through it becomes someone else.',
    },
    body: {
      vi: 'Ký ức về trường không chịu đứng thành hàng. Nó lẫn bạn bè với phố xá, quần áo với âm nhạc, một buổi tan học với cảm giác bỗng nhiên thấy mình lớn hơn hôm qua. Không ai biết chính xác tuổi thiếu niên kết thúc lúc nào. Có lẽ nó chỉ im lặng rời đi, để lại một cái tên trường vẫn còn nguyên.',
      en: 'School memories refuse to line up neatly. Friends mix with streets, clothes with music, an afternoon dismissal with the sudden feeling of being older than yesterday. Nobody knows exactly when adolescence ends. Perhaps it simply leaves quietly, while the school’s name stays behind unchanged.',
    },
  },
  'goc-pho-hoa-qua-rung': {
    intro: {
      vi: 'Một thị xã có thể được nhớ bằng những thứ bày thấp sát vỉa hè hơn là bằng những tòa nhà cao.',
      en: 'A town can be remembered more clearly by things laid low beside the pavement than by anything tall.',
    },
    body: {
      vi: 'Củ đậu, mắc sim, quả me, một bát muối ớt. Người bán ngồi ở góc phố như một phần tự nhiên của buổi chiều, còn người đi qua chẳng nghĩ mình đang nhìn thấy điều gì đặc biệt. Nhiều năm sau mới hiểu chính những cảnh bình thường nhất ấy mới làm một nơi khác với mọi nơi khác.',
      en: 'Jicama, wild fruit, tamarind, a bowl of chili salt. Sellers sat at street corners as naturally as part of the afternoon, while passersby saw nothing remarkable. Years later, it becomes clear that the most ordinary scenes were what made one place unlike every other.',
    },
  },
  'nhung-quan-che': {
    intro: {
      vi: 'Có thời cả thế giới bên ngoài đi vào thị xã qua một chiếc tivi đặt trong quán chè.',
      en: 'There was a time when the outside world entered the town through a television in a sweet-soup shop.',
    },
    body: {
      vi: 'Người trong giang hồ, Cú đấm máu, Ỷ Thiên Đồ Long Ký. Chỉ cần những cái tên ấy là một dãy quán, ánh màn hình và những buổi tối cũ tự trở lại. Khi ấy chẳng ai gọi đó là hoài niệm; chỉ là ngồi xem thêm một đoạn, ăn thêm một cốc chè, rồi về nhà khi phim vẫn còn chạy.',
      en: 'Young and Dangerous, Bloodfight, The Heaven Sword and Dragon Saber. The titles alone can bring back a row of shops, television light, and evenings long gone. Nobody called it nostalgia then; it was simply watching a little longer, finishing another sweet soup, and going home while the film was still running.',
    },
  },
  'am-thanh-nhung-nam-2000': {
    intro: {
      vi: 'Có những năm không trở lại bằng ngày tháng. Chúng trở lại ngay từ vài nốt nhạc đầu tiên.',
      en: 'Some years do not return through dates. They return in the first few notes of a song.',
    },
    body: {
      vi: 'Lam Trường, Đan Trường, Ưng Hoàng Phúc, H.A.T., rồi Linkin Park. Những cái tên từng rất mới đi qua quần áo, kiểu tóc, quán xá và những căn phòng có màn hình sáng. Bây giờ chỉ cần một bài hát bật lên bất ngờ, một thời kỳ đã mất có thể đứng ngay giữa hiện tại mà không cần xin phép.',
      en: 'Lam Truong, Dan Truong, Ung Hoang Phuc, H.A.T., then Linkin Park. Names that once felt new moved through clothes, haircuts, shops, and rooms lit by screens. Now a song appearing without warning can place an entire vanished period in the middle of the present without asking permission.',
    },
  },
  'canh-dong-muong-thanh-sau-mua-gat': {
    intro: {
      vi: 'Ra khỏi phố một chút, lòng chảo mở ra và bầu trời bỗng rộng hơn.',
      en: 'A little beyond the streets, the basin opens and the sky suddenly becomes larger.',
    },
    body: {
      vi: 'Giữa cánh đồng Mường Thanh, gió đi thấp qua mặt đất, đường sá nằm xa hơn và người ta vẫn làm công việc của một ngày bình thường. Lịch sử ở đây không cần lúc nào cũng được gọi tên. Nó nằm cùng ruộng, cùng núi, cùng những người đang sống — một lớp thời gian lặng lẽ dưới cảnh vật trước mắt.',
      en: 'In Muong Thanh Field, wind moves low across the ground, roads seem farther away, and people continue the work of an ordinary day. History does not always need to be named here. It lies with field, mountain, and the people still living—a quiet layer of time beneath the visible landscape.',
    },
  },
  'su-hung-vi': {
    intro: {
      vi: 'Có những vùng đất đi vào gia đình trước khi kịp đi vào ký ức của một đứa trẻ.',
      en: 'Some places enter a family before they enter a child’s own memory.',
    },
    body: {
      vi: 'Ông nội đến Điện Biên và điều ở lại trong ông là sự hùng vĩ. Cảm giác ấy mạnh đến mức hai chữ “Hùng Vĩ” bước khỏi cảnh quan để đi vào câu chuyện đặt tên trong gia đình. Có lẽ con người gắn với một vùng đất bằng những cách rất lạ: đôi khi chỉ vì lần đầu nhìn quanh và thấy mình muốn ở lại.',
      en: 'Grandfather came to Dien Bien and what stayed with him was its vastness. The feeling was strong enough for “Hung Vi”—grandeur—to leave the landscape and enter the family’s naming story. People attach themselves to places in strange ways; sometimes it begins with simply looking around for the first time and wanting to remain.',
    },
  },
  'nhung-ngon-doi': {
    intro: {
      vi: 'Thành phố lớn lên từng năm. Những ngọn đồi thì gần như không đi đâu cả.',
      en: 'The city grows year by year. The hills barely move at all.',
    },
    body: {
      vi: 'Nhà cửa và đường phố đã bò sát đến chân những điểm cao từng nằm trên bản đồ chiến dịch. Dưới đồi, người ta đi làm, mở cửa hàng, đưa trẻ con về nhà. Trên cao là một lớp ký ức khác. Chiến tranh đã đi qua; địa hình ở lại, và thành phố học cách sống quanh những thứ không thể dời đi.',
      en: 'Houses and streets have crept close to high ground once marked on campaign maps. Below, people go to work, open shops, and take children home. Higher up lies another layer of memory. War passed; the terrain remained, and the city learned to live around what could not be moved.',
    },
  },
  '1954-duoi-mot-thanh-pho-dang-song': {
    intro: {
      vi: '1954 không chỉ ở trong bảo tàng. Nó nằm dưới một thành phố vẫn mở cửa mỗi sáng.',
      en: '1954 is not only in a museum. It lies beneath a city that still opens every morning.',
    },
    body: {
      vi: 'Người ta đi làm, trẻ con đi học, xe chạy qua những con phố và hàng quán bật đèn. Cùng trên mặt đất ấy từng là một thời khác, với những người đã chết và những dấu tích chưa biến mất. Có lẽ lịch sử ở Điện Biên nên được đọc như vậy: không tách khỏi đời sống, cũng không biến thành phông nền. Đọc chậm, rồi bước ra đường nếu muốn.',
      en: 'People go to work, children go to school, traffic crosses the streets, and shops turn on their lights. The same ground once held another time, with people who died and traces that never fully disappeared. Perhaps history in Dien Bien is best read this way: neither separated from life nor reduced to backdrop. Read slowly, then step outside if you wish.',
    },
  },
  'con-vat': {
    intro: {
      vi: 'Có những chuyến đi lớn dần trong trí nhớ chỉ vì một thứ rất nhỏ bám vào chân.',
      en: 'Some outings grow larger in memory because of one very small thing that clung to a leg.',
    },
    body: {
      vi: 'Hôm ấy lớp học thêm được nghỉ, cả nhóm đi qua đồi và bản để xuống thác tắm. Đến khi có người hét lên, mọi người mới cúi xuống kiểm tra quần áo: mỗi người một vài con vắt. Hai vết máu tròn trên chiếc quần jeans, rồi ngứa, rồi thâm rất lâu. Trí nhớ đôi khi bất công như thế — nó làm rơi những chuyện lớn và giữ chặt một con vắt.',
      en: 'That day an extra class was cancelled, so the group crossed hills and villages to swim at a waterfall. Only when someone shouted did everyone look down and check their clothes: one or two leeches on each person. Two round blood marks on a pair of jeans, then itching, then dark marks that lasted. Memory can be unfair that way—it drops larger events and holds tightly to a leech.',
    },
  },
  'chuyen-xe-dua-nguoi-chet-di-hoa-tang': {
    intro: {
      vi: 'Có những chuyến xe đi ngang qua đời sống và mang theo một sự im lặng không ai cần giải thích.',
      en: 'Some vehicles pass through ordinary life carrying a silence nobody needs explained.',
    },
    body: {
      vi: 'Chiếc xe đưa người đã mất đi hỏa táng chạy qua một ngày vẫn đang tiếp tục. Hai bên đường, người sống vẫn làm việc, vẫn nói chuyện, vẫn có những việc phải về nhà làm nốt. Không có ranh giới rõ ràng giữa hai thế giới; chỉ có một chiếc xe đi qua rồi nhỏ dần ở phía trước. Một lúc sau, con đường lại như cũ.',
      en: 'The vehicle carrying the dead to cremation moves through a day that continues anyway. Along the road, the living keep working, talking, and carrying unfinished things home. There is no clean border between the two worlds; only a vehicle moving away and becoming smaller ahead. After a while, the road looks ordinary again.',
    },
  },
  'di-ve-phia-tay-cho-den-gan-het-duong': {
    intro: {
      vi: 'Đi về phía Tây đủ lâu, thành phố sẽ lùi khỏi gương và con đường bắt đầu tự nói bằng núi, bản và những khúc cua.',
      en: 'Go west long enough and the city slips from the mirror, leaving the road to speak in mountains, villages, and bends.',
    },
    body: {
      vi: 'Càng đi xa, những câu chuyện vừa kể không biến mất; chúng chỉ nằm lại phía sau từng khúc đường. A Pa Chải ở phía trước, nhưng không nhất thiết phải là một dấu chấm hết hay một nơi để chinh phục. Có lẽ chỉ cần đi tiếp, qua rừng và những bản nhỏ, cho đến khi con đường dài hơn mọi điều mình định nói về nó.',
      en: 'The farther the road goes, the stories just told do not disappear; they simply remain behind bend after bend. A Pa Chai lies ahead, but it need not be a full stop or something to conquer. Perhaps it is enough to continue through forest and small villages until the road becomes longer than anything you meant to say about it.',
    },
  },
  'thanh-pho-ban-dem-va-mot-phep-thu-nho': {
    intro: {
      vi: 'Đêm làm một thành phố nhỏ rộng ra. Không phải vì đường dài hơn, mà vì những điều ban ngày giữ người ta lại bỗng nhẹ đi.',
      en: 'Night makes a small city feel larger. Not because the roads lengthen, but because the things that hold people back by day become lighter.',
    },
    body: {
      vi: 'Sự nổi loạn ở đây không cần ồn. Chỉ là đi thêm một đoạn trong gió đêm, qua những phố đã thưa người, rồi làm một việc hơi lệch khỏi thói quen: để chiếc xe ở một chỗ đỗ hợp pháp, khóa lại như bình thường và bước đi. Sáng hôm sau có thể quay lại. App chỉ xác nhận bạn đã đến nơi; phần còn lại không phải bằng chứng, mà là một chút tự do bạn tự quyết định có nhận lấy hay không.',
      en: 'Rebellion here does not need to be loud. It can be riding a little farther through the night air and quieter streets, then doing something slightly outside routine: leave the motorbike in a legal parking place, lock it as usual, and walk away. You can return the next morning. The app only confirms that you reached the place; the rest is not evidence, but a small freedom you decide whether to take.',
    },
  },
};

export const withLiteraryPageCopy = (page: BookPage): BookPage => {
  const copy = BOOK_PAGE_LITERARY_COPY[page.id];
  if (!copy) return page;

  return {
    ...page,
    intro: copy.intro,
    blocks: page.blocks.map((block) => block.type === 'text' ? { ...block, body: copy.body } : block),
  };
};
