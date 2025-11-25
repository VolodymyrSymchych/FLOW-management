import { pgTable, serial, text, varchar, integer, timestamp, boolean, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (read-only, managed by auth-service/user-service)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  language: varchar('language', { length: 10 }).default('en').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }),
  industry: varchar('industry', { length: 100 }),
  teamSize: varchar('team_size', { length: 50 }),
  timeline: varchar('timeline', { length: 100 }),
  budget: integer('budget'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  score: integer('score').default(0),
  riskLevel: varchar('risk_level', { length: 50 }),
  status: varchar('status', { length: 50 }).default('in_progress').notNull(),
  document: text('document'),
  analysisData: text('analysis_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Project Templates table
export const projectTemplates = pgTable('project_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  templateData: text('template_data').notNull(), // JSON string
  isPublic: boolean('is_public').default(true).notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  createdTemplates: many(projectTemplates),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const projectTemplatesRelations = relations(projectTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [projectTemplates.createdBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;
