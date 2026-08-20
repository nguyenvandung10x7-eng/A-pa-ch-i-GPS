import type { BookChapter, BookLocalizedText, BookPage, ContentBlock } from '../types/book';

type MiddlePageForm = {
  intro: BookLocalizedText;
  paragraphs: BookLocalizedText[];
};

const MIDDLE_PAGE_FORMS: Record<string, MiddlePageForm> = {
  'goc-pho-hoa-qua-rung': {
    intro: {
      vi: 'Tôi nhớ thị xã đôi khi không bằng một con đường, mà bằng những thứ được bày thấp sát vỉa hè.',
      en: 'Sometimes I remember the town not by a street, but by the things laid low beside the pavement.',
    },
    paragraphs: [
      {
        vi: 'Củ đậu. Mắc sim. Quả me. Một bát muối ớt.',
        en: 'Jicama. Wild fruit. Tamarind. A bowl of chili salt.',
      },
      {
        vi: 'Người bán ngồi ở góc phố. Người đi qua dừng lại, mua một ít, rồi đi tiếp. Chẳng ai nghĩ khung cảnh ấy cần phải được giữ lại.',
        en: 'The seller sits at a street corner. Someone passing stops, buys a little, then moves on. Nobody thinks the scene needs preserving.',
      },
      {
        vi: 'Có lẽ một thị xã ngày trước là như vậy: nó không cần làm gì để trở thành ký ức. Nó chỉ cần tồn tại đủ lâu trong những buổi chiều bình thường.',
        en: 'Perhaps that is what a small town once was: it did not need to do anything to become memory. It only had to exist long enough inside ordinary afternoons.',
      },
    ],
  },
  'nhung-quan-che': {
    intro: {
      vi: 'Có một thời muốn nhìn ra thế giới bên ngoài chỉ cần bước vào một quán chè có chiếc tivi đang bật.',
      en: 'There was a time when seeing the outside world only required stepping into a sweet-soup shop with a television switched on.',
    },
    paragraphs: [
      {
        vi: 'Người trong giang hồ. Cú đấm máu. Ỷ Thiên Đồ Long Ký.',
        en: 'Young and Dangerous. Bloodfight. The Heaven Sword and Dragon Saber.',
      },
      {
        vi: 'Những cái tên ấy đi vào thị xã qua màn hình tivi. Người ta ngồi xem, ăn chè, nói chuyện, rồi có khi nấn ná thêm chỉ vì phim chưa hết.',
        en: 'Those titles entered the town through television screens. People watched, ate sweet soup, talked, and sometimes stayed a little longer simply because the film had not ended.',
      },
      {
        vi: 'Hồi đó chẳng ai nghĩ mình đang sống trong một thời kỳ. Chỉ là tối nay có phim hay.',
        en: 'Back then nobody thought they were living inside an era. There was simply a good film on tonight.',
      },
    ],
  },
  'canh-dong-muong-thanh-sau-mua-gat': {
    intro: {
      vi: 'Ngày thường, cánh đồng Mường Thanh chỉ là nơi người ta tiếp tục một ngày của mình.',
      en: 'On an ordinary day, Muong Thanh Field is simply where people continue with their day.',
    },
    paragraphs: [
      {
        vi: 'Ruộng nằm giữa lòng chảo. Núi đứng bốn phía. Gió đi thấp qua mặt đất.',
        en: 'Fields lie inside the basin. Mountains stand on all sides. Wind moves low across the ground.',
      },
      {
        vi: 'Người ta vẫn làm việc, đi qua, trở về nhà. Cảnh vật lớn như thế nhưng khi sống trong nó mỗi ngày, có lúc chẳng ai thấy mình đang ở giữa một nơi hùng vĩ.',
        en: 'People still work, pass through, and go home. The landscape is vast, yet when you live inside it every day, there are times nobody notices they are surrounded by grandeur.',
      },
      {
        vi: 'Lịch sử ở đây cũng vậy. Không phải lúc nào nó cũng đứng lên để được nhìn thấy. Có ngày nó nằm yên dưới một buổi chiều rất bình thường.',
        en: 'History is like that here too. It does not always rise up to be seen. Some days it lies quietly beneath a very ordinary afternoon.',
      },
    ],
  },
  'su-hung-vi': {
    intro: {
      vi: 'Ông nội đến Điện Biên và mang hai chữ “Hùng Vĩ” về tận trong gia đình.',
      en: 'Grandfather came to Dien Bien and carried the words “Hung Vi” — grandeur — all the way into the family.',
    },
    paragraphs: [
      {
        vi: 'Tôi không biết chính xác ông đã đứng ở đâu khi lần đầu nhìn thấy lòng chảo.',
        en: 'I do not know exactly where he stood when he first saw the basin.',
      },
      {
        vi: 'Tôi chỉ biết cảm giác về vùng đất ấy đủ mạnh để hai chữ “Hùng Vĩ” không còn là một lời tả cảnh. Chúng đi vào câu chuyện đặt tên của gia đình.',
        en: 'I only know the feeling of the place was strong enough that “Hung Vi” stopped being merely a description of scenery. The words entered the family’s story of naming.',
      },
      {
        vi: 'Có những cách một vùng đất ở lại trong một gia đình mà người đến sau chỉ có thể lần theo từ một câu chuyện như thế.',
        en: 'There are ways a place remains inside a family that later generations can only trace through a story like this.',
      },
    ],
  },
  'nhung-ngon-doi': {
    intro: {
      vi: 'Dưới chân đồi là thành phố đang sống. Trên đồi là một lớp thời gian khác.',
      en: 'At the foot of the hills, the city is living. On the hills, another layer of time remains.',
    },
    paragraphs: [
      {
        vi: 'Nhà cửa và đường phố đã tiến sát đến những điểm cao từng nằm trên bản đồ chiến dịch.',
        en: 'Houses and streets have advanced close to the high ground once marked on campaign maps.',
      },
      {
        vi: 'Bên dưới, người ta mở cửa hàng, đi làm, đưa trẻ con về nhà. Những việc rất nhỏ của một ngày sống diễn ra sát cạnh địa hình từng mang một ý nghĩa hoàn toàn khác.',
        en: 'Below, people open shops, go to work, and take children home. The small acts of an ordinary day happen beside terrain that once carried an entirely different meaning.',
      },
      {
        vi: 'Những ngọn đồi không cần kể lại chiến tranh. Chúng chỉ ở đó. Thành phố lớn dần quanh chúng.',
        en: 'The hills do not need to retell the war. They are simply there. The city grows around them.',
      },
    ],
  },
  '1954-duoi-mot-thanh-pho-dang-song': {
    intro: {
      vi: 'Buổi sáng, thành phố mở cửa như mọi ngày. 1954 vẫn ở dưới chân người ta.',
      en: 'In the morning, the city opens as it does every day. 1954 is still beneath people’s feet.',
    },
    paragraphs: [
      {
        vi: 'Xe chạy. Trẻ con đi học. Hàng quán bật đèn. Người ta bắt đầu công việc của mình.',
        en: 'Traffic moves. Children go to school. Shops turn on their lights. People begin their work.',
      },
      {
        vi: 'Cũng trên mặt đất ấy từng là một thời khác. Có những người đã chết. Có những dấu tích vẫn còn.',
        en: 'The same ground once belonged to another time. People died here. Traces remain.',
      },
      {
        vi: 'Tôi không muốn bắt thành phố phải đứng yên để tưởng niệm quá khứ. Có lẽ điều lạ nhất chính là nó vẫn sống — ngay trên nơi lịch sử từng dữ dội đến thế.',
        en: 'I do not want the city to stand still in order to remember the past. Perhaps the strangest thing is that it keeps living—on the very ground where history was once so violent.',
      },
    ],
  },
};

