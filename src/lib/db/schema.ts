import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  date,
  jsonb,
} from 'drizzle-orm/pg-core';

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
  
  // Custom Fields (JSONB holds flexibile structures like e.g. data sizes, mesh count)
  customFields: jsonb('custom_fields').default({}),
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
});

// ----------------------------------------------------------------------------
// WorkLogs (Timesheets)
// ----------------------------------------------------------------------------
export const workLogs = pgTable('work_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userEmail: text('user_email').notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }), // Nullable for common costs
  category: text('category'), // E.g., meeting, training
  hours: integer('hours').notNull(),
  workDate: date('work_date').notNull(),
});
