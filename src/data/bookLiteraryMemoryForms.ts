import type { BookChapter, BookLocalizedText, BookPage, ContentBlock } from '../types/book';

type MemoryForm = {
  intro: BookLocalizedText;
  paragraphs: BookLocalizedText[];
};

const MEMORY_FORMS: Record<string, MemoryForm> = {
  'nam-rom-buoi-chieu': {
    intro: {
      vi: 'Tôi nhớ Nậm Rốm trước hết bằng những lần trốn người lớn đi tắm sông.',
      en: 'I remember Nam Rom first through the times we slipped away from the adults to swim.',
    },
    paragraphs: [
      {
        vi: 'Ngày ấy, bọn tôi có những lần trốn người lớn đi tắm sông. Chỉ là một chuyện nghịch của trẻ con. Không ai nghĩ nó sẽ nằm lại lâu đến thế.',
        en: 'Back then, there were times when we slipped away from the adults to swim in the river. It was only a childhood mischief. Nobody thought it would stay for so long.',
      },
      {
        vi: 'Nậm Rốm trong trí nhớ tôi không phải một phong cảnh. Nó là nước, là bạn bè, là những trò nghịch dại và cảm giác mình đã đi ra ngoài phần thế giới người lớn đang trông nom.',
        en: 'The Nam Rom in my memory is not a landscape. It is water, friends, foolish games, and the feeling of having stepped outside the part of the world adults were watching over.',
      },
      {
        vi: 'Nhiều năm sau, con sông vẫn chảy qua Điện Biên. Mọi thứ quanh nó có thể đổi khác. Còn một buổi chiều nào đó của bọn trẻ ngày ấy, kỳ lạ thay, vẫn ở nguyên trong tôi.',
        en: 'Years later, the river still runs through Dien Bien. Everything around it may change. Yet some afternoon belonging to those children, strangely enough, remains untouched inside me.',
      },
    ],
  },
  'mua-hoa-nhan-hoa-vai': {
    intro: {
      vi: 'Mùa hè ấy không đến bằng ngày tháng. Nó đến thành từng mùi, từng vị, từng tiếng động.',
      en: 'That summer did not arrive through dates. It came as smells, tastes, and sounds.',
    },
    paragraphs: [
      {
        vi: 'Hoa nhãn. Hoa vải. Tiếng ve. Quả chuối xanh chấm muối ớt. Quả nhãn vừa bóc vừa ăn.',
        en: 'Longan blossom. Lychee blossom. Cicadas. Green banana dipped in chili salt. Longan peeled and eaten as we went.',
      },
      {
        vi: 'Có những ngày đi bóc nong nhãn thuê để có một ít tiền chơi game. Hồi đó chuyện ấy chẳng có gì đáng kể. Làm xong thì có tiền. Có tiền thì đi chơi. Mùa hè cứ thế trôi qua.',
        en: 'There were days spent working with longan trays for a little money to play games. At the time there was nothing remarkable about it. Work, get paid, go play. Summer passed that way.',
      },
      {
        vi: 'Bây giờ nhớ lại, tôi không nhớ được từng ngày. Tôi chỉ nhớ cái nóng, những thứ quả, tiếng ve và cảm giác mùa hè khi ấy dài khủng khiếp — như thể chẳng có lý do gì để nó phải kết thúc.',
        en: 'Now I cannot remember each day. I remember the heat, the fruit, the cicadas, and the sense that summer was impossibly long—as though there were no reason it should ever end.',
      },
    ],
  },
  'vuon-nha-ba-noi': {
    intro: {
      vi: 'Ký ức về nhà bà không đến thành một câu chuyện. Nó trở lại thành từng thứ một.',
      en: 'My memory of grandmother’s house does not return as a story. It comes back one thing at a time.',
    },
    paragraphs: [
      {
        vi: 'Nhà ngói ba gian. Cái giếng. Bơm tay. Nhà tắm ngoài trời. Vườn rau. Cây bưởi. Chuồng gà. Bếp củi.',
        en: 'A three-bay tiled house. The well. The hand pump. The outdoor wash area. Vegetable beds. A pomelo tree. The chicken coop. The wood stove.',
      },
      {
        vi: 'Rồi đến mùi lông chó, mùi cám lợn. Những thứ lúc ấy chẳng ai nghĩ cần phải nhớ, bởi ngày nào chúng cũng ở đó.',
        en: 'Then the smell of dog fur, the smell of pig feed. Things nobody thought needed remembering because they were there every day.',
      },
      {
        vi: 'Phía sau là vườn nhãn gần bờ sông. Từ nhà này có thể đi sang nhà khác qua những khoảng sân đầy lá khô. Khi ấy đó không phải một thế giới đã mất, cũng chẳng phải một miền ký ức. Đó chỉ là nhà bà.',
        en: 'Behind it was the longan garden near the river. You could move from one house to another across yards full of dry leaves. Back then it was not a lost world, or a realm of memory. It was simply grandmother’s house.',
      },
    ],
  },
  'pho-cu': {
    intro: {
      vi: 'Tôi vẫn biết con đường ấy ở đâu. Nhưng con đường tôi từng đi qua thì không còn nữa.',
      en: 'I still know where that road is. But the road I once moved through is no longer there.',
    },
    paragraphs: [
      {
        vi: 'Đường vào nhà bà từng là đường đất. Hai bên là những ngôi nhà nhỏ, hàng rào cây găng và những ô đất trống nơi trẻ con trong xóm tụ tập.',
        en: 'The road to grandmother’s house used to be dirt. Small houses, living hedges, and empty plots where neighborhood children gathered stood along both sides.',
      },
      {
        vi: 'Từ những khoảng đất ấy có thể đi sang xóm khác để chơi. Với một đứa trẻ, khu phố không được chia bằng thửa đất hay hàng rào. Chỗ nào chui qua được thì chỗ đó là đường.',
        en: 'From those open plots we could pass into other neighborhoods to play. To a child, the quarter was not divided by property lines or fences. If you could get through, it was a path.',
      },
      {
        vi: 'Sau này mặt đường đổi, nhà cửa kín hơn, những khoảng trống biến mất. Người lớn gọi đó là đô thị hóa. Tôi chỉ thấy một cách đi qua thế giới của bọn trẻ ngày ấy đã không còn.',
        en: 'Later the road changed, houses closed in, and the open spaces disappeared. Adults call that urbanization. I only see that one way children once moved through the world is gone.',
      },
    ],
  },
  'am-thanh-nhung-nam-2000': {
    intro: {
      vi: 'Có một thời chỉ cần nhắc vài cái tên là cả căn phòng, con phố và tuổi của mình cùng trở lại.',
      en: 'There was a time when a few names could bring back a room, a street, and the age you were all at once.',
    },
    paragraphs: [
      {
        vi: 'Lam Trường. Đan Trường. Ưng Hoàng Phúc. H.A.T. Rồi Linkin Park.',
        en: 'Lam Truong. Dan Truong. Ung Hoang Phuc. H.A.T. Then Linkin Park.',
      },
      {
        vi: 'Chúng đi cùng quần áo, kiểu tóc, màn hình máy tính và những thứ khi ấy trông mới đến mức tưởng sẽ chẳng bao giờ cũ. Người ta nghe một bài hát mà không biết nó đang âm thầm ghi ngày tháng lên đời mình.',
        en: 'They came with clothes, haircuts, computer screens, and things that looked so new it seemed impossible they would ever become old. You listened to a song without knowing it was quietly dating your life.',
      },
      {
        vi: 'Bây giờ đôi khi chỉ vài nốt nhạc đầu tiên là đủ. Không phải tôi nhớ lại những năm 2000. Chúng tự trở về.',
        en: 'Now sometimes the first few notes are enough. It is not that I remember the 2000s. They return by themselves.',
      },
    ],
  },
  'con-vat': {
    intro: {
      vi: 'Hôm đó lớp học thêm được nghỉ. Thế là cả nhóm đi chơi thác.',
      en: 'That day our extra class was cancelled. So the whole group went to a waterfall.',
    },
    paragraphs: [
      {
        vi: 'Cả nhóm băng qua những ngọn đồi và làng bản rồi xuống tắm. Mọi chuyện vẫn bình thường cho đến khi có người hét lên.',
        en: 'We crossed hills and villages and went down to swim. Everything was ordinary until someone shouted.',
      },
      {
        vi: 'Lúc ấy cả bọn mới kiểm tra quần áo. Mỗi người đều có một hoặc vài con vắt.',
        en: 'Only then did everyone check their clothes. Each of us had one or several leeches.',
      },
      {
        vi: 'Tôi nhớ hai vết máu tròn trên chiếc quần jeans. Sau đó chỗ bị cắn ngứa và thâm rất lâu. Cả một chuyến đi cuối cùng lại nằm gọn trong hai vết máu ấy.',
        en: 'I remember two round blood marks on my jeans. The bites itched and stayed dark for a long time. In the end, an entire outing somehow fits inside those two marks of blood.',
      },
    ],
  },
  'chuyen-xe-dua-nguoi-chet-di-hoa-tang': {
    intro: {
      vi: 'Một chiếc xe chở người đã chết đi hỏa táng.',
      en: 'A vehicle carrying someone who had died to be cremated.',
    },
    paragraphs: [
      {
        vi: 'Chỉ có vậy.',
        en: 'That is all.',
      },
      {
        vi: 'Chiếc xe đi qua giữa đời sống của những người còn sống. Mọi việc ở hai bên đường vẫn tiếp tục.',
        en: 'The vehicle passes through the lives of those still living. Everything on either side of the road continues.',
      },
      {
        vi: 'Rồi chiếc xe khuất đi.',
        en: 'Then the vehicle disappears.',
      },
    ],
  },
  'di-ve-phia-tay-cho-den-gan-het-duong': {
    intro: {
      vi: 'Cứ đi về phía Tây. Thành phố sẽ nhỏ dần lại phía sau.',
      en: 'Keep going west. The city will grow smaller behind you.',
    },
    paragraphs: [
      {
        vi: 'Đường dài ra. Rừng và các bản lần lượt mở ra. A Pa Chải ở phía trước, nhưng tôi không muốn coi nó như một đích đến phải chinh phục.',
        en: 'The road lengthens. Forests and villages open one after another. A Pa Chai lies ahead, but I do not want to treat it as a destination to conquer.',
      },
      {
        vi: 'Đi xa thêm một chút, những câu chuyện vừa kể về thành phố bắt đầu nằm lại phía sau. Không biến mất. Chỉ nhỏ đi, giống như một nơi mình vừa rời khỏi nhìn qua gương.',
        en: 'A little farther on, the stories just told about the city begin to remain behind. They do not disappear. They only grow smaller, like a place just left behind in a mirror.',
      },
      {
        vi: 'Có lẽ cứ đi cho đến khi con đường gần hết. Đến lúc ấy không cần nó nói hộ mình điều gì nữa.',
        en: 'Perhaps just keep going until the road nearly runs out. By then it no longer needs to say anything on your behalf.',
      },
    ],
  },
};

