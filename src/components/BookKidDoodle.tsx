type BookKidDoodleProps = {
  chapterNumber: string;
  compact?: boolean;
};

const variantsByChapter: Record<string, string> = {
  '01': 'river',
  '02': 'flowers',
  '03': 'house',
  '04': 'street',
  '05': 'school',
  '06': 'radio',
  '07': 'valley',
  '08': 'hills',
  '09': 'history',
  '10': 'insect',
  '11': 'memorial',
  '12': 'west',
  '13': 'night',
};

const normalizeChapterNumber = (chapterNumber: string) => chapterNumber.padStart(2, '0');

const RiverDoodle = () => (
  <>
    <path className="book-kid-doodle__green" d="M18 168 C62 146 92 182 132 158 C172 134 210 168 302 134" />
    <path className="book-kid-doodle__blue" d="M12 122 C48 98 82 140 116 116 C154 90 188 130 226 105 C254 88 280 91 308 74" />
    <path className="book-kid-doodle__blue book-kid-doodle__thin" d="M16 143 C62 124 92 160 132 139 C172 116 212 146 306 111" />
    <circle className="book-kid-doodle__yellow-fill" cx="260" cy="42" r="22" />
    <path className="book-kid-doodle__brown" d="M56 92 L96 82 L138 91" />
    <path className="book-kid-doodle__brown" d="M62 92 L62 112 M94 84 L94 109 M132 92 L132 111" />
  </>
);

const FlowerDoodle = () => (
  <>
    <path className="book-kid-doodle__green" d="M36 175 C80 132 123 162 157 126 C194 86 238 112 288 72" />
    {[50, 93, 142, 190, 236, 276].map((cx, index) => (
      <g key={cx} transform={`translate(${cx} ${index % 2 ? 93 : 126}) rotate(${index * 16})`}>
        <circle className="book-kid-doodle__pink-fill" cx="0" cy="-12" r="10" />
        <circle className="book-kid-doodle__pink-fill" cx="12" cy="0" r="10" />
        <circle className="book-kid-doodle__pink-fill" cx="0" cy="12" r="10" />
        <circle className="book-kid-doodle__pink-fill" cx="-12" cy="0" r="10" />
        <circle className="book-kid-doodle__yellow-fill" cx="0" cy="0" r="7" />
      </g>
    ))}
    <path className="book-kid-doodle__blue book-kid-doodle__thin" d="M22 61 C76 35 99 60 146 43 C207 21 229 48 303 28" />
  </>
);

const HouseDoodle = () => (
  <>
    <path className="book-kid-doodle__green" d="M18 178 C68 158 111 183 157 161 C209 138 247 165 302 142" />
    <path className="book-kid-doodle__red-fill" d="M79 98 L153 45 L229 101 Z" />
    <rect className="book-kid-doodle__cream-fill" x="93" y="99" width="121" height="76" />
    <rect className="book-kid-doodle__blue-fill" x="111" y="118" width="27" height="23" />
    <rect className="book-kid-doodle__brown-fill" x="164" y="124" width="30" height="51" />
    <path className="book-kid-doodle__green" d="M252 173 L252 106" />
    <circle className="book-kid-doodle__green-fill" cx="251" cy="89" r="27" />
  </>
);

const StreetDoodle = () => (
  <>
    <path className="book-kid-doodle__gray-fill" d="M136 218 C125 170 132 132 151 90 C163 62 164 43 158 12 L218 12 C205 54 215 85 232 115 C248 143 263 175 281 218 Z" />
    <path className="book-kid-doodle__brown" d="M31 166 L101 140 L95 98 L38 119 Z" />
    <path className="book-kid-doodle__brown" d="M222 153 L292 132 L288 84 L225 105 Z" />
    <path className="book-kid-doodle__yellow" d="M170 28 C176 65 170 91 162 120 C155 147 154 179 165 210" />
    <path className="book-kid-doodle__blue book-kid-doodle__thin" d="M37 70 L88 58 M229 58 L287 45" />
  </>
);

