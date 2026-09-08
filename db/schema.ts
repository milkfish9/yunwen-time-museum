import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const ciWorks = sqliteTable(
  'ci_works',
  {
    id: text('id').primaryKey(),
    author: text('author').notNull(),
    tune: text('tune').notNull(),
    topic: text('topic').notNull(),
    linesJson: text('lines_json').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('ci_works_created_at_idx').on(table.createdAt)],
);

export const boardAdminSettings = sqliteTable('board_admin_settings', {
  id: integer('id').primaryKey(),
  passwordHash: text('password_hash').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