const CHAPTER_INTROS: Record<string, BookLocalizedText> = {
  'chapter-01-dong-song': {
    vi: 'Tôi nhớ Nậm Rốm không phải vì nó đẹp. Tôi nhớ những lần bọn trẻ trốn người lớn xuống sông.',
    en: 'I remember Nam Rom not because it was beautiful. I remember the times we children slipped away from the adults and went down to the river.',
  },
  'chapter-02-mua-he': {
    vi: 'Hoa nhãn. Hoa vải. Tiếng ve. Muối ớt. Tiền công bóc nong. Game. Một mùa hè có thể chỉ cần ngần ấy để trở về.',
    en: 'Longan blossom. Lychee blossom. Cicadas. Chili salt. Wages from longan trays. Games. Sometimes that is all a summer needs in order to return.',
  },
  'chapter-03-mot-dien-bien-rat-nho': {
    vi: 'Nhà bà không còn nguyên trong trí nhớ như một bức ảnh. Nó còn thành cái giếng, bơm tay, bếp củi, mùi cám lợn, mùi lông chó và những khoảng sân đầy lá khô.',
    en: 'Grandmother’s house does not remain in memory as a complete photograph. It remains as the well, the hand pump, the wood stove, pig feed, dog fur, and yards full of dry leaves.',
  },
  'chapter-04-pho-cu': {
    vi: 'Có những con đường không biến mất khỏi bản đồ. Chúng chỉ biến mất khỏi cách một đứa trẻ từng đi qua chúng.',
    en: 'Some roads do not disappear from maps. They disappear from the way a child once moved through them.',
  },
  'chapter-06-nhung-nam-2000': {
    vi: 'Lam Trường, Đan Trường, Ưng Hoàng Phúc, H.A.T., Linkin Park. Có những năm tháng không cần kể theo thứ tự.',
    en: 'Lam Truong, Dan Truong, Ung Hoang Phuc, H.A.T., Linkin Park. Some years do not need to be told in order.',
  },
  'chapter-09-nhung-thu-kho-quen': {
    vi: 'Một chuyến đi thác. Một tiếng hét. Vài con vắt. Hai vết máu tròn trên quần jeans. Có những ký ức không cần lớn hơn thế.',
    en: 'A trip to a waterfall. A shout. A few leeches. Two round marks of blood on jeans. Some memories do not need to be larger than that.',
  },
  'chapter-10-nguoi-song-nguoi-chet': {
    vi: 'Một người đã chết. Một chiếc xe vẫn phải đi. Những người sống vẫn ở lại.',
    en: 'Someone has died. A vehicle still has to go. The living remain.',
  },
  'chapter-11-di-ve-phia-tay': {
    vi: 'Cứ đi về phía Tây. Qua thành phố, qua những con đường dài hơn, qua rừng và các bản. Đến một lúc, ký ức sẽ tự biết phải nằm lại ở đâu.',
    en: 'Keep going west. Past the city, onto longer roads, through forests and villages. At some point memory will know for itself where to remain.',
  },
};

const paragraphBlock = (body: BookLocalizedText): ContentBlock => ({ type: 'text', body });

export const withLiteraryMemoryForm = (page: BookPage): BookPage => {
  const form = MEMORY_FORMS[page.id];
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

export const withLiteraryMemoryChapterForm = (chapter: BookChapter): BookChapter => {
  const intro = CHAPTER_INTROS[chapter.id];
  return intro ? { ...chapter, intro } : chapter;
};