const MIDDLE_CHAPTER_INTROS: Record<string, BookLocalizedText> = {
  'chapter-05-thi-xa': {
    vi: 'Một thị xã cũ có thể trở về bằng một góc vỉa hè, một cốc chè, một bộ phim đang chiếu dở.',
    en: 'An old town can return through a street corner, a sweet soup, or a film still playing.',
  },
  'chapter-05-long-chao': {
    vi: 'Sống giữa lòng chảo lâu ngày, người ta có thể quên mất bốn phía quanh mình đều là núi.',
    en: 'Live inside the basin long enough and you can forget that mountains stand on every side.',
  },
  'chapter-08-nhung-ngon-doi': {
    vi: 'Thành phố đã tiến sát chân những ngọn đồi. Những ngọn đồi vẫn ở đó.',
    en: 'The city has reached the feet of the hills. The hills are still there.',
  },
  'chapter-06-1954': {
    vi: '1954 không nằm sau thành phố. Nó nằm cùng thành phố, dưới những ngày vẫn đang tiếp tục.',
    en: '1954 does not sit behind the city. It lies with the city, beneath days that continue.',
  },
};

const paragraphBlock = (body: BookLocalizedText): ContentBlock => ({ type: 'text', body });

export const withLiteraryMiddlePageForm = (page: BookPage): BookPage => {
  const form = MIDDLE_PAGE_FORMS[page.id];
  if (!form) return page;

  let replaced = false;
  const blocks = page.blocks.flatMap((block) => {
    if (block.type !== 'text') return [block];
    if (replaced) return [];
    replaced = true;
    return form.paragraphs.map(paragraphBlock);
  });

  if (!replaced) blocks.push(...form.paragraphs.map(paragraphBlock));
  return { ...page, intro: form.intro, blocks };
};

export const withLiteraryMiddleChapterForm = (chapter: BookChapter): BookChapter => {
  const intro = MIDDLE_CHAPTER_INTROS[chapter.id];
  return intro ? { ...chapter, intro } : chapter;
};
