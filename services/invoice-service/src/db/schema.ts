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

// Projects table (read-only, managed by project-service)
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('in_progress').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Invoices table
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

// Recurring Invoices table
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

// Invoice Comments table
export const invoiceComments = pgTable('invoice_comments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorEmail: varchar('author_email', { length: 255 }).notNull(),
  comment: text('comment').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(), // visible only to project owner
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Invoice Payments table
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
  recurringInvoices: many(recurringInvoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  comments: many(invoiceComments),
  payments: many(invoicePayments),
  recurringInvoice: one(recurringInvoices, {
    fields: [invoices.id],
    references: [recurringInvoices.baseInvoiceId],
  }),
}));

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

export const invoiceCommentsRelations = relations(invoiceComments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceComments.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoicePaymentsRelations = relations(invoicePayments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoicePayments.invoiceId],
    references: [invoices.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type RecurringInvoice = typeof recurringInvoices.$inferSelect;
export type InsertRecurringInvoice = typeof recurringInvoices.$inferInsert;
export type InvoiceComment = typeof invoiceComments.$inferSelect;
export type InsertInvoiceComment = typeof invoiceComments.$inferInsert;
export type InvoicePayment = typeof invoicePayments.$inferSelect;
export type InsertInvoicePayment = typeof invoicePayments.$inferInsert;