const SchoolDoodle = () => (
  <>
    <rect className="book-kid-doodle__cream-fill" x="68" y="83" width="185" height="91" />
    <path className="book-kid-doodle__red-fill" d="M56 86 L160 31 L264 87 Z" />
    <rect className="book-kid-doodle__blue-fill" x="96" y="109" width="31" height="26" />
    <rect className="book-kid-doodle__blue-fill" x="191" y="109" width="31" height="26" />
    <rect className="book-kid-doodle__brown-fill" x="144" y="121" width="33" height="53" />
    <path className="book-kid-doodle__red" d="M255 63 L255 28 L289 38 L255 49" />
    <path className="book-kid-doodle__green" d="M42 176 C96 158 146 184 205 162 C239 150 267 154 301 143" />
  </>
);

const RadioDoodle = () => (
  <>
    <rect className="book-kid-doodle__gray-fill" x="57" y="75" width="201" height="105" rx="10" />
    <circle className="book-kid-doodle__yellow-fill" cx="204" cy="127" r="31" />
    <path className="book-kid-doodle__black" d="M84 105 L151 105 M84 126 L139 126 M84 147 L158 147" />
    <path className="book-kid-doodle__black" d="M103 73 L61 35 M199 74 L248 31" />
    <path className="book-kid-doodle__red" d="M271 86 C292 103 299 131 290 155 M43 88 C26 107 22 133 35 157" />
    <path className="book-kid-doodle__blue book-kid-doodle__thin" d="M268 58 C305 82 318 130 300 175" />
  </>
);

const ValleyDoodle = () => (
  <>
    <path className="book-kid-doodle__green-fill" d="M6 187 C57 126 100 147 151 104 C207 58 258 87 318 34 L318 220 L6 220 Z" />
    <path className="book-kid-doodle__yellow" d="M32 179 L302 72 M59 198 L316 119 M105 216 L318 161" />
    <path className="book-kid-doodle__green" d="M27 151 C90 131 120 156 170 131 C220 105 252 124 303 92" />
    <circle className="book-kid-doodle__yellow-fill" cx="65" cy="50" r="18" />
  </>
);

const HillsDoodle = () => (
  <>
    <path className="book-kid-doodle__green-fill" d="M8 169 C61 80 119 116 157 61 C208 132 238 75 314 139 L314 220 L8 220 Z" />
    <path className="book-kid-doodle__green" d="M28 165 C74 118 109 129 151 88 C184 120 219 115 288 125" />
    <path className="book-kid-doodle__brown" d="M75 170 L75 115 M75 115 L54 136 M75 115 L99 133" />
    <path className="book-kid-doodle__brown" d="M236 153 L236 96 M236 96 L215 119 M236 96 L264 116" />
    <path className="book-kid-doodle__blue book-kid-doodle__thin" d="M34 58 C83 34 127 52 168 38 C215 23 252 34 290 18" />
  </>
);

const HistoryDoodle = () => (
  <>
    <path className="book-kid-doodle__green-fill" d="M5 179 C67 127 118 146 169 111 C219 77 257 98 317 69 L317 220 L5 220 Z" />
    <path className="book-kid-doodle__gray-fill" d="M69 133 L151 86 L241 127 L237 166 L72 171 Z" />
    <path className="book-kid-doodle__black" d="M95 134 L130 121 M151 113 L185 102 M198 132 L230 122" />
    <path className="book-kid-doodle__red-fill" d="M161 38 L174 66 L204 69 L181 89 L188 119 L162 103 L134 119 L143 89 L120 69 L149 66 Z" />
  </>
);

const InsectDoodle = () => (
  <>
    <ellipse className="book-kid-doodle__brown-fill" cx="162" cy="118" rx="45" ry="57" />
    <circle className="book-kid-doodle__gray-fill" cx="162" cy="62" r="25" />
    <path className="book-kid-doodle__black" d="M121 93 L78 70 M119 121 L71 122 M128 149 L91 181" />
    <path className="book-kid-doodle__black" d="M203 93 L246 70 M205 121 L253 122 M196 149 L233 181" />
    <path className="book-kid-doodle__yellow" d="M162 93 L162 169" />
    <path className="book-kid-doodle__green" d="M28 190 C86 165 128 193 190 168 C229 152 268 154 301 138" />
  </>
);

