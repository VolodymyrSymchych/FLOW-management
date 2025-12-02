// Event types for event-driven architecture

// Auth Service Events
export interface UserRegisteredEvent {
  type: 'user.registered';
  userId: number;
  email: string;
  username: string;
  timestamp: Date;
}

export interface UserVerifiedEvent {
  type: 'user.verified';
  userId: number;
  email: string;
  timestamp: Date;
}

export interface UserLoggedInEvent {
  type: 'user.logged_in';
  userId: number;
  timestamp: Date;
}

export interface UserLoggedOutEvent {
  type: 'user.logged_out';
  userId: number;
  timestamp: Date;
}

// User Service Events
export interface UserUpdatedEvent {
  type: 'user.updated';
  userId: number;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface UserDeletedEvent {
  type: 'user.deleted';
  userId: number;
  timestamp: Date;
}

export interface FriendshipCreatedEvent {
  type: 'friendship.created';
  senderId: number;
  receiverId: number;
  timestamp: Date;
}

export interface FriendshipAcceptedEvent {
  type: 'friendship.accepted';
  senderId: number;
  receiverId: number;
  timestamp: Date;
}

// Project Service Events
export interface ProjectCreatedEvent {
  type: 'project.created';
  projectId: number;
  userId: number;
  name: string;
  timestamp: Date;
}

export interface ProjectUpdatedEvent {
  type: 'project.updated';
  projectId: number;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface ProjectDeletedEvent {
  type: 'project.deleted';
  projectId: number;
  timestamp: Date;
}

export interface ProjectProgressUpdatedEvent {
  type: 'project.progress.updated';
  projectId: number;
  progress: number;
  timestamp: Date;
}

// Task Service Events
export interface TaskCreatedEvent {
  type: 'task.created';
  taskId: number;
  projectId?: number;
  userId?: number;
  title: string;
  timestamp: Date;
}

export interface TaskUpdatedEvent {
  type: 'task.updated';
  taskId: number;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface TaskCompletedEvent {
  type: 'task.completed';
  taskId: number;
  projectId?: number;
  timestamp: Date;
}

export interface TaskAssignedEvent {
  type: 'task.assigned';
  taskId: number;
  assigneeId: number;
  timestamp: Date;
}

export interface CommentCreatedEvent {
  type: 'comment.created';
  commentId: number;
  entityType: string;
  entityId: number;
  userId: number;
  timestamp: Date;
}

// Team Service Events
export interface TeamCreatedEvent {
  type: 'team.created';
  teamId: number;
  ownerId: number;
  name: string;
  timestamp: Date;
}

export interface TeamMemberAddedEvent {
  type: 'team.member.added';
  teamId: number;
  userId: number;
  role: string;
  timestamp: Date;
}

export interface TeamMemberRemovedEvent {
  type: 'team.member.removed';
  teamId: number;
  userId: number;
  timestamp: Date;
}

export interface TeamProjectAddedEvent {
  type: 'team.project.added';
  teamId: number;
  projectId: number;
  timestamp: Date;
}

// Chat Service Events
export interface ChatMessageCreatedEvent {
  type: 'chat.message.created';
  messageId: number;
  chatId: number;
  senderId: number;
  timestamp: Date;
}

export interface ChatMessageUpdatedEvent {
  type: 'chat.message.updated';
  messageId: number;
  chatId: number;
  timestamp: Date;
}

// Financial Service Events
export interface InvoiceCreatedEvent {
  type: 'invoice.created';
  invoiceId: number;
  projectId: number;
  amount: number;
  timestamp: Date;
}

export interface InvoiceSentEvent {
  type: 'invoice.sent';
  invoiceId: number;
  recipientEmail: string;
  timestamp: Date;
}

export interface InvoicePaidEvent {
  type: 'invoice.paid';
  invoiceId: number;
  amount: number;
  timestamp: Date;
}

export interface PaymentProcessedEvent {
  type: 'payment.processed';
  paymentId: number;
  invoiceId: number;
  amount: number;
  status: string;
  timestamp: Date;
}

export interface ExpenseCreatedEvent {
  type: 'expense.created';
  expenseId: number;
  projectId: number;
  amount: number;
  timestamp: Date;
}

export interface BudgetExceededEvent {
  type: 'budget.exceeded';
  projectId: number;
  budget: number;
  spent: number;
  timestamp: Date;
}

// File Service Events
export interface FileUploadedEvent {
  type: 'file.uploaded';
  fileId: number;
  projectId?: number;
  taskId?: number;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  timestamp: Date;
}

export interface FileDeletedEvent {
  type: 'file.deleted';
  fileId: number;
  timestamp: Date;
}

export interface FileVersionCreatedEvent {
  type: 'file.version.created';
  fileId: number;
  version: number;
  timestamp: Date;
}

// Time Tracking Service Events
export interface TimeEntryCreatedEvent {
  type: 'time.entry.created';
  entryId: number;
  userId: number;
  taskId?: number;
  projectId?: number;
  duration: number;
  timestamp: Date;
}

export interface TimeEntryUpdatedEvent {
  type: 'time.entry.updated';
  entryId: number;
  changes: Record<string, any>;
  timestamp: Date;
}

export interface TimeClockedInEvent {
  type: 'time.clocked.in';
  entryId: number;
  userId: number;
  timestamp: Date;
}

export interface TimeClockedOutEvent {
  type: 'time.clocked.out';
  entryId: number;
  userId: number;
  duration: number;
  timestamp: Date;
}

// Notification Service Events
export interface NotificationCreatedEvent {
  type: 'notification.created';
  notificationId: number;
  userId: number;
  notificationType: string;
  timestamp: Date;
}

export interface NotificationSentEvent {
  type: 'notification.sent';
  notificationId: number;
  userId: number;
  channel: string;
  timestamp: Date;
}

// Analytics Service Events
export interface ReportGeneratedEvent {
  type: 'report.generated';
  reportId: number;
  userId: number;
  reportType: string;
  timestamp: Date;
}

// AI Service Events
export interface AIAnalysisCompletedEvent {
  type: 'ai.analysis.completed';
  projectId: number;
  analysisId: string;
  results: Record<string, any>;
  timestamp: Date;
}

export interface AIReportGeneratedEvent {
  type: 'ai.report.generated';
  reportId: number;
  projectId: number;
  timestamp: Date;
}

export interface UserVerificationRequestedEvent {
  type: 'user.verification_requested';
  email: string;
  name: string;
  token: string;
  timestamp: Date;
}

export interface UserVerificationResendEvent {
  type: 'user.verification_resend';
  email: string;
  name: string;
  token: string;
  timestamp: Date;
}

export interface UserPasswordResetRequestedEvent {
  type: 'user.password_reset_requested';
  email: string;
  name: string;
  token: string;
  timestamp: Date;
}

export interface UserPasswordChangedEvent {
  type: 'user.password_changed';
  userId: number;
  timestamp: Date;
}

// Union type for all events
export type AppEvent =
  | UserRegisteredEvent
  | UserVerifiedEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | UserVerificationRequestedEvent
  | UserVerificationResendEvent
  | UserPasswordResetRequestedEvent
  | UserPasswordChangedEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | FriendshipCreatedEvent
  | FriendshipAcceptedEvent
  | ProjectCreatedEvent
  | ProjectUpdatedEvent
  | ProjectDeletedEvent
  | ProjectProgressUpdatedEvent
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskCompletedEvent
  | TaskAssignedEvent
  | CommentCreatedEvent
  | TeamCreatedEvent
  | TeamMemberAddedEvent
  | TeamMemberRemovedEvent
  | TeamProjectAddedEvent
  | ChatMessageCreatedEvent
  | ChatMessageUpdatedEvent
  | InvoiceCreatedEvent
  | InvoiceSentEvent
  | InvoicePaidEvent
  | PaymentProcessedEvent
  | ExpenseCreatedEvent
  | BudgetExceededEvent
  | FileUploadedEvent
  | FileDeletedEvent
  | FileVersionCreatedEvent
  | TimeEntryCreatedEvent
  | TimeEntryUpdatedEvent
  | TimeClockedInEvent
  | TimeClockedOutEvent
  | NotificationCreatedEvent
  | NotificationSentEvent
  | ReportGeneratedEvent
  | AIAnalysisCompletedEvent
  | AIReportGeneratedEvent;

// Event metadata
export interface EventMetadata {
  eventId: string;
  correlationId?: string;
  causationId?: string;
  timestamp: Date;
  source: string;
  version: string;
}

export interface EventEnvelope<T extends AppEvent> {
  event: T;
  metadata: EventMetadata;
}

