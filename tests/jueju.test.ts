import assert from 'node:assert/strict';
import test from 'node:test';
import { juejuPoems, rhymeRules } from '../data/jueju.ts';
import { qualityCases } from '../data/jueju-quality.ts';

void test('第一分頁只使用三首指定絕句，順序正確', () => {
  assert.deepEqual(
    juejuPoems.map((poem) => poem.title),
    ['靜夜思', '楓橋夜泊', '登鸛雀樓'],
  );
});

void test('三首作品皆為四句，字數依序建立五言、七言、五言模型', () => {
  assert.deepEqual(
    juejuPoems.map((poem) => [poem.lineCount, poem.charactersPerLine]),
    [
      [4, 5],
      [4, 7],
      [4, 5],
    ],
  );
  for (const poem of juejuPoems) {
    assert.equal(poem.lines.length, 4);
    assert.ok(
      poem.lines.every(
        (line) => Array.from(line).length === poem.charactersPerLine,
      ),
    );
  }
});

void test('押韻位置先形成一二四印象，再由登鸛雀樓修正為二四固定', () => {
  assert.deepEqual(
    juejuPoems.map((poem) =>
      poem.endings.flatMap((ending, index) =>
        ending.rhymes ? [index + 1] : [],
      ),
    ),
    [
      [1, 2, 4],
      [1, 2, 4],
      [2, 4],
    ],
  );
});

void test('結構卡押韻規則符合第一句可選、偶數句必押、第三句不押', () => {
  assert.deepEqual(
    rhymeRules.map((item) => [item.position, item.rule]),
    [
      ['第1句', '可押可不押'],
      ['第2句', '一定押韻'],
      ['第3句', '不押韻'],
      ['第4句', '一定押韻'],
    ],
  );
});

void test('絕句品管局使用一首真實唐詩與兩首明確標示的教學擬作', () => {
  assert.deepEqual(
    qualityCases.map((item) => [item.title, item.sourceLabel]),
    [
      ['竹里館', '唐詩'],
      ['山窗即景', '教學擬作'],
      ['江樓晚望', '教學擬作'],
    ],
  );
});

void test('品管卷宗依序檢驗完全合格、字數故障與押韻故障', () => {
  assert.deepEqual(
    qualityCases.map((item) => item.expected),
    [
      {
        lineGate: 'four-lines',
        characterGate: 'five-character',
        rhymeGate: 'rhyme-pass',
      },
      {
        lineGate: 'four-lines',
        characterGate: 'invalid-character-count',
      },
      {
        lineGate: 'four-lines',
        characterGate: 'five-character',
        rhymeGate: 'rhyme-fail',
      },
    ],
  );
  assert.deepEqual(
    qualityCases.map((item) =>
      item.lines.map((line) => Array.from(line).length),
    ),
    [
      [5, 5, 5, 5],
      [6, 6, 6, 6],
      [5, 5, 5, 5],
    ],
  );
});
