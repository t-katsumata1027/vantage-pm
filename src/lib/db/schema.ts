import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  date,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ----------------------------------------------------------------------------
// Teams
// ----------------------------------------------------------------------------
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
});

// ----------------------------------------------------------------------------
// Members (社内担当者マスタ)
// ----------------------------------------------------------------------------
export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  avatarUrl: text('avatar_url'),                    // Optional uploaded image URL
  avatarColor: text('avatar_color').notNull().default('#6366f1'), // Initials bg color
});

// ----------------------------------------------------------------------------
// Projects (SALES, ALLIANCE, PROMO, RD)
// ----------------------------------------------------------------------------
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['SALES', 'ALLIANCE', 'PROMO', 'RD'] }).notNull(),
  status: text('status').notNull().default('PLANNING'),

  // SALES specific
  revenue: numeric('revenue'),
  probability: integer('probability'),

  // Estimations
  duration: integer('duration'), // Months

  // Custom Fields (JSONB holds flexible structures like e.g. data sizes, mesh count)
  customFields: jsonb('custom_fields').default({}),
});

// ----------------------------------------------------------------------------
// Project Members (案件-担当者 中間テーブル)
// ACCOUNT_MANAGER = 顧客窓口担当者（メイン1名推奨） / SUB_CONTACT = サブ担当
// ----------------------------------------------------------------------------
export const projectMembers = pgTable('project_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['ACCOUNT_MANAGER', 'SUB_CONTACT'] })
    .notNull()
    .default('SUB_CONTACT'),
});

// ----------------------------------------------------------------------------
// Tasks
// ----------------------------------------------------------------------------
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  taskType: text('task_type', { enum: ['HUMAN', 'SYSTEM'] }).notNull(),
  label: text('label').notNull(),
  status: text('status').notNull().default('PENDING'),
  startDate: date('start_date'),
  dueDate: date('due_date'),
});

// ----------------------------------------------------------------------------
// Task Members (タスク-担当者 中間テーブル)
// MAIN = 主担当1名 / SUB = サブ担当N名
// ----------------------------------------------------------------------------
export const taskMembers = pgTable('task_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['MAIN', 'SUB'] }).notNull().default('SUB'),
});

// ----------------------------------------------------------------------------
// WorkLogs (Timesheets)
// ----------------------------------------------------------------------------
export const workLogs = pgTable('work_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userEmail: text('user_email').notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  category: text('category'),
  hours: integer('hours').notNull(),
  workDate: date('work_date').notNull(),
});
