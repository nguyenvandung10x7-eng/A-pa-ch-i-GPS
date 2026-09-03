import type { BookChapter, BookLocalizedText, BookPage, ContentBlock } from '../types/book';

type EditorialPageCopy = {
  intro: BookLocalizedText;
  body: BookLocalizedText[];
};

const CHAPTER_INTRO_OVERRIDES: Record<string, BookLocalizedText> = {
  'chapter-03-mot-dien-bien-rat-nho': {
    vi: 'Thuở ấy, bản đồ Điện Biên bắt đầu từ hiên nhà bà, đi qua cái giếng rồi mất hút trong khu vườn. Chừng ấy đã đủ rộng cho cả một tuổi thơ.',
    en: 'Back then, the map of Dien Bien began at grandmother’s veranda, passed the well, and disappeared into the garden. That was wide enough to contain a whole childhood.',
  },
  'chapter-05-long-chao': {
    vi: 'Ra khỏi phố, lòng chảo mở ra bằng gió, nước, cỏ, đá và những vách núi xanh thẫm. Đứng giữa khoảng rộng ấy, chúng ta bỗng trở về đúng kích thước nhỏ bé của mình.',
    en: 'Beyond the streets, the basin opens through wind, water, grass, stone, and dark-green mountain walls. Standing inside that expanse, we suddenly return to our own small scale.',
  },
  'chapter-08-nhung-ngon-doi': {
    vi: 'Ở Điện Biên, những ngọn đồi luôn ở trong tầm mắt. Đường vòng qua chân đồi, bóng chiều đổ xuống mái nhà; người sống giữa lòng chảo quen đo khoảng cách bằng những sườn xanh im lặng ấy.',
    en: 'In Dien Bien, the hills are always within sight. Roads curve around their feet and evening shadows fall across the roofs; people in the basin have learned to measure distance by those quiet green slopes.',
  },
  'chapter-09-nhung-thu-kho-quen': {
    vi: 'Sau lớp học và những con phố còn một Điện Biên khác: rừng ẩm, khe nước, đá phủ rêu, tiếng chim lạ và những sinh vật nhỏ bận rộn theo cách của chúng. Một buổi được nghỉ học đã đưa cả bọn bước vào đó.',
    en: 'Beyond classrooms and streets lies another Dien Bien: damp forest, streams, moss-covered stone, strange bird calls, and small creatures busy with lives of their own. One cancelled class carried the whole group into it.',
  },
};

