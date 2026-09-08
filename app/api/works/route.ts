import { env } from 'cloudflare:workers';
import { ciPatterns, creationTopics } from '@/data/ci-workshop';
import { countWritingCharacters, flattenPattern } from '@/lib/ci-workshop';

type WorkRow = {
  id: string;
  author: string;
  tune: string;
  topic: string;
  lines_json: string;
  created_at: number;
};

function database() {
  return (env as unknown as { DB: D1Database }).DB;
}

function response(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('cache-control', 'no-store');
  return Response.json(data, {
    ...init,
    headers,
  });
}

export async function GET() {
  try {
    const result = await database()
      .prepare(
        `SELECT id, author, tune, topic, lines_json, created_at
         FROM ci_works ORDER BY created_at DESC LIMIT 60`,
      )
      .all<WorkRow>();
    return response({
      works: result.results.map((row) => ({
        id: row.id,
        author: row.author,
        tune: row.tune,
        topic: row.topic,
        lines: JSON.parse(row.lines_json) as string[],
        createdAt: row.created_at,
      })),
    });
  } catch {
    return response(
      { message: '汴京城佈告欄暫時無法開啟，請稍後再試。' },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      author?: unknown;
      tune?: unknown;
      topic?: unknown;
      lines?: unknown;
    };
    const author = typeof body.author === 'string' ? body.author.trim() : '';
    const pattern = ciPatterns.find((item) => item.name === body.tune);
    const topic = typeof body.topic === 'string' ? body.topic : '';
    const lines = Array.isArray(body.lines)
      ? body.lines.map((line) => (typeof line === 'string' ? line.trim() : ''))
      : [];
    const shape = pattern ? flattenPattern(pattern) : [];
    const validLines =
      pattern &&
      lines.length === shape.length &&
      lines.every(
        (line, index) => countWritingCharacters(line) === shape[index],
      );

    if (
      author.length < 1 ||
      author.length > 12 ||
      !pattern ||
      !creationTopics.includes(topic as (typeof creationTopics)[number]) ||
      !validLines
    ) {
      return response(
        { message: '作品資料不完整，請檢查詞人名、詞牌、題目與每句字數。' },
        { status: 400 },
      );
    }

    const work = {
      id: crypto.randomUUID(),
      author,
      tune: pattern.name,
      topic,
      lines,
      createdAt: Date.now(),
    };
    await database()
      .prepare(
        `INSERT INTO ci_works (id, author, tune, topic, lines_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        work.id,
        work.author,
        work.tune,
        work.topic,
        JSON.stringify(work.lines),
        work.createdAt,
      )
      .run();
    return response({ work }, { status: 201 });
  } catch {
    return response(
      { message: '作品沒有送達佈告欄，請再試一次。' },
      { status: 500 },
    );
  }
}
