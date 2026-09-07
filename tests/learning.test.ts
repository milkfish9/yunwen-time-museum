import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  characters,
  countWords,
  classify,
  matches,
  slotFeedback,
  readProgress,
} from '../lib/learning.ts';
import { works, samples, molds } from '../data/curriculum.ts';
void test('教材正文與字數尺一致，標點不計數', () => {
  assert.deepEqual(
    works.map((w) => countWords(w.lines)),
    [33, 33, 33, 60, 95, 44],
  );
  assert.equal(characters('知否，知否？').length, 4);
});
void test('三首真實如夢令維持相同模具', () => {
  for (const w of works.slice(0, 3))
    assert.ok(matches(w.lines, [6, 6, 5, 6, 2, 2, 6]));
  assert.equal(matches(works[0].lines, [6, 6, 5, 6, 2, 6]), false);
});
void test('58/59 與 90/91 邊界', () => {
  assert.deepEqual([33, 58, 59, 90, 91, 95].map(classify), [
    '小令',
    '小令',
    '中調',
    '中調',
    '長調',
    '長調',
  ]);
});
void test('語意陷阱必須由句長決定', () => {
  samples.forEach((s) => assert.ok(matches(s.lines, molds[s.mold].shape)));
  assert.equal(matches(samples[2].lines, molds[1].shape), false);
});
void test('錯誤回饋區分字數與原作位置', () => {
  assert.match(slotFeedback('爭渡', '常記溪亭日暮', 0)!, /2 字.*6 格/);
  assert.match(
    slotFeedback('沉醉不知歸路', '常記溪亭日暮', 0)!,
    /字數符合.*原作位置/,
  );
  assert.equal(slotFeedback('爭渡', '爭渡', 4), null);
});
void test('損壞或非預期本機進度不造成錯誤認證', () => {
  assert.deepEqual(readProgress('{bad'), []);
  assert.deepEqual(readProgress('{"0":true}'), []);
  assert.deepEqual(readProgress('[0,0,9,10,-1,"2",1.3]'), [0, 9]);
});
