export type JuejuPoem = {
  id: string;
  title: string;
  author: string;
  lines: string[];
  endings: { character: string; zhuyin: string; rhymes: boolean }[];
  lineCount: number;
  charactersPerLine: number;
  kind: '五言絕句' | '七言絕句';
};

export const juejuPoems: JuejuPoem[] = [
  {
    id: 'jing-ye-si',
    title: '靜夜思',
    author: '李白',
    lines: ['床前明月光', '疑是地上霜', '舉頭望明月', '低頭思故鄉'],
    endings: [
      { character: '光', zhuyin: 'ㄍㄨㄤ', rhymes: true },
      { character: '霜', zhuyin: 'ㄕㄨㄤ', rhymes: true },
      { character: '月', zhuyin: 'ㄩㄝˋ', rhymes: false },
      { character: '鄉', zhuyin: 'ㄒㄧㄤ', rhymes: true },
    ],
    lineCount: 4,
    charactersPerLine: 5,
    kind: '五言絕句',
  },
  {
    id: 'feng-qiao-ye-bo',
    title: '楓橋夜泊',
    author: '張繼',
    lines: [
      '月落烏啼霜滿天',
      '江楓漁火對愁眠',
      '姑蘇城外寒山寺',
      '夜半鐘聲到客船',
    ],
    endings: [
      { character: '天', zhuyin: 'ㄊㄧㄢ', rhymes: true },
      { character: '眠', zhuyin: 'ㄇㄧㄢˊ', rhymes: true },
      { character: '寺', zhuyin: 'ㄙˋ', rhymes: false },
      { character: '船', zhuyin: 'ㄔㄨㄢˊ', rhymes: true },
    ],
    lineCount: 4,
    charactersPerLine: 7,
    kind: '七言絕句',
  },
  {
    id: 'deng-guan-que-lou',
    title: '登鸛雀樓',
    author: '王之渙',
    lines: ['白日依山盡', '黃河入海流', '欲窮千里目', '更上一層樓'],
    endings: [
      { character: '盡', zhuyin: 'ㄐㄧㄣˋ', rhymes: false },
      { character: '流', zhuyin: 'ㄌㄧㄡˊ', rhymes: true },
      { character: '目', zhuyin: 'ㄇㄨˋ', rhymes: false },
      { character: '樓', zhuyin: 'ㄌㄡˊ', rhymes: true },
    ],
    lineCount: 4,
    charactersPerLine: 5,
    kind: '五言絕句',
  },
];

export const rhymeRules = [
  { position: '第1句', rule: '可押可不押' },
  { position: '第2句', rule: '一定押韻' },
  { position: '第3句', rule: '不押韻' },
  { position: '第4句', rule: '一定押韻' },
] as const;
