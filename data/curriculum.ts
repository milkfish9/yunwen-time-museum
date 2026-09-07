// 教材資料層：作品正文不含標點；題名、首句識別、小序分開保存。
export type Work = {
  id: string;
  tune: string;
  author: string;
  title?: string;
  topic: string;
  lines: string[];
  source: string;
  note?: string;
};
export const works: Work[] = [
  {
    id: 'boat',
    tune: '如夢令',
    author: '李清照',
    topic: '遊舟的回憶',
    lines: [
      '常記溪亭日暮',
      '沉醉不知歸路',
      '興盡晚回舟',
      '誤入藕花深處',
      '爭渡',
      '爭渡',
      '驚起一灘鷗鷺',
    ],
    source:
      'https://zh.wikisource.org/zh-hant/如夢令_(李清照)/如夢令_(常記溪亭日暮)',
  },
  {
    id: 'rain',
    tune: '如夢令',
    author: '李清照',
    topic: '雨後惜花',
    lines: [
      '昨夜雨疏風驟',
      '濃睡不消殘酒',
      '試問卷簾人',
      '卻道海棠依舊',
      '知否',
      '知否',
      '應是綠肥紅瘦',
    ],
    source:
      'https://zh.wikisource.org/zh-hant/如夢令_(李清照)/如夢令_(昨夜雨疏風驟)',
  },
  {
    id: 'bath',
    tune: '如夢令',
    author: '蘇軾',
    topic: '沐浴時的戲語',
    lines: [
      '水垢何曾相受',
      '細看兩俱無有',
      '寄語揩背人',
      '盡日勞君揮肘',
      '輕手',
      '輕手',
      '居士本來無垢',
    ],
    source: 'https://zh-hant.meirishici.com/poetry/zxz7',
    note: '只採原文，不採來源網站的 AI 賞析；「倶」正字化為「俱」。',
  },
  {
    id: 'festival',
    tune: '蝶戀花',
    author: '蘇軾',
    title: '密州上元',
    topic: '兩地元宵景象與感懷',
    lines: [
      '燈火錢塘三五夜',
      '明月如霜',
      '照見人如畫',
      '帳底吹笙香吐麝',
      '此般風味應無價',
      '寂寞山城人老也',
      '擊鼓吹簫',
      '乍入農桑社',
      '火冷燈稀霜露下',
      '昏昏雪意雲垂野',
    ],
    source: 'https://zh.wikisource.org/zh-hant/蝶戀花_(蘇軾)',
    note: '採「此般風味應無價」「乍入」版本；待教師確認課本異文。',
  },
  {
    id: 'moon',
    tune: '水調歌頭',
    author: '蘇軾',
    topic: '中秋懷人',
    lines: [
      '明月幾時有',
      '把酒問青天',
      '不知天上宮闕',
      '今夕是何年',
      '我欲乘風歸去',
      '又恐瓊樓玉宇',
      '高處不勝寒',
      '起舞弄清影',
      '何似在人間',
      '轉朱閣',
      '低綺戶',
      '照無眠',
      '不應有恨',
      '何事長向別時圓',
      '人有悲歡離合',
      '月有陰晴圓缺',
      '此事古難全',
      '但願人長久',
      '千里共嬋娟',
    ],
    source: 'https://zh.wikisource.org/zh-hant/水調歌頭_(明月幾時有)',
    note: '計正文 95 字，不計小序。',
  },
  {
    id: 'final',
    tune: '卜算子',
    author: '蘇軾',
    title: '黃州定惠院寓居作',
    topic: '孤寂中的自我寄託',
    lines: [
      '缺月掛疏桐',
      '漏斷人初靜',
      '時見幽人獨往來',
      '縹緲孤鴻影',
      '驚起卻回頭',
      '有恨無人省',
      '揀盡寒枝不肯棲',
      '寂寞沙洲冷',
    ],
    source: 'https://zh.wikisource.org/zh-hant/卜算子_(蘇軾)',
    note: '依所列來源採「定惠」「時見」；另有「定慧」「誰見」等版本，待教師確認。',
  },
];
export const halls = [
  { name: '詩經', era: '先秦', note: '四言為主', shape: [4, 4, 4, 4] },
  {
    name: '樂府詩',
    era: '漢魏六朝',
    note: '採集歌謠・入樂',
    shape: [5, 5, 7, 5],
  },
  {
    name: '古詩',
    era: '漢魏六朝',
    note: '五言、七言發展',
    shape: [5, 5, 5, 5],
  },
  { name: '近體詩', era: '唐', note: '唐代定型', shape: [7, 7, 7, 7] },
  {
    name: '詞',
    era: '宋',
    note: '唐五代發展・宋代興盛',
    shape: [6, 6, 5, 6, 2, 2, 6],
  },
  { name: '曲', era: '元', note: '元代興盛', shape: [3, 3, 6, 4, 6] },
];
export const stages = [
  {
    title: '看見句子的形狀',
    short: '長短句',
    question: '先別急著下定義。點開每一句，看文字佔了幾格。',
    bridge: '句子有長有短，那麼，想寫幾個字都可以嗎？',
  },
  {
    title: '找出看不見的模具',
    short: '模具組裝',
    question: '先選一句卡片，再點一排文字槽；也可以直接拖入。',
    bridge: '文字拿走了，格式還在。這副模具有自己的名字嗎？',
  },
  {
    title: '文字換了，什麼沒換？',
    short: '詞牌蘿蔔坑',
    question: '沿用剛才的模具，換入另外兩首真正的詞。',
    bridge: '既然同一詞牌可以寫不同內容，牌名會限制題材嗎？',
  },
  {
    title: '〈蝶戀花〉一定寫花嗎？',
    short: '牌名與內容',
    question: '打開正文中的三份線索，看看作者實際在寫什麼。',
    bridge: '內容和牌名很搭，就一定放得進模具嗎？',
  },
  {
    title: '內容很搭，也要看格式',
    short: '格式檢驗',
    question: '選一組文字，再點模具試填。這裡只比較開頭三個分句。',
    bridge: '詞牌管格式，那一首作品自己的題名又放在哪裡？',
  },
  {
    title: '拆開一首詞的三個角色',
    short: '拆解作品',
    question: '先點資訊卡，再點它所屬的角色；也可以拖曳配對。',
    bridge: '把文字填進既定格式，為什麼這個動作叫「填詞」？',
  },
  {
    title: '先有旋律，再放進文字',
    short: '詞與音樂',
    question: '想起熟悉的〈小星星〉，試著把一句自製文字放入旋律示意。',
    bridge: '同樣叫詞，有的短、有的長，怎麼量它的篇幅？',
  },
  {
    title: '讓作品站上字數尺',
    short: '字數分類',
    question: '點正文逐句計數，再把三首作品送到合適的分類區。',
    bridge: '你已看過形狀、格式和音樂，現在替這些發現貼上名字。',
  },
  {
    title: '把別稱貼回你的發現',
    short: '詞的名片',
    question: '選一張名稱卡，再點它對應的操作經驗。',
    bridge: '帶著這些工具，試著鑑定一首之前沒看過的作品。',
  },
  {
    title: '你的第一份詞作品鑑定書',
    short: '作品鑑定',
    question:
      '用陌生作品完成挑模具、牌名陷阱、拆作品和量字數，再留下自己的解釋。',
    bridge: '你已把看不見的規則，變成自己的判斷工具。',
  },
];
export const formatScope =
  '本關只檢查句長與指定作品的位置。真正填詞還須依詞牌的押韻、平仄等規定；同一詞牌也可能有不同體式。';
