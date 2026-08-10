import type { BookChapter, BookExperience, BookPage } from '../types/book';

// Book of Dien Bien is edited as a memory book rather than a destination guide.
// Place names are kept when they are part of the remembered life itself; prose should not name-drop locations merely to establish setting.
// Existing music catalog IDs are reused until chapter-specific tracks are authored.
export const BOOK_CHAPTERS: BookChapter[] = [
  {
    id: 'chapter-01-dong-song',
    number: '01',
    title: { vi: 'Dòng sông', en: 'The River' },
    intro: {
      vi: 'Một thế giới tuổi nhỏ bắt đầu từ nước, bờ sông, những buổi chiều và cảm giác thời gian còn rất dài.',
      en: 'A childhood world begins with water, riverbanks, afternoons, and the feeling that time was still very long.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-1' },
    order: 1,
    status: 'published',
  },
  {
    id: 'chapter-02-mua-he',
    number: '02',
    title: { vi: 'Mùa hè', en: 'Summer' },
    intro: {
      vi: 'Hoa nhãn, hoa vải, tiếng côn trùng, những buổi chiều sáng rực và tuổi nhỏ chơi đến quên giờ.',
      en: 'Longan and lychee blossoms, insects, bright afternoons, and childhood days that forgot the clock.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-2' },
    order: 2,
    status: 'published',
  },
  {
    id: 'chapter-03-mot-dien-bien-rat-nho',
    number: '03',
    title: { vi: 'Một Điện Biên rất nhỏ', en: 'A Very Small Dien Bien' },
    intro: {
      vi: 'Vườn nhà bà nội, mùi cám lợn, căn bếp, khoảng sân và những người sống đủ gần để chuyện của nhà này đôi khi cũng là chuyện của nhà kia.',
      en: 'Grandmother’s garden, the smell of pig feed, kitchens, yards, and people living close enough that one household’s life could spill into another’s.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-1' },
    order: 3,
    status: 'published',
  },
  {
    id: 'chapter-04-pho-cu',
    number: '04',
    title: { vi: 'Phố cũ', en: 'The Old Quarter' },
    intro: {
      vi: 'Nơi tôi lớn lên từng được gọi là phố cũ: hàng xóm gần gũi, tình cảm, có thể va chạm nhưng có việc thì vẫn sang, sống hết mình và sòng phẳng.',
      en: 'The place where I grew up was once called the old quarter: neighbors were close, affectionate, sometimes rough with one another, but present when it mattered, living intensely and dealing straight.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-2' },
    order: 4,
    status: 'published',
  },
  {
    id: 'chapter-05-thi-xa',
    number: '05',
    title: { vi: 'Thị xã', en: 'The Town' },
    intro: {
      vi: 'Một đô thị nhỏ mở rộng trong ký ức bằng những con đường buổi tối, quán chè, ánh sáng từ tivi và những bộ phim làm thế giới bên ngoài bỗng rộng hơn.',
      en: 'A small town expands in memory through evening streets, sweet-soup shops, television light, and films that suddenly made the outside world feel larger.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-2' },
    order: 5,
    status: 'published',
  },
  {
    id: 'chapter-06-nhung-nam-2000',
    number: '06',
    title: { vi: 'Những năm 2000', en: 'The 2000s' },
    intro: {
      vi: 'Âm nhạc, quần áo, kiểu tóc và những thứ từng thấy rất ngầu trở thành chiếc đồng hồ kỳ lạ của ký ức.',
      en: 'Music, clothes, hairstyles, and the things that once seemed impossibly cool become a strange clock for memory.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-2' },
    order: 6,
    status: 'published',
  },
  {
    id: 'chapter-05-long-chao',
    number: '07',
    title: { vi: 'Lòng chảo', en: 'The Basin' },
    intro: {
      vi: 'Sau những ký ức gần, không gian đột nhiên mở rộng: một cánh đồng, một con đường lớn lúc đêm, ánh sáng ở rất xa và những năm tháng đã đi qua.',
      en: 'After close memories, the space suddenly opens: a field, a broad road at night, distant lights, and years that have already passed.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-1' },
    order: 7,
    status: 'published',
  },
  {
    id: 'chapter-06-1954',
    number: '08',
    title: { vi: '1954', en: '1954' },
    intro: {
      vi: 'Một lớp thời gian khác nằm dưới nơi mình đã lớn lên: chiến tranh, những người đã chết, và một thành phố vẫn tiếp tục sống phía trên.',
      en: 'Another layer of time lies beneath the place where I grew up: war, the dead, and a city that keeps living above it.',
    },
    music: { mood: 'epic-slow', trackId: 'thai-epic-1' },
    order: 8,
    status: 'published',
  },
  {
    id: 'chapter-09-nhung-thu-kho-quen',
    number: '09',
    title: { vi: 'Những thứ khó quên', en: 'Things Hard to Forget' },
    intro: {
      vi: 'Những thứ không đủ lớn để thành lịch sử nhưng bám rất dai trong trí nhớ: một con vắt, một cái cây, một quán nhỏ, một chuyện buồn cười.',
      en: 'Things too small to become history yet stubborn in memory: a leech, a tree, a small shop, something ridiculous.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-1' },
    order: 9,
    status: 'published',
  },
  {
    id: 'chapter-10-nguoi-song-nguoi-chet',
    number: '10',
    title: { vi: 'Người sống, người chết', en: 'The Living, the Dead' },
    intro: {
      vi: 'Có những ký ức không cần làm đẹp: một chuyến xe đưa người chết đi hỏa táng, những người từng ở rất gần rồi không còn nữa.',
      en: 'Some memories do not need beautifying: a vehicle taking the dead to cremation, people once close who are no longer here.',
    },
    music: { mood: 'epic-slow', trackId: 'thai-epic-2' },
    order: 10,
    status: 'published',
  },
  {
    id: 'chapter-11-di-ve-phia-tay',
    number: '11',
    title: { vi: 'Đi về phía Tây', en: 'Go West' },
    intro: {
      vi: 'Càng đi về phía Tây, đường cao dần, rừng và các bản mở ra, còn những ký ức vừa kể dần ở lại phía sau.',
      en: 'The farther west the road goes, the higher it climbs into forests and villages, while the memories just told begin to remain behind.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-2' },
    order: 11,
    status: 'published',
  },
];