const PAGE_COPY_OVERRIDES: Record<string, EditorialPageCopy> = {
  'vuon-nha-ba-noi': {
    intro: {
      vi: 'Có một thời bản đồ Điện Biên của chúng ta chỉ rộng vài chục bước chân: từ hiên nhà bà ra cái giếng, vòng qua bếp, chạm tới khu vườn rồi mất hút sau những hàng cây.',
      en: 'There was a time when our map of Dien Bien was only a few dozen steps wide: from grandmother’s veranda to the well, around the kitchen, into the garden, then disappearing behind rows of trees.',
    },
    body: [
      {
        vi: 'Với trẻ con, khoảng cách được tính bằng quãng chạy trước khi bị gọi về, bằng chỗ có thể trốn, chỗ được nghịch nước và nơi phải đi nhẹ vì người lớn đang ngồi. Căn nhà ngói ba gian của bà có một phương hướng riêng. Phía này là sân. Qua sân là cái giếng và chiếc bơm tay. Xa thêm chút nữa có vườn rau, cây bưởi, chuồng gà, bếp củi. Cơ thể nhỏ bé thuộc từng khoảng đất: chân nhớ chỗ nào gồ, tay biết cái then cửa nào khó mở, tai phân biệt được tiếng gọi nào cho phép chơi thêm và tiếng gọi nào phải chạy về ngay.',
        en: 'For children, distance is measured by how far they can run before being called home, by places to hide, places where water may be played with, and places where adults are sitting and footsteps should soften. Grandmother’s three-bay tiled house had its own compass. Here was the yard. Beyond it stood the well and hand pump. A little farther were vegetable beds, the pomelo tree, the chicken coop, and the wood stove. A small body knew every patch of ground: feet remembered the uneven places, hands knew which latch resisted, ears could tell a call that allowed a few more minutes outside from one that meant run home now.',
      },
      {
        vi: 'Căn nhà trở về rõ nhất bằng mùi. Đất ẩm quanh thành giếng. Nước vừa bơm lên lạnh, hơi tanh mùi kim loại. Khói bếp bám vào mái ngói và quần áo. Rồi mùi lông chó, cám lợn, chuồng gà, lá bưởi bị vò trong tay. Ngày ấy chúng đều thuộc về đời sống, có thứ còn bị chê bẩn và khó chịu. Nhiều năm sau, trí nhớ lại giữ rất kỹ những gì từng ở gần da thịt. Một mùi tương tự thoáng qua giữa nơi xa lạ cũng đủ mở cả khoảng sân cũ.',
        en: 'The house returns most clearly through smell. Damp earth around the well. Newly pumped water, cold and faintly metallic. Wood smoke caught in the roof tiles and clothes. Then dog fur, pig feed, the chicken coop, pomelo leaves crushed in a hand. Back then they all belonged to ordinary life, and some were dismissed as dirty or unpleasant. Years later, memory carefully preserves what once stayed close to the body. A passing trace of the same scent in an unfamiliar place can open the whole yard again.',
      },
      {
        vi: 'Phía sau nhà là vườn nhãn gần bờ sông. Một khoảng sân nối sang hàng cây, hàng cây dẫn qua lớp lá khô, đi một lúc đã thấy mình ở nhà hàng xóm. Bọn trẻ hiểu quyền sở hữu theo một cách rất nhẹ: lối nào vẫn đi qua được thì cứ đi. Gốc cây thành điểm hẹn, khe hàng rào thành đường tắt, bãi đất hôm nay là sân bóng, ngày mai là chỗ đào tìm một kho báu chẳng đứa nào nhớ rõ. Tự do đầu tiên của chúng ta có khi đơn giản vậy thôi—trước mặt còn nhiều lối rẽ và chưa ai vội dựng rào.',
        en: 'Behind the house was a longan garden near the river. One yard led to a row of trees, the trees led through dry leaves, and before long we found ourselves at a neighbour’s house. Children held a light idea of ownership: if a path remained open, they followed it. A tree became a meeting place, a gap in a fence a shortcut, an empty plot a football field today and the site of a half-imagined treasure hunt tomorrow. Our first freedom may have been that simple—many turns still lay ahead and nobody was in a hurry to build a fence.',
      },
      {
        vi: 'Một ngày trong vườn chỉ có nắng trượt từ mái nhà xuống sân, tiếng bơm nước vang lên rồi im, gà bới lá và người lớn làm việc của họ. Trẻ con tự nghĩ ra những trò chẳng tạo được thứ gì mà vẫn chiếm trọn buổi chiều. Mọi việc bình thường đến nỗi chẳng ai nghĩ phải nhớ. Cũng chẳng ai báo chiều nào sẽ là lần cuối chúng ta nhìn cái sân bằng đôi mắt ấy. Căn nhà đổi từng chút, đứa trẻ lớn từng chút; đến lúc ngoảnh lại, hai phía đã đứng xa nhau.',
        en: 'A day in the garden held sunlight moving from roof to yard, the pump sounding and falling silent, chickens scratching leaves, and adults doing their work. Children invented games that produced nothing and still filled the afternoon. Everything felt too ordinary to remember. Nobody announced which afternoon would be the last time we saw the yard with those eyes. The house changed by degrees and the child grew by degrees; when we looked back, the two stood far apart.',
      },
      {
        vi: 'Sau này quay lại, mọi thứ có thể vẫn gần vị trí cũ mà tỷ lệ đã sai. Con đường ngắn hơn. Khoảng sân hẹp hơn. Hàng cây chẳng sâu như trong trí nhớ. Tuổi thơ từng âm thầm phóng đại nơi mình sống cho vừa cả thế giới; người lớn mang đôi mắt khác về nên chẳng thể thấy đúng căn nhà năm ấy nữa. Những bức tường còn lại thuộc về hiện tại. Căn nhà kia thuộc về một cơ thể nhỏ hơn, một nhịp thời gian chậm hơn và những người khi ấy vẫn ngồi ở chỗ quen của họ.',
        en: 'When we return, everything may remain near its old position and still have the wrong proportions. The road is shorter. The yard is narrower. The trees are nowhere near as deep as memory made them. Childhood quietly enlarged the place we lived until the whole world fitted inside; adults return with different eyes and cannot see the same house again. The walls that remain belong to the present. The other house belongs to a smaller body, a slower rhythm of time, and people still sitting in their familiar places.',
      },
      {
        vi: 'Trong vài chục bước chân ấy có bà, tiếng gọi ăn cơm, nước giếng, khói bếp, những con vật, lối sang nhà hàng xóm, vườn nhãn và cảm giác thuộc về một nơi từ trước khi biết hỏi vì sao. Sau này bản đồ Điện Biên mở rộng ra cánh đồng, những ngọn đồi và con đường dài về phía Tây. Bản đồ đầu tiên vẫn nằm dưới tất cả: nhỏ, riêng, gấp lại vừa trong một mùi khói bếp.',
        en: 'Those few dozen steps held grandmother, a call to dinner, well water, wood smoke, animals, paths into neighbouring yards, the longan garden, and a sense of belonging that came before we knew to ask why. Later the map of Dien Bien expanded into fields, hills, and the long road west. The first map remains beneath them all: small, private, folded into the scent of a kitchen fire.',
      },
    ],
  },

  'nhung-ngon-doi': {
    intro: {
      vi: "Điện Biên lớn lên giữa những ngọn đồi. Rời đường chính vài bước, chúng ta đã thấy đất, cây rừng và một nhịp thời gian khác ở rất gần đời sống.",
      en: "Dien Bien has grown among hills. A few steps from the main road bring earth, forest trees, and another rhythm of time close to everyday life.",
    },
    body: [
      {
        vi: "Nhà cao thêm, biển hiệu nhiều thêm, đường nối sang đường; vậy mà giữa phố chỉ cần ngẩng lên đã gặp một sườn đồi hoặc dải núi chắn ngang tầm mắt. Thành phố nằm trong lòng chảo, bốn phía có thành bằng đất và đá. Khoảng cách vì vậy mang một tính nết riêng. Nơi trông rất gần có khi phải vòng lâu dưới chân đồi. Cơn mưa đã đi qua sườn núi vẫn chưa chắc chạm tới phố. Buổi tối thường sẫm xuống từ trên cao rồi mới tới lượt đèn đường bật ở dưới.",
        en: "Buildings rise, signs multiply, and road joins road; still, from the middle of town, lifting our eyes is enough to meet a hillside or a mountain line across the view. The city lies in a basin ringed by earth and stone. Distance has its own temperament here. A place that looks close may require a long road around the foot of a hill. Rain may have crossed the ridge and still not reached the street. Evening often darkens above before the lamps below come on.",
      },
      {
        vi: "Hồi nhỏ, những ngọn đồi cứ có mặt như hướng mặt trời lặn hay cơn gió chiều. Một quả đồi nằm bên đường đi học, một sườn khác nhìn thấy từ sân nhà, xa hơn là đường xanh mờ cuối mắt. Bọn trẻ lấy chúng làm mốc từ trước khi biết độ cao, tên gọi và lịch sử. “Qua cái đồi ấy thì rẽ.” Một sườn núi quen hiện ra nghĩa là sắp về đến nhà. Địa hình đã đi vào cơ thể như vậy, sớm hơn bài học địa lý rất nhiều.",
        en: "In childhood, the hills were simply present, like the direction of sunset or the afternoon wind. One stood beside the school road, another could be seen from the yard, and farther away a green line blurred at the edge of sight. The children used them as landmarks before learning elevations, official names, or history. “Turn after that hill.” A familiar slope appearing meant home was near. The terrain entered the body this way, long before geography became a school lesson.",
      },
      {
        vi: "Lớn lên, chúng ta mới biết một số ngọn đồi quen từng có tên trên bản đồ chiến dịch. Những điểm cao đã được nhìn bằng đôi mắt của chiến tranh nay đứng giữa một thành phố đang sống. Dưới chân đồi, người ta mở cửa hàng, đưa trẻ đi học, sửa xe, mua thức ăn, trở về sau giờ làm. Trên sườn, cây tiếp tục mọc và bóng chiều đổ xuống mái nhà. Cùng một quả đồi vừa là ký ức chiến tranh, vừa là mốc chỉ đường của một đứa trẻ. Các lớp thời gian ở sát nhau, bình thản như vốn vẫn thế.",
        en: "Only as we grew older did we learn that some familiar hills once carried names on campaign maps. High ground studied through the eyes of war now stands inside a living city. At the foot of a hill, people open shops, take children to school, repair motorbikes, buy food, and return after work. Trees keep growing on the slope and evening shadow falls across the roofs. The same hill holds a memory of war and serves as a child's landmark on the way home. The layers of time rest close together, as calmly as if they always had.",
      },
      {
        vi: "Đi bộ dưới chân đồi, chúng ta cảm được sự chồng lớp ấy bằng từng bước. Từ đường chính rẽ vào một xóm nhỏ trong thung lũng, mặt đường thu lại thành dải bê tông vừa đủ nối vài căn nhà. Hai bên có hàng rào, vườn, cây ăn quả và những khoảng đất vẫn còn hơi lộn xộn. Chẳng có biển báo phía trước đáng xem điều gì. Đi sâu thêm, tiếng xe ngoài đường lớn lùi xa. Vai bớt căng vì không phải né dòng xe liên tục; chân cũng thôi giục mình đến một nơi cụ thể. Lâu lâu một chiếc xe máy chạy qua. Tiếng máy vừa khuất, con ngõ đã trở lại nhịp cũ.",
        en: "Walking beneath the hills, we feel those overlapping layers one step at a time. We leave the main road for a small neighbourhood in the valley, where the surface narrows to a strip of concrete just wide enough to join a few homes. Fences, gardens, fruit trees, and slightly disorderly plots line the way. No sign announces anything worth seeing ahead. Farther in, traffic from the main road recedes. Our shoulders loosen when there is no steady flow to avoid, and our feet stop urging us toward a particular destination. A motorbike passes now and then. As soon as its engine fades, the lane returns to its old pace.",
      },
      {
        vi: "Những ngọn đồi lúc này hiện ngay sau mái nhà, gần đến mức bước qua khu vườn cuối cùng dường như sẽ chạm sườn dốc. Một vài nơi có thông. Chỗ khác mọc cây rừng, bụi thấp, dây leo và nhiều thứ cây chúng ta không biết tên. Gió trên đồi thỉnh thoảng đi xuống, mang theo mùi lá, cỏ, đất ẩm và thứ mùi rất khó gọi của một khu rừng đang tự sống. Nó chỉ thoảng qua, vừa đủ để nhận ra luồng không khí này đã chạm cây cối trước khi chạm vào vai mình. Ở thành phố lớn, gió thường tới sau khi đã đi qua bê tông, bụi đường và động cơ.",
        en: "The hills now rise directly behind the roofs, so close that stepping beyond the last garden seems enough to touch the slope. There are pines in some places. Elsewhere grow forest trees, low shrubs, vines, and plants we cannot name. Wind comes down from the hills carrying leaves, grass, damp earth, and the difficult-to-name scent of a forest living by its own processes. It passes lightly, just enough for us to know that this air touched trees before it touched our shoulders. In a large city, wind often arrives only after crossing concrete, road dust, and engines.",
      },
      {
        vi: "Cuộc sống trong những con ngõ trôi rất chậm. Có người ngồi trước cửa. Khu vườn để cỏ chen vào giữa các luống cây. Một con chó nằm bên đường, ngẩng đầu nhìn người lạ rồi lại đặt mõm xuống hai chân trước. Có đoạn chẳng gặp ai. Cảnh này lên ảnh hẳn cũng bình thường: vài mái nhà, một dải bê tông, bóng đồi phía sau. Người đi ngang chỉ nhìn thấy một buổi chiều yên; sau mỗi cánh cửa vẫn có công việc, thu nhập, mùa mưa, đường xa và những lo toan của người thực sự sống ở đây.",
        en: "Life in the lanes moves slowly. Someone sits outside a house. Grass grows between the rows in a garden. A dog lies beside the road, lifts its head to inspect a stranger, then lowers its muzzle onto its forepaws again. One stretch is empty of people. A photograph would look ordinary: a few roofs, a strip of concrete, the shadow of a hill behind them. A passerby sees only one quiet afternoon; behind every door are work, income, rainy seasons, long roads, and the concerns of those who actually live here.",
      },
      {
        vi: "Cứ thế mà chúng ta xiêu lòng. Đi đủ lâu, nhịp suy nghĩ tự chậm xuống. Việc chưa làm, tin nhắn chưa trả lời và cảm giác phải hoàn thành một điều gì đó còn lởn vởn một lúc rồi lùi xa. Tiếng lá bắt đầu rõ. Tiếng chim. Tiếng người nói chuyện trong một căn nhà. Tiếng đế giày chạm mặt bê tông. Sự yên tĩnh chừa đủ chỗ cho những âm thanh nhỏ ấy. Tới đoạn nhìn thấy vài mái nhà nằm dưới bóng đồi, một ý nghĩ thoáng qua làm chính chúng ta cũng ngạc nhiên: “Có lẽ mình sống ở đây cũng ổn.” Rồi chân vẫn bước, như thể chưa ai vừa nói gì.",
        en: "And somehow the place wins us over. Walk long enough and thought slows on its own. Unfinished work, unanswered messages, and the urge to complete something hover for a while, then recede. Leaves become audible. Birds. A conversation inside a house. The soles of our shoes meeting concrete. The quiet leaves enough room for these small sounds. Where a few roofs sit beneath the hill's shadow, a thought passes through and surprises even us: “Perhaps I could live here and be all right.” Our feet keep moving as though nobody had said a thing.",
      },
      {
        vi: "Sự dễ chịu ấy còn đến từ địa hình. Vòng đồi tạo cho các xóm nhỏ cảm giác được che chở, đồng thời đưa cây rừng và không khí của núi xuống sát nơi người ở. Nhà, vườn, đường bê tông và sườn dốc gặp nhau bằng những đường biên mềm, lẫn vào nhau qua từng hàng rào. Ở nhiều nơi, muốn đến với thiên nhiên chúng ta phải rời thành phố. Ở đây, có buổi chiều chỉ cần rẽ vào một con ngõ.",
        en: "The terrain adds to that ease. The ring of hills gives small neighbourhoods a sense of shelter while bringing forest trees and mountain air close to where people live. Homes, gardens, concrete lanes, and slopes meet along soft boundaries and mingle across each fence. In many places, reaching nature means leaving the city. Here, on some afternoons, we need only turn into a lane.",
      },
      // Scientific framing: Park et al. (2010), DOI 10.1007/s12199-009-0086-9.
      {
        vi: "Cơ thể thường nhận ra rừng trước khi ý nghĩ kịp gọi tên. Năm 1982, ở Nhật xuất hiện khái niệm shinrin-yoku (森林浴), thường được dịch là “tắm rừng”. Chữ “tắm” ở đây gợi việc để toàn bộ giác quan ở trong không khí rừng: ngửi đất và lá, nhìn ánh sáng vỡ qua tán cây, nghe gió và chim, cảm độ ẩm, nhiệt độ, mặt đất dưới bàn chân. Người ta đi chậm, thôi đếm quãng đường, để điện thoại nằm yên. Tâm trí vẫn có thể nghĩ ngợi; sự chú ý chỉ từ từ chuyển sang những tín hiệu nhỏ của môi trường quanh mình.",
        en: "The body often recognizes a forest before thought has time to name it. In 1982, the Japanese term shinrin-yoku (森林浴), usually translated as “forest bathing,” came into use. Here, “bathing” suggests placing all the senses inside the atmosphere of the forest: smelling soil and leaves, watching light break through the canopy, hearing wind and birds, feeling humidity, temperature, and the ground beneath the feet. People walk slowly, stop counting distance, and leave the phone alone. The mind may keep thinking; attention gradually shifts toward the small signals in the surrounding world.",
      },
      {
        vi: "Trekking còn có quãng đường, đỉnh dốc hoặc đích đến. Shinrin-yoku đi theo sự chú ý; một giờ trôi qua trên vài trăm mét cũng được. Nhiều năm sau, nhóm nghiên cứu của Bum-Jin Park và Yoshifumi Miyazaki mang máy đo tới 24 khu rừng ở Nhật. Họ quan sát 280 nam thanh niên khi đi bộ hoặc ngồi nhìn rừng, rồi so sánh với hoạt động tương tự trong đô thị. Ở môi trường rừng, mức trung bình của cortisol trong nước bọt, nhịp mạch và huyết áp thấp hơn; hoạt động thần kinh tự chủ cũng nghiêng về trạng thái thư giãn hơn. Nghiên cứu ấy ghi lại phản ứng ngắn hạn ở một nhóm người cụ thể. Các con số đáng để suy nghĩ, nhưng chưa biến rừng thành thuốc và cũng chưa nói thay mọi cơ thể.",
        en: "Trekking still has a distance, a summit, or a destination. Shinrin-yoku follows attention; an hour may pass over only a few hundred metres. Years later, a research team including Bum-Jin Park and Yoshifumi Miyazaki carried measuring instruments into 24 forests across Japan. They observed 280 young men walking or sitting and viewing the forest, then compared the results with similar activities in urban settings. Under forest conditions, average salivary cortisol, pulse rate, and blood pressure were lower; autonomic activity also leaned toward a more relaxed state. The study recorded short-term responses in one particular group. The numbers are worth considering, but they do not turn the forest into medicine or speak for every body.",
      },
      {
        vi: "Con đường dưới những ngọn đồi nằm ở chỗ rừng, vườn, xóm nhỏ và đời sống con người chạm vào nhau. Chúng ta đi trên bê tông, nghe tiếng bát đũa từ một căn nhà; cùng lúc, gió vừa qua cây rừng xuống tới vai, bóng đồi phủ lên mái ngói, mùi lá ẩm lẫn vào khu dân cư. Mượn cách gọi của Nhật, đây giống một cuộc tắm rừng của thung lũng Điện Biên. Chẳng cần đi sâu vào rừng. Cứ rẽ vào con ngõ, bước chậm, rồi ranh giới giữa phố và cây tự mờ đi. Chúng ta ở đó đủ lâu và dần nhận ra những điều vốn vẫn có mặt.",
        en: "The road beneath the hills lies where forest, garden, neighbourhood, and human life meet. We walk on concrete and hear bowls and chopsticks inside a house; at the same time, air that has crossed the trees reaches our shoulders, hill shadow covers the roofs, and the smell of damp leaves enters the neighbourhood. Borrowing the Japanese term, this feels like a kind of forest bathing for the Dien Bien valley. There is no need to enter deep forest. Turn into the lane, slow down, and the boundary between street and trees begins to blur on its own. We stay long enough to notice what was present all along.",
      },
      {
        vi: "Những khu vườn ven đường khiến chúng ta muốn cúi xuống chạm vào đất. Ở chỗ còn bóng râm, mặt đất lạnh hơn không khí một chút; cái lạnh ẩm truyền vào đầu ngón tay, cùng vài hạt đất vụn bám trên da. Thử cắt mặt đất ấy, chỉ trong tưởng tượng, thành những phân tố lập phương có cạnh một xăng-ti-mét. Nhấc riêng một khối nhỏ lên, giữ nguyên những lỗ rỗng, sợi rễ, hạt cát và mảnh lá mục bên trong. Trong một vật bé đến mức có thể đặt trên đầu ngón tay như vậy, rốt cuộc đang có những gì?",
        en: "The gardens beside the road make us want to crouch down and touch the earth. In the shade, the ground is a little colder than the air; its damp chill reaches the fingertips, leaving a few crumbs of soil on the skin. Suppose we cut that ground, only in the mind, into cubic elements one centimetre wide. Lift one tiny cube without disturbing the pores, root fibres, grains of sand, and fragments of decaying leaf held inside it. What, in the end, is happening within something small enough to rest on a fingertip?",
      },
      {
        vi: "Trong đầu hiện ra con số một triệu. Hình như chúng ta từng nghe rằng một nhúm đất chứa vô số vi sinh vật. Ở nhiều loại đất, các nghiên cứu quả thực đếm được từ hàng triệu đến hàng tỷ tế bào vi khuẩn trong một gram; con số đổi theo loại đất, độ ẩm, độ sâu và cách đo. Khoa học cũng không lấy mốc một triệu để gọi đất là “hữu cơ” hay giàu dinh dưỡng. Khối đất Điện Biên dưới tay chưa hề được lấy mẫu. Cứ tạm đặt một triệu sinh vật nhỏ vào đó, như một con số cho trí tưởng tượng bám vào, rồi nhớ rằng đây là tưởng tượng chứ chưa phải kết quả xét nghiệm.",
        en: "The number one million comes to mind. Somewhere, we seem to remember hearing that a pinch of earth contains innumerable microorganisms. Across many kinds of soil, studies do count millions to billions of bacterial cells in a gram; the number changes with soil type, moisture, depth, and method. Science does not use one million as a threshold for calling soil “organic” or nutrient-rich. The piece of Dien Bien earth beneath our hand has never been sampled. We can place a million tiny lives inside it as a number for the imagination to hold, while remembering that this is an image, not a laboratory result.",
      },
      {
        vi: "Trong khối lập phương tưởng tượng ấy, đời sống không nằm yên. Vi khuẩn hoạt động trên những bề mặt ẩm; sợi nấm đi qua các khe đất; những sinh vật lớn hơn một chút ăn mảnh lá, ăn vi khuẩn, rồi lại trở thành thức ăn cho thứ khác. Một chiếc lá rụng không lập tức biến thành “dinh dưỡng”. Nó mềm đi, vỡ nhỏ, được phân giải qua nhiều lần sống và chết. Một phần carbon trở lại không khí, một phần ở lại trong chất hữu cơ; các nguyên tố khoáng được giữ, giải phóng rồi luân chuyển sang những dạng rễ cây có thể tiếp cận. Trên mặt đất, cây tiếp tục lớn và lại thả lá xuống. Dưới mặt đất, một công việc chậm hơn tiếp tục nhận lấy phần rơi xuống ấy. Vòng lặp không có đoạn nào thật sự đứng riêng.",
        en: "Within that imagined cube, life does not remain still. Bacteria work across damp surfaces; fungal threads pass through pores; slightly larger organisms consume fragments of leaf and bacteria, then become food for something else. A fallen leaf does not instantly become “nutrition.” It softens, breaks apart, and is decomposed through many passages of living and dying. Some carbon returns to the air and some remains in organic matter; mineral elements are held, released, and cycled into forms that roots can reach. Above ground, plants continue to grow and let their leaves fall. Below, a slower labour receives what has fallen. No part of the cycle truly stands alone.",
      },
      {
        vi: "Rồi một ngày, có người đặt xuống đó hạt xà lách, hoặc một hạt cà chua rơi khỏi quả chín. Rễ non mở đường qua khe nhỏ, tìm nước và những ion khoáng hòa tan; quanh rễ, cây cùng vi sinh vật trao đổi các chất mắt thường không thấy. Khối đất không được nhấc nguyên lên để hóa thành lá hay quả. Cây lấy carbon từ không khí, nhận năng lượng của nắng, dùng nước tạo nên đường, mô mềm, màu xanh của lá và phần thịt mọng quanh hạt. Một lá xà lách hay quả cà chua mang theo dấu vết của nhiều dòng gặp nhau: mưa, khí trời, nắng, khoáng chất, lá cũ, đời sống quanh rễ và thời gian.",
        en: "Then one day someone places a lettuce seed there, or a tomato seed falls from ripe fruit. A young root works through narrow spaces in search of water and dissolved mineral ions; around it, plant and microorganisms exchange substances invisible to the eye. The cube of earth is not lifted whole and turned into leaf or fruit. The plant takes carbon from the air, receives energy from sunlight, and uses water to build sugars, soft tissue, the green of a leaf, and the flesh around a seed. A lettuce leaf or tomato carries traces of many currents meeting: rain, air, sunlight, minerals, old leaves, life around the roots, and time.",
      },
      {
        vi: "Nghĩ đến đây, thức ăn trên chiếc đĩa hiện ra như hình dạng tạm thời của một chuyển động rất dài. Vị của quả cà chua không đo được “độ giàu” của đất, cũng chẳng chứng nhận nơi nó mọc là sạch hay hữu cơ. Muốn biết những điều ấy phải có dữ liệu và cả quá trình canh tác; cuộc dạo bộ này không đem theo câu trả lời. Nó cho chúng ta hình dung dưới một khu vườn bình thường, đất, nước, không khí, ánh sáng và vô số đời sống đang mượn vật chất của nhau, hiện ra một lúc trong chiếc lá, quả chín, rồi trở về. Chúng ta phủi đất khỏi đầu ngón tay và đứng lên. Mặt đất vẫn lạnh, im lặng, chẳng cần mang thêm một lời quảng cáo nào.",
        en: "Seen this way, food on a plate appears as the temporary shape of a very long movement. The taste of a tomato cannot measure the soil's “richness” or certify that it was grown cleanly or organically. Those questions require evidence and a full history of cultivation; this walk carries no answer. It lets us imagine how, beneath an ordinary garden, earth, water, air, light, and innumerable lives borrow matter from one another, appearing for a while as a leaf or ripe fruit before returning. We brush the soil from our fingertips and stand. The ground remains cold and quiet, requiring no advertising claim.",
      },
      {
        vi: "Cuối chiều, chúng ta trở lại con đường bê tông nhỏ dưới chân đồi. Ánh sáng dịu đi. Bóng cây kéo dài qua mặt đường. Gió đưa mùi lá và đất xuống giữa những mái nhà. Một lúc lâu chẳng có xe chạy qua. Từ căn nhà gần đó vọng ra tiếng nói chuyện, tiếng bát đũa chạm nhau trong lúc chuẩn bị bữa tối. Trên cao, đường đồi sẫm dần rồi hòa vào đêm. Trong các căn nhà, bữa tối bắt đầu; dưới những khu vườn, lá mục, rễ cây và các sinh vật nhỏ vẫn tiếp tục phần việc không ai nhìn thấy. Sau này nhớ về nơi này, chúng ta có thể quên mình đã đi qua con ngõ nào. Cảm giác bước thật chậm dưới những ngọn đồi thì vẫn còn—giữa một nơi cuộc sống đủ chậm để chúng ta nghe thấy chính mình.",
        en: "Toward evening, we return to the narrow concrete road beneath the hill. The light softens. Tree shadows lengthen across the lane. Wind brings the smell of leaves and earth down among the roofs. For a long while no vehicle passes. From a nearby house come voices and the clink of bowls and chopsticks as dinner is prepared. Above, the line of the hill darkens into night. Dinner begins inside the houses; beneath the gardens, fallen leaves, roots, and small creatures continue the work nobody sees. Later, we may forget which lane we followed. The feeling of walking slowly beneath the hills remains—in a place where life is slow enough for us to hear ourselves.",
      },
      {
        vi: "Trên cao, những ngọn đồi vẫn ở đó. Thành phố bắt đầu sáng đèn quanh chân chúng.",
        en: "Above us, the hills remain. Around their feet, the city begins to light up.",
      },
    ],
  },

  'su-hung-vi': {
    intro: {
      vi: 'Có lúc cảnh vật làm câu chuyện trong đầu ngừng lại. Đá, nước, cây, gió và khoảng trống đưa cơ thể trở về với thế giới mà nó vốn thuộc về.',
      en: 'Sometimes a landscape stops the story running through our minds. Stone, water, trees, wind, and open space return the body to the world it has always belonged to.',
    },
    body: [
      {
        vi: 'Ở Điện Biên, cảm giác hùng vĩ thường đến tại những đoạn dấu chân người bắt đầu thưa. Ra khỏi phố một chút, tiếng máy nhỏ lại và không khí đổi mùi. Đất sau mưa đang hong trong nắng, lá mục ở chỗ ẩm, cỏ vừa bị giẫm, đá nóng nằm cạnh dòng nước lạnh. Gió mang theo mùi rừng vừa xanh vừa ẩm, lúc ngai ngái, lúc thoảng chút ngọt của hoa dại. Tất cả trộn vào nhau. Mặt đường phẳng lùi lại sau lưng, bước chân bắt đầu dè chừng trước đất và đá.',
        en: 'In Dien Bien, grandeur often arrives where human tracks begin to thin. A little way beyond town, engines quieten and the air changes scent. Earth dries in sunlight after rain, leaves decay in damp places, grass has just been crushed, hot stone lies beside cold water. Wind carries a forest smell that is green and wet, sometimes sharp, sometimes faintly sweet with wild flowers. Everything mingles. The level road recedes behind us, and our steps begin to take care over earth and stone.',
      },
      {
        vi: 'Gần nước, giác quan đổi trước suy nghĩ. Tiếng dòng chảy phủ lên tiếng người. Hơi lạnh từ khe suối hay chân thác chạm vào da trong khi nắng vẫn nằm trên vai. Mỗi phiến đá có một bề mặt: viên nhẵn vì nước, viên còn cạnh sắc, viên phủ rêu làm bàn chân phải dò từng chút. Hoa cỏ mọc ở nơi chẳng ai trồng, lộn xộn về màu sắc và tên gọi. Một tiếng chim bật lên trong rừng sâu rồi tắt. Khoảng im phía sau bỗng rộng hơn cả tiếng chim vừa nghe.',
        en: 'Near water, the senses change before thought. The current covers human voices. Cool air from a stream or the foot of a waterfall touches the skin while sunlight still rests on the shoulders. Each stone has a surface: one polished by water, another sharp at the edge, another coated in moss that makes the foot test its way. Flowers and grasses grow where nobody planted them, unruly in colour and name. A bird calls from deep forest and falls silent. The quiet behind it suddenly feels wider than the call itself.',
      },
      {
        vi: 'Đứng trước sườn núi phủ cây hoặc khoảng lòng chảo vừa mở ra sau mưa, những việc thường ngày tự co lại. Công việc, lịch hẹn, một cuộc tranh cãi ban sáng vẫn còn đó nhưng tạm lùi khỏi chỗ ồn ào nhất trong đầu. Cơ thể quay sang để ý gió, nhiệt độ, độ dốc, ánh sáng và tiếng nước. Trời còn bao lâu nữa tối? Mưa có tới không? Hòn đá dưới chân có chắc? Phía kia còn lối đi chứ? Những câu hỏi rất cũ trở lại, giản dị và gần da thịt.',
        en: 'Before a forested slope or a basin opening after rain, ordinary concerns shrink on their own. Work, appointments, an argument from the morning still exist, but for a while they move away from the noisiest part of the mind. The body turns toward wind, temperature, slope, light, and water. How much daylight is left? Is rain coming? Is the stone underfoot secure? Is there a path on the other side? Very old questions return, simple and close to the skin.',
      },
      {
        vi: 'Nắng trong núi rừng rơi thành từng mảng qua tán cây, bám lên phiến đá, làm sáng một cụm cỏ và để khoảng đất bên cạnh nằm trong bóng tối. Ở đó nắng cũng có mùi: cỏ khô đang nóng lên, nhựa cây, đất vừa rút bớt hơi ẩm. Gió qua, cả khu rừng tự phát ra âm thanh—lá cọ nhau, cành khô gãy ở đâu đó, côn trùng rền lên, chim gọi từ những khoảng mắt không thấy. Sự hoang vu đầy ắp đời sống. Phần lớn đời sống ấy chẳng bận tâm đến sự có mặt của chúng ta.',
        en: 'Sunlight in the forest falls in patches through the canopy, rests on a stone, brightens one cluster of grass, and leaves the ground beside it in shadow. There, sunlight has a smell: dry grass warming, resin, earth releasing its dampness. Wind passes and the forest makes its own sounds—leaves rubbing, a dead branch breaking somewhere, insects rising into a drone, birds calling from places beyond sight. Wilderness is crowded with life. Most of that life pays no attention to our presence.',
      },
      {
        vi: 'Càng cố chụp, bức ảnh càng lộ ra phần thiếu. Ống kính giữ được đường núi, mặt nước, mây và cây. Hơi lạnh chạy dọc cánh tay khi đứng gần suối, mùi đá sau mưa, tiếng chim xa tới mức chẳng biết phát ra từ tán nào thì ở lại ngoài khung hình. Chúng ta rời rừng với vài tấm ảnh, đôi giày bẩn và mùi nắng trên áo. Nhiều năm sau, thứ quay về lại là cảm giác bàn chân mình rất nhỏ trên một khối đất kéo dài ngoài tầm mắt.',
        en: 'The harder we try to photograph the place, the more clearly the picture reveals what it lacks. A lens keeps the mountain line, water, cloud, and trees. The cold running along an arm beside a stream, the smell of stone after rain, a bird too distant to locate remain outside the frame. We leave the forest with a few photographs, dirty shoes, and sunlight in our clothes. Years later, what returns is the feeling of our feet being very small on a body of land extending beyond sight.',
      },
      {
        vi: 'Rồi chúng ta quay lại thành phố. Tiếng xe trở lại, mặt đường phẳng hơn, điện thoại có sóng và đời sống con người lại lấp đầy tầm mắt. Cơ thể vẫn mang theo một nhịp khác. Sau quãng lâu nghe nước và chim trong khu rừng chẳng cần đến mình, phố nghe ồn hơn, còn những lo toan co lại đôi chút. Hai chữ “hùng vĩ” lúc ấy gần với một cảm giác về tỷ lệ: chúng ta biết ngửi mùi rừng, biết sợ đá trơn, biết khát, biết lắng nghe; một sinh vật nhỏ đang đi giữa rất nhiều sự sống.',
        en: 'Then we return to town. Engines return, roads flatten, phones regain signal, and human life fills the view again. The body carries another rhythm for a while. After listening to water and birds in a forest that has no need of us, the streets sound louder and our worries shrink a little. The word “grandeur” then feels close to a sense of scale: we can smell the forest, fear slippery stone, feel thirst, and listen; one small creature walking among many forms of life.',
      },
    ],
  },

  'con-vat': {
    intro: {
      vi: 'Bọn học sinh lớn lên ở nơi chỉ qua vài con đường, vài quả đồi và một bản nhỏ, bàn ghế với thời khóa biểu đã nhường chỗ cho rừng, đá, nước và những sinh vật sống theo giờ riêng của chúng.',
      en: 'The students grew up where, after a few roads, hills, and a small village, desks and timetables gave way to forest, stone, water, and creatures living by clocks of their own.',
    },
    body: [
      {
        vi: 'Buổi học thêm vừa báo nghỉ, ranh giới giữa hai thế giới đã mở ra. Vài phút trước còn bàn ghế, vở và câu hỏi hôm nay phải học gì; một lúc sau cả bọn đã đi về phía đồi, qua bản, tìm đường xuống thác. Nhà thưa dần. Tiếng xe lùi lại. Cây cối khép gần hơn. Con đường bắt đầu uốn theo dốc, đất, đá và nước. Với bọn học sinh, đó chỉ là một buổi đi chơi bất ngờ, và mấy giờ vừa được trả lại phải dùng cho thật hết.',
        en: 'As soon as the extra class was cancelled, the boundary between two worlds opened. Minutes earlier there had been desks, notebooks, and the question of what had to be studied; soon the whole group was heading toward the hills, through a village, looking for the way down to a waterfall. Houses thinned. Engines receded. Vegetation closed in. The road began to bend with slope, soil, stone, and water. To the students, it was an unexpected afternoon out, and the returned hours had to be spent to the last one.',
      },
      {
        vi: 'Đi sâu thêm, những thứ thường dùng để định hướng trong phố lần lượt biến mất. Biển hiệu, mặt tiền nhà, khoảng nhìn thẳng dài đều ở lại phía sau. Trước mặt là mùi lá ẩm, đất mềm dưới chân, tiếng nước khi gần khi xa và tiếng chim lạ vọng qua tán cây. Có đoạn nắng chiếu sáng bừng; vài bước sau đã tối và mát. Bụi cây quệt vào quần áo, côn trùng bay ngang mặt, một con thằn lằn lẩn đi trước khi ai kịp nhìn rõ. Cả bọn nói cười ồn ào giữa những sinh vật vẫn mải việc riêng của chúng.',
        en: 'Farther in, the usual ways of finding direction in town disappeared one by one. Signs, house fronts, and long straight views stayed behind. Ahead were damp leaves, soft earth underfoot, water sounding near and then far, and unfamiliar birds calling through the canopy. One stretch opened bright in sunlight; a few steps later it was dark and cool. Shrubs brushed clothing, insects crossed faces, and a lizard vanished before anyone saw it clearly. The group talked and laughed loudly among creatures still absorbed in lives of their own.',
      },
      {
        vi: 'Đến thác, tiếng nước lớn đến mức muốn nói phải cao giọng. Đá ướt làm bước chân bớt tự tin; nước lạnh vừa chạm da đã cuốn sạch những ý nghĩ lặt vặt. Bọn trẻ cười, gọi nhau, tìm chỗ đứng và thử gan theo kiểu tuổi học trò. Chung quanh, rêu bám đá, nước theo độ dốc, cây vươn về phía sáng, những con vật nhỏ tìm thức ăn và chỗ ẩn. Cả khu rừng đã vận hành từ rất lâu trước buổi học thêm hôm ấy. Đám trẻ chỉ vừa chen vào vài giờ náo động.',
        en: 'At the waterfall, the water was so loud that everyone had to raise their voices. Wet stone made each step less certain; cold water touching skin washed away every stray thought. The students laughed, called to one another, found places to stand, and tested their courage in the manner of adolescence. Around them, moss held to stone, water followed the slope, plants reached toward light, and small animals searched for food and shelter. The forest had been at work long before that extra class. The children had merely inserted a few noisy hours into it.',
      },
      {
        vi: 'Rồi một đứa phát hiện con vắt. Cả đám lập tức cúi xuống chân, lật gấu quần, xem những chỗ da hở. Mấy thân nhỏ, mềm, tối màu bám chặt hoặc chui vào nơi khó nhìn. Hai vết máu tròn hiện trên quần jeans; tiếp theo là ngứa, ghê người và những tiếng la chồng lên tiếng nước. Đối với con vắt, bọn học sinh chỉ là các cơ thể ấm vừa đi ngang qua. Khoảng rừng đang vui bỗng lộ ra vẻ sống, ẩm và hoang của nó, thản nhiên trước cảm giác của khách.',
        en: 'Then one child found a leech. Everyone immediately looked down, lifted trouser cuffs, and checked every patch of exposed skin. Small, soft, dark bodies clung tightly or worked into places difficult to see. Two round blood marks appeared on denim; then came itching, disgust, and shouts layered over the water. To a leech, the students were simply warm bodies passing through. The playful forest suddenly revealed itself as alive, wet, and wild, indifferent to the comfort of its visitors.',
      },
      {
        vi: 'Bọn trẻ sinh ra ở mảnh đất này nên cũng quen đường tới rừng theo cách riêng. Sau thị xã có đường, sau đường có bản, qua bản gặp suối, thác và cây rậm. Núi luôn nằm cuối tầm mắt; bước vào núi tự nhiên như trẻ ở nơi khác đi vào công viên gần nhà. Sự hoang sơ ở sát đời sống thường ngày, gần đến mức một buổi nghỉ học đột xuất đủ đưa cả nhóm chạm tới. Tuổi học trò Điện Biên mang theo địa hình của quê hương: dốc trong bắp chân, nước lạnh trên da, lá quệt qua áo và những con vật nhỏ bất ngờ bám lại.',
        en: 'Because the children were born on this land, they knew the way toward the forest in their own fashion. Beyond town were roads, beyond the roads villages, and past the villages streams, waterfalls, and dense trees. Mountains always stood at the edge of sight; entering them felt as natural as children elsewhere walking into a nearby park. Wild country touched ordinary life closely enough for one cancelled class to carry the whole group into it. Adolescence in Dien Bien carried the terrain of home: slopes in the calves, cold water on skin, leaves brushing shirts, and small animals suddenly attaching themselves.',
      },
      {
        vi: 'Nhiều năm sau, con vắt vẫn là chi tiết dễ kể nhất: nó có hình dạng, có máu và hơi buồn cười. Kể tới nó là cả con đường theo về. Rừng chẳng biết điểm số. Nước chẳng biết giờ vào lớp. Chim vẫn kêu khi cả bọn cãi nhau; vắt vẫn tìm một chỗ da hở, bất kể đứa nào gan hay nhát. Trong vài giờ, chúng ta từng là một loài vật ồn ào và vụng về giữa rất nhiều loài khác. Hai vết thâm đã mờ từ lâu. Con đường qua đồi, đám bạn mặc quần áo ẩm và tiếng cười trên lối về vẫn chưa chịu mất.',
        en: 'Years later, the leech remains the easiest detail to tell: it has a shape, blood, and something comic about it. Mention it and the whole road returns. The forest knew nothing of grades. Water knew nothing of class time. Birds kept calling while the group argued; leeches kept looking for exposed skin, indifferent to who was brave or frightened. For a few hours, we were one noisy, clumsy animal among many others. The two dark marks faded long ago. The road over the hills, friends in damp clothes, and laughter on the way home have not.',
      },
    ],
  },
};

export const withNatureEditorialChapterCopy = (chapter: BookChapter): BookChapter => {
  const intro = CHAPTER_INTRO_OVERRIDES[chapter.id];
  return intro ? { ...chapter, intro } : chapter;
};

export const withNatureEditorialPageCopy = (page: BookPage): BookPage => {
  const copy = PAGE_COPY_OVERRIDES[page.id];
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
