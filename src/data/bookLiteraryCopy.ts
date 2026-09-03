import type { BookChapter, BookLocalizedText } from '../types/book';

export const BOOK_CHAPTER_LITERARY_INTROS: Record<string, BookLocalizedText> = {
  'chapter-01-dong-song': {
    vi: 'Nậm Rốm vẫn chảy qua thành phố. Những đứa trẻ bên bờ năm ấy đã lớn, có người đi xa; thỉnh thoảng một buổi chiều cũ lại theo mặt nước trở về.',
    en: 'Nam Rom still runs through the city. The children who once played along its banks have grown up, some have gone far away; now and then an old afternoon returns with the water.',
  },
  'chapter-02-mua-he': {
    vi: 'Mùa hè ngày ấy đến cùng mùi hoa nhãn, hoa vải, tiếng ve rát trong nắng và những buổi chiều dài đến nỗi lũ trẻ tin rằng trời sẽ còn sáng mãi.',
    en: 'Summer came with the scent of longan and lychee blossom, cicadas rasping in the heat, and afternoons so long that the children believed daylight would last forever.',
  },
  'chapter-03-mot-dien-bien-rat-nho': {
    vi: 'Thuở nhỏ, Điện Biên của chúng ta chỉ rộng bằng căn nhà của bà: cái giếng, bếp củi, vườn rau, mùi cám lợn và con đường chạy chân đất sang nhà hàng xóm.',
    en: "In childhood, our Dien Bien was only as large as grandmother's house: the well, the wood stove, vegetable beds, the smell of pig feed, and the path we ran barefoot to the neighbors.",
  },
  'chapter-04-pho-cu': {
    vi: 'Tên phố vẫn còn trên bản đồ, nhưng những lối nhỏ chúng ta từng chạy qua đã khép lại. Trở về đúng nơi, chân vẫn thấy lạc.',
    en: 'The street name remains on the map, but the little paths we once ran along have closed. We return to the right place and our feet still feel lost.',
  },
  'chapter-05-thi-xa': {
    vi: 'Thị xã ngày ấy vừa đủ nhỏ để người ta nhận ra nhau ngoài phố, vừa đủ rộng để một đứa trẻ tin rằng sau mỗi góc đường còn một thế giới chưa mở hết.',
    en: 'The town was small enough for people to recognize one another in the street, yet wide enough for a child to believe that every corner held another unopened world.',
  },
  'chapter-06-nhung-nam-2000': {
    vi: 'Tương lai từng sáng lên từ màn hình máy tính, một bài nhạc mới, chiếc quần rộng và kiểu tóc lạ. Chớp mắt một lần, tất cả đã thành dấu hiệu của một thời rất xa.',
    en: 'The future once glowed from computer screens, a new song, baggy trousers, and an unfamiliar haircut. In what feels like a blink, they have all become signs of a distant time.',
  },
  'chapter-05-long-chao': {
    vi: 'Qua khỏi mấy dãy phố, Điện Biên mở ra đến tận chân núi. Cánh đồng nằm giữa bốn phía xanh thẫm; ngước lên đâu cũng gặp trời.',
    en: 'Beyond a few rows of streets, Dien Bien opens all the way to the mountains. Fields rest inside a dark-green rim; everywhere we look up, there is sky.',
  },
  'chapter-08-nhung-ngon-doi': {
    vi: 'Thành phố đã mọc sát chân những ngọn đồi. Chiều xuống, người lớn đi làm về, trẻ con chơi dưới phố; trên cao, đất và cây giữ một nhịp chậm hơn.',
    en: 'The city has grown to the feet of the hills. At dusk, adults come home from work and children play below; higher up, earth and trees keep a slower rhythm.',
  },
  'chapter-06-1954': {
    vi: 'Ở Điện Biên, một lớp đất có thể giữ nhiều thời khác nhau. Trên mặt đất, thành phố vẫn mở cửa mỗi sáng; dưới bước chân là những dấu vết chưa đi hết vào quá khứ.',
    en: 'In Dien Bien, one layer of earth can hold several times at once. Above ground the city opens every morning; beneath our feet are traces that have not entirely receded into the past.',
  },
  'chapter-09-nhung-thu-kho-quen': {
    vi: 'Trí nhớ bỏ quên nhiều ngày được đánh dấu là quan trọng, rồi giữ rất lâu một con vắt, mùi bùn, tiếng dép ướt và buổi chiều cả bọn trốn xuống thác.',
    en: 'Memory forgets many days marked as important, then keeps a leech, the smell of mud, wet sandals, and the afternoon the whole group slipped away to a waterfall.',
  },
  'chapter-10-nguoi-song-nguoi-chet': {
    vi: 'Người đã mất vẫn ở trong nghĩa trang, trong những chuyến xe trở về và trong câu chuyện người sống đang kể bỗng hạ giọng giữa chừng.',
    en: 'Those who have died remain in cemeteries, in journeys home, and in stories whose tellers suddenly lower their voices halfway through.',
  },
  'chapter-11-di-ve-phia-tay': {
    vi: 'Càng về phía Tây, thành phố càng lùi sâu trong gương. Núi, bản, sương và những khúc cua nối nhau cho đến lúc câu chuyện trong xe thưa dần, chỉ còn con đường nói tiếp.',
    en: 'The farther west we go, the deeper the city recedes in the mirror. Mountains, villages, mist, and bends follow one another until conversation in the vehicle thins and the road carries on alone.',
  },
  'chapter-13-su-noi-loan-va-thanh-pho-ban-dem': {
    vi: 'Đêm xuống, đường thưa người, đèn vàng kéo dài trên mặt nhựa. Đứa trẻ từng bị nhắc phải ngoan vẫn còn đâu đó trong chúng ta, vừa nghe tiếng máy nổ đã muốn đi thêm một vòng.',
    en: 'At night the roads empty and yellow light stretches across the asphalt. Somewhere inside us, the child once told to behave hears an engine start and wants to ride one more circuit.',
  },
};

export const withLiteraryChapterCopy = (chapter: BookChapter): BookChapter => {
  const intro = BOOK_CHAPTER_LITERARY_INTROS[chapter.id];
  return intro ? { ...chapter, intro } : chapter;
};
