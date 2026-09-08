export type Hall = {
  name: string;
  era: string;
  note: string;
  shape: number[];
};

export type CiPattern = {
  id: string;
  name: string;
  guide: string;
  stanzas: number[][];
  source: string;
};

export const halls: Hall[] = [
  { name: '詩經', era: '先秦', note: '四言為主', shape: [4, 4, 4, 4] },
  {
    name: '樂府詩',
    era: '漢魏六朝',
    note: '採集歌謠・可入樂',
    shape: [4, 4, 6, 6],
  },
  {
    name: '古詩',
    era: '漢魏六朝',
    note: '五言、七言發展',
    shape: [5, 5, 5, 5],
  },
  { name: '近體詩', era: '唐', note: '格律整齊', shape: [7, 7, 7, 7] },
  {
    name: '詞',
    era: '宋',
    note: '依詞牌填寫',
    shape: [6, 6, 5, 6, 2, 2, 6],
  },
  { name: '曲', era: '元', note: '曲牌與襯字', shape: [4, 4, 7, 3] },
];

export const ciPatterns: CiPattern[] = [
  {
    id: 'yumeiren',
    name: '虞美人',
    guide: '依李煜〈春花秋月何時了〉代表體式',
    stanzas: [
      [7, 5, 7, 9],
      [7, 5, 7, 9],
    ],
    source:
      'https://zh.wikisource.org/zh-hant/虞美人_(春花秋月何時了)',
  },
  {
    id: 'nanxiangzi',
    name: '南鄉子',
    guide: '依辛棄疾〈登京口北固亭有懷〉代表體式',
    stanzas: [
      [5, 7, 7, 2, 7],
      [5, 7, 7, 2, 7],
    ],
    source: 'https://zh.wikisource.org/zh-hant/南鄉子_(辛棄疾)',
  },
  {
    id: 'chounuer',
    name: '醜奴兒',
    guide: '依辛棄疾〈書博山道中壁〉代表體式',
    stanzas: [
      [7, 4, 4, 7],
      [7, 4, 4, 7],
    ],
    source: 'https://zh.wikisource.org/zh-hant/醜奴兒·書博山道中壁',
  },
  {
    id: 'rumengling',
    name: '如夢令',
    guide: '依李清照〈常記溪亭日暮〉代表體式',
    stanzas: [[6, 6, 5, 6, 2, 2, 6]],
    source:
      'https://zh.wikisource.org/zh-hant/如夢令_(李清照)/如夢令_(常記溪亭日暮)',
  },
  {
    id: 'chaitoufeng',
    name: '釵頭鳳',
    guide: '依陸游〈紅酥手〉代表體式',
    stanzas: [
      [3, 3, 7, 3, 3, 4, 4, 1, 1, 1],
      [3, 3, 7, 3, 3, 4, 4, 1, 1, 1],
    ],
    source:
      'https://zh.wikisource.org/zh-hant/詞律_(四庫全書本)/卷08',
  },
];

export const creationTopics = [
  '上學要遲到了',
  '考試考砸了',
  '出去玩好開心',
] as const;

export const learningSources = [
  {
    label: '國立成功大學圖書館：宋詞',
    url: 'https://libapp.lib.ncku.edu.tw/libref/chinese/talk/song.htm',
  },
  {
    label: '教育部《重編國語辭典修訂本》：曲牌',
    url: 'https://dict.revised.moe.edu.tw/dictView.jsp?ID=103142&la=0&powerMode=0',
  },
];
