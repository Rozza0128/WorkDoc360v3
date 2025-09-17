import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  json,
  index,
  serial,
  boolean,
  integer,
  date,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret"), // For TOTP authenticator apps
  backupCodes: text("backup_codes").array(), // Emergency backup codes
  selectedPlan: varchar("selected_plan", { length: 50 }).default("essential"), // essential, professional, enterprise
  planStatus: varchar("plan_status", { length: 50 }).default("pending_payment"), // pending_payment, active, cancelled, expired
  subscriptionType: varchar("subscription_type", { length: 50 }).default("monthly"), // monthly, yearly
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  yearlyDiscount: boolean("yearly_discount").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Two-factor authentication verification codes
export const twoFactorCodes = pgTable("two_factor_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  code: varchar("code", { length: 6 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // email, sms, backup
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// CSCS Personnel Records - Core business data for compliance tracking
export const cscsPersonnelRecords = pgTable("cscs_personnel_records", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  employeeName: varchar("employee_name", { length: 100 }).notNull(),
  employeeId: varchar("employee_id", { length: 50 }), // Company's internal employee ID
  nationalInsuranceNumber: varchar("ni_number", { length: 15 }), // For payroll/tax records
  
  // Employment Type Classification
  employmentType: varchar("employment_type", { length: 30 }).notNull(), // permanent, temporary, subcontractor, agency, freelance
  contractorCompany: varchar("contractor_company", { length: 100 }), // If subcontractor/agency
  agencyName: varchar("agency_name", { length: 100 }), // If agency worker
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"), // null for permanent
  dayRate: integer("day_rate"), // Daily rate in pence
  
  // Role and Trade Information
  primaryTrade: varchar("primary_trade", { length: 100 }).notNull(), // Scaffolder, Electrician, etc.
  role: varchar("role", { length: 100 }).notNull(), // Site Supervisor, Labourer, etc.
  skillLevel: varchar("skill_level", { length: 20 }).notNull(), // apprentice, skilled, supervisor, manager
  
  // CSCS Card Details
  cscsCardNumber: varchar("cscs_card_number", { length: 20 }).notNull(),
  cardType: varchar("card_type", { length: 100 }).notNull(), // Green CSCS Labourer Card, etc.
  cardColor: varchar("card_color", { length: 20 }).notNull(), // Green, Blue, Gold, etc.
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  verificationDate: timestamp("verification_date").notNull(),
  verificationStatus: varchar("verification_status", { length: 20 }).notNull(), // valid, expired, revoked, pending
  
  // Current Assignment
  currentSite: varchar("current_site", { length: 200 }), // Which site they're currently working on
  currentProject: varchar("current_project", { length: 200 }), // Project name/code
  siteStartDate: date("site_start_date"), // When they started on current site
  expectedEndDate: date("expected_end_date"), // When assignment ends
  
  // Insurance and Compliance
  insuranceProvider: varchar("insurance_provider", { length: 100 }),
  publicLiabilityAmount: integer("public_liability_amount"), // Coverage amount
  emergencyContact: varchar("emergency_contact", { length: 200 }),
  
  // Photo and Documentation
  photoUrl: varchar("photo_url", { length: 500 }), // URL to cardholder photo if extracted
  inductionCompleted: boolean("induction_completed").default(false),
  inductionDate: date("induction_date"),
  
  // Record Management
  recordStatus: varchar("record_status", { length: 20 }).default("active"), // active, suspended, archived
  notes: text("notes"), // Additional compliance notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site Access Log - Track who accessed which sites when
export const siteAccessLog = pgTable("site_access_log", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  personnelRecordId: integer("personnel_record_id").notNull().references(() => cscsPersonnelRecords.id),
  siteName: varchar("site_name", { length: 200 }).notNull(),
  accessDate: timestamp("access_date").notNull(),
  accessType: varchar("access_type", { length: 20 }).notNull(), // entry, exit, denied
  verifiedBy: varchar("verified_by", { length: 100 }), // Who verified the card
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance Alerts - Track renewal reminders and violations
export const complianceAlerts = pgTable("compliance_alerts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  personnelRecordId: integer("personnel_record_id").references(() => cscsPersonnelRecords.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // card_expiry, missing_insurance, site_violation
  alertMessage: text("alert_message").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(), // high, medium, low
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Voucher codes table for payment discounts and free access
export const voucherCodes = pgTable("voucher_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // percentage, fixed_amount, free_month, bypass_payment
  discountValue: integer("discount_value"), // percentage (1-100) or fixed amount in pence
  maxUses: integer("max_uses").default(1), // null = unlimited
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  applicablePlans: text("applicable_plans").array(), // ['essential', 'professional', 'enterprise'] or null for all
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by"), // admin user who created it
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track voucher code usage
export const voucherUsage = pgTable("voucher_usage", {
  id: serial("id").primaryKey(),
  voucherId: integer("voucher_id").notNull().references(() => voucherCodes.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  planApplied: varchar("plan_applied", { length: 50 }).notNull(),
  discountAmount: integer("discount_amount").notNull(), // amount saved in pence
  usedAt: timestamp("used_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 100 }).notNull().default("sole_trader"), // limited_company, sole_trader, partnership, llp, charity, other
  tradeType: varchar("trade_type", { length: 100 }).notNull(), // comprehensive UK construction trades
  registrationNumber: varchar("registration_number", { length: 50 }),
  address: text("address"),
  postcode: varchar("postcode", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  logoUrl: varchar("logo_url"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companyUsers = pgTable("company_users", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  role: varchar("role", { length: 50 }).notNull().default("worker"), // admin, manager, team_leader, worker
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const cscsCards = pgTable("cscs_cards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  cardNumber: varchar("card_number", { length: 50 }).notNull(),
  cardType: varchar("card_type", { length: 100 }).notNull(),
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  assessorId: varchar("assessor_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("draft"), // draft, approved, expired
  reviewDate: date("review_date"),
  hazards: jsonb("hazards"), // Array of hazard objects
  controlMeasures: jsonb("control_measures"), // Array of control measure objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const methodStatements = pgTable("method_statements", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  riskAssessmentId: integer("risk_assessment_id").references(() => riskAssessments.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  workSteps: jsonb("work_steps"), // Array of work step objects
  equipment: jsonb("equipment"), // Array of equipment objects
  ppe: jsonb("ppe"), // Array of PPE requirements
  emergencyProcedures: text("emergency_procedures"),
  authorizedBy: varchar("authorized_by").references(() => users.id),
  status: varchar("status", { length: 50 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const toolboxTalks = pgTable("toolbox_talks", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  title: varchar("title", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  conductedBy: varchar("conducted_by").notNull().references(() => users.id),
  location: varchar("location", { length: 255 }),
  date: date("date").notNull(),
  attendees: jsonb("attendees"), // Array of user IDs who attended
  keyPoints: jsonb("key_points"), // Array of key discussion points
  hazardsDiscussed: jsonb("hazards_discussed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complianceItems = pgTable("compliance_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  type: varchar("type", { length: 100 }).notNull(), // cscs_renewal, risk_assessment_review, certification_renewal
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, overdue
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
  assignedTo: varchar("assigned_to").references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated documents table
// Document templates table for ISO 9001 and other standards
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // iso_9001, health_safety, compliance
  documentType: varchar("document_type", { length: 100 }).notNull(),
  template: jsonb("template").notNull(), // JSON template structure
  tradeTypes: varchar("trade_types").array(), // which trades this applies to
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  templateId: integer("template_id").references(() => documentTemplates.id),
  templateType: varchar("template_type", { length: 100 }).notNull(),
  documentName: varchar("document_name", { length: 255 }).notNull(),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  siteAddress: text("site_address").notNull(),
  projectManager: varchar("project_manager", { length: 255 }).notNull(),
  hazards: text("hazards"),
  controlMeasures: text("control_measures"),
  specialRequirements: text("special_requirements"),
  status: varchar("status", { length: 50 }).default("generated"), // generated, downloaded, sent
  isTemplate: boolean("is_template").default(false), // if this is a master template copy
  filePath: varchar("file_path", { length: 500 }),
  fileUrl: varchar("file_url", { length: 500 }),
  generatedBy: varchar("generated_by").references(() => users.id),
  reviewStatus: varchar("review_status", { length: 50 }).default("pending"), // pending, in_review, approved, rejected
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document annotations for collaborative review
export const documentAnnotations: any = pgTable("document_annotations", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => generatedDocuments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  annotationType: varchar("annotation_type", { length: 50 }).notNull(), // comment, suggestion, approval, rejection
  sectionReference: varchar("section_reference", { length: 255 }), // Which section of the document
  lineNumber: integer("line_number"), // Specific line reference
  status: varchar("status", { length: 50 }).default("active"), // active, resolved, archived
  parentId: integer("parent_id"), // For threaded comments - references documentAnnotations.id
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, critical
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document review history for audit trail
export const documentReviews = pgTable("document_reviews", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => generatedDocuments.id, { onDelete: "cascade" }),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  reviewType: varchar("review_type", { length: 50 }).notNull(), // technical, compliance, quality, final
  status: varchar("status", { length: 50 }).notNull(), // pending, approved, rejected, changes_requested
  comments: text("comments"),
  reviewedSections: json("reviewed_sections"), // Track which sections were reviewed
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document workflow tracking for progress and notifications
export const documentWorkflow = pgTable("document_workflow", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => generatedDocuments.id, { onDelete: "cascade" }),
  companyId: integer("company_id").notNull().references(() => companies.id),
  workflowStage: varchar("workflow_stage", { length: 50 }).notNull(), // created, in_review, approved, published, archived
  assignedTo: varchar("assigned_to").references(() => users.id),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  completionPercentage: integer("completion_percentage").default(0),
  emailNotificationsSent: integer("email_notifications_sent").default(0),
  lastNotificationSent: timestamp("last_notification_sent"),
  nextNotificationDue: timestamp("next_notification_due"),
  isOverdue: boolean("is_overdue").default(false),
  workflowNotes: text("workflow_notes"),
  estimatedCompletionTime: integer("estimated_completion_time"), // in hours
  actualCompletionTime: integer("actual_completion_time"), // in hours
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email notification log for tracking
export const emailNotifications = pgTable("email_notifications", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => generatedDocuments.id),
  workflowId: integer("workflow_id").references(() => documentWorkflow.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // reminder, status_update, assignment, approval_request
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, failed, bounced
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companyUsers),
  cscsCards: many(cscsCards),
  riskAssessments: many(riskAssessments),
  toolboxTalks: many(toolboxTalks),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.ownerId],
    references: [users.id],
  }),
  users: many(companyUsers),
  cscsCards: many(cscsCards),
  riskAssessments: many(riskAssessments),
  methodStatements: many(methodStatements),
  toolboxTalks: many(toolboxTalks),
  complianceItems: many(complianceItems),
  generatedDocuments: many(generatedDocuments),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one, many }) => ({
  company: one(companies, {
    fields: [riskAssessments.companyId],
    references: [companies.id],
  }),
  assessor: one(users, {
    fields: [riskAssessments.assessorId],
    references: [users.id],
  }),
  methodStatements: many(methodStatements),
}));

export const methodStatementsRelations = relations(methodStatements, ({ one }) => ({
  company: one(companies, {
    fields: [methodStatements.companyId],
    references: [companies.id],
  }),
  riskAssessment: one(riskAssessments, {
    fields: [methodStatements.riskAssessmentId],
    references: [riskAssessments.id],
  }),
}));

// Document assessments table for uploaded document analysis
export const documentAssessments = pgTable("document_assessments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(), // risk_assessment, method_statement, etc.
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  overallScore: integer("overall_score"), // 0-100
  assessmentStatus: varchar("assessment_status", { length: 50 }).default("pending"), // pending, completed, failed
  complianceGaps: jsonb("compliance_gaps"), // Array of gap objects
  recommendations: jsonb("recommendations"), // Array of recommendation objects
  strengths: jsonb("strengths"), // Array of strengths
  criticalIssues: jsonb("critical_issues"), // Array of critical issues
  improvementPlan: jsonb("improvement_plan"), // Array of improvement steps
  aiAnalysisLog: text("ai_analysis_log"), // Full AI response for debugging
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document upload sessions for tracking batch uploads
export const uploadSessions = pgTable("upload_sessions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  sessionName: varchar("session_name", { length: 255 }), // e.g., "Rob & Son Initial Assessment"
  totalFiles: integer("total_files").default(0),
  processedFiles: integer("processed_files").default(0),
  status: varchar("status", { length: 50 }).default("active"), // active, completed, failed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Create user schema for registration
export const createUserSchema = createInsertSchema(users).omit({
  id: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  profileImageUrl: true,
});

export type InsertCompany = typeof companies.$inferInsert;
export type Company = typeof companies.$inferSelect;

export type InsertCompanyUser = typeof companyUsers.$inferInsert;
export type CompanyUser = typeof companyUsers.$inferSelect;

export type InsertCSCSCard = typeof cscsCards.$inferInsert;
export type CSCSCard = typeof cscsCards.$inferSelect;

export type InsertRiskAssessment = typeof riskAssessments.$inferInsert;
export type RiskAssessment = typeof riskAssessments.$inferSelect;

export type InsertMethodStatement = typeof methodStatements.$inferInsert;
export type MethodStatement = typeof methodStatements.$inferSelect;

export type InsertToolboxTalk = typeof toolboxTalks.$inferInsert;
export type ToolboxTalk = typeof toolboxTalks.$inferSelect;

export type InsertComplianceItem = typeof complianceItems.$inferInsert;
export type ComplianceItem = typeof complianceItems.$inferSelect;

export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

export type InsertGeneratedDocument = typeof generatedDocuments.$inferInsert;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;

export type InsertDocumentAnnotation = typeof documentAnnotations.$inferInsert;
export type DocumentAnnotation = typeof documentAnnotations.$inferSelect;

export type InsertDocumentReview = typeof documentReviews.$inferInsert;
export type DocumentReview = typeof documentReviews.$inferSelect;

export type InsertDocumentWorkflow = typeof documentWorkflow.$inferInsert;
export type DocumentWorkflow = typeof documentWorkflow.$inferSelect;

export type InsertEmailNotification = typeof emailNotifications.$inferInsert;
export type EmailNotification = typeof emailNotifications.$inferSelect;

export type InsertTwoFactorCode = typeof twoFactorCodes.$inferInsert;
export type TwoFactorCode = typeof twoFactorCodes.$inferSelect;

export type InsertDocumentAssessment = typeof documentAssessments.$inferInsert;
export type DocumentAssessment = typeof documentAssessments.$inferSelect;

export type InsertUploadSession = typeof uploadSessions.$inferInsert;
export type UploadSession = typeof uploadSessions.$inferSelect;

// Zod schemas for validation
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMethodStatementSchema = createInsertSchema(methodStatements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToolboxTalkSchema = createInsertSchema(toolboxTalks).omit({
  id: true,
  createdAt: true,
});

export const insertCSCSCardSchema = createInsertSchema(cscsCards).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceItemSchema = createInsertSchema(complianceItems).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentAnnotationSchema = createInsertSchema(documentAnnotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentReviewSchema = createInsertSchema(documentReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentAssessmentSchema = createInsertSchema(documentAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUploadSessionSchema = createInsertSchema(uploadSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Voucher code types and schemas
export type InsertVoucherCode = typeof voucherCodes.$inferInsert;
export type VoucherCode = typeof voucherCodes.$inferSelect;

export type InsertVoucherUsage = typeof voucherUsage.$inferInsert;
export type VoucherUsage = typeof voucherUsage.$inferSelect;

export const insertVoucherCodeSchema = createInsertSchema(voucherCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVoucherUsageSchema = createInsertSchema(voucherUsage).omit({
  id: true,
  usedAt: true,
});

// Company branding and details extracted from website
export const companyBranding = pgTable("company_branding", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  websiteUrl: varchar("website_url"),
  logoUrl: varchar("logo_url"),
  businessDescription: text("business_description"),
  tagline: varchar("tagline"),
  primaryColors: text("primary_colors").array(),
  services: text("services").array(),
  certifications: text("certifications").array(),
  yearEstablished: varchar("year_established", { length: 4 }),
  keyPersonnel: jsonb("key_personnel").default([]), // Array of {name, role}
  contactInfo: jsonb("contact_info").default({}), // {address, phone, email}
  lastScraped: timestamp("last_scraped"),
  scrapingStatus: varchar("scraping_status", { length: 50 }).default("pending"), // pending, success, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document generation requests and progress
export const documentGenerationRequests = pgTable("document_generation_requests", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  requestedDocuments: text("requested_documents").array().notNull(), // Array of document IDs
  generationContext: jsonb("generation_context").notNull(), // Company details and answers
  status: varchar("status", { length: 50 }).default("pending"), // pending, in_progress, completed, failed
  completedDocuments: integer("completed_documents").default(0),
  totalDocuments: integer("total_documents").notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add types for new tables
export type InsertCompanyBranding = typeof companyBranding.$inferInsert;
export type CompanyBranding = typeof companyBranding.$inferSelect;

export type InsertDocumentGenerationRequest = typeof documentGenerationRequests.$inferInsert;
export type DocumentGenerationRequest = typeof documentGenerationRequests.$inferSelect;

export const insertCompanyBrandingSchema = createInsertSchema(companyBranding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentGenerationRequestSchema = createInsertSchema(documentGenerationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
