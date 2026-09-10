export type QualityDecision =
  | 'four-lines'
  | 'not-four-lines'
  | 'five-character'
  | 'seven-character'
  | 'invalid-character-count'
  | 'rhyme-pass'
  | 'rhyme-fail';

export type QualityCase = {
  id: string;
  title: string;
  author: string;
  sourceLabel: '唐詩' | '教學擬作';
  lines: string[];
  endings: { character: string; zhuyin: string }[];
  expected: {
    lineGate: QualityDecision;
    characterGate: QualityDecision;
    rhymeGate?: QualityDecision;
  };
  result: '基礎規格合格' | '退回修正';
  finding: string;
};

export const qualityCases: QualityCase[] = [
  {
    id: 'zhu-li-guan',
    title: '竹里館',
    author: '王維',
    sourceLabel: '唐詩',
    lines: ['獨坐幽篁裡', '彈琴復長嘯', '深林人不知', '明月來相照'],
    endings: [
      { character: '裡', zhuyin: 'ㄌㄧˇ' },
      { character: '嘯', zhuyin: 'ㄒㄧㄠˋ' },
      { character: '知', zhuyin: 'ㄓ' },
      { character: '照', zhuyin: 'ㄓㄠˋ' },
    ],
    expected: {
      lineGate: 'four-lines',
      characterGate: 'five-character',
      rhymeGate: 'rhyme-pass',
    },
    result: '基礎規格合格',
    finding: '四句、每句五字，第2、4句「嘯／照」押韻，通過本站規格。',
  },
  {
    id: 'shan-chuang-ji-jing',
    title: '山窗即景',
    author: '本站編撰',
    sourceLabel: '教學擬作',
    lines: ['晨光映入書窗', '竹影輕搖滿牆', '遠寺鐘聲初歇', '清風又送花香'],
    endings: [
      { character: '窗', zhuyin: 'ㄔㄨㄤˋ' },
      { character: '牆', zhuyin: 'ㄑㄧㄤˊ' },
      { character: '歇', zhuyin: 'ㄒㄧㄡ' },
      { character: '香', zhuyin: 'ㄒㄧㄤ' },
    ],
    expected: {
      lineGate: 'four-lines',
      characterGate: 'invalid-character-count',
    },
    result: '退回修正',
    finding: '虽然共有4句，但每句是6字，不是五言或七言絕句的規格。',
  },
  {
    id: 'jiang-lou-wan-wang',
    title: '江樓晚望',
    author: '本站編撰',
    sourceLabel: '教學擬作',
    lines: ['落日照江洲', '孤帆帶晚風', '客心隨雁遠', '月上倚高樓'],
    endings: [
      { character: '洲', zhuyin: 'ㄓㄡ' },
      { character: '風', zhuyin: 'ㄈㄥ' },
      { character: '遠', zhuyin: 'ㄩㄢˇ' },
      { character: '樓', zhuyin: 'ㄌㄡˊ' },
    ],
    expected: {
      lineGate: 'four-lines',
      characterGate: 'five-character',
      rhymeGate: 'rhyme-fail',
    },
    result: '退回修正',
    finding: '句數和字數都通過，但第2、4句「風／樓」沒有押韻，因此退件。',
  },
];