export const molds = [
  { name: '如夢令', shape: [6, 6, 5] },
  { name: '蝶戀花', shape: [7, 4, 5] },
  { name: '浣溪沙', shape: [7, 7, 7] },
];
export const samples = [
  {
    title: '校園午後',
    lines: ['操場邊風正輕', '下課鐘聲響起', '同學走出門'],
    mold: 0,
    kind: '教學擬作',
  },
  {
    title: '回家的路',
    lines: ['放學沿著河堤走', '夕陽落下', '書包背肩上'],
    mold: 1,
    kind: '教學擬作',
  },
  {
    title: '蝴蝶與花',
    lines: ['蝴蝶飛過一朵花', '花在春風裡輕搖', '我在窗前看日光'],
    mold: 2,
    kind: '教學擬作',
  },
];
export const roleHints = [
  '用哪副格式模具？',
  '這一首作品的題名（若有）。',
  '實際填進格式裡的文字。',
];
export const aliases = [
  {
    name: '長短句',
    experience: '我看見多數詞的句子長短不齊。',
    feedback:
      '「長短句」把你看到的句子形狀命名了。不是所有詞的每句都一定長短不同。',
  },
  {
    name: '曲子詞',
    experience: '我發現詞原本可以配合音樂歌唱。',
    feedback: '詞原與曲調密切相關，所以又稱「曲子詞」。',
  },
  {
    name: '倚聲',
    experience: '我依照既定曲調格式填入文字。',
    feedback: '「倚聲」著重依曲調格式填詞這個動作。',
  },
];
export const sources = [
  {
    label: '李清照〈如夢令〉二首',
    url: 'https://zh.wikisource.org/zh-hant/如夢令_(李清照)',
  },
  { label: '蘇軾〈如夢令〉', url: works[2].source },
  { label: '蘇軾〈蝶戀花〉', url: works[3].source },
  { label: '蘇軾〈水調歌頭〉', url: works[4].source },
  { label: '蘇軾〈卜算子〉', url: works[5].source },
  {
    label: '教育部辭典：倚聲',
    url: 'https://dict.revised.moe.edu.tw/dictView.jsp?ID=150931&la=0&powerMode=0',
  },
  {
    label: '翰林：歷代文體流變',
    url: 'https://han-lin.tw/wp-content/uploads/2019/05/中國歷代文體流變.pdf',
  },
];

export const finalCandidates = [
  {
    label: '占卜問運勢',
    kind: '教學擬作片段',
    lines: ['今日來占卜', '吉凶問先生', '抽籤看運勢', '前路可安寧'],
    feedback:
      '題材雖然提到占卜，第 3 句卻只有 5 字，模具需要 7 字。牌名的字面意思不能取代格式。',
  },
  {
    label: '孤鴻與夜景',
    kind: '蘇軾原作上片',
    lines: works[5].lines.slice(0, 4),
    feedback:
      '這四句依序是 5、5、7、5 字，符合這個上片模具；正文不必描寫占卜。完整格律仍不只檢查字數。',
  },
];
