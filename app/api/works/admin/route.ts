import { env } from 'cloudflare:workers';

type AdminEnvironment = {
  BOARD_ADMIN_PASSWORD_HASH?: string;
  DB: D1Database;
};

function bindings() {
  return env as unknown as AdminEnvironment;
}

function response(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('cache-control', 'no-store');
  return Response.json(data, { ...init, headers });
}

async function passwordMatches(password: unknown) {
  const expected = bindings().BOARD_ADMIN_PASSWORD_HASH;
  if (!expected || typeof password !== 'string' || password.length > 128)
    return false;
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const actual = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: unknown };
    if (!(await passwordMatches(body.password))) {
      return response({ message: '管理密碼不正確。' }, { status: 401 });
    }
    return response({ authenticated: true });
  } catch {
    return response(
      { message: '無法驗證管理密碼，請再試一次。' },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown; password?: unknown };
    if (!(await passwordMatches(body.password))) {
      return response({ message: '管理密碼不正確。' }, { status: 401 });
    }
    if (typeof body.id !== 'string' || !body.id) {
      return response({ message: '找不到要刪除的作品。' }, { status: 400 });
    }
    const result = await bindings()
      .DB.prepare('DELETE FROM ci_works WHERE id = ?')
      .bind(body.id)
      .run();
    if (!result.meta.changes) {
      return response(
        { message: '這篇作品已經不在佈告欄上。' },
        { status: 404 },
      );
    }
    return response({ deleted: true });
  } catch {
    return response({ message: '作品尚未刪除，請再試一次。' }, { status: 500 });
  }
}
