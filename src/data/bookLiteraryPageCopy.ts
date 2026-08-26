import type { BookLocalizedText, BookPage, ContentBlock } from '../types/book';

type LiteraryPageCopy = {
  intro: BookLocalizedText;
  body: BookLocalizedText[];
};

export const BOOK_PAGE_LITERARY_COPY: Record<string, LiteraryPageCopy> = {
  'nam-rom-buoi-chieu': {
    intro: {
      vi: 'Nậm Rốm vẫn chảy qua thành phố. Chỉ có bờ sông trong trí nhớ là không còn ở đúng chỗ cũ.',
      en: 'Nam Rom still runs through the city. Only the riverbank in memory is no longer quite where it used to be.',
    },
    body: [
      {
        vi: 'Ngày ấy, con sông không phải phong cảnh. Nó là một lối trốn khỏi người lớn, là đám bạn rủ nhau xuống nước, là những trò nghịch dại tưởng rồi sẽ quên. Nhiều năm sau, nước vẫn đi qua Điện Biên như chưa từng biết những đứa trẻ ấy đã lớn. Chỉ cần đứng gần bờ một lúc, đôi khi một buổi chiều cũ lại nổi lên rất rõ.',
        en: 'Back then the river was not scenery. It was a way of slipping away from adults, friends calling one another into the water, and foolish games everyone assumed would be forgotten. Years later, the river still passes through Dien Bien as though it never knew those children grew up. Stand near the bank long enough and an old afternoon can sometimes surface intact.',
      },
      {
        vi: 'Trong buổi chiều ấy có mùi bùn non, rêu bám vào đá và tiếng ai gọi với từ một mái nhà bên kia bờ. Nắng rút chậm khỏi mặt nước, để lại những vệt sáng chao nghiêng theo dòng. Khi còn bé, chẳng ai nghĩ con sông đang mang thời gian đi mất. Chỉ đến lúc trở về, nhìn nước vẫn chảy mà không tìm thấy đủ những gương mặt cũ, người ta mới hiểu: Nậm Rốm đã dạy mình bài học đầu tiên về những điều vừa ở lại, vừa không ngừng trôi.',
        en: 'That afternoon carries the smell of new mud, moss on stone, and someone calling from a house across the water. Sunlight withdraws slowly, leaving bright streaks that tilt with the current. As children, nobody imagined the river was carrying time away. Only on returning—finding the water still moving but not all the old faces beside it—does the lesson become clear: Nam Rom first taught us how something can remain and keep departing at once.',
      },
    ],
  },
  'mua-hoa-nhan-hoa-vai': {
    intro: {
      vi: 'Có một mùa hè không cần ngày tháng: chỉ cần hoa nhãn, hoa vải và tiếng ve là biết nó đã về.',
      en: 'There was a summer that needed no dates: longan blossom, lychee blossom, and cicadas were enough to know it had arrived.',
    },
    body: [
      {
        vi: 'Hoa nở rồi quả lớn dần trong cái nắng rất dài. Có chuối xanh chấm muối ớt, có nhãn vừa bóc vừa ăn, có những ngày đi bóc nong thuê chỉ để đổi lấy ít tiền chơi game. Khi còn nhỏ, mùa hè tưởng như một thứ không bao giờ hết. Sau này nhớ lại, nó chỉ còn vài mùi, vài vị và một khoảng sáng rất xa.',
        en: 'Blossom came first, then fruit slowly filled out through the long heat. There was green banana dipped in chili salt, longan eaten while it was being peeled, and days of paid tray work exchanged for a little game money. As a child, summer seemed incapable of ending. Later it survives as a few smells, a few tastes, and a distant field of light.',
      },
      {
        vi: 'Những nong nhãn xếp dưới hiên, nhựa quả dính đầu ngón tay, mấy đồng tiền công còn ấm trong túi quần. Niềm vui ngày ấy nhỏ đến mức có thể đếm được, vậy mà đủ làm một đứa trẻ mong sáng mai đến thật nhanh. Bây giờ mùa hè vẫn về, hoa vẫn nở đúng lúc, chỉ có ngày tháng dường như ngắn hơn. Có lẽ tuổi thơ không mất hẳn; nó co lại, nằm trong vị chua của quả non và tiếng ve bất chợt vang lên giữa một trưa đã rất xa nhà.',
        en: 'Trays of longan rested beneath the eaves, fruit sap clung to fingertips, and a few warm coins of wages waited in a pocket. Joy was small enough to count then, yet large enough to make a child impatient for morning. Summer still returns and blossom still opens on time; only the days seem shorter now. Perhaps childhood never vanishes. It contracts into the sourness of unripe fruit and a sudden cicada call heard one noon, far from home.',
      },
    ],
  },
  'vuon-nha-ba-noi': {
    intro: {
      vi: 'Một căn nhà nhỏ có thể rộng hơn cả thành phố, nếu đó là nơi tuổi thơ từng sống.',
      en: 'A small house can be larger than a city when it is where childhood once lived.',
    },
    body: [
      {
        vi: 'Nhà ngói ba gian, cái giếng với bơm tay, nhà tắm ngoài trời, vườn rau, cây bưởi, chuồng gà, bếp củi. Có mùi lông chó, mùi cám lợn — những thứ khi ấy chẳng ai nghĩ là đáng nhớ. Phía sau là vườn nhãn gần bờ sông; trẻ con có thể đi từ sân nhà này sang sân nhà khác qua lớp lá khô. Một thế giới rất nhỏ, nhưng lúc ở trong đó chẳng ai thấy nó nhỏ.',
        en: 'A three-bay tiled house, the well and hand pump, an outdoor wash area, vegetable beds, a pomelo tree, chicken coop, and wood stove. There was the smell of dog fur and pig feed—things nobody then considered worth remembering. Behind the house stood a longan garden near the river, and children could pass from one yard to another over dry leaves. It was a very small world, though nobody living inside it thought so.',
      },
      {
        vi: 'Buổi tối, tiếng bơm nước thôi kẽo kẹt, khói bếp tan dần dưới mái ngói và khu vườn tối lại thành một nơi sâu hun hút. Từ trong nhà vẫn nghe lá khô xao động, tiếng gà trở mình, tiếng người lớn nói những chuyện trẻ con không cần hiểu. Một căn nhà cũ không biến mất trong một ngày. Nó rời đi từng chút: trước là hàng rào, rồi cái giếng, rồi một mùi quen không còn gặp nữa. Đến sau cùng, nó chỉ còn nguyên vẹn trong trí nhớ của những người từng chạy chân đất qua sân.',
        en: 'At night the hand pump stopped creaking, cooking smoke thinned beneath the tiles, and the garden darkened into something deep and endless. From indoors came dry leaves stirring, chickens shifting, and adults discussing matters children did not need to understand. An old house does not disappear in a day. It leaves by degrees: first the hedge, then the well, then a familiar smell no longer encountered. In the end it remains whole only in the memory of those who once ran barefoot across its yard.',
      },
    ],
  },
  'pho-cu': {
    intro: {
      vi: 'Con đường vẫn còn đâu đó trên bản đồ. Con đường một đứa trẻ từng biết thì đã mất.',
      en: 'The road may still exist on a map. The road a child once knew is gone.',
    },
    body: [
      {
        vi: 'Đường vào nhà bà từng là đường đất. Hai bên là nhà nhỏ, hàng rào cây găng và những ô đất trống nơi trẻ con tụ lại, rồi từ đó len sang xóm khác như thể cả khu phố không có ranh giới. Sau này đường rộng hơn, nhà kín hơn, các khoảng trống dần biến mất. Đô thị hóa không chỉ đổi mặt đường; nó khép lại những lối đi mà người lớn chưa bao giờ biết trẻ con từng có.',
        en: 'The road to grandmother’s house used to be dirt. Small homes, living hedges, and empty plots lined it, places where children gathered and then slipped into the next neighborhood as though the whole quarter had no borders. Later the road widened, houses closed in, and the open ground disappeared. Urbanization changed more than the surface; it sealed paths adults may never have known children possessed.',
      },
      {
        vi: 'Bản đồ giữ được tên phố, nhưng không giữ được lối tắt chui qua hàng rào, chỗ đất lõm đọng nước sau mưa hay góc một đứa trẻ từng đứng chờ bạn. Khi trở lại, người ta có thể đi đúng đường mà vẫn thấy mình lạc. Những ngôi nhà mới không có lỗi; con đường rộng cũng không. Chỉ là dưới lớp bê tông phẳng phiu ấy vẫn còn một con đường đất khác, chỉ hiện ra khi ai đó nhắm mắt và nhớ mình đã từng thấp bé đến thế nào.',
        en: 'A map can preserve a street name, but not the shortcut through a hedge, the hollow where rainwater gathered, or the corner where one child waited for another. On returning, you can follow the correct road and still feel lost. The new houses are not to blame, nor is the wider street. Beneath that even concrete lies another dirt road, visible only when someone closes their eyes and remembers how small they once were.',
      },
    ],
  },
  'thcs-so-1-dien-bien': {
    intro: {
      vi: 'Tên một ngôi trường đôi khi giữ nguyên cả quãng đời mà người trong đó đã đổi khác hoàn toàn.',
      en: 'The name of a school can remain unchanged while everyone who passed through it becomes someone else.',
    },
    body: [
      {
        vi: 'Ký ức về trường không chịu đứng thành hàng. Nó lẫn bạn bè với phố xá, quần áo với âm nhạc, một buổi tan học với cảm giác bỗng nhiên thấy mình lớn hơn hôm qua. Không ai biết chính xác tuổi thiếu niên kết thúc lúc nào. Có lẽ nó chỉ im lặng rời đi, để lại một cái tên trường vẫn còn nguyên.',
        en: 'School memories refuse to line up neatly. Friends mix with streets, clothes with music, an afternoon dismissal with the sudden feeling of being older than yesterday. Nobody knows exactly when adolescence ends. Perhaps it simply leaves quietly, while the school’s name stays behind unchanged.',
      },
      {
        vi: 'Còn lại là tiếng trống vọng qua sân, bụi phấn trên tay áo, mùi giấy vở và đám học sinh ùa ra cổng như nước vỡ bờ. Ngày ấy ai cũng nóng lòng đi về phía trước, chưa biết rồi sẽ có lúc chỉ mong được đứng lại trong một buổi tan trường bình thường. Bạn bè tản đi theo những con đường khác nhau; trong trí nhớ, họ vẫn mặc bộ quần áo năm ấy, vẫn quay sang cười trước khi cuộc đời kịp gọi mỗi người bằng một cái tên khác.',
        en: 'What remains is the drumbeat across the yard, chalk dust on a sleeve, the smell of notebooks, and students flooding through the gate like released water. Everyone was impatient to move forward then, unaware that one day they would long to pause inside an ordinary dismissal. Friends scattered along separate roads; in memory they still wear the clothes of that year and turn to smile before life has time to call each of them by another name.',
      },
    ],
  },
  'goc-pho-hoa-qua-rung': {
    intro: {
      vi: 'Một thị xã có thể được nhớ bằng những thứ bày thấp sát vỉa hè hơn là bằng những tòa nhà cao.',
      en: 'A town can be remembered more clearly by things laid low beside the pavement than by anything tall.',
    },
    body: [
      {
        vi: 'Củ đậu, mắc sim, quả me, một bát muối ớt. Người bán ngồi ở góc phố như một phần tự nhiên của buổi chiều, còn người đi qua chẳng nghĩ mình đang nhìn thấy điều gì đặc biệt. Nhiều năm sau mới hiểu chính những cảnh bình thường nhất ấy mới làm một nơi khác với mọi nơi khác.',
        en: 'Jicama, wild fruit, tamarind, a bowl of chili salt. Sellers sat at street corners as naturally as part of the afternoon, while passersby saw nothing remarkable. Years later, it becomes clear that the most ordinary scenes were what made one place unlike every other.',
      },
      {
        vi: 'Bọn trẻ nhớ đường bằng vị giác: góc này có quả chua làm nhăn mặt, ngã kia có thứ ngọt tím đầu ngón tay, đoạn gần trường chỉ cần vài đồng là đủ chia nhau một túi nhỏ. Thành phố của tuổi thơ vì thế không đo bằng cây số. Nó được nối bằng những lần dừng chân, bằng muối ớt dính quanh miệng và tiếng cười sau một miếng quá chua. Khi những mẹt quả ấy thưa dần, một phần bản đồ cũng lặng lẽ mất theo.',
        en: 'Children remembered the way by taste: sour fruit at one corner, something sweet that stained fingertips purple at the next, and near the school a few coins enough for a small bag to share. Childhood’s city was not measured in kilometers. It was joined by pauses, chili salt at the lips, and laughter after a bite too sharp. As those trays of fruit grew scarce, part of the map quietly disappeared with them.',
      },
    ],
  },
  'nhung-quan-che': {
    intro: {
      vi: 'Có thời cả thế giới bên ngoài đi vào thị xã qua một chiếc tivi đặt trong quán chè.',
      en: 'There was a time when the outside world entered the town through a television in a sweet-soup shop.',
    },
    body: [
      {
        vi: 'Người trong giang hồ, Cú đấm máu, Ỷ Thiên Đồ Long Ký. Chỉ cần những cái tên ấy là một dãy quán, ánh màn hình và những buổi tối cũ tự trở lại. Khi ấy chẳng ai gọi đó là hoài niệm; chỉ là ngồi xem thêm một đoạn, ăn thêm một cốc chè, rồi về nhà khi phim vẫn còn chạy.',
        en: 'Young and Dangerous, Bloodfight, The Heaven Sword and Dragon Saber. The titles alone can bring back a row of shops, television light, and evenings long gone. Nobody called it nostalgia then; it was simply watching a little longer, finishing another sweet soup, and going home while the film was still running.',
      },
      {
        vi: 'Tiếng thìa chạm thành cốc, tiếng quạt quay, tiếng xe máy ngoài đường lẫn vào lời thoại từ chiếc tivi nhỏ. Thế giới xa xôi đến với thị xã chậm rãi như vậy, qua một bộ phim đang chiếu dở và chỗ ngồi phải ghé sát mới nhìn rõ. Quán chè chẳng định trở thành rạp chiếu hay cánh cửa nào cả. Nhưng với bọn trẻ ngồi dưới ánh màn hình xanh, nơi ấy từng rộng hơn mọi con phố chúng biết.',
        en: 'Spoons touched glass, a fan turned, and motorbikes outside mingled with dialogue from the little television. That was how the distant world reached the town: slowly, through a film already in progress and seats drawn close enough to see. The sweet-soup shop never meant to become a cinema or a doorway. Yet to the children sitting in its blue screen-light, it was once larger than every street they knew.',
      },
    ],
  },
  'am-thanh-nhung-nam-2000': {
    intro: {
      vi: 'Có những năm không trở lại bằng ngày tháng. Chúng trở lại ngay từ vài nốt nhạc đầu tiên.',
      en: 'Some years do not return through dates. They return in the first few notes of a song.',
    },
    body: [
      {
        vi: 'Lam Trường, Đan Trường, Ưng Hoàng Phúc, H.A.T., rồi Linkin Park. Những cái tên từng rất mới đi qua quần áo, kiểu tóc, quán xá và những căn phòng có màn hình sáng. Bây giờ chỉ cần một bài hát bật lên bất ngờ, một thời kỳ đã mất có thể đứng ngay giữa hiện tại mà không cần xin phép.',
        en: 'Lam Truong, Dan Truong, Ung Hoang Phuc, H.A.T., then Linkin Park. Names that once felt new moved through clothes, haircuts, shops, and rooms lit by screens. Now a song appearing without warning can place an entire vanished period in the middle of the present without asking permission.',
      },
      {
        vi: 'Mỗi bài hát từng là một lời báo trước rằng ngoài kia có một đời sống khác: sôi động hơn, buồn hơn, táo bạo hơn điều thị xã quen nhìn. Người ta học một kiểu tóc từ màn hình, thuộc một đoạn điệp khúc qua chiếc loa rè, rồi mang chút tương lai ấy ra phố. Tương lai cuối cùng cũng đến, nhưng không giống trong bài hát. Chỉ những giai điệu cũ là trung thành, vẫn mở đúng cánh cửa dẫn về căn phòng và con người của những năm hai nghìn.',
        en: 'Each song once promised another life beyond the town—louder, sadder, more daring than anything familiar. A haircut came from a screen, a chorus was learned through a crackling speaker, and a small piece of the future was carried into the street. The future eventually arrived, though not as the songs described. Only the old melodies stayed faithful, still opening the exact door back to the rooms and people of the two-thousands.',
      },
    ],
  },
  'canh-dong-muong-thanh-sau-mua-gat': {
    intro: {
      vi: 'Ra khỏi phố một chút, lòng chảo mở ra và bầu trời bỗng rộng hơn.',
      en: 'A little beyond the streets, the basin opens and the sky suddenly becomes larger.',
    },
    body: [
      {
        vi: 'Giữa cánh đồng Mường Thanh, gió đi thấp qua mặt đất, đường sá nằm xa hơn và người ta vẫn làm công việc của một ngày bình thường. Lịch sử ở đây không cần lúc nào cũng được gọi tên. Nó nằm cùng ruộng, cùng núi, cùng những người đang sống — một lớp thời gian lặng lẽ dưới cảnh vật trước mắt.',
        en: 'In Muong Thanh Field, wind moves low across the ground, roads seem farther away, and people continue the work of an ordinary day. History does not always need to be named here. It lies with field, mountain, and the people still living—a quiet layer of time beneath the visible landscape.',
      },
      {
        vi: 'Sau mùa gặt, gốc rạ làm cánh đồng ngả màu cũ, đôi chỗ khói rơm bay mỏng và một bóng người đi qua bỗng nhỏ hẳn dưới khoảng trời. Từ đây mới thấy lòng chảo rộng đến đâu, cũng thấy thành phố thực ra được ôm kín thế nào. Có người chỉ đi ngang, có người đã sống cả đời trong vòng núi ấy. Dù thế nào, đứng lâu một chút cũng dễ nghe gió nhắc rằng trước mọi tên gọi lớn lao, nơi này từng là đất, lúa và những mùa nối nhau.',
        en: 'After harvest, the stubble gives the field an older color. Thin straw smoke drifts in places, and a passing figure suddenly looks small beneath the sky. From here the basin reveals both its breadth and how completely the mountains hold the city. Some only pass through; others spend a lifetime within that ring. Stay a little longer and the wind seems to recall that before every grand name, this place was earth, rice, and one season following another.',
      },
    ],
  },
  'su-hung-vi': {
    intro: {
      vi: 'Có những vùng đất đi vào gia đình trước khi kịp đi vào ký ức của một đứa trẻ.',
      en: 'Some places enter a family before they enter a child’s own memory.',
    },
    body: [
      {
        vi: 'Ông nội đến Điện Biên và điều ở lại trong ông là sự hùng vĩ. Cảm giác ấy mạnh đến mức hai chữ “Hùng Vĩ” bước khỏi cảnh quan để đi vào câu chuyện đặt tên trong gia đình. Có lẽ con người gắn với một vùng đất bằng những cách rất lạ: đôi khi chỉ vì lần đầu nhìn quanh và thấy mình muốn ở lại.',
        en: 'Grandfather came to Dien Bien and what stayed with him was its vastness. The feeling was strong enough for “Hung Vi”—grandeur—to leave the landscape and enter the family’s naming story. People attach themselves to places in strange ways; sometimes it begins with simply looking around for the first time and wanting to remain.',
      },
      {
        vi: 'Đứa cháu biết Điện Biên trước hết qua lời kể ấy, nghĩa là một phần quê hương đã có trong mình từ trước cả ký ức. Núi không chỉ đứng ngoài cửa sổ; nó đi vào cách một gia đình gọi nhau, nhắc nhau về người đã đến trước. Nhiều năm sau, khi tự mình nhìn lại những dãy xanh vây quanh lòng chảo, người ta không còn biết đâu là cảnh thật, đâu là cái nhìn được thừa hưởng từ ông. Có lẽ quê nhà chính là chỗ hai điều ấy gặp nhau.',
        en: 'The grandchild first knew Dien Bien through that story, which meant part of home existed before memory itself. The mountains did not remain beyond a window; they entered the way a family named and reminded one another of those who came before. Years later, looking across the green ranges around the basin, it becomes hard to tell the actual landscape from the gaze inherited from Grandfather. Perhaps home is where the two meet.',
      },
    ],
  },
  'nhung-ngon-doi': {
    intro: {
      vi: 'Thành phố lớn lên từng năm. Những ngọn đồi thì gần như không đi đâu cả.',
      en: 'The city grows year by year. The hills barely move at all.',
    },
    body: [
      {
        vi: 'Nhà cửa và đường phố đã bò sát đến chân những điểm cao từng nằm trên bản đồ chiến dịch. Dưới đồi, người ta đi làm, mở cửa hàng, đưa trẻ con về nhà. Trên cao là một lớp ký ức khác. Chiến tranh đã đi qua; địa hình ở lại, và thành phố học cách sống quanh những thứ không thể dời đi.',
        en: 'Houses and streets have crept close to high ground once marked on campaign maps. Below, people go to work, open shops, and take children home. Higher up lies another layer of memory. War passed; the terrain remained, and the city learned to live around what could not be moved.',
      },
      {
        vi: 'Chiều xuống, đèn phố bật lên từng hàng dưới chân đồi. Từ trên cao, tiếng xe cộ và mái nhà nhập lại thành một đời sống bình thường, thứ đời sống mà những người nằm lại có lẽ từng mong sẽ có. Thành phố không thể đứng yên để tưởng niệm mãi, cũng không nên lớn lên bằng cách quên. Nó chỉ có thể tiếp tục ở giữa hai điều ấy: dựng thêm một mái nhà, mở thêm một con đường, rồi ngẩng lên để nhớ vì sao ngọn đồi vẫn còn tên.',
        en: 'At dusk, streetlights come on in rows below the hill. From above, traffic and rooftops gather into ordinary life—the kind of life those who remained in the earth may once have hoped would follow. A city cannot stand still in remembrance forever, nor should it grow by forgetting. It can only continue between the two: raise another roof, open another road, then look up and remember why the hill still has a name.',
      },
    ],
  },
  '1954-duoi-mot-thanh-pho-dang-song': {
    intro: {
      vi: '1954 không chỉ ở trong bảo tàng. Nó nằm dưới một thành phố vẫn mở cửa mỗi sáng.',
      en: '1954 is not only in a museum. It lies beneath a city that still opens every morning.',
    },
    body: [
      {
        vi: 'Người ta đi làm, trẻ con đi học, xe chạy qua những con phố và hàng quán bật đèn. Cùng trên mặt đất ấy từng là một thời khác, với những người đã chết và những dấu tích chưa biến mất. Có lẽ lịch sử ở Điện Biên nên được đọc như vậy: không tách khỏi đời sống, cũng không biến thành phông nền. Đọc chậm, rồi bước ra đường nếu muốn.',
        en: 'People go to work, children go to school, traffic crosses the streets, and shops turn on their lights. The same ground once held another time, with people who died and traces that never fully disappeared. Perhaps history in Dien Bien is best read this way: neither separated from life nor reduced to backdrop. Read slowly, then step outside if you wish.',
      },
      {
        vi: 'Không ai có thể sống mỗi ngày với sự trang nghiêm của một ngày kỷ niệm. Người bán hàng vẫn phải tính tiền, một đứa trẻ vẫn muộn học, đèn đỏ vẫn giữ dòng xe lại ngay trên vùng đất từng rung chuyển. Chính sự bình thường ấy không làm quá khứ nhỏ đi. Trái lại, nó cho thấy sau mất mát, đời sống đã khó nhọc trở về và bén rễ. Năm 1954 vì thế không chỉ nằm phía sau; nó im lặng có mặt trong từng buổi sáng thành phố lại thức dậy.',
        en: 'No one can live every day with the solemnity of an anniversary. A shopkeeper must still count change, a child still runs late for school, and a red light still holds traffic over ground that once shook. Such ordinariness does not diminish the past. It shows how, after loss, life worked its way back and took root. In that sense, 1954 is not only behind the city; it is quietly present each morning the city wakes again.',
      },
    ],
  },
  'con-vat': {
    intro: {
      vi: 'Có những chuyến đi lớn dần trong trí nhớ chỉ vì một thứ rất nhỏ bám vào chân.',
      en: 'Some outings grow larger in memory because of one very small thing that clung to a leg.',
    },
    body: [
      {
        vi: 'Hôm ấy lớp học thêm được nghỉ, cả nhóm đi qua đồi và bản để xuống thác tắm. Đến khi có người hét lên, mọi người mới cúi xuống kiểm tra quần áo: mỗi người một vài con vắt. Hai vết máu tròn trên chiếc quần jeans, rồi ngứa, rồi thâm rất lâu. Trí nhớ đôi khi bất công như thế — nó làm rơi những chuyện lớn và giữ chặt một con vắt.',
        en: 'That day an extra class was cancelled, so the group crossed hills and villages to swim at a waterfall. Only when someone shouted did everyone look down and check their clothes: one or two leeches on each person. Two round blood marks on a pair of jeans, then itching, then dark marks that lasted. Memory can be unfair that way—it drops larger events and holds tightly to a leech.',
      },
      {
        vi: 'Lúc hoảng thì ai cũng sợ, một lát sau lại thi nhau kể xem mình bị nhiều hay ít, như thể nỗi sợ đã kịp biến thành chiến tích. Trên đường về, quần áo còn ẩm, chân còn rát mà câu chuyện đã bắt đầu được phóng đại qua mỗi lần kể. Vết thâm rồi cũng mờ. Nhưng con đường qua đồi, tiếng nước và khoảnh khắc cả bọn cùng cúi nhìn xuống chân vẫn ở nguyên. Đôi khi một kỷ niệm cần một dấu cắn rất nhỏ để biết đường quay về.',
        en: 'Everyone was frightened at first; moments later they competed over who had found more, as though fear had already turned into an achievement. On the way home their clothes were damp and their legs still stung, yet the story grew with every retelling. The dark marks eventually faded. The road over the hill, the sound of water, and the instant everyone looked down at once remained. Sometimes a memory needs one tiny bite to find its way home.',
      },
    ],
  },
  'chuyen-xe-dua-nguoi-chet-di-hoa-tang': {
    intro: {
      vi: 'Có những chuyến xe đi ngang qua đời sống và mang theo một sự im lặng không ai cần giải thích.',
      en: 'Some vehicles pass through ordinary life carrying a silence nobody needs explained.',
    },
    body: [
      {
        vi: 'Chiếc xe đưa người đã mất đi hỏa táng chạy qua một ngày vẫn đang tiếp tục. Hai bên đường, người sống vẫn làm việc, vẫn nói chuyện, vẫn có những việc phải về nhà làm nốt. Không có ranh giới rõ ràng giữa hai thế giới; chỉ có một chiếc xe đi qua rồi nhỏ dần ở phía trước. Một lúc sau, con đường lại như cũ.',
        en: 'The vehicle carrying the dead to cremation moves through a day that continues anyway. Along the road, the living keep working, talking, and carrying unfinished things home. There is no clean border between the two worlds; only a vehicle moving away and becoming smaller ahead. After a while, the road looks ordinary again.',
      },
      {
        vi: 'Không cần tiếng nhạc buồn, con người vẫn tự nhiên hạ giọng khi nhận ra chuyến xe ấy. Có người dừng mắt một chút, có người tiếp tục việc đang làm; ai rồi cũng từng có một cái tên để nhớ. Xe khuất sau khúc đường, bụi lắng xuống, câu chuyện đang nói lại được nối tiếp. Chỉ có một khoảng im mỏng còn ở lại, nhắc rằng đời sống không thắng được cái chết — nó chỉ kiên nhẫn đi tiếp bên cạnh.',
        en: 'No mournful music is needed for voices to lower when that vehicle is recognized. Some pause to watch; others continue their work. Everyone has, or will have, a name to remember. The vehicle disappears beyond a bend, dust settles, and interrupted conversations resume. Only a thin silence remains, a reminder that life does not defeat death—it simply keeps moving beside it.',
      },
    ],
  },
  'di-ve-phia-tay-cho-den-gan-het-duong': {
    intro: {
      vi: 'Đi về phía Tây đủ lâu, thành phố sẽ lùi khỏi gương và con đường bắt đầu tự nói bằng núi, bản và những khúc cua.',
      en: 'Go west long enough and the city slips from the mirror, leaving the road to speak in mountains, villages, and bends.',
    },
    body: [
      {
        vi: 'Càng đi xa, những câu chuyện vừa kể không biến mất; chúng chỉ nằm lại phía sau từng khúc đường. A Pa Chải ở phía trước, nhưng không nhất thiết phải là một dấu chấm hết hay một nơi để chinh phục. Có lẽ chỉ cần đi tiếp, qua rừng và những bản nhỏ, cho đến khi con đường dài hơn mọi điều mình định nói về nó.',
        en: 'The farther the road goes, the stories just told do not disappear; they simply remain behind bend after bend. A Pa Chai lies ahead, but it need not be a full stop or something to conquer. Perhaps it is enough to continue through forest and small villages until the road becomes longer than anything you meant to say about it.',
      },
      {
        vi: 'Phía Tây không mở ra cùng một lúc. Nó hiện dần qua sương còn mắc trên sườn núi, một mái nhà thấp bên đường, mùi khói bếp thoáng vào cửa xe rồi mất. Mỗi khúc cua lấy đi một phần vội vã mang từ thành phố, trả lại cảm giác mình đang ở rất xa mà vẫn trong cùng một miền đất. Đến gần cuối đường, điều đáng nhớ có khi không phải cột mốc. Đó là quãng đường đã khiến người đi thôi hỏi bao giờ tới và bắt đầu thật sự nhìn quanh.',
        en: 'The west does not reveal itself all at once. It appears in mist caught on a mountainside, a low roof by the road, and woodsmoke entering the window for a moment before it is gone. Each bend removes a little of the hurry brought from the city, returning the feeling of being very far away and still within the same homeland. Near the end of the road, the marker may not be what matters. It is the distance that makes a traveler stop asking when they will arrive and begin, at last, to look around.',
      },
    ],
  },
  'thanh-pho-ban-dem-va-mot-phep-thu-nho': {
    intro: {
      vi: 'Đêm làm một thành phố nhỏ rộng ra. Không phải vì đường dài hơn, mà vì những điều ban ngày giữ người ta lại bỗng nhẹ đi.',
      en: 'Night makes a small city feel larger. Not because the roads lengthen, but because the things that hold people back by day become lighter.',
    },
    body: [
      {
        vi: 'Sự nổi loạn ở đây không cần ồn. Chỉ là đi thêm một đoạn trong gió đêm, qua những phố đã thưa người, rồi làm một việc hơi lệch khỏi thói quen: để chiếc xe ở một chỗ đỗ hợp pháp, khóa lại như bình thường và bước đi. Sáng hôm sau có thể quay lại. App chỉ xác nhận bạn đã đến nơi; phần còn lại không phải bằng chứng, mà là một chút tự do bạn tự quyết định có nhận lấy hay không.',
        en: 'Rebellion here does not need to be loud. It can be riding a little farther through the night air and quieter streets, then doing something slightly outside routine: leave the motorbike in a legal parking place, lock it as usual, and walk away. You can return the next morning. The app only confirms that you reached the place; the rest is not evidence, but a small freedom you decide whether to take.',
      },
      {
        vi: 'Dưới đèn vàng, những con phố quen bỗng bớt tên gọi. Cửa hàng đã khép, tiếng máy xe thưa dần, gió ban đêm đi qua cổ áo mang theo mùi cây và mặt đường nguội. Một thành phố nhỏ không có nhiều chỗ để biến mất, nhưng đôi khi chỉ cần không ai hỏi mình đang đi đâu đã là đủ rộng. Phép thử thật sự không nằm ở chiếc xe để lại. Nó nằm ở khoảnh khắc ta tự tin rằng sáng mai mình sẽ quay về, và đêm nay có thể sống một giờ theo ý mình.',
        en: 'Under yellow lamps, familiar streets begin to lose their names. Shops are closed, engines grow infrequent, and night air slips through a collar carrying the smell of trees and cooling asphalt. A small city offers few places to disappear, yet sometimes the absence of anyone asking where you are going is space enough. The true test is not the motorbike left behind. It is trusting that you will return in the morning, and that tonight one hour may belong entirely to you.',
      },
    ],
  },
};

export const withLiteraryPageCopy = (page: BookPage): BookPage => {
  const copy = BOOK_PAGE_LITERARY_COPY[page.id];
  if (!copy) return page;

  return {
    ...page,
    intro: copy.intro,
    blocks: page.blocks.flatMap<ContentBlock>((block) => (
      block.type === 'text'
        ? copy.body.map((body) => ({ ...block, body }))
        : [block]
    )),
  };
};