export const BOOK_PAGES: BookPage[] = [
  {
    id: 'nam-rom-buoi-chieu',
    chapterId: 'chapter-01-dong-song',
    type: 'story',
    title: { vi: 'Một đoạn sông vào buổi chiều', en: 'A Stretch of River in the Afternoon' },
    intro: {
      vi: 'Không cần một sự kiện lớn. Có khi trí nhớ chỉ bắt đầu bằng nước, ánh sáng và một buổi chiều đã ở rất xa.',
      en: 'No large event is required. Sometimes memory begins with water, light, and an afternoon now very far away.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Có những đoạn sông tôi không nhớ bằng một câu chuyện hoàn chỉnh. Chỉ còn cảm giác của buổi chiều, mặt nước và một thời tuổi nhỏ khi ngày dường như dài hơn bây giờ rất nhiều. Ký ức không kể lại mọi thứ. Nó giữ một vài mảnh sáng, rồi để phần còn lại chìm xuống.',
          en: 'There are stretches of river I do not remember as complete stories. What remains is the feeling of afternoon, the water, and a childhood when a day seemed far longer than it does now. Memory does not retell everything. It keeps a few bright fragments and lets the rest sink away.',
        },
      },
    ],
    tags: ['river', 'memory', 'childhood'],
    order: 1,
    status: 'published',
  },
  {
    id: 'mua-hoa-nhan-hoa-vai',
    chapterId: 'chapter-02-mua-he',
    type: 'story',
    title: { vi: 'Mùa hoa nhãn, hoa vải', en: 'Longan and Lychee Blossom Season' },
    intro: {
      vi: 'Một mùa hè được nhớ bằng ánh sáng, cây trái, tiếng côn trùng và cảm giác chơi mà không để ý thời gian.',
      en: 'A summer remembered through light, fruit trees, insects, and the feeling of playing without noticing time.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Mùa hè trong trí nhớ không đứng yên. Nó chói, nóng, có tiếng côn trùng và mùi cây trái. Có những ngày tuổi nhỏ chỉ biết chạy đi chơi, không nghĩ xem mấy giờ và cũng chẳng thấy cần phải nghĩ. Sau này rất nhiều thứ đổi đi, nhưng chỉ cần nhớ đến mùa hoa nhãn, hoa vải là cái khoảng thời gian ấy lại sáng lên.',
          en: 'Summer does not stand still in memory. It is bright and hot, full of insects and the smell of fruit trees. There were childhood days spent simply running out to play, without thinking about the hour or seeing any reason to. Much changed later, yet the season of longan and lychee blossoms can still light that time again.',
        },
      },
    ],
    tags: ['summer', 'childhood', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: 'vuon-nha-ba-noi',
    chapterId: 'chapter-03-mot-dien-bien-rat-nho',
    type: 'story',
    title: { vi: 'Vườn nhà bà nội', en: "Grandmother's Garden" },
    intro: {
      vi: 'Một không gian rất nhỏ nhưng đủ giữ lại cả một phần tuổi thơ.',
      en: 'A very small space that can still hold an entire part of childhood.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Có những nơi không cần rộng để trở thành cả một thế giới. Vườn nhà bà nội nằm trong trí nhớ theo cách như vậy. Tôi không muốn cố dựng lại từng chi tiết đã quên. Chỉ cần biết rằng đã có một khu vườn, một tuổi nhỏ đi qua đó, và nhiều năm sau cái tên ấy vẫn mở được một cánh cửa rất sâu trong ký ức.',
          en: 'Some places do not need to be large to become an entire world. My grandmother’s garden remains in memory that way. I do not want to reconstruct every forgotten detail. It is enough that there was a garden, a childhood that passed through it, and that many years later its name can still open a very deep door in memory.',
        },
      },
    ],
    tags: ['family', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: 'mui-cam-lon',
    chapterId: 'chapter-03-mot-dien-bien-rat-nho',
    type: 'story',
    title: { vi: 'Mùi cám lợn', en: 'The Smell of Pig Feed' },
    intro: {
      vi: 'Một mùi rất bình thường đôi khi sống lâu hơn những chuyện tưởng là quan trọng.',
      en: 'An ordinary smell can sometimes survive longer than things that once seemed important.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Có những ký ức không có cốt truyện. Mùi cám lợn là một thứ như thế. Nó chẳng đẹp, cũng chẳng cần được làm cho đẹp. Nhưng khi nhớ đến, cả một thế giới rất nhỏ của nhà cửa, bếp núc và đời sống ngày ấy bỗng ở gần hơn. Trí nhớ đôi khi giữ lại đúng những thứ không ai nghĩ cần phải giữ.',
          en: 'Some memories have no plot. The smell of pig feed is one of them. It is not beautiful, and does not need to be made beautiful. Yet remembering it brings a whole small world of homes, kitchens, and ordinary life closer again. Memory sometimes keeps precisely what no one thought needed keeping.',
        },
      },
    ],
    tags: ['memory', 'fragment', 'sensory'],
    order: 2,
    status: 'published',
  },
  {
    id: 'pho-cu',
    chapterId: 'chapter-04-pho-cu',
    type: 'story',
    title: { vi: 'Phố cũ', en: 'The Old Quarter' },
    intro: {
      vi: 'Người lớn gọi nơi ấy là phố cũ. Với một đứa trẻ đang lớn lên ở đó, nó từng là toàn bộ hiện tại.',
      en: 'Adults called it the old quarter. To a child growing up there, it was once the whole present.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Người lớn vẫn gọi chỗ ấy là phố cũ. Tôi lớn lên trong cái chữ “cũ” đó mà lúc ấy chẳng thấy nó cũ chút nào. Hàng xóm biết nhau, gần nhau, có thể va chạm rất thật nhưng khi có việc thì vẫn có mặt. Người ta sống tình cảm, sống hết mình và sòng phẳng. Có những điều khi đang ở giữa nó mình không thấy đặc biệt. Chỉ đến khi thời gian kéo mọi người xa ra mới nhận ra đó từng là một cách sống.',
          en: 'Adults kept calling the place the old quarter. I grew up inside that word “old” without finding anything old about it then. Neighbors knew one another and lived close; conflicts could be real, yet people still appeared when something mattered. They were affectionate, intense, and straight with one another. Some ways of living do not seem special while you are inside them. Only after time pulls people apart do you realize they were a world of their own.',
        },
      },
    ],
    tags: ['neighborhood', 'memory', 'community'],
    order: 1,
    status: 'published',
  },
  {
    id: 'thcs-so-1-dien-bien',
    chapterId: 'chapter-04-pho-cu',
    type: 'story',
    title: { vi: 'THCS số 1 Điện Biên', en: 'Dien Bien Secondary School No. 1' },
    intro: {
      vi: 'Một cái tên trường học có thể giữ nguyên cả một quãng tuổi thiếu niên dù rất nhiều chi tiết đã rơi mất.',
      en: 'A school name can hold an entire stretch of adolescence even after many details have fallen away.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Tôi không muốn biến những năm học ở THCS số 1 Điện Biên thành một bản kể đầy đủ. Ký ức về trường không còn đi theo thứ tự. Nó nằm lẫn với bạn bè, phố xá, quần áo, âm nhạc và cảm giác mình đang lớn lên mà không biết chính xác từ lúc nào. Có lẽ trường học trong hồi tưởng thường như vậy: không phải một tòa nhà, mà là cái mốc nơi một phiên bản cũ của mình vẫn còn đứng lại.',
          en: 'I do not want to turn the years at Dien Bien Secondary School No. 1 into a complete record. School memory no longer arrives in order. It mixes with friends, streets, clothes, music, and the feeling of growing up without knowing exactly when it happened. Perhaps school in memory is often like that: not a building, but a marker where an earlier version of oneself still remains.',
        },
      },
    ],
    tags: ['school', 'adolescence', 'memory'],
    order: 2,
    status: 'published',
  },
  {
    id: 'nhung-quan-che',
    chapterId: 'chapter-05-thi-xa',
    type: 'story',
    title: { vi: 'Những quán chè', en: 'The Sweet-Soup Shops' },
    intro: {
      vi: 'Một con đường buổi tối, một dãy quán chè và ánh sáng của những chiếc tivi.',
      en: 'An evening street, a row of sweet-soup shops, and the light of television sets.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Hồi ấy có một con đường ở thị xã mà trong trí nhớ của tôi là cả một dãy quán chè. Buổi tối, ánh sáng từ tivi hắt ra đường. Trên màn hình là Người trong giang hồ, Cú đấm máu, Ỷ Thiên Đồ Long Ký và những thế giới ở rất xa cuộc sống quanh mình. Tôi không còn nhớ hết cốt truyện. Tôi nhớ cảm giác đứng trước những màn hình ấy hơn: ngoài phố vẫn là một thị xã nhỏ, còn bên trong chiếc tivi thế giới rộng đến mức gần như vô tận.',
          en: 'There was a street in the town that memory keeps as almost an entire row of sweet-soup shops. At night, television light spilled onto the road. On the screens were Young and Dangerous, Bloodfight, The Heaven Sword and Dragon Saber, and worlds very far from the life around us. I no longer remember every plot. I remember the feeling of standing before those screens more clearly: outside was still a small town, while inside the television the world seemed nearly endless.',
        },
      },
    ],
    tags: ['town', 'television', '2000s', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: 'am-thanh-nhung-nam-2000',
    chapterId: 'chapter-06-nhung-nam-2000',
    type: 'story',
    title: { vi: 'Âm thanh của những năm 2000', en: 'The Sound of the 2000s' },
    intro: {
      vi: 'Có những năm tháng được định vị chính xác hơn bằng một bài hát, một kiểu tóc hay một chiếc áo hơn là bằng ngày tháng.',
      en: 'Some years are located more precisely by a song, a hairstyle, or a shirt than by dates.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Lam Trường, Đan Trường, Ưng Hoàng Phúc, H.A.T. Những cái tên ấy đi cùng một lớp hình ảnh rất rõ của những năm 2000: cách ăn mặc, kiểu tóc, những thứ lúc ấy nhìn vào thấy rất mới và rất ngầu. Rồi Linkin Park xuất hiện như một âm thanh khác hẳn. Tôi không cần nhớ chính xác năm nào. Chỉ cần những cái tên ấy đứng cạnh nhau là một quãng đời tự hiện ra — cái cũ còn nguyên mà cái mới đã bắt đầu ùa vào.',
          en: 'Lam Truong, Dan Truong, Ung Hoang Phuc, H.A.T. Those names carry a very specific visual layer of the 2000s: clothes, hairstyles, things that looked new and impossibly cool then. Then Linkin Park arrived as something altogether different. I do not need to remember the exact year. Put those names beside one another and a period of life reappears — the old world still intact while the new one was already rushing in.',
        },
      },
    ],
    tags: ['music', 'fashion', '2000s', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: 'canh-dong-muong-thanh-sau-mua-gat',
    chapterId: 'chapter-05-long-chao',
    type: 'place',
    title: { vi: 'Cánh đồng Mường Thanh sau mùa gặt', en: 'Muong Thanh Field After the Harvest' },
    intro: {
      vi: 'Một khoảng rộng đủ để ký ức tự chạy về những năm tháng khác.',
      en: 'An open space wide enough for memory to run back into other years.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Chiều xuống ngoài cánh đồng. Gió đi rất thấp qua mặt đất. Có những nơi chỉ cần đứng yên đủ lâu, thời gian sẽ bắt đầu chạy ngược: một bàn tay từng nắm, một buổi tối đã quên mất ngày tháng, tiếng cười của những người giờ đã ở rất xa. Giữa khoảng rộng ấy, ký ức thanh xuân có thể đến mà không cần báo trước. Rồi một chiếc xe chạy ngoài đường. Mọi thứ lại trở về bình thường.',
          en: 'Evening falls over the field. Wind moves low across the ground. In some places, standing still long enough makes time begin to run backward: a hand once held, an evening whose date is gone, the laughter of people now very far away. In that open space, youth can return without warning. Then a vehicle passes on the road. Everything becomes ordinary again.',
        },
      },
    ],
    location: {
      lat: 21.37668,
      lng: 103.02135,
      radius: 250,
      label: { vi: 'Cánh đồng Mường Thanh', en: 'Muong Thanh Field' },
    },
    legacyTaskIds: ['canh-dong-muong-thanh-cat-banh'],
    tags: ['landscape', 'field', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: '1954-duoi-mot-thanh-pho-dang-song',
    chapterId: 'chapter-06-1954',
    type: 'story',
    title: { vi: '1954 nằm dưới một thành phố đang sống', en: '1954 Beneath a Living City' },
    intro: {
      vi: 'Quá khứ chiến tranh và đời sống hiện tại tồn tại trên cùng một mặt đất.',
      en: 'The wartime past and present-day life occupy the same ground.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Có một lúc người ta nhận ra nơi mình vẫn đi qua hằng ngày còn có một lớp thời gian khác. Người sống đi làm, trẻ con đi học, xe chạy và hàng quán mở cửa. Dưới nhịp sống ấy là 1954, là những người đã chết và những dấu tích không thể chỉ nhìn như phông nền của thành phố. Phần lịch sử này cần được đọc chậm, rồi nếu muốn mới bước ra ngoài để đi tiếp.',
          en: 'At some point, one realizes that the ground crossed every day contains another layer of time. The living go to work, children go to school, vehicles pass, shops open. Beneath that rhythm is 1954, the dead, and traces that cannot be treated merely as the city’s backdrop. This history should be read slowly, and only then, if the reader chooses, continued outside.',
        },
      },
    ],
    tags: ['history', '1954'],
    order: 1,
    status: 'published',
  },
  {
    id: 'con-vat',
    chapterId: 'chapter-09-nhung-thu-kho-quen',
    type: 'story',
    title: { vi: 'Con vắt', en: 'The Leech' },
    intro: {
      vi: 'Có những thứ nhớ mãi đơn giản vì chúng đủ khó chịu.',
      en: 'Some things stay memorable simply because they are unpleasant enough.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Con vắt không cần một đoạn văn đẹp. Chỉ cần nhớ nó từng có mặt trong những chuyến đi rừng là đủ. Một sinh vật bé tí, chẳng có gì lãng mạn, nhưng lại bám rất dai — cả ngoài da lẫn trong trí nhớ.',
          en: 'A leech does not need a beautiful paragraph. It is enough to remember that it was there on trips into the forest. A tiny creature with nothing romantic about it, yet remarkably good at clinging — to skin and to memory.',
        },
      },
    ],
    tags: ['forest', 'fragment', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: 'chuyen-xe-dua-nguoi-chet-di-hoa-tang',
    chapterId: 'chapter-10-nguoi-song-nguoi-chet',
    type: 'story',
    title: { vi: 'Chuyến xe', en: 'The Vehicle' },
    intro: {
      vi: 'Một chuyến xe đưa người chết đi hỏa táng. Chỉ thế thôi cũng đủ làm thay đổi cách nhìn một con đường.',
      en: 'A vehicle taking the dead to cremation. That alone can change how a road is seen.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Có những hình ảnh không cần kể thêm để trở nên nặng. Một chuyến xe đưa người chết đi hỏa táng là một hình ảnh như vậy. Người sống vẫn ở hai bên đường, công việc vẫn tiếp tục, ngày vẫn trôi. Chiếc xe đi qua giữa tất cả những thứ bình thường ấy. Rồi nó khuất đi.',
          en: 'Some images need no additional story to become heavy. A vehicle taking the dead to cremation is one of them. The living remain on both sides of the road, work continues, the day moves on. The vehicle passes through all that ordinary life. Then it disappears.',
        },
      },
    ],
    tags: ['life', 'death', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: 'di-ve-phia-tay-cho-den-gan-het-duong',
    chapterId: 'chapter-11-di-ve-phia-tay',
    type: 'story',
    title: { vi: 'Đi về phía Tây cho đến gần hết đường', en: 'Go West Until the Road Nearly Ends' },
    intro: {
      vi: 'Một chuyển động ra xa khỏi thế giới vừa được kể, về phía đường cao, rừng, các bản và A Pa Chải.',
      en: 'A movement away from the world just told, toward higher roads, forests, villages, and A Pa Chai.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Càng đi về phía Tây, ký ức không biến mất nhưng bắt đầu nằm lại phía sau. Đường cao dần, rừng và các bản mở ra. A Pa Chải ở phía trước, nhưng tôi không muốn coi nó như một dấu chấm hết hay một điểm phải chinh phục. Có lẽ chỉ cần tiếp tục đi cho đến khi con đường gần như không còn gì để nói hộ mình nữa.',
          en: 'The farther west one goes, memory does not disappear, but it begins to remain behind. The road climbs, forests and villages open out. A Pa Chai lies ahead, but I do not want it to become a full stop or a point to conquer. Perhaps it is enough to keep going until the road has almost nothing left to say on one’s behalf.',
        },
      },
    ],
    tags: ['west', 'journey', 'apa-chai'],
    order: 1,
    status: 'published',
  },
];

