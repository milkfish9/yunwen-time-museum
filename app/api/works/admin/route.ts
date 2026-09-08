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

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

async function currentPasswordHash() {
  const custom = await bindings()
    .DB.prepare('SELECT password_hash FROM board_admin_settings WHERE id = 1')
    .first<{ password_hash: string }>();
  return custom?.password_hash ?? bindings().BOARD_ADMIN_PASSWORD_HASH;
}

async function passwordMatches(password: unknown) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const expected = await currentPasswordHash();
  if (!expected) return false;
  const actual = await hashPassword(password);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };
    if (!(await passwordMatches(body.currentPassword))) {
      return response({ message: '目前的管理密碼不正確。' }, { status: 401 });
    }
    if (
      typeof body.newPassword !== 'string' ||
      body.newPassword.length < 8 ||
      body.newPassword.length > 64
    ) {
      return response(
        { message: '新密碼請設定為 8 至 64 個字元。' },
        { status: 400 },
      );
    }
    const passwordHash = await hashPassword(body.newPassword);
    await bindings()
      .DB.prepare(
        `INSERT INTO board_admin_settings (id, password_hash, updated_at)
         VALUES (1, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           password_hash = excluded.password_hash,
           updated_at = excluded.updated_at`,
      )
      .bind(passwordHash, Date.now())
      .run();
    return response({ changed: true });
  } catch {
    return response({ message: '密碼尚未更新，請再試一次。' }, { status: 500 });
  }
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
