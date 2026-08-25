import type { BookChapter, BookPage, ContentBlock } from '../types/book';

const CHAPTER_ID = 'chapter-06-nhung-nam-2000';
const PAGE_ID = 'am-thanh-nhung-nam-2000';

const chapterIntro = {
  vi: 'Có một thời rất gần mà giờ xa như mối tình đầu. Chỉ cần vài nốt nhạc cũ là cả thị xã, một buổi tan học, một bàn tay từng nắm và câu tỏ tình vụng về đầu tiên bỗng trở lại — nguyên vẹn đến mức làm người ta vui lên rồi buồn đi gần như cùng một lúc.',
  en: 'There was a time close enough to touch and now as distant as first love. A few old notes can bring back the whole town, an after-school afternoon, a hand once held, and a first awkward confession—so intact that joy and sadness seem to arrive at almost the same moment.',
};

const pageIntro = {
  vi: 'Những năm hai nghìn không chỉ còn lại trong âm nhạc, quần áo hay những chiếc màn hình cũ. Với tôi, đó còn là quãng đời lần đầu biết một người khác có thể làm cả buổi chiều thay đổi chỉ bằng việc xuất hiện.',
  en: 'The two-thousands did not survive only in music, clothes, or old screens. For me, they were also the years when I first learned that another person could change an entire afternoon simply by appearing.',
};

