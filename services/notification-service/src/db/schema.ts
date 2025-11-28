import { pgTable, serial, text, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (read-only, managed by auth-service/user-service)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'info', 'success', 'warning', 'error', 'task', 'project', 'team', 'chat', 'payment'
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  read: boolean('read').default(false).notNull(),
  actionUrl: text('action_url'),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notification preferences table
export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  pushEnabled: boolean('push_enabled').default(true).notNull(),
  inAppEnabled: boolean('in_app_enabled').default(true).notNull(),
  taskNotifications: boolean('task_notifications').default(true).notNull(),
  projectNotifications: boolean('project_notifications').default(true).notNull(),
  teamNotifications: boolean('team_notifications').default(true).notNull(),
  chatNotifications: boolean('chat_notifications').default(true).notNull(),
  paymentNotifications: boolean('payment_notifications').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  notifications: many(notifications),
  preferences: one(notificationPreferences),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;
