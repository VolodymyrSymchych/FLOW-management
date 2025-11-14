import { pgTable, serial, text, varchar, integer, timestamp, boolean, primaryKey, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: text('password'),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  provider: varchar('provider', { length: 50 }),
  providerId: text('provider_id'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  teamMemberships: many(teamMembers),
  sentFriendRequests: many(friendships, { relationName: 'sender' }),
  receivedFriendRequests: many(friendships, { relationName: 'receiver' }),
  payments: many(payments),
  emailVerifications: many(emailVerifications),
  tasks: many(tasks),
  timeEntries: many(timeEntries),
  reports: many(reports),
  sentMessages: many(chatMessages, { relationName: 'sender' }),
  receivedMessages: many(chatMessages, { relationName: 'receiver' }),
  chatMemberships: many(chatMembers),
  comments: many(comments),
  messageReactions: many(messageReactions),
}));

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


export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  projects: many(teamProjects),
  chats: many(chats),
}));

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTeamUser: unique().on(table.teamId, table.userId),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const teamProjects = pgTable('team_projects', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTeamProject: unique().on(table.teamId, table.projectId),
}));

export const teamProjectsRelations = relations(teamProjects, ({ one }) => ({
  team: one(teams, {
    fields: [teamProjects.teamId],
    references: [teams.id],
  }),
  project: one(projects, {
    fields: [teamProjects.projectId],
    references: [projects.id],
  }),
}));

export const friendships = pgTable('friendships', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueFriendship: unique().on(table.senderId, table.receiverId),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  sender: one(users, {
    fields: [friendships.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [friendships.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  stripePaymentId: text('stripe_payment_id'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const emailVerifications = pgTable('email_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailVerificationsRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [emailVerifications.userId],
    references: [users.id],
  }),
}));

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  read: boolean('read').default(false).notNull(),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  parentId: integer('parent_id').references(() => tasks.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assignee: varchar('assignee', { length: 100 }),
  startDate: timestamp('start_date'),
  dueDate: timestamp('due_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 50 }).default('todo').notNull(),
  priority: varchar('priority', { length: 50 }).default('medium').notNull(),
  dependsOn: text('depends_on'), // JSON array of task IDs
  progress: integer('progress').default(0).notNull(), // 0-100 percentage
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});


export const timeEntries = pgTable('time_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  clockIn: timestamp('clock_in').notNull(),
  clockOut: timestamp('clock_out'),
  duration: integer('duration'), // in minutes
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id],
  }),
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id],
  }),
}));

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  clientName: varchar('client_name', { length: 255 }),
  clientEmail: varchar('client_email', { length: 255 }),
  clientAddress: text('client_address'),
  amount: integer('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  taxRate: integer('tax_rate').default(0), // percentage (e.g., 20 for 20%)
  taxAmount: integer('tax_amount').default(0), // in cents
  totalAmount: integer('total_amount').notNull(), // in cents (amount + tax)
  status: varchar('status', { length: 50 }).default('draft').notNull(), // draft, sent, paid, overdue, cancelled
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date'),
  paidDate: timestamp('paid_date'),
  description: text('description'),
  items: text('items'), // JSON string of invoice items
  notes: text('notes'),
  publicToken: varchar('public_token', { length: 255 }).unique(),
  tokenExpiresAt: timestamp('token_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
}));

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  category: varchar('category', { length: 100 }).notNull(), // e.g., 'materials', 'labor', 'software', 'travel', 'other'
  description: text('description').notNull(),
  amount: integer('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  expenseDate: timestamp('expense_date').notNull(),
  receiptUrl: text('receipt_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  project: one(projects, {
    fields: [expenses.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // Rich text HTML content
  type: varchar('type', { length: 50 }).default('custom').notNull(), // 'project_status', 'analysis', 'financial_summary', 'custom'
  status: varchar('status', { length: 50 }).default('draft').notNull(), // 'draft', 'published', 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  project: one(projects, {
    fields: [reports.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const fileAttachments: any = pgTable('file_attachments', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  r2Key: text('r2_key').notNull(), // S3/R2 object key
  uploadedBy: integer('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  version: integer('version').default(1).notNull(),
  parentFileId: integer('parent_file_id').references(() => fileAttachments.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const fileAttachmentsRelations = relations(fileAttachments, ({ one }) => ({
  project: one(projects, {
    fields: [fileAttachments.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [fileAttachments.taskId],
    references: [tasks.id],
  }),
  uploadedByUser: one(users, {
    fields: [fileAttachments.uploadedBy],
    references: [users.id],
  }),
  parentFile: one(fileAttachments, {
    fields: [fileAttachments.parentFileId],
    references: [fileAttachments.id],
    relationName: 'parent',
  }),
}));

export const projectTemplates = pgTable('project_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(), // web_app, mobile_app, ecommerce, etc.
  templateData: text('template_data').notNull(), // JSON string with pre-filled project fields, tasks, budget, timeline
  isPublic: boolean('is_public').default(true).notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  usageCount: integer('usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectTemplatesRelations = relations(projectTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [projectTemplates.createdBy],
    references: [users.id],
  }),
}));

export const recurringInvoices = pgTable('recurring_invoices', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  baseInvoiceId: integer('base_invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  frequency: varchar('frequency', { length: 50 }).notNull(), // weekly, bi-weekly, monthly, quarterly, yearly, custom
  customIntervalDays: integer('custom_interval_days'), // for custom frequency
  nextGenerationDate: timestamp('next_generation_date').notNull(),
  lastGeneratedDate: timestamp('last_generated_date'),
  isActive: boolean('is_active').default(true).notNull(),
  endDate: timestamp('end_date'), // optional end date
  autoSendEmail: boolean('auto_send_email').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recurringInvoicesRelations = relations(recurringInvoices, ({ one }) => ({
  project: one(projects, {
    fields: [recurringInvoices.projectId],
    references: [projects.id],
  }),
  baseInvoice: one(invoices, {
    fields: [recurringInvoices.baseInvoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceComments = pgTable('invoice_comments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorEmail: varchar('author_email', { length: 255 }).notNull(),
  comment: text('comment').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(), // visible only to project owner
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoiceCommentsRelations = relations(invoiceComments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceComments.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoicePayments = pgTable('invoice_payments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  amount: integer('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, succeeded, failed
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoicePaymentsRelations = relations(invoicePayments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoicePayments.invoiceId],
    references: [invoices.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  teamProjects: many(teamProjects),
  tasks: many(tasks),
  invoices: many(invoices),
  expenses: many(expenses),
  reports: many(reports),
  fileAttachments: many(fileAttachments),
  chats: many(chats),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: 'subtasks',
  }),
  subtasks: many(tasks, {
    relationName: 'subtasks',
  }),
  timeEntries: many(timeEntries),
  fileAttachments: many(fileAttachments),
  comments: many(comments),
}));

// Chat tables
export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }), // For group chats
  type: varchar('type', { length: 50 }).default('direct').notNull(), // 'direct', 'group', 'project', 'team'
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  createdBy: integer('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
  project: one(projects, {
    fields: [chats.projectId],
    references: [projects.id],
  }),
  team: one(teams, {
    fields: [chats.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [chats.createdBy],
    references: [users.id],
  }),
  members: many(chatMembers),
  messages: many(chatMessages),
}));

export const chatMembers = pgTable('chat_members', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member').notNull(), // 'admin', 'member'
  lastReadAt: timestamp('last_read_at'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  uniqueChatUser: unique().on(table.chatId, table.userId),
}));

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMembers.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [chatMembers.userId],
    references: [users.id],
  }),
}));

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 50 }).default('text').notNull(), // 'text', 'file', 'system'
  replyToId: integer('reply_to_id').references(() => chatMessages.id, { onDelete: 'set null' }),
  readAt: timestamp('read_at'), // When message was read (for read receipts)
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  replyTo: one(chatMessages, {
    fields: [chatMessages.replyToId],
    references: [chatMessages.id],
    relationName: 'replies',
  }),
  replies: many(chatMessages, {
    relationName: 'replies',
  }),
  reactions: many(messageReactions),
  attachments: many(chatMessageAttachments),
}));