const narrativeBlocks: ContentBlock[] = [
  {
    type: 'text',
    body: {
      vi: 'Những năm hai nghìn ở Điện Biên có một thứ ánh sáng riêng. Ánh sáng xanh từ màn hình máy tính trong quán Internet, ánh tivi hắt ra từ những căn phòng tối, bảng hiệu nhỏ ngoài phố và những chiếc điện thoại phím bấm mà ai có được cũng thấy mình gần tương lai hơn một chút. Lam Trường, Đan Trường, Ưng Hoàng Phúc, H.A.T., rồi Linkin Park đi qua những chiếc loa vi tính đôi khi rè tiếng, qua đĩa CD, VCD, những file nhạc chép cho nhau và những quán xá còn chưa biết thế nào là Wi-Fi. Quần áo rộng hơn, tóc cũng có những kiểu mà nhìn lại bây giờ có thể bật cười. Khi ấy chẳng ai thấy buồn cười cả. Tất cả đều rất mới, rất nghiêm túc, và quan trọng nhất: tất cả dường như đang xảy ra lần đầu.',
      en: 'The two-thousands in Dien Bien had a light of their own: the blue glow of computer screens in Internet cafés, television light spilling from dark rooms, small signs along the street, and keypad phones that made anyone holding one feel a little closer to the future. Lam Truong, Dan Truong, Ung Hoang Phuc, H.A.T., then Linkin Park came through small computer speakers that sometimes crackled, through CDs and VCDs, copied music files, and cafés that did not yet know what Wi-Fi was. Clothes were wider; haircuts now capable of making us laugh were then taken completely seriously. Everything felt new, and more important, everything seemed to be happening for the first time.',
    },
  },
  {
    type: 'text',
    body: {
      vi: 'Cũng trong cái nền rất hai nghìn ấy, tôi biết cảm giác thích một người. Trước đó, bạn bè vẫn chỉ là bạn bè, sân trường vẫn chỉ là sân trường, buổi tan học chỉ là lúc được về nhà. Rồi một cô gái xuất hiện và những thứ rất bình thường bỗng có thêm một tầng nghĩa. Tôi bắt đầu để ý xem cô ấy đứng ở đâu trong sân, đi về lối nào, hôm nay có cười nhiều không. Có những ngày chẳng nói với nhau câu nào nhưng chỉ cần nhìn thấy cô ấy từ xa cũng đủ khiến cả buổi chiều có vẻ khác. Khi còn nhỏ hơn, người ta mong một món đồ chơi. Đến một tuổi nào đó, người ta bỗng mong một người nhìn về phía mình. Có lẽ đó là lúc tuổi thơ bắt đầu rời đi mà không báo trước.',
      en: 'Against that unmistakably two-thousands backdrop, I learned what it meant to like someone. Before then, friends were simply friends, the schoolyard was simply a schoolyard, and dismissal meant going home. Then a girl appeared and ordinary things gained another layer of meaning. I began noticing where she stood in the yard, which way she walked home, whether she laughed more that day. Some afternoons we did not speak at all, yet seeing her from a distance was enough to alter the entire day. Younger children wait for toys. At some point, you begin waiting for another person to look your way. Perhaps that is one of the quiet moments when childhood starts leaving without telling you.',
    },
  },
  {
    type: 'text',
    body: {
      vi: 'Câu tỏ tình đầu tiên của tôi chắc chẳng có gì đáng để đưa vào một cuốn tiểu thuyết. Tôi thậm chí không còn nhớ chính xác từng chữ mình đã nói. Chỉ nhớ trước đó đã nghĩ đi nghĩ lại rất nhiều, như thể nếu chọn đúng câu thì mọi thứ sẽ trở nên dễ dàng. Nhưng đứng trước người mình thích, những câu chuẩn bị sẵn bỗng biến mất. Tim đập nhanh một cách vô lý. Mặt nóng lên. Miệng nói những lời vụng về hơn dự định. Thế mà chính sự vụng về ấy mới là thứ còn lại lâu nhất. Bởi lần đầu yêu thích một người, ta chưa biết phải diễn vai gì, chưa biết cách tỏ ra bình thản, chưa có đủ những lần thất vọng để tự bảo vệ mình. Cảm xúc đi thẳng từ trong người ra ngoài, gần như không có lớp che chắn.',
      en: 'My first confession was probably nothing a novel would consider remarkable. I no longer remember the exact words. I only remember rehearsing them again and again beforehand, as though choosing the right sentence would make everything easier. Then I stood in front of the person I liked and every prepared line disappeared. My heart beat absurdly fast. My face grew hot. The words came out clumsier than intended. Yet that clumsiness is what lasted. The first time you care for someone, you do not yet know which role to perform, how to appear calm, or how to protect yourself with the lessons of previous disappointment. Feeling travels almost directly from the body into the world, with very little armor around it.',
    },
  },
  {
    type: 'text',
    body: {
      vi: 'Rồi có lần đầu tiên nắm tay người mình thích. Bây giờ nghĩ lại, đó chỉ là hai bàn tay chạm vào nhau — một việc quá nhỏ nếu đem kể bằng ngôn ngữ của người lớn. Nhưng ở tuổi ấy, khoảng cách vài centimét giữa hai người có thể dài hơn cả một con đường. Khi những ngón tay cuối cùng chạm nhau, tôi nhớ cảm giác vừa muốn giữ thật chặt vừa sợ mình làm điều gì đó quá rõ ràng. Bàn tay hơi ấm, bước chân tự nhiên chậm lại, và trong vài phút người ta có thể nghe rõ cả nhịp tim của chính mình hơn tiếng xe ngoài phố. Không có ảnh chụp, không có story, không có định vị ghi lại nơi ấy. Có lẽ chính vì không có gì chứng minh nên ký ức phải tự làm công việc giữ nó, và đã giữ suốt từng ấy năm.',
      en: 'Then came the first time I held the hand of someone I liked. Looking back, it was only two hands touching—an event almost embarrassingly small in adult language. But at that age, a few centimeters between two people can feel longer than a road. When our fingers finally touched, I remember wanting to hold on tightly while also fearing that I was revealing too much. The hand was warm, our steps somehow slowed, and for a few minutes I could hear my own heartbeat more clearly than the traffic outside. There was no photograph, no story post, no location tag preserving the place. Perhaps because nothing else recorded it, memory had to do the work itself—and it has been doing so all these years.',
    },
  },
  {
    type: 'text',
    body: {
      vi: 'Mối tình đầu thường không để lại một kết thúc lớn lao như người ta tưởng. Có khi nó chỉ nhạt dần giữa những năm học, những kỳ thi, những người bạn đổi lớp, những con đường bắt đầu đưa mỗi người về một phía khác. Một ngày nào đó, người từng khiến mình chờ đợi ngoài cổng trường trở thành một cái tên ít được nhắc đến hơn. Rồi lâu hơn nữa, ngay cả khuôn mặt trong trí nhớ cũng không còn sắc nét như trước. Điều kỳ lạ là cảm giác thì vẫn còn. Ta có thể quên một cuộc nói chuyện nhưng nhớ rất rõ mình đã hồi hộp thế nào trước nó. Có thể không còn muốn quay lại với người ấy, nhưng đôi khi vẫn muốn quay lại một buổi chiều chỉ để được làm đứa trẻ chưa biết kết quả của câu chuyện.',
      en: 'First love rarely leaves behind the grand ending we imagine. Sometimes it simply fades among school years, examinations, friends changing classes, and roads that begin carrying two people in different directions. One day, the person who once made you wait outside the school gate becomes a name mentioned less often. Much later, even the face in memory loses some of its sharpness. Strangely, the feeling remains. You may forget a conversation and remember perfectly how nervous you were before it. You may have no wish to return to that person, yet still wish to return to one afternoon simply to be the child who did not yet know how the story would end.',
    },
  },
  {
    type: 'text',
    body: {
      vi: 'Bởi vậy những bài hát của thời ấy có một quyền lực hơi bất công. Chỉ cần vài nốt nhạc cũ vang lên ở một quán cà phê, trên xe hay từ chiếc điện thoại của ai đó, hiện tại có thể nứt ra một khe rất nhỏ. Qua khe ấy là một thị xã ít xe hơn, những buổi tối chưa có quá nhiều màn hình, một kiểu tóc từng nghĩ là đẹp, một chiếc áo từng mặc mãi, sân trường, con đường về nhà và người con gái đầu tiên mình đã lấy hết can đảm để nói rằng mình thích. Âm nhạc không đưa ta trở lại thật sự. Nó làm điều gần như tàn nhẫn hơn: cho ta đứng rất gần quá khứ trong vài phút, nhìn thấy nó, cảm được nó, rồi đóng cửa lại.',
      en: 'That is why the songs from those years possess an almost unfair power. A few old notes in a café, a car, or someone else’s phone can open a narrow crack in the present. Through it lies a town with less traffic, evenings with fewer screens, a haircut once considered beautiful, a shirt worn too often, the schoolyard, the road home, and the first girl I gathered enough courage to tell that I liked her. Music does not truly take us back. It does something almost crueler: it lets us stand very close to the past for a few minutes, see it, feel it, and then closes the door again.',
    },
  },
  {
    type: 'text',
    body: {
      vi: 'Có lẽ thứ tôi nhớ nhất về những năm hai nghìn không phải chiếc điện thoại nào, bài hát nào hay kiểu quần áo nào. Tôi nhớ khả năng rung động của mình khi ấy. Một cái nhìn cũng đủ vui cả ngày. Một câu nói lỡ lời có thể làm buồn đến tối. Một bàn tay nắm lấy là một sự kiện. Một lời tỏ tình cần nhiều can đảm hơn những quyết định lớn của đời sau. Nuối tiếc mối tình đầu vì thế không nhất thiết là tiếc một người. Đôi khi ta tiếc chính mình của ngày ấy — người chưa biết phải dè chừng cảm xúc, chưa biết mọi cuộc gặp rồi sẽ có lúc kết thúc, và vẫn tin những gì đang xảy ra có thể kéo dài vô tận. Những năm hai nghìn đã qua. Cô gái ấy cũng đã bước vào một cuộc đời khác, như tất cả chúng ta. Nhưng đâu đó giữa vài nốt nhạc cũ, bàn tay đầu tiên ấy vẫn còn ấm. Và điều buồn nhất, cũng đẹp nhất, là biết rằng trong đời có rất nhiều tình yêu, nhưng sẽ không bao giờ có một lần đầu tiên thứ hai.',
      en: 'Perhaps what I miss most about the two-thousands is not a particular phone, song, or style of clothing. I miss my own capacity for feeling then. A glance could brighten an entire day. One careless sentence could darken an evening. Holding a hand was an event. A confession required more courage than decisions that would later appear far larger. The ache of first love, then, is not always the loss of a person. Sometimes it is the loss of the self we were—someone who had not yet learned to guard feeling, who did not yet know every meeting would one day end, and who still believed the present might last forever. The two-thousands are gone. That girl has also walked into another life, as all of us have. Yet somewhere inside a few old notes, that first hand is still warm. And the saddest, most beautiful thing is knowing that a life may contain many loves, but it can never contain a second first time.',
    },
  },
];

export const withFirstLoveEditorialChapterCopy = (chapter: BookChapter): BookChapter =>
  chapter.id === CHAPTER_ID ? { ...chapter, intro: chapterIntro } : chapter;

export const withFirstLoveEditorialPageCopy = (page: BookPage): BookPage =>
  page.id === PAGE_ID ? { ...page, intro: pageIntro, blocks: narrativeBlocks } : page;
