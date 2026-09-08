import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ciPatterns, creationTopics, halls } from '../data/ci-workshop.ts';
import {
  countWritingCharacters,
  firstIncompleteLine,
  flattenPattern,
  wheelTargetDegrees,
} from '../lib/ci-workshop.ts';

void test('首頁維持六個時代節點與指定順序', () => {
  assert.deepEqual(
    halls.map((hall) => hall.name),
    ['詩經', '樂府詩', '古詩', '近體詩', '詞', '曲'],
  );
  assert.deepEqual(halls[1].shape, [4, 4, 6, 6]);
});

void test('扭蛋庫只收五個詞牌，不混入山坡羊', () => {
  assert.deepEqual(
    ciPatterns.map((pattern) => pattern.name),
    ['虞美人', '南鄉子', '醜奴兒', '如夢令', '釵頭鳳'],
  );
  assert.equal(
    ciPatterns.some((pattern) => pattern.name === '山坡羊'),
    false,
  );
});

void test('五副代表體式的總字數正確', () => {
  assert.deepEqual(
    ciPatterns.map((pattern) =>
      flattenPattern(pattern).reduce((sum, length) => sum + length, 0),
    ),
    [56, 56, 44, 33, 60],
  );
});

void test('題目轉盤包含三個指定題目與自由創作', () => {
  assert.deepEqual(
    [...creationTopics],
    ['上學要遲到了', '考試考砸了', '出去玩好開心', '自由創作'],
  );
});

void test('字數檢查忽略空白與標點', () => {
  assert.equal(countWritingCharacters('快走，快走！'), 4);
  const pattern = ciPatterns.find((item) => item.name === '如夢令')!;
  const result = firstIncompleteLine(pattern, ['今天鬧鐘沒響', '書包還在桌上']);
  assert.deepEqual(result, { index: 2, expected: 5, actual: 0 });
});

void test('轉盤四個題目都會把對應區塊中心停在指針下', () => {
  let previous = 0;
  for (let index = 0; index < 4; index += 1) {
    const degrees = wheelTargetDegrees(previous, index);
    assert.equal((((degrees + index * 90 + 45) % 360) + 360) % 360, 0);
    assert.ok(degrees > previous);
    previous = degrees;
  }
});
