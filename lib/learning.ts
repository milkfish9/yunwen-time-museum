export const characters = (text: string) =>
  Array.from(text.replace(/[^\p{Script=Han}]/gu, ''));
export const countWords = (lines: string[]) =>
  lines.reduce((sum, line) => sum + characters(line).length, 0);
export function classify(count: number) {
  return count <= 58 ? '小令' : count <= 90 ? '中調' : '長調';
}
export function matches(lines: string[], shape: number[]) {
  return (
    lines.length === shape.length &&
    lines.every((line, i) => characters(line).length === shape[i])
  );
}
export function slotFeedback(text: string, expected: string, index: number) {
  const actual = characters(text).length;
  const target = characters(expected).length;
  if (actual !== target)
    return `這句有 ${actual} 字，第 ${index + 1} 槽只有 ${target} 格。先比對句長，再找合適的位置。`;
  if (text !== expected)
    return `字數符合 ${target} 格，但這是還原原作的活動：第 ${index + 1} 句是「${expected}」。字數相同不表示原作位置相同。`;
  return null;
}
export function readProgress(value: string | null): number[] {
  try {
    const p = JSON.parse(value ?? '[]');
    return Array.isArray(p)
      ? [...new Set(p.filter((n) => Number.isInteger(n) && n >= 0 && n < 10))]
      : [];
  } catch {
    return [];
  }
}
