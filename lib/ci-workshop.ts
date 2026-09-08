import type { CiPattern } from '@/data/ci-workshop';

export function flattenPattern(pattern: CiPattern): number[] {
  return pattern.stanzas.flat();
}

export function countWritingCharacters(value: string): number {
  return Array.from(value).filter(
    (character) => !/[\s，。！？、；：「」『』（）〈〉《》…—,.!?;:'"()[\]{}]/u.test(character),
  ).length;
}

export function firstIncompleteLine(
  pattern: CiPattern,
  lines: string[],
): { index: number; expected: number; actual: number } | null {
  const shape = flattenPattern(pattern);
  for (let index = 0; index < shape.length; index += 1) {
    const actual = countWritingCharacters(lines[index] ?? '');
    if (actual !== shape[index]) return { index, expected: shape[index], actual };
  }
  return null;
}
