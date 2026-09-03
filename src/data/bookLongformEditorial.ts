import type { BookLocalizedText, BookPage, ContentBlock } from '../types/book';

type LongformEditorialCopy = {
  intro: BookLocalizedText;
  body: BookLocalizedText[];
};

/**
 * Longform editorial pass requested for the memory-heavy chapters.
 *
 * The aim is roughly a five-minute Vietnamese read per named chapter/story arc while
 * preserving the original memories and literary intent. Chapters with two pages split
 * that reading time across both pages instead of repeating the same idea twice.
 */
const BOOK_LONGFORM_EDITORIAL_COPY: Record<string, LongformEditorialCopy> = {
  'vuon-nha-ba-noi': {
    intro: {
      vi: `Điện Biên của một đứa trẻ đôi khi không rộng bằng một tỉnh, cũng chưa rộng bằng một thị xã. Nó chỉ vừa bằng căn nhà của bà, cái giếng, khu vườn và những lối đi mà đôi chân nhỏ có thể chạy hết trước khi trời tối.`,
      en: `For a child, Dien Bien was not yet as large as a province, or even as large as a town. It was only as wide as grandmother's house, the well, the garden, and the paths small feet could cover before dark.`,
    },
    body: [
      {
        vi: `Ngày ấy, thế giới có một kích thước khác. Người lớn có thể nói đến huyện này, xã kia, đến những con đường đi xa mà trẻ con không hình dung nổi, nhưng Điện Biên trong đầu tôi chỉ bắt đầu từ căn nhà ngói ba gian của bà. Cánh cửa mở ra sân, sân dẫn tới cái giếng, cái giếng đứng cạnh chiếc bơm tay, rồi thêm vài bước nữa là vườn rau, cây bưởi, chuồng gà, bếp củi. Mọi thứ gần nhau đến mức một tiếng gọi từ trong bếp có thể với tới tận cuối vườn. Bây giờ nghĩ lại mới thấy nơi ấy thật nhỏ. Khi còn ở trong đó, chưa bao giờ tôi thấy nó nhỏ cả. Nó đủ rộng để có chỗ trốn, chỗ chơi, chỗ bị mắng, chỗ ngồi một mình và cả những góc mà một đứa trẻ tin rằng người lớn không biết đến.`,
        en: `The world had a different scale then. Adults could speak of distant districts, communes, and roads a child could barely imagine, but the Dien Bien in my head began at grandmother's three-bay tiled house. The doorway opened to the yard, the yard led to the well, the well stood beside the hand pump, and a few more steps reached the vegetable beds, the pomelo tree, the chicken coop, and the wood stove. Everything was close enough for a call from the kitchen to reach the far end of the garden. Looking back, the place was small. Living inside it, I never felt that. It was large enough for hiding, playing, being scolded, sitting alone, and for corners a child believed adults did not know existed.`,
      },
      {
        vi: `Ký ức giữ lại những thứ rất lạ. Nó không nhớ căn nhà theo bản vẽ, mà nhớ bằng mùi. Mùi khói bếp quẩn dưới mái ngói. Mùi đất ẩm quanh giếng. Mùi lông chó khi con vật vừa chạy ngoài sân về. Mùi cám lợn, thứ mùi ngày ấy bình thường đến mức chẳng ai nghĩ sau này lại có thể khiến cả một buổi chiều cũ trở về. Có tiếng chiếc bơm tay kẽo kẹt, nước đổ vào chậu, tiếng gà bới dưới lớp lá, tiếng củi bắt lửa trong bếp. Nhà tắm ở ngoài trời, đơn sơ đến mức bây giờ kể lại nghe như thuộc về một thời rất xa, nhưng khi ấy chẳng có gì cần phải giải thích. Cuộc sống vốn là như thế. Một đứa trẻ nhận thế giới bằng da thịt trước khi biết dùng những từ như nghèo, đủ đầy, cũ hay mới để phân loại nó.`,
        en: `Memory keeps strange things. It does not remember the house as a floor plan, but as smells: wood smoke caught beneath the tiles, damp earth around the well, dog fur after the animal had run through the yard, pig feed so ordinary then that nobody could have guessed it might one day summon an entire afternoon. There was the creak of the hand pump, water falling into a basin, chickens scratching through leaves, firewood catching in the stove. The wash area stood outside, simple enough that describing it now makes it sound like another era, though then nothing about it required explanation. Life was simply arranged that way. A child receives the world through the body long before learning words such as poor, sufficient, old, or new.`,
      },
      {
        vi: `Phía sau nhà là vườn nhãn gần bờ sông. Ở đó, ranh giới giữa nhà này với nhà khác không cứng như sau này. Có thể đi qua một khoảng sân, men theo hàng cây, bước lên lớp lá khô rồi bỗng thấy mình đã sang nhà hàng xóm. Trẻ con trong xóm hiểu một hệ thống đường riêng không cần biển chỉ dẫn. Một khe hàng rào là lối tắt. Một gốc cây là chỗ hẹn. Một khoảng đất trống có thể biến thành sân chơi cho đến khi người lớn gọi về ăn cơm. Chúng tôi không nghĩ mình đang có tự do; chỉ nghĩ đó là cách bình thường để đi từ nơi này sang nơi khác. Sau này khi các bức tường mọc lên, cổng khép lại, đất trống có chủ rõ ràng hơn, mới hiểu tự do tuổi nhỏ đôi khi chỉ là việc có quá nhiều lối đi mà chưa ai kịp cấm.`,
        en: `Behind the house was a longan garden near the river. Boundaries between one home and the next were softer than they would later become. You could cross a yard, follow a row of trees, step through dry leaves, and suddenly realize you were already at a neighbor's house. Children knew a private road system with no signs. A gap in a hedge was a shortcut. A tree was a meeting point. An empty patch of ground could become a playground until an adult called everyone home for dinner. We did not think of this as freedom; it was simply how one moved. Only later, when walls rose, gates closed, and every empty plot acquired a clearer owner, did it become obvious that childhood freedom can be nothing more complicated than having too many paths for anyone to forbid yet.`,
      },
      {
        vi: `Buổi chiều trong khu vườn có một nhịp rất chậm. Nắng đổi chỗ trên sân. Lá khô bị chân trẻ con đá tung rồi lại nằm im. Có những ngày chẳng xảy ra chuyện gì đáng kể, nhưng chính những ngày ấy bây giờ lại có một sức nặng kỳ lạ. Người lớn làm việc của người lớn; trẻ con tự tìm việc của trẻ con. Không ai đứng giữa sân tuyên bố rằng đây là tuổi thơ và phải nhớ lấy. Vì thế mọi thứ đi qua tự nhiên đến mức khi nó biến mất, ta không kịp biết lần cuối là lần nào. Lần cuối bơm nước ở cái giếng ấy. Lần cuối chạy qua sân nhà bên. Lần cuối nghe tiếng củi nổ trong bếp. Những cái “lần cuối” thường chỉ được đặt tên nhiều năm sau, khi chẳng còn cách nào quay lại để làm thêm một lần nữa.`,
        en: `Afternoons in the garden moved slowly. Sunlight shifted across the yard. Dry leaves scattered under children's feet and became still again. Many days contained nothing worth reporting, yet those are the days that now carry a peculiar weight. Adults did adult things; children invented their own work. Nobody stood in the yard announcing that this was childhood and should be remembered. Everything passed too naturally for us to notice the final time: the last time pumping water from that well, the last run through a neighbor's yard, the last crackle of firewood in that kitchen. “Last times” are usually named years later, when there is no longer any way to return and do them once more.`,
      },
      {
        vi: `Rồi căn nhà cũ rời khỏi đời sống từng phần một. Không có một buổi sáng nào thức dậy và thấy cả thế giới ấy biến mất. Trước tiên có thể là một hàng rào thay đổi, một khoảng đất được xây kín, một cái cây không còn nữa. Rồi đến cái giếng, cái bếp, một mùi quen lâu dần không gặp. Sự thay đổi lịch sự đến mức người ta vẫn tiếp tục sống, vẫn đi qua đó, vẫn gọi tên con đường như cũ. Chỉ ký ức là ngoan cố giữ một phiên bản khác. Trong phiên bản ấy, sân vẫn rộng, lá vẫn khô dưới chân, nhà bà vẫn ở đúng chỗ của nó và một đứa trẻ có thể chạy từ đầu này sang đầu kia mà không cần nghĩ đến thời gian.`,
        en: `The old house then left ordinary life piece by piece. There was no single morning when its whole world vanished. First perhaps a hedge changed, an empty plot was filled, a tree was gone. Then the well, the kitchen, a familiar smell no longer encountered. Change was polite enough that people kept living, kept passing through, kept using the same street names. Only memory stubbornly held another version. In that version the yard is still wide, leaves still dry beneath the feet, grandmother's house still exactly where it belongs, and a child can run from one end to the other without thinking about time.`,
      },
      {
        vi: `Có lẽ vì thế chương này là một Điện Biên rất nhỏ. Không phải vì Điện Biên nhỏ, mà vì quê hương đầu tiên của mỗi người thường bắt đầu trong một phạm vi rất hẹp: nơi có người gọi mình vào ăn cơm, nơi biết cái cây nào cho bóng mát, nơi có thể nhận ra nhà chỉ bằng mùi khói. Sau này ta học thêm những ngọn đồi, cánh đồng, lịch sử, những con đường dài về phía Tây. Bản đồ mở rộng dần. Nhưng ở lớp sâu nhất, Điện Biên vẫn có thể chỉ là căn nhà ba gian, cái bơm tay và khu vườn của bà. Một nơi nhỏ đến mức có thể đi hết bằng vài chục bước, nhưng phải mất gần cả đời mới hiểu nó đã từng rộng đến đâu.`,
        en: `That is perhaps why this chapter is a very small Dien Bien. Not because Dien Bien itself is small, but because everyone's first homeland usually begins within a narrow radius: where someone calls you in for dinner, where you know which tree gives shade, where the smell of smoke alone tells you that you are home. Later come the hills, the fields, history, and long roads west. The map expands. Yet at the deepest layer Dien Bien can still be the three-bay house, the hand pump, and grandmother's garden—a place crossed in a few dozen steps, but one that can take most of a lifetime to understand how large it once was.`,
      },
    ],
  },

  'pho-cu': {
    intro: {
      vi: `Tên đường còn nguyên trên bản đồ. Con đường chúng ta nhớ đã lùi xuống dưới mặt bê tông, sau những cánh cổng mới và trong bước chân của mấy đứa trẻ ngày ấy.`,
      en: `The street name remains on the map. The road we remember has slipped beneath the concrete, behind new gates, and into the footsteps of the children we once were.`,
    },
    body: [
      {
        vi: `Đường vào nhà bà ngày ấy còn là đường đất. Hai bên có nhà thấp, hàng rào cây găng và những ô đất trống được bọn trẻ tự chia thành lãnh địa. Sau mưa, bánh xe để lại những rãnh lầy; muốn qua vũng nước phải lựa đúng mấy chỗ đất cao. Trời nắng, bụi bám vào chân, dép và gấu quần. Chúng ta thuộc con đường bằng những dấu hiệu chẳng ai ghi lại: khúc quanh có con chó hay sủa, bờ rào nhà một đứa bạn, chỗ từng ngã đau, đoạn có thể chạy trong chạng vạng mà chân vẫn tự biết đường.`,
        en: `The road to grandmother's house was still dirt then. Low homes, living hedges, and empty plots lined it, and the children divided the open ground into territories of their own. After rain, wheels left muddy ruts and crossing a puddle meant choosing the few raised patches. In dry weather dust settled on feet, sandals, and trouser cuffs. We knew the road by signs nobody recorded: the bend with the barking dog, a friend's hedge, the place of a hard fall, the stretch we could run at dusk while our feet found their own way.`,
      },
      {
        vi: `Từ đường chính tỏa ra một mạng lối đi chỉ bọn trẻ biết. Chui qua khe hàng rào, cắt ngang mảnh đất trống, men sau một căn nhà là sang xóm khác. Người lớn hiếm khi dùng những lối ấy, nhưng cả khu phố âm thầm để trẻ con đi qua. Muốn tìm nhau, chúng ta cứ chạy một vòng qua mấy chỗ quen. Sớm muộn cũng gặp tiếng gọi, một chiếc xe đạp quăng bên gốc cây, vài đứa đang lúi húi với trò mới. Những khoảng trống giữa các ngôi nhà đã tự thành sân chơi như vậy, chẳng ai dựng biển hay phân công.`,
        en: `A network of paths known only to the children branched from the main road. Through a gap in a hedge, across an empty plot, behind one house, and we were in another part of the neighbourhood. Adults rarely used those routes, but the whole street quietly allowed children through. To find one another, we ran a circuit of the usual places. Sooner or later there was a shout, a bicycle dropped beside a tree, a few children absorbed in a new game. The spaces between homes became playgrounds on their own, with no signs or organizers.`,
      },
      {
        vi: `Rồi đường được đổ bê tông, nhà xây kín dần, tường thay hàng cây và đất trống có chủ rõ ràng. Người trong xóm bớt cảnh lội bùn, nhà cửa chắc chắn hơn; thành phố lớn lên bằng những đổi thay rất cụ thể ấy. Cùng lúc, một khe rào khép lại, lối tắt vòng sau bếp biến mất, sân chơi hôm qua thành nền nhà hôm nay. Nhiều năm sau trở về, chúng ta có thể đứng đúng tọa độ mà vẫn chưa tới nơi mình tìm. Con đường trước mặt thuộc về hiện tại. Con đường đất cũ nằm dưới nó, nguyên vẹn ở một tầng không máy móc nào đào thấy.`,
        en: `Then concrete covered the road, houses filled their plots, walls replaced hedges, and open land acquired clear owners. The neighbourhood no longer had to wade through mud and homes became sturdier; the city grew through changes as practical as these. At the same time a gap in a hedge closed, a shortcut behind a kitchen vanished, yesterday's playground became today's foundation. Years later, we can return to the exact coordinates and still not reach the place we seek. The road before us belongs to the present. The old dirt road lies beneath it, intact in a layer no machine can excavate.`,
      },
      {
        vi: `Chúng ta cũng trở về bằng một cơ thể khác: mắt nhìn cao hơn, bước chân dài hơn, trong đầu đã có việc phải làm tiếp. Khoảng đất từng rộng như cả thế giới giờ đo được bằng vài chục bước. Đứng yên một lúc, cảnh cũ đôi khi chồng lên cảnh mới. Bụi đường hiện dưới mặt bê tông. Hàng cây đi xuyên qua bức tường. Có tiếng một đứa gọi bạn rồi chạy khuất sau nhà. Âm thanh ấy tắt rất nhanh; phố lại là phố của hôm nay.`,
        en: `We also return in a different body: our eyes are higher, our stride longer, our minds already occupied by whatever comes next. Ground that once seemed as wide as the world now measures only a few dozen steps. Stand still for a while and the old view sometimes overlaps the new one. Dust appears beneath concrete. A hedge passes through a wall. A child calls to a friend and disappears behind a house. The sound fades quickly; the street belongs to today again.`,
      },
    ],
  },

  'thcs-so-1-dien-bien': {
    intro: {
      vi: `Trong phố cũ có một ngôi trường. Ở đó, chúng ta bắt đầu cao lên, biết giấu vài điều trong lòng và tin quãng đời phía trước còn dài vô tận.`,
      en: `There was a school in the old quarter. There we began to grow taller, learned to keep a few things to ourselves, and believed the life ahead was endless.`,
    },
    body: [
      {
        vi: `Ký ức về THCS số 1 Điện Biên chẳng chịu xếp theo từng năm học. Buổi chào cờ lẫn vào giờ ra chơi, bụi phấn trên tay áo đi cùng tiếng trống tan trường, khuôn mặt bạn bè hiện ra với một kiểu tóc và bài hát đang thịnh hành ngoài phố. Có người đã nhiều năm không gặp, vậy mà trong đầu vẫn đứng nguyên ở tuổi mười ba, mười bốn, quay sang nói một câu rất vu vơ. Hồi ấy, một ánh nhìn cũng thành chuyện lớn. Bây giờ cả quãng đời chỉ còn vài mảnh, càng cố xếp càng sai thứ tự.`,
        en: `Memories of Dien Bien Secondary School No. 1 refuse to line up by school year. A flag ceremony blends into recess, chalk dust on a sleeve accompanies the dismissal drum, and a friend's face appears with a particular haircut and whatever song was popular in town. Some people have not been seen for years, yet in our minds they remain thirteen or fourteen, turning to say something entirely casual. Back then, a single glance could become a major event. Now the whole period survives in a few fragments that fall further out of order the more we try to arrange them.`,
      },
      {
        vi: `Tan học, học sinh ùa qua cổng như nước vừa tháo. Ai cũng vội về phía phần còn lại của buổi chiều; trong lòng còn vội hơn nữa về phía ngày mình được lớn. Chúng ta muốn tự do hơn, muốn đi xa hơn; một buổi tan trường bình thường có gì để tiếc đâu. Nhiều năm sau, giữa một ngày bận rộn, tiếng trống trường nào đó bỗng làm chân chậm lại. Mùi giấy vở, nắng trên vai, con đường về nhà chưa hề biết đời mình sẽ rẽ sang đâu—tất cả trở lại trong vài giây.`,
        en: `At dismissal, students poured through the gate like released water. Everyone hurried toward the rest of the afternoon; inwardly, we hurried even faster toward the day we would be grown. We wanted more freedom and greater distance; what was there to miss about an ordinary end to a school day? Years later, in the middle of a busy day, a drum from some school suddenly slows our steps. The smell of notebooks, sunlight on our shoulders, the road home before it knew where our lives would turn—all return for a few seconds.`,
      },
      {
        vi: `Ngôi trường có thể vẫn đứng đó, mỗi năm lại đón một lớp học sinh mới. Tiếng trống hôm nay vang qua đúng khoảng sân cũ, nhưng buổi tan trường của chúng ta đã khép lại từ lâu. Đám bạn từng đi chung một đoạn nay tản về nhiều thành phố, mang những công việc và gia đình khác nhau. Trong trí nhớ, cả nhóm vẫn ở ngoài cổng: một đứa dắt xe, một đứa gọi với theo, vài đứa còn nấn ná. Con phố, ngôi trường và tuổi thiếu niên giữ nhau trong khoảnh khắc ấy.`,
        en: `The school may still stand, welcoming another class every year. Today's drum crosses the same yard, but our own dismissal ended long ago. Friends who once walked part of the way together have scattered to different cities, carrying different work and families. In memory, the group remains outside the gate: one child wheeling a bicycle, another calling after someone, a few still lingering. The street, the school, and adolescence hold one another inside that moment.`,
      },
    ],
  },

  'goc-pho-hoa-qua-rung': {
    intro: {
      vi: `Thị xã cũ được nhận ra từ những thứ nằm thấp sát mặt đường: vài mẹt quả rừng, một bát muối ớt, người bán quen và buổi chiều trôi chậm dưới chân đồi.`,
      en: `The old town could be recognized by things set low beside the road: trays of forest fruit, a bowl of chilli salt, a familiar seller, and an afternoon moving slowly beneath the hills.`,
    },
    body: [
      {
        vi: `Củ đậu, mắc sim, quả me; vị chua, chát, ngọt nằm lẫn trong những mẹt tre thấp hơn đầu gối người đi đường. Bên cạnh là bát muối ớt đỏ au. Chỉ một đầu quả chạm vào đó cũng đủ làm cả miệng nóng ran. Người bán ngồi sau mẹt hàng, nhớ mặt mấy đứa hay ghé, vừa nhặt quả vừa hỏi chuyện nhà. Chúng ta mua một túi nhỏ, nhận thêm dúm muối gói trong mảnh nilon rồi đi tiếp. Hôm sau qua góc ấy vẫn thấy người, thấy mẹt, thấy màu đỏ của muối; sự có mặt đều đặn khiến ai cũng tưởng cảnh này sẽ còn mãi.`,
        en: `Jicama, wild berries, tamarind; sour, astringent, and sweet tastes mingled in bamboo trays lower than a passerby's knee. Beside them sat a bowl of vivid red chilli salt. Touching one end of a fruit to it was enough to set the whole mouth burning. The seller sat behind the trays, remembering the children who came often, sorting fruit while asking after their families. We bought a small bag, accepted a pinch of salt wrapped in plastic, and moved on. The next day the person, the trays, and the red bowl were still at the corner; their steady presence made everyone assume the scene would last.`,
      },
      {
        vi: `Bọn trẻ nhớ thị xã bằng vị giác sớm hơn bằng tên đường. Góc này có quả chua làm nhăn mặt, góc kia có thứ để lại màu tím trên đầu ngón tay. Đoạn gần trường, vài đồng đủ mua một túi để cả nhóm chuyền nhau. Đứa nào cũng chấm quá tay, vừa xuýt xoa vừa cười. Từ đó, đường về nhà có thêm những mốc riêng, đo bằng chỗ dừng chân và thứ vị còn dính quanh miệng. Số nhà rồi có thể quên. Vị chua thì ở lại rất dai.`,
        en: `Children learned the town by taste before they learned its street names. One corner sold fruit sharp enough to crease the face; another sold something that stained fingertips purple. Near the school, a few coins bought one bag for the group to pass around. Everyone dipped too deeply into the salt, laughing while their mouths burned. From then on, the road home acquired private markers, measured by stopping places and flavours left around the lips. House numbers can be forgotten. Sourness stays for a very long time.`,
      },
      {
        vi: `Đi một vòng thị xã thường gặp vài khuôn mặt quen. Có người vẫn ngồi chỗ hôm qua, có chuyện từ khu bên kia đã theo người bán hàng sang tới góc phố này. Hồi trẻ, sự lặp lại ấy làm chúng ta sốt ruột. Ai cũng mong thêm cửa hàng, thêm ánh sáng, thêm một dấu hiệu cho thấy nơi mình sống đang kịp với thế giới. Rồi một ngày người bán quen vắng mặt. Xe vẫn chạy, nhà vẫn mở, góc phố chẳng thiếu đi mét vuông nào, vậy mà lúc ngang qua mắt cứ tìm về chỗ cũ.`,
        en: `A circuit of the town usually brought a few familiar faces. Someone remained in yesterday's seat; news from another neighbourhood had travelled with a vendor to this corner. When we were young, the repetition made us restless. Everyone wanted more shops, more light, another sign that the place where we lived was keeping pace with the world. Then one day the familiar seller was absent. Traffic continued, houses opened, the corner had lost none of its area, yet our eyes kept returning to the old spot.`,
      },
      {
        vi: `Bây giờ hàng hóa nhiều hơn, một chiếc điện thoại có thể gọi đồ đến tận cửa. Chúng ta vẫn vui vì những tiện lợi ấy, rồi thỉnh thoảng nhớ động tác bước ra phố, đứng cạnh vài người, cùng cúi xuống một mẹt quả. Chỉ mấy phút thôi: hỏi giá, chọn quả, xin thêm chút muối, nghe một câu chuyện đang kể dở. Phố ngày ấy ở rất gần mặt đất. Trong ký ức, quê hương có lúc cũng thấp như vậy—vừa tầm một bàn tay đưa xuống, chạm vào quả me rồi đưa lên miệng.`,
        en: `There are more goods now, and a phone can bring almost anything to the door. We enjoy that convenience and still sometimes remember the act of stepping into the street, standing beside a few people, and bending together over a tray of fruit. It lasted only minutes: asking the price, choosing a piece, requesting a little more salt, hearing part of a conversation already underway. The town then sat close to the ground. In memory, home can be that low too—within reach of a hand descending to a tamarind and lifting it to the mouth.`,
      },
    ],
  },

  'nhung-quan-che': {
    intro: {
      vi: `Hồi thế giới còn chưa nằm gọn trong lòng bàn tay, nó đi vào Điện Biên qua chiếc tivi nhỏ trong quán chè, ánh màn hình xanh trên mặt bọn trẻ và tiếng thìa chạm cốc ngoài hiên.`,
      en: `Before the world fit into the palm of a hand, it entered Dien Bien through a small television in a sweet-soup shop, blue screen-light on children's faces, and spoons touching glasses by the shopfront.`,
    },
    body: [
      {
        vi: `Ỷ Thiên Đồ Long Ký, Thần Điêu Đại Hiệp, Thiên Long Bát Bộ—đọc lại mấy cái tên ấy, cả dãy quán tự hiện lên. Mặt đường tối, các quán lùi vào trong một khoảng đất, xe đạp dựng lộn xộn, ghế nhựa thấp kéo quanh chiếc tivi. Đứa đến muộn hỏi nhỏ phim tới đâu rồi. Đứa xem được nửa tập hôm trước ghé tai kể tiếp bằng trí nhớ của mình. Câu chuyện võ hiệp chạy khỏi màn hình, theo bọn trẻ về tận lớp học và được thêm thắt qua mỗi lần kể.`,
        en: `The Heaven Sword and Dragon Saber, The Return of the Condor Heroes, Demi-Gods and Semi-Devils—read those titles again and the whole row of shops appears. The road is dark, the shops sit back across a strip of ground, bicycles lean in disorder, and low plastic stools gather around the television. A late arrival whispers to ask how far the story has gone. A child who saw half an episode the day before leans over to continue it from memory. The martial-arts tale escapes the screen, follows the children back to school, and grows with every retelling.`,
      },
      {
        vi: `Chiếc tivi nhỏ, tiếng có lúc rè, hình lâu lâu chạy một dải nhiễu. Vậy mà từ cái màn hình ấy mở ra Hồng Kông, giang hồ võ lâm, những thành phố ban đêm và những con người khác hẳn người chúng ta gặp hằng ngày. Trên đầu, quạt quay lạch cạch. Ngoài đường, một chiếc xe máy vụt qua. Trong quán, có người gọi thêm cốc chè đúng lúc nhân vật trên phim rút kiếm. Tất cả trộn thành âm thanh của một tối tuổi nhỏ: phim đang hay, bạn bè ngồi sát bên, chưa đứa nào muốn về.`,
        en: `The television was small, the sound sometimes rasped, and now and then a band of static crossed the picture. Still, its screen opened onto Hong Kong, martial-arts worlds, cities at night, and people unlike anyone we met each day. Overhead, the fan clicked. Outside, a motorbike passed. In the shop, someone ordered another sweet soup just as a character drew a sword. Everything blended into the sound of a childhood evening: the film was good, friends sat close, and nobody wanted to go home yet.`,
      },
      {
        vi: `Những tối ấy chẳng có cao trào riêng. Cả bọn ăn thêm một cốc chè, xem thêm một đoạn, xin nán thêm vài phút rồi về khi phim còn đang chạy. Tuần sau lại tới, vẫn mấy chiếc ghế ấy, vẫn tranh nhau chỗ nhìn rõ. Thói quen lặp đến mức chẳng ai ghi nhớ buổi cuối cùng. Có lẽ hôm đó một đứa bận học, một đứa chuyển sang trò khác, quán đổi chương trình; cả nhóm thưa dần mà không kịp chào căn phòng từng giữ mình lại bao nhiêu tối.`,
        en: `Those evenings had no climax of their own. The group ate another sweet soup, watched another scene, pleaded for a few more minutes, then went home while the film was still running. The next week they returned to the same stools and argued over the clearest view. The habit repeated so often that nobody remembered the last evening. Perhaps one child had schoolwork, another found a different pastime, the shop changed its programme; the group thinned without saying goodbye to the room that had held them for so many nights.`,
      },
      {
        vi: `Sau này, Internet đưa trọn bộ phim đến bất cứ màn hình nào. Chúng ta xem đúng giờ mình muốn, dừng ở cảnh mình thích, hình ảnh rõ hơn rất nhiều. Mấy đứa trẻ quanh chiếc tivi cũ cũng lớn lên và tản đi. Khi tìm lại một tập phim năm xưa, cốt truyện có thể vẫn vậy, nhưng bên cạnh không còn tiếng thìa chạm cốc, tiếng quạt, câu hỏi của đứa đến muộn và mấy cái đầu cùng nghiêng về phía trước. Bộ phim còn đó. Buổi tối Điện Biên dưới ánh màn hình xanh thì chỉ chiếu lại trong trí nhớ.`,
        en: `Later, the internet brought every episode to any screen. We watch whenever we choose, pause at a favourite scene, and see a much clearer picture. The children around the old television grew up and scattered. When we find an episode from those years, the plot may be unchanged, but beside us are no spoons touching glasses, no fan, no questions from a late arrival, no row of heads leaning forward together. The film remains. That Dien Bien evening beneath blue screen-light plays only in memory.`,
      },
    ],
  },

  'nhung-ngon-doi': {
    intro: {
      vi: `Điện Biên là một trong những nơi mà thành phố không che được địa hình của quá khứ. Nhà cửa có thể mọc thêm, đường có thể mở rộng; những ngọn đồi vẫn đứng đó và buộc đời sống hôm nay phải lớn lên quanh chúng.`,
      en: `Dien Bien is a place where a modern city cannot hide the terrain of the past. Houses can multiply and roads can widen; the hills remain, forcing present-day life to grow around them.`,
    },
    body: [
      {
        vi: `Có những thành phố nhìn ra xa chỉ thấy thêm thành phố. Ở Điện Biên, mắt thường bị chặn lại bởi một ngọn đồi, một dải núi hoặc một đường xanh chạy quanh lòng chảo. Khi còn nhỏ, những thứ ấy có thể chỉ là địa hình quen thuộc, giống như bầu trời hay thời tiết: luôn ở đó nên chẳng cần hỏi vì sao. Lớn lên mới biết nhiều điểm cao quanh mình từng có tên trong một bản đồ khác, một bản đồ của chiến dịch và chiến tranh. Cảm giác ấy làm không gian quen thuộc bỗng có chiều sâu. Con đường đi học, khu dân cư, cửa hàng, quán ăn — tất cả đang sống trên một nền địa hình đã từng được nhìn bằng đôi mắt hoàn toàn khác.`,
        en: `Some cities look outward and reveal only more city. In Dien Bien the eye is often stopped by a hill, a mountain line, or the green rim around the basin. As children, those forms could seem as ordinary as sky or weather: always present, requiring no explanation. Growing older means learning that many of the heights around us once had names on another kind of map, a map of campaign and war. That knowledge gives familiar space depth. The school road, housing, shops, restaurants—all live on terrain that was once seen through entirely different eyes.`,
      },
      {
        vi: `Thành phố đã bò dần tới sát chân đồi. Dưới đó là những việc rất bình thường: người ta mở cửa hàng buổi sáng, đưa con đi học, đi làm, sửa xe, mua thức ăn, ngồi uống cà phê. Quần áo phơi ngoài ban công, tiếng ti vi lọt qua cửa, một chiếc xe dừng trước nhà. Trên cao, tên của ngọn đồi vẫn gợi tới một thời không hề bình thường. Hai lớp ấy không tách nhau bằng hàng rào. Chúng nằm chồng lên nhau trong cùng một khung nhìn. Có lẽ đó là điều đặc biệt nhất: lịch sử ở đây không chỉ nằm trong bảo tàng; nó thành phông nền cho những sinh hoạt chẳng có ý định trở thành lịch sử.`,
        en: `The city has crept right to the foot of the hills. Below them are ordinary activities: shops opening in the morning, children taken to school, people going to work, repairing motorbikes, buying food, sitting over coffee. Clothes dry on balconies, television sound leaks through a doorway, a vehicle stops outside a house. Above, the hill's name still points to a time that was anything but ordinary. No fence separates those layers. They overlap in the same view. Perhaps that is what is most distinctive here: history is not only inside museums; it becomes the background to activities with no intention of becoming history themselves.`,
      },
      {
        vi: `Buổi chiều, khi ánh sáng dịu đi, những ngọn đồi rõ hơn trong đường viền của chúng. Đèn phố bắt đầu bật ở dưới thấp. Từ trên cao nhìn xuống, mái nhà và dòng xe nhập lại thành một đời sống yên ổn, có phần nhỏ bé. Một ý nghĩ rất khó tránh xuất hiện: đời sống bình thường này chính là thứ mà chiến tranh đã từng làm cho không thể bình thường. Những người đã ở trên những điểm cao ấy nhiều thập kỷ trước không thể biết chính xác thành phố sau này sẽ trông ra sao. Nhưng có lẽ việc trẻ con đi học, người lớn tan ca, quán xá sáng đèn là một câu trả lời đủ tốt cho những gì đã kết thúc ở đó.`,
        en: `In the late afternoon, as light softens, the hills become clearer in outline. Streetlights begin to appear below. From a height, rooftops and traffic merge into a stable, almost small-scale ordinary life. One thought is difficult to avoid: this ordinary life is precisely what war once made impossible. The people who occupied those heights decades ago could not know exactly what the later city would look like. Yet children going to school, adults coming home from work, and shops lighting up may be answer enough to what ended there.`,
      },
      {
        vi: `Nhưng một thành phố không thể chỉ sống để tưởng niệm. Nó phải xây thêm nhà, mở đường, thay đổi, thậm chí có lúc ồn ào và vụng về. Nếu bắt nó đứng yên để giữ nguyên quá khứ, chính đời sống sẽ bị biến thành một bảo tàng. Ngược lại, nếu lớn lên bằng cách coi những ngọn đồi chỉ là quỹ đất hoặc phong cảnh, thành phố sẽ tự cắt đi phần chiều sâu làm nó khác với mọi nơi khác. Điện Biên phải làm một việc khó hơn: tiếp tục sống thật sự mà không làm quá khứ biến thành phông trang trí. Mỗi thế hệ tự tìm một khoảng cân bằng khác giữa hai yêu cầu ấy.`,
        en: `Yet a city cannot live only to commemorate. It must build houses, open roads, change, and at times become noisy and awkward. Freeze it in order to preserve the past and ordinary life itself becomes a museum. Grow by treating the hills only as land or scenery and the city cuts away the depth that distinguishes it from anywhere else. Dien Bien has a harder task: to live fully without turning the past into decoration. Each generation has to find a different balance between those demands.`,
      },
      {
        vi: `Có thể vì thế những ngọn đồi trong ký ức không mang một cảm xúc duy nhất. Chúng vừa gần vừa xa, vừa quen thuộc vừa nghiêm trang. Một đứa trẻ có thể đi qua chân đồi mà nghĩ đến chuyện chơi; một người lớn đi cùng con đường lại nhớ đến lịch sử. Cả hai cách nhìn đều thật. Địa hình không yêu cầu ai phải xúc động theo một khuôn mẫu. Nó chỉ ở đó, bền bỉ hơn con người, chứng kiến thành phố thay da đổi thịt quanh mình. Chính sự im lặng ấy đôi khi khiến lịch sử mạnh hơn mọi lời thuyết minh.`,
        en: `That may be why the hills in memory carry no single emotion. They are near and distant, familiar and solemn at once. A child can pass their foot thinking only of play; an adult on the same road can think of history. Both views are real. Terrain asks nobody to feel according to a script. It simply remains, more durable than people, while the city changes around it. That silence can make history stronger than explanation.`,
      },
      {
        vi: `Dưới những ngọn đồi, Điện Biên tiếp tục là một thành phố của người sống. Có bữa cơm tối, tiếng trẻ con, những cuộc cãi vã nhỏ, công việc ngày mai và vô số điều chẳng liên quan gì đến năm 1954. Nhưng chỉ cần ngẩng lên, đường chân trời nhắc rằng nơi này còn một tầng thời gian khác. Thành phố không cần cúi đầu mỗi phút để chứng minh mình nhớ. Có lẽ cách tưởng niệm bền nhất chính là sống cho tử tế dưới những ngọn đồi ấy, để những điều bình thường được phép tiếp tục, và thỉnh thoảng ngẩng lên biết rằng sự bình thường này đã từng phải trả một giá rất lớn.`,
        en: `Below the hills, Dien Bien remains a city of the living. There are evening meals, children's voices, small arguments, tomorrow's work, and countless matters unrelated to 1954. Yet a glance upward reveals another layer of time. The city does not need to bow every minute to prove it remembers. Perhaps the most durable memorial is to live decently beneath those hills, to let ordinary things continue, and sometimes to look up knowing that this ordinariness once came at an enormous cost.`,
      },
    ],
  },

  'su-hung-vi': {
    intro: {
      vi: `Có những vùng đất bước vào lịch sử của một gia đình trước khi đứa trẻ trong gia đình ấy kịp có ký ức. Với tôi, Điện Biên đã từng đi vào nhà bằng hai chữ rất đơn giản: Hùng Vĩ.`,
      en: `Some places enter a family's history before a child in that family has any memory of them. For me, Dien Bien once entered the household through two simple words: Hung Vi—grandeur.`,
    },
    body: [
      {
        vi: `Ông nội đến Điện Biên và điều ở lại mạnh nhất trong ông là cảm giác về sự hùng vĩ. Không phải một địa danh riêng lẻ, không chỉ một ngọn núi hay một cánh đồng, mà là cảm giác khi nhìn quanh và thấy không gian mở ra theo một tỷ lệ khác với nơi mình đã biết. Câu chuyện gia đình giữ lại hai chữ ấy lâu đến mức “Hùng Vĩ” không còn chỉ là một tính từ mô tả cảnh quan. Nó bước vào chuyện đặt tên, vào cách người trong nhà nhắc tới Điện Biên và nhắc tới người đã đến trước. Một cảm giác trước phong cảnh bỗng có đời sống riêng trong một gia đình.`,
        en: `Grandfather came to Dien Bien, and what remained most strongly with him was a sense of grandeur. Not one landmark, not a single mountain or field, but the feeling of looking around and finding space opening on a scale unlike places he had known. The family story carried those two words for so long that “Hung Vi” ceased to be merely an adjective for landscape. It entered a naming story, the way the family spoke of Dien Bien and of the person who had arrived before us. A feeling before a landscape acquired a life inside a family.`,
      },
      {
        vi: `Tôi biết Điện Biên qua câu chuyện ấy trước khi đủ lớn để tự hỏi hùng vĩ nghĩa là gì. Trẻ con tiếp nhận quê hương bằng những mảnh rất khác người lớn: một câu kể lặp lại trong bữa cơm, tên một người, một tấm ảnh, cách người lớn bỗng đổi giọng khi nhắc về một nơi. Vì thế có những ký ức thực ra không hoàn toàn là ký ức của mình. Chúng được trao lại, giống như một vật gia đình đã cũ. Ta cầm lấy nó từ rất sớm, mang theo nhiều năm, rồi một ngày mới bắt đầu tự kiểm tra xem điều mình được kể có giống điều mắt mình nhìn thấy hay không.`,
        en: `I knew Dien Bien through that story before I was old enough to ask what grandeur really meant. Children inherit home differently from adults: a sentence repeated over meals, a person's name, a photograph, the way an adult's voice changes when a place is mentioned. Some memories therefore are not entirely our own. They are handed down like an old family object. We receive them early, carry them for years, and only later begin testing whether what we were told resembles what our own eyes can see.`,
      },
      {
        vi: `Khi tự mình nhìn lòng chảo và những dãy núi bao quanh, điều thú vị là tôi không còn biết mình đang nhìn bằng mắt của ai. Có phải cảnh quan tự nó gây ra cảm giác ấy, hay bởi từ nhỏ tôi đã được dạy rằng đây là một nơi hùng vĩ? Có lẽ không cần tách hai điều. Cái nhìn của con người luôn có phần được thừa hưởng. Một ngọn núi là đá, cây, độ cao; nhưng trong gia đình nó còn là câu chuyện của ông, quyết định ở lại, những năm tháng sau đó và những người sinh ra từ sự ở lại ấy. Cảnh vật thật và ký ức được truyền lại chồng lên nhau, làm quê hương dày hơn một phong cảnh.`,
        en: `Looking across the basin and the ranges around it, I can no longer tell whose eyes I am using. Does the landscape itself create that feeling, or was I taught from childhood that this is a place of grandeur? Perhaps the two need not be separated. Human vision is always partly inherited. A mountain is rock, trees, and elevation; inside a family it is also Grandfather's story, the decision to stay, the years that followed, and the people born from that staying. Physical landscape and inherited memory overlap, making a homeland thicker than scenery.`,
      },
      {
        vi: `“Hùng vĩ” cũng là một từ dễ bị dùng quá tay. Đứng trước núi, trước mây, trước một thung lũng rộng, người ta có thể nói nó gần như theo phản xạ. Nhưng trong câu chuyện này, điều làm hai chữ ấy có trọng lượng không phải vì cảnh đẹp đến mức nào. Đó là việc một cảm giác thoáng qua khi lần đầu nhìn một vùng đất lại có thể ảnh hưởng đến cả những lựa chọn sau đó của một con người. Có những nơi khiến người ta muốn đi tiếp; có những nơi khiến người ta muốn ở lại. Nếu Điện Biên từng khiến ông muốn ở lại, thì sự hùng vĩ ở đây không còn là mỹ từ. Nó đã tạo ra hậu quả thật trong đời sống.`,
        en: `“Grand” is also a word easily overused. Faced with mountains, clouds, or a broad valley, people can say it almost automatically. Here the word carries weight for another reason. A passing feeling on first seeing a place may shape the decisions that follow. Some places make a person want to keep moving; others make a person want to stay. If Dien Bien once made Grandfather want to remain, then grandeur is no longer decorative language. It produced real consequences in a life.`,
      },
      {
        vi: `Nhiều năm sau, quê hương có thể trở nên quá quen để còn thấy hùng vĩ mỗi ngày. Người sống lâu trong lòng chảo bận với công việc, hóa đơn, đường tắc, thời tiết, những việc nhỏ làm đầy đời sống. Núi biến thành phông nền. Cánh đồng thành con đường đi qua. Đó là điều tự nhiên; chẳng ai có thể liên tục sống trong trạng thái kinh ngạc trước nơi mình ở. Nhưng thỉnh thoảng, ở một góc nhìn đúng, sau một cơn mưa hoặc vào lúc mây mở ra, cảnh quan lại bỗng xa lạ như lần đầu. Khi ấy tôi hiểu phần nào điều ông có thể đã thấy: không phải một bức tranh đẹp, mà là cảm giác mình rất nhỏ trước một khoảng đất rộng và vẫn muốn bước vào sống trong nó.`,
        en: `Years later, home can become too familiar to feel grand every day. People living in the basin are busy with work, bills, traffic, weather, and the small matters that fill a life. Mountains become background. Fields become routes. That is natural; nobody can remain permanently astonished by home. Yet from the right angle, after rain or when clouds open, the landscape can suddenly become unfamiliar again. In such moments I understand something of what Grandfather may have seen: not a pretty picture, but the feeling of being very small before a large place and still wanting to enter and live inside it.`,
      },
      {
        vi: `Có lẽ quê nhà được tạo nên từ hai chuyển động ngược nhau. Một bên là sự quen thuộc: biết con đường, biết mùa nào gió đổi, biết nhìn dãy núi nào để đoán mình đang ở đâu. Bên kia là khả năng thỉnh thoảng vẫn bị nơi ấy làm cho bất ngờ. Nếu chỉ còn bất ngờ, đó là cảnh du lịch. Nếu chỉ còn quen thuộc, ta dễ quên vì sao những người trước mình từng chọn ở lại. Câu chuyện “Sự hùng vĩ” nằm giữa hai phía ấy. Nó không cố chứng minh Điện Biên lớn lao hơn nơi khác. Nó chỉ giữ lại khoảnh khắc một vùng đất đã chạm vào một người, rồi qua người ấy đi tiếp vào nhiều thế hệ.`,
        en: `Home may be built from two opposite movements. One is familiarity: knowing the roads, knowing when the wind changes, knowing which ridge tells you where you are. The other is the ability to be surprised by the same place from time to time. With only surprise, a place becomes tourism. With only familiarity, we risk forgetting why those before us chose to remain. “The Grandeur” lives between those sides. It does not try to prove Dien Bien is more magnificent than anywhere else. It preserves the moment when a place touched one person and, through that person, continued into later generations.`,
      },
      {
        vi: `Vì thế khi nhắc hai chữ Hùng Vĩ, tôi không chỉ nghĩ tới núi. Tôi nghĩ tới một sợi dây rất dài nối một cái nhìn của ông trong quá khứ với cách con cháu nhìn quê hương ở hiện tại. Phần đầu sợi dây ấy mình không chứng kiến, chỉ được kể lại. Phần sau mình đang sống trong đó. Giữa hai đầu là nhà cửa, tên người, những lần đi xa rồi trở về và vô số chuyện gia đình không có trong lịch sử chính thức. Có lẽ quê hương sâu nhất không phải nơi mình biết mọi thứ, mà là nơi ngay cả cảm xúc của những người đã khuất vẫn còn tham gia vào cách mình nhìn một ngọn núi hôm nay.`,
        en: `So when I hear the words Hung Vi, I do not think only of mountains. I think of a long thread joining Grandfather's gaze in the past to the way his descendants look at home now. I never witnessed the first end of that thread; it was told to me. I am living in the later end. Between them lie houses, names, departures and returns, and countless family stories absent from official history. Perhaps the deepest form of homeland is not the place where we know everything, but the place where even the feelings of those who are gone still participate in how we look at a mountain today.`,
      },
    ],
  },

  'con-vat': {
    intro: {
      vi: `Trí nhớ có một kiểu công bằng rất riêng: nó có thể làm rơi những ngày được cho là quan trọng, nhưng nhất quyết giữ lại một con vắt, hai vết máu trên quần jeans và con đường cả bọn đã đi xuống thác.`,
      en: `Memory has its own strange justice: it can drop supposedly important days and still refuse to release one leech, two blood marks on a pair of jeans, and the road a group of friends took down to a waterfall.`,
    },
    body: [
      {
        vi: `Hôm ấy bắt đầu bằng một sự thay đổi rất nhỏ: lớp học thêm được nghỉ. Với người lớn, đó chỉ là một khoảng trống trong lịch. Với một nhóm trẻ, khoảng trống ấy lập tức biến thành khả năng đi đâu đó. Cả bọn rủ nhau qua đồi, qua bản để xuống thác tắm. Không có kế hoạch lớn, chẳng ai nghĩ mình đang tạo ra một kỷ niệm sẽ còn được nhớ nhiều năm. Chỉ là một ngày bỗng được trả lại vài giờ tự do, và tự do ở tuổi ấy thường phải được tiêu hết ngay lập tức. Con đường đi càng xa khỏi chỗ học thêm, cảm giác như vừa trốn khỏi một trật tự nào đó càng rõ.`,
        en: `That day began with a very small change: an extra class was cancelled. To an adult it was merely an empty slot in a schedule. To a group of young people, the gap instantly became somewhere to go. We headed across hills and through villages toward a waterfall to swim. There was no grand plan and nobody thought a memory was being manufactured for years to come. A few hours had simply been returned to us, and at that age freedom usually had to be spent immediately. The farther the road led from the cancelled class, the stronger the feeling of having slipped out of some minor order.`,
      },
      {
        vi: `Đường qua đồi và bản khi ấy quan trọng không kém cái thác. Có đoạn phải để ý chân, có chỗ cây cối sát hơn, có lúc cả nhóm đi thành một hàng rồi lại dãn ra vì mỗi đứa dừng nhìn một thứ. Tuổi nhỏ có cách đi đường rất khác: đích đến chỉ là cái cớ, phần lớn câu chuyện xảy ra trên đường. Người đi trước gọi người phía sau. Có đứa đùa dai. Có đứa luôn tỏ ra biết đường dù chẳng chắc hơn ai. Những chi tiết ấy thường biến mất khỏi lời kể tóm tắt, nhưng chính chúng tạo ra cảm giác của một ngày không thuộc về người lớn.`,
        en: `The route over hills and through villages mattered almost as much as the waterfall. Some stretches demanded attention to footing, vegetation closed in at others, and the group alternated between single file and loose clusters whenever somebody stopped to look at something. Young people travel differently: the destination is only an excuse and most of the story happens on the way. Someone ahead calls back. Someone keeps making jokes. Someone pretends to know the route without being any more certain than the rest. Those details disappear from summaries, yet they created the feeling that the day belonged to us rather than to adults.`,
      },
      {
        vi: `Rồi có người hét lên. Chỉ một tiếng hét đủ khiến cả đám đang vô tư bỗng đồng loạt cúi xuống kiểm tra chân, quần, tất, những chỗ da hở. Mỗi người một vài con vắt. Nỗi sợ đến rất nhanh vì thứ đang bám vào mình nhỏ, mềm và khó chịu theo một cách nguyên thủy. Trước đó chẳng ai để ý. Bây giờ tự nhiên đâu cũng có cảm giác như đang có thứ bò trên da. Hai vết máu tròn hiện trên chiếc quần jeans. Máu không chịu dừng ngay, rồi sau đó là ngứa, là vết thâm kéo dài rất lâu. Một chuyến đi xuống thác đột nhiên có nhân vật chính mới, nhỏ hơn ngón tay.`,
        en: `Then someone shouted. One shout was enough to make the whole carefree group look down at legs, trousers, socks, every exposed patch of skin. Each person had one or two leeches. Fear arrived quickly because the thing attached to the body was small, soft, and unpleasant in a primitive way. Nobody had noticed before; now every sensation felt like something crawling. Two round blood marks appeared on a pair of jeans. The bleeding did not stop immediately, followed by itching and dark marks that lasted a long time. A trip to a waterfall suddenly had a new main character, smaller than a finger.`,
      },
      {
        vi: `Điều buồn cười là nỗi sợ cũng qua rất nhanh khi có bạn bè xung quanh. Vài phút trước còn nhảy dựng lên, vài phút sau đã bắt đầu đếm xem ai bị nhiều hơn, ai gan hơn, ai phản ứng buồn cười nhất. Một tai nạn nhỏ lập tức được chuyển hóa thành chiến tích. Đó là cơ chế rất trẻ con và cũng rất hữu ích: nếu cùng nhau cười được thì thứ vừa làm mình sợ sẽ bớt quyền lực. Trên đường về, chân vẫn rát, quần áo còn ẩm, nhưng câu chuyện đã bắt đầu được chỉnh sửa. Mỗi lần kể lại thêm một chút cường điệu, một chút khoe khoang, một chi tiết mà có lẽ chẳng ai còn chắc thật sự đã xảy ra đúng như thế.`,
        en: `The funny part is how quickly fear loses force when friends are present. Minutes after jumping in panic, everyone was counting who had more, who was braver, whose reaction looked funniest. A minor mishap was converted into an achievement. It is a childish and useful mechanism: if a group can laugh together, the thing that frightened them loses some of its power. On the way home legs still stung and clothes were damp, but the story was already being edited. Each retelling added a little exaggeration, a little pride, perhaps a detail nobody could later swear had happened exactly that way.`,
      },
      {
        vi: `Hai vết thâm rồi cũng mờ. Nếu chỉ nhìn vào cơ thể, chuyến đi gần như không để lại gì. Nhưng trong đầu, con đường vẫn còn: những đoạn qua đồi, qua bản, tiếng nước, cảm giác được nghỉ học thêm bất ngờ, khoảnh khắc tất cả cùng cúi xuống chân. Trí nhớ không lưu sự kiện theo tầm quan trọng khách quan. Nó lưu bằng độ bám. Có những ngày lễ lớn sau này không nhớ mình đã mặc gì hay đứng cạnh ai; nhưng một ngày bình thường với con vắt lại còn màu sắc, nhịp đi và cả cảm giác ngứa rất rõ. Có lẽ bởi kỷ niệm ấy có đủ mọi thứ tuổi trẻ cần: tự do, bạn bè, một chút nguy hiểm và câu chuyện để mang về.`,
        en: `The dark marks eventually faded. Judged only by the body, the outing left almost nothing behind. In the mind, however, the road remains: stretches over hills and through villages, the sound of water, the unexpected cancellation of class, the instant everyone looked at their legs together. Memory does not rank events by objective importance. It keeps what clings. There are major holidays one later cannot remember clothing or company from, while an ordinary day with leeches still retains color, pace, even the sensation of itching. Perhaps because it contained everything youth needs: freedom, friends, a little danger, and a story to bring home.`,
      },
      {
        vi: `Con vắt vì thế không chỉ là chuyện ghê hay buồn cười. Nó là cái đinh nhỏ đóng một ngày vào trí nhớ. Nếu không có nó, có thể chuyến đi thác đã hòa lẫn với nhiều lần đi chơi khác. Chính sự khó chịu làm ngày ấy có đường viền. Khi kể lại, con vắt kéo theo cả quãng đường, kéo theo khuôn mặt bạn bè, kéo theo một phiên bản của mình còn có thể bỏ lớp học thêm được nghỉ và lập tức đi xuyên qua đồi chỉ vì muốn xuống nước. Một sinh vật rất nhỏ vô tình giữ hộ một phần tuổi trẻ mà bản thân những người trong cuộc lúc ấy chẳng nghĩ cần phải giữ.`,
        en: `The leech therefore is more than something disgusting or funny. It is a tiny nail fixing one day to memory. Without it the waterfall trip might have blended into many other outings. The discomfort gave the day its outline. In retelling, the leech pulls the road back with it, then friends' faces, then a version of oneself capable of receiving a cancelled class and immediately crossing hills simply to reach water. A very small creature accidentally preserved a piece of youth that nobody involved thought needed preserving.`,
      },
      {
        vi: `Nhiều năm sau, điều đáng nhớ nhất có lẽ không phải mình đã sợ con vắt đến đâu. Đó là việc cả nhóm đã cùng sợ, rồi cùng cười, rồi cùng đi về. Bạn bè sau này có thể sống ở những nơi khác, mỗi người bận một đời riêng. Nhưng trong ký ức ấy, cả bọn vẫn đang ở cùng một con đường, quần áo ẩm, chân ngứa và kể đi kể lại một chuyện vừa mới xảy ra. Thời gian chưa kịp tách ai khỏi ai. Có những ký ức lớn nhờ cảnh đẹp hay biến cố. Ký ức này lớn lên chỉ nhờ một thứ rất nhỏ bám vào chân, rồi nhất quyết không chịu buông khỏi trí nhớ.`,
        en: `Years later, the most important part may not be how frightening the leeches felt. It is that the group was frightened together, then laughed together, then went home together. Friends may now live elsewhere, each occupied by a separate life. In this memory, however, everyone is still on the same road, clothes damp, legs itching, retelling something that has only just happened. Time has not yet separated anyone. Some memories become large through beautiful scenery or major events. This one grew large because something very small attached itself to a leg and then refused to let go of memory.`,
      },
    ],
  },
};

export const withLongformEditorialPageCopy = (page: BookPage): BookPage => {
  const copy = BOOK_LONGFORM_EDITORIAL_COPY[page.id];
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