export const BOOK_EXPERIENCES: BookExperience[] = [
  {
    id: 'experience-muong-thanh-mooncake-sidequest',
    chapterId: 'chapter-05-long-chao',
    type: 'sideQuest',
    title: { vi: 'Cắt bánh bên Cánh đồng Mường Thanh', en: 'Cut a Mooncake by Muong Thanh Field' },
    description: {
      vi: 'Một side quest vui được giữ lại từ hệ thống nhiệm vụ cũ và chỉ xuất hiện sau phần đọc của chương.',
      en: 'A playful side quest retained from the legacy challenge system and shown only after the chapter reading.',
    },
    location: {
      lat: 21.37668,
      lng: 103.02135,
      radius: 250,
      label: { vi: 'Cánh đồng Mường Thanh', en: 'Muong Thanh Field' },
    },
    musicMode: 'fun',
    legacyTaskId: 'canh-dong-muong-thanh-cat-banh',
    order: 1,
    status: 'published',
  },
  {
    id: 'experience-a1-1954-time-train',
    chapterId: 'chapter-06-1954',
    type: 'external',
    title: { vi: '1954 – Chuyến tàu thời gian', en: '1954 – The Time Train' },
    description: {
      vi: 'Trải nghiệm lịch sử nghiêm túc tại Đồi A1, mở sau phần đọc của chương và tiếp tục dùng trải nghiệm web hiện có.',
      en: 'A serious historical experience at A1 Hill, surfaced after the chapter reading and continuing to use the existing web experience.',
    },
    externalUrl: 'https://1954-chuyentauthoigian.netlify.app/',
    musicMode: 'inherit-chapter',
    legacyTaskId: 'doi-a1-chuyen-tau-thoi-gian-1954',
    order: 1,
    status: 'published',
  },
];
