import { pgTable, serial, text, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (read-only, managed by user-service)
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table (read-only, managed by project-service)
export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks table (read-only, managed by task-service)
export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// File Attachments table (managed by file-service)
export const fileAttachments: any = pgTable('file_attachments', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileType: varchar('file_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(), // in bytes
    r2Key: text('r2_key').notNull(), // R2 storage key
    uploadedBy: integer('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    version: integer('version').default(1).notNull(),
    parentFileId: integer('parent_file_id').references((): any => fileAttachments.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const fileAttachmentsRelations = relations(fileAttachments, ({ one, many }) => ({
    project: one(projects, {
        fields: [fileAttachments.projectId],
        references: [projects.id],
    }),
    task: one(tasks, {
        fields: [fileAttachments.taskId],
        references: [tasks.id],
    }),
    uploader: one(users, {
        fields: [fileAttachments.uploadedBy],
        references: [users.id],
    }),
    parentFile: one(fileAttachments, {
        fields: [fileAttachments.parentFileId],
        references: [fileAttachments.id],
        relationName: 'versions',
    }),
    versions: many(fileAttachments, {
        relationName: 'versions',
    }),
}));

// Types
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type FileAttachment = typeof fileAttachments.$inferSelect;
export type InsertFileAttachment = typeof fileAttachments.$inferInsert;