const MemorialDoodle = () => (
  <>
    <path className="book-kid-doodle__gray-fill" d="M119 91 L200 91 L215 178 L103 178 Z" />
    <path className="book-kid-doodle__yellow-fill" d="M154 50 C142 69 153 82 160 91 C173 76 178 61 164 43 C164 56 159 61 154 50 Z" />
    <path className="book-kid-doodle__brown" d="M27 194 C85 152 118 167 153 139 C195 106 229 127 296 87" />
    <path className="book-kid-doodle__green" d="M40 178 C82 160 122 180 160 159 C198 138 241 154 286 128" />
    <path className="book-kid-doodle__black book-kid-doodle__thin" d="M133 119 L190 119 M129 143 L196 143" />
  </>
);

const WestDoodle = () => (
  <>
    <path className="book-kid-doodle__green-fill" d="M7 145 C48 68 100 104 144 52 C201 111 233 61 315 120 L315 220 L7 220 Z" />
    <path className="book-kid-doodle__gray-fill" d="M143 220 C155 178 157 143 149 111 L186 103 C190 146 213 177 254 220 Z" />
    <path className="book-kid-doodle__yellow" d="M172 112 C173 143 181 175 199 214" />
    <path className="book-kid-doodle__brown" d="M55 98 L55 60 L126 60 L126 98 Z M61 79 L119 79" />
    <path className="book-kid-doodle__red" d="M77 44 L104 44" />
  </>
);

const NightDoodle = () => (
  <>
    <rect className="book-kid-doodle__night-fill" x="0" y="0" width="320" height="220" />
    <circle className="book-kid-doodle__yellow-fill" cx="251" cy="47" r="24" />
    <path className="book-kid-doodle__black" d="M92 180 L92 84 L127 84" />
    <circle className="book-kid-doodle__yellow-fill" cx="139" cy="89" r="13" />
    <path className="book-kid-doodle__red" d="M83 151 C115 130 144 136 174 151 L200 151" />
    <circle className="book-kid-doodle__gray-fill" cx="107" cy="166" r="13" />
    <circle className="book-kid-doodle__gray-fill" cx="180" cy="166" r="13" />
    <path className="book-kid-doodle__blue book-kid-doodle__thin" d="M25 58 C74 39 108 57 151 43 C190 30 218 39 238 28" />
  </>
);

const renderDoodle = (variant: string) => {
  switch (variant) {
    case 'flowers': return <FlowerDoodle />;
    case 'house': return <HouseDoodle />;
    case 'street': return <StreetDoodle />;
    case 'school': return <SchoolDoodle />;
    case 'radio': return <RadioDoodle />;
    case 'valley': return <ValleyDoodle />;
    case 'hills': return <HillsDoodle />;
    case 'history': return <HistoryDoodle />;
    case 'insect': return <InsectDoodle />;
    case 'memorial': return <MemorialDoodle />;
    case 'west': return <WestDoodle />;
    case 'night': return <NightDoodle />;
    default: return <RiverDoodle />;
  }
};

export const BookKidDoodle = ({ chapterNumber, compact = false }: BookKidDoodleProps) => {
  const normalizedNumber = normalizeChapterNumber(chapterNumber);
  const variant = variantsByChapter[normalizedNumber] ?? 'river';

  return (
    <svg
      className={`book-kid-doodle book-kid-doodle--${variant} ${compact ? 'book-kid-doodle--compact' : ''}`}
      viewBox="0 0 320 220"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="book-kid-doodle__paper" x="0" y="0" width="320" height="220" />
      <path className="book-kid-doodle__sky" d="M12 28 C70 8 113 26 161 15 C221 2 261 15 310 7" />
      {renderDoodle(variant)}
      <text className="book-kid-doodle__label" x="18" y="38">CH {normalizedNumber}</text>
      <path className="book-kid-doodle__scribble" d="M18 204 C71 196 100 211 151 202 C207 191 242 207 301 197" />
    </svg>
  );
};
