import assert from 'node:assert/strict';
import test from 'node:test';
import { juejuPoems, rhymeRules } from '../data/jueju.ts';

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