export const chatMessageAttachments = pgTable('chat_message_attachments', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
  fileAttachmentId: integer('file_attachment_id').notNull().references(() => fileAttachments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessageAttachmentsRelations = relations(chatMessageAttachments, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatMessageAttachments.messageId],
    references: [chatMessages.id],
  }),
  fileAttachment: one(fileAttachments, {
    fields: [chatMessageAttachments.fileAttachmentId],
    references: [fileAttachments.id],
  }),
}));

export const messageReactions = pgTable('message_reactions', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  emoji: varchar('emoji', { length: 10 }).notNull(), // e.g., '👍', '❤️', '😂'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueMessageUserEmoji: unique().on(table.messageId, table.userId, table.emoji),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(chatMessages, {
    fields: [messageReactions.messageId],
    references: [chatMessages.id],
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id],
  }),
}));

// Comments tables
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'task', 'project'
  entityId: integer('entity_id').notNull(),
  content: text('content').notNull(),
  parentId: integer('parent_id').references(() => comments.id, { onDelete: 'cascade' }), // For nested comments
  mentions: text('mentions'), // JSON array of user IDs
  status: varchar('status', { length: 50 }).default('active').notNull(), // 'active', 'resolved'
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: integer('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'replies',
  }),
  replies: many(comments, {
    relationName: 'replies',
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type FileAttachment = typeof fileAttachments.$inferSelect;
export type InsertFileAttachment = typeof fileAttachments.$inferInsert;
export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;
export type RecurringInvoice = typeof recurringInvoices.$inferSelect;
export type InsertRecurringInvoice = typeof recurringInvoices.$inferInsert;
export type InvoiceComment = typeof invoiceComments.$inferSelect;
export type InsertInvoiceComment = typeof invoiceComments.$inferInsert;
export type InvoicePayment = typeof invoicePayments.$inferSelect;
export type InsertInvoicePayment = typeof invoicePayments.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;
export type ChatMember = typeof chatMembers.$inferSelect;
export type InsertChatMember = typeof chatMembers.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessageAttachment = typeof chatMessageAttachments.$inferSelect;
export type InsertChatMessageAttachment = typeof chatMessageAttachments.$inferInsert;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = typeof messageReactions.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
