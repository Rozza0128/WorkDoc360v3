import {
  users,
  companies,
  companyUsers,
  cscsCards,
  riskAssessments,
  methodStatements,
  toolboxTalks,
  complianceItems,
  twoFactorCodes,
  voucherCodes,
  voucherUsage,
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type CompanyUser,
  type InsertCompanyUser,
  type CSCSCard,
  type InsertCSCSCard,
  type RiskAssessment,
  type InsertRiskAssessment,
  type MethodStatement,
  type InsertMethodStatement,
  type ToolboxTalk,
  type InsertToolboxTalk,
  type ComplianceItem,
  type InsertComplianceItem,
  generatedDocuments,
  documentTemplates,
  documentAnnotations,
  documentReviews,
  type GeneratedDocument,
  type InsertGeneratedDocument,
  type DocumentTemplate,
  type InsertDocumentTemplate,
  type DocumentAnnotation,
  type InsertDocumentAnnotation,
  type DocumentReview,
  type InsertDocumentReview,
  type TwoFactorCode,
  type InsertTwoFactorCode,
  type VoucherCode,
  type InsertVoucherCode,
  type VoucherUsage,
  type InsertVoucherUsage,
  companyBranding,
  documentGenerationRequests,
  type CompanyBranding,
  type InsertCompanyBranding,
  type DocumentGenerationRequest,
  type InsertDocumentGenerationRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, gte, lte } from "drizzle-orm";
import { 
  masterCompanyTemplates,
  companyMasterSubscriptions,
  masterCompanyUpdates,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  updateUserPhone(id: string, phoneNumber: string): Promise<User>;
  updateUserPlan(userId: string, selectedPlan: string, subscriptionType: string): Promise<User>;
  
  // Two-factor authentication operations
  createTwoFactorCode(code: InsertTwoFactorCode): Promise<TwoFactorCode>;
  verifyTwoFactorCode(userId: string, code: string, type: string): Promise<boolean>;
  verifyBackupCode(userId: string, code: string): Promise<boolean>;
  enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<void>;
  disableTwoFactor(userId: string): Promise<void>;
  updateBackupCodes(userId: string, codes: string[]): Promise<void>;
  
  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyById(id: number): Promise<Company | undefined>;
  getCompanyBySlug(slug: string): Promise<Company | undefined>;
  getCompaniesByName(name: string): Promise<Company[]>;
  getCompaniesByUserId(userId: string): Promise<Company[]>;
  getUserCompanies(userId: string): Promise<Company[]>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  updateCompanySubdomain(id: number, subdomain: string): Promise<Company>;
  
  // Company archiving operations (soft delete protection)
  archiveCompany(companyId: number, archivedBy: string, reason?: string): Promise<Company>;
  restoreCompany(companyId: number): Promise<Company>;
  getArchivedCompanies(userId?: string): Promise<Company[]>;
  permanentlyDeleteCompany(companyId: number, deletedByWorkdoc360User: string): Promise<boolean>;

  // Master Company Template System
  createMasterCompanyTemplate(template: InsertMasterCompanyTemplate): Promise<MasterCompanyTemplate>;
  getMasterCompanyTemplates(masterCompanyId: number): Promise<MasterCompanyTemplate[]>;
  getTemplatesByTrade(tradeType: string): Promise<MasterCompanyTemplate[]>;
  getMasterCompaniesForTrade(tradeType: string): Promise<Company[]>;
  
  // Company subscriptions to master companies
  subscribeToMasterCompany(subscription: InsertCompanyMasterSubscription): Promise<CompanyMasterSubscription>;
  getCompanySubscriptions(companyId: number): Promise<CompanyMasterSubscription[]>;
  getMasterCompanySubscribers(masterCompanyId: number): Promise<CompanyMasterSubscription[]>;
  updateTemplateUsage(subscriptionId: number): Promise<void>;
  
  // Master company updates and notifications
  createMasterCompanyUpdate(update: InsertMasterCompanyUpdate): Promise<MasterCompanyUpdate>;
  getMasterCompanyUpdates(masterCompanyId: number): Promise<MasterCompanyUpdate[]>;
  getUpdatesForCompany(companyId: number): Promise<MasterCompanyUpdate[]>;
  
  // Company user operations
  addUserToCompany(companyUser: InsertCompanyUser): Promise<CompanyUser>;
  getCompanyUsers(companyId: number): Promise<(CompanyUser & { user: User })[]>;
  getUserRole(userId: string, companyId: number): Promise<string | undefined>;
  
  // CSCS card operations
  createCSCSCard(card: InsertCSCSCard): Promise<CSCSCard>;
  getCSCSCards(companyId: number): Promise<CSCSCard[]>;
  getExpiringCSCSCards(companyId: number, days: number): Promise<CSCSCard[]>;
  
  // Risk assessment operations
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskAssessments(companyId: number): Promise<RiskAssessment[]>;
  updateRiskAssessment(id: number, assessment: Partial<InsertRiskAssessment>): Promise<RiskAssessment>;
  
  // Method statement operations
  createMethodStatement(statement: InsertMethodStatement): Promise<MethodStatement>;
  getMethodStatements(companyId: number): Promise<MethodStatement[]>;
  
  // Toolbox talk operations
  createToolboxTalk(talk: InsertToolboxTalk): Promise<ToolboxTalk>;
  getToolboxTalks(companyId: number): Promise<ToolboxTalk[]>;
  getToolboxTalksThisMonth(companyId: number): Promise<number>;
  
  // Compliance operations
  createComplianceItem(item: InsertComplianceItem): Promise<ComplianceItem>;
  getComplianceItems(companyId: number): Promise<ComplianceItem[]>;
  getOverdueComplianceItems(companyId: number): Promise<ComplianceItem[]>;
  updateComplianceItemStatus(id: number, status: string): Promise<ComplianceItem>;
  
  // Document generation operations
  createGeneratedDocument(document: InsertGeneratedDocument): Promise<GeneratedDocument>;
  getGeneratedDocuments(companyId: number): Promise<GeneratedDocument[]>;
  getGeneratedDocument(id: number): Promise<GeneratedDocument | undefined>;
  updateGeneratedDocumentStatus(id: number, status: string): Promise<GeneratedDocument>;
  
  // Document template operations
  getDocumentTemplates(category?: string): Promise<DocumentTemplate[]>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  createBasicStarterDocumentsForCompany(companyId: number, tradeType: string, userId: string): Promise<GeneratedDocument[]>;
  createPremiumStarterDocumentsForCompany(companyId: number, tradeType: string, userId: string): Promise<GeneratedDocument[]>;
  
  // Document annotation and review operations
  createDocumentAnnotation(annotation: InsertDocumentAnnotation): Promise<DocumentAnnotation>;
  getDocumentAnnotations(documentId: number): Promise<(DocumentAnnotation & { user: User })[]>;
  updateAnnotationStatus(id: number, status: string): Promise<DocumentAnnotation>;
  deleteDocumentAnnotation(id: number): Promise<void>;
  
  createDocumentReview(review: InsertDocumentReview): Promise<DocumentReview>;
  getDocumentReviews(documentId: number): Promise<(DocumentReview & { reviewer: User })[]>;
  updateDocumentReviewStatus(documentId: number, reviewerId: string, status: string, comments?: string): Promise<DocumentReview>;
  
  updateDocumentReviewStatus(documentId: number, reviewStatus: string, reviewerId?: string): Promise<GeneratedDocument>;
  
  // Dashboard metrics
  getComplianceMetrics(companyId: number): Promise<{
    cscsCardsTotal: number;
    cscsCardsExpiring: number;
    riskAssessmentsTotal: number;
    riskAssessmentsDue: number;
    toolboxTalksThisMonth: number;
    complianceScore: number;
  }>;

  // Smart dashboard data
  getDashboardData(companyId: number): Promise<{
    completedDocuments: number;
    documentsInProgress: number;
    overdueDocuments: number;
    complianceScore: number;
    pendingDocuments: number;
    totalReports: number;
    recentDocuments: any[];
  }>;

  // Document progress tracking
  getDocumentProgress(companyId: number): Promise<any[]>;
  updateDocumentProgress(documentId: number, progress: number, notes?: string): Promise<void>;

  // Email notifications
  sendDocumentNotification(documentId: number, companyId: number, type: string): Promise<boolean>;
  getUserNotifications(companyId: number): Promise<any[]>;
  
  // Voucher code operations
  getVoucherByCode(code: string): Promise<VoucherCode | undefined>;
  createVoucher(voucher: InsertVoucherCode): Promise<VoucherCode>;
  recordVoucherUsage(usage: InsertVoucherUsage): Promise<VoucherUsage>;
  incrementVoucherUsage(voucherId: number): Promise<void>;
  updateUserPlanStatus(userId: string, updates: {
    planStatus: string;
    selectedPlan: string;
    subscriptionType: string;
    contractStartDate: Date;
    contractEndDate: Date;
    nextBillingDate: Date;
  }): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPhone(id: string, phoneNumber: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ phoneNumber, phoneVerified: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPlan(userId: string, selectedPlan: string, subscriptionType: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        selectedPlan,
        subscriptionType,
        planStatus: "pending_payment",
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  // Two-factor authentication operations
  async createTwoFactorCode(codeData: InsertTwoFactorCode): Promise<TwoFactorCode> {
    const [code] = await db.insert(twoFactorCodes).values(codeData).returning();
    return code;
  }

  async verifyTwoFactorCode(userId: string, code: string, type: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(twoFactorCodes)
      .where(
        and(
          eq(twoFactorCodes.userId, userId),
          eq(twoFactorCodes.code, code),
          eq(twoFactorCodes.type, type),
          eq(twoFactorCodes.verified, false),
          gte(twoFactorCodes.expiresAt, new Date())
        )
      );

    if (result) {
      // Mark code as verified
      await db
        .update(twoFactorCodes)
        .set({ verified: true })
        .where(eq(twoFactorCodes.id, result.id));
      return true;
    }
    return false;
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user?.backupCodes) return false;

    const codeIndex = user.backupCodes.indexOf(code);
    if (codeIndex === -1) return false;

    // Remove used backup code
    const updatedCodes = user.backupCodes.filter((_, index) => index !== codeIndex);
    await this.updateUser(userId, { backupCodes: updatedCodes });
    
    return true;
  }

  async enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    await this.updateUser(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      backupCodes,
    });
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
    });
  }

  async updateBackupCodes(userId: string, codes: string[]): Promise<void> {
    await this.updateUser(userId, { backupCodes: codes });
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    
    // Add the owner as admin
    await db.insert(companyUsers).values({
      userId: company.ownerId,
      companyId: newCompany.id,
      role: "admin",
    });
    
    return newCompany;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    return this.getCompany(id);
  }

  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.companySlug, slug));
    return company;
  }

  async getCompaniesByName(name: string): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.name, name));
  }

  async getCompaniesByUserId(userId: string): Promise<Company[]> {
    const result = await db
      .select({ company: companies })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyId, companies.id))
      .where(and(
        eq(companyUsers.userId, userId),
        eq(companies.isArchived, false) // Only show active companies
      ));
    
    return result.map(r => r.company);
  }

  async getUserCompanies(userId: string): Promise<Company[]> {
    // Get companies owned by this user (they are the original creator) - exclude archived
    return await db.select().from(companies).where(and(
      eq(companies.ownerId, userId),
      eq(companies.isArchived, false) // Only show active companies
    ));
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company> {
    const [updated] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  async updateCompanySubdomain(id: number, subdomain: string): Promise<Company> {
    const [updated] = await db
      .update(companies)
      .set({ companySlug: subdomain, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  // Company archiving methods - customer protection with soft delete
  async archiveCompany(companyId: number, archivedBy: string, reason?: string): Promise<Company> {
    const [archived] = await db
      .update(companies)
      .set({
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: archivedBy,
        archiveReason: reason || "Archived by user",
        updatedAt: new Date()
      })
      .where(eq(companies.id, companyId))
      .returning();
    return archived;
  }

  async restoreCompany(companyId: number): Promise<Company> {
    const [restored] = await db
      .update(companies)
      .set({
        isArchived: false,
        archivedAt: null,
        archivedBy: null,
        archiveReason: null,
        updatedAt: new Date()
      })
      .where(eq(companies.id, companyId))
      .returning();
    return restored;
  }

  async getArchivedCompanies(userId?: string): Promise<Company[]> {
    const whereClause = userId 
      ? and(eq(companies.isArchived, true), eq(companies.ownerId, userId))
      : eq(companies.isArchived, true);
    
    return await db.select().from(companies).where(whereClause);
  }

  async permanentlyDeleteCompany(companyId: number, deletedByWorkdoc360User: string): Promise<boolean> {
    try {
      // First mark as permanently deleted by WorkDoc360 (superadmin only)
      await db
        .update(companies)
        .set({
          deletedByWorkdoc360: true,
          archiveReason: `Permanently deleted by WorkDoc360 admin: ${deletedByWorkdoc360User}`,
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId));

      // Delete all related records first
      await db.delete(companyUsers).where(eq(companyUsers.companyId, companyId));
      await db.delete(cscsCards).where(eq(cscsCards.companyId, companyId));
      await db.delete(riskAssessments).where(eq(riskAssessments.companyId, companyId));
      await db.delete(methodStatements).where(eq(methodStatements.companyId, companyId));
      await db.delete(toolboxTalks).where(eq(toolboxTalks.companyId, companyId));
      await db.delete(complianceItems).where(eq(complianceItems.companyId, companyId));
      await db.delete(generatedDocuments).where(eq(generatedDocuments.companyId, companyId));

      // Finally delete the company itself
      await db.delete(companies).where(eq(companies.id, companyId));
      
      return true;
    } catch (error) {
      console.error("Failed to permanently delete company:", error);
      return false;
    }
  }

  // ================================
  // MASTER COMPANY TEMPLATE SYSTEM
  // ================================

  // Create and manage master company templates
  async createMasterCompanyTemplate(template: any): Promise<any> {
    const [newTemplate] = await db.insert(masterCompanyTemplates).values(template).returning();
    return newTemplate;
  }

  async getMasterCompanyTemplates(masterCompanyId: number): Promise<any[]> {
    return await db
      .select()
      .from(masterCompanyTemplates)
      .where(and(
        eq(masterCompanyTemplates.masterCompanyId, masterCompanyId),
        eq(masterCompanyTemplates.isActive, true)
      ))
      .orderBy(desc(masterCompanyTemplates.createdAt));
  }

  async getTemplatesByTrade(tradeType: string): Promise<any[]> {
    return await db
      .select()
      .from(masterCompanyTemplates)
      .innerJoin(companies, eq(masterCompanyTemplates.masterCompanyId, companies.id))
      .where(and(
        eq(companies.tradeType, tradeType),
        eq(companies.isMasterCompany, true),
        eq(masterCompanyTemplates.isActive, true)
      ))
      .orderBy(desc(masterCompanyTemplates.lastReviewDate));
  }

  async getMasterCompaniesForTrade(tradeType: string): Promise<Company[]> {
    return await db
      .select()
      .from(companies)
      .where(and(
        eq(companies.tradeType, tradeType),
        eq(companies.isMasterCompany, true),
        eq(companies.isArchived, false)
      ))
      .orderBy(desc(companies.lastStandardsUpdate));
  }

  // Company subscription management
  async subscribeToMasterCompany(subscription: any): Promise<any> {
    const [newSubscription] = await db.insert(companyMasterSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getCompanySubscriptions(companyId: number): Promise<any[]> {
    return await db
      .select()
      .from(companyMasterSubscriptions)
      .innerJoin(companies, eq(companyMasterSubscriptions.masterCompanyId, companies.id))
      .where(and(
        eq(companyMasterSubscriptions.companyId, companyId),
        eq(companyMasterSubscriptions.isActive, true)
      ))
      .orderBy(desc(companyMasterSubscriptions.subscribedAt));
  }

  async getMasterCompanySubscribers(masterCompanyId: number): Promise<any[]> {
    return await db
      .select()
      .from(companyMasterSubscriptions)
      .innerJoin(companies, eq(companyMasterSubscriptions.companyId, companies.id))
      .where(and(
        eq(companyMasterSubscriptions.masterCompanyId, masterCompanyId),
        eq(companyMasterSubscriptions.isActive, true)
      ))
      .orderBy(desc(companyMasterSubscriptions.subscribedAt));
  }

  async updateTemplateUsage(subscriptionId: number): Promise<void> {
    await db
      .update(companyMasterSubscriptions)
      .set({
        templatesUsed: sql`${companyMasterSubscriptions.templatesUsed} + 1`,
        lastTemplateUsed: new Date(),
        lastUpdated: new Date()
      })
      .where(eq(companyMasterSubscriptions.id, subscriptionId));
  }

  // Master company updates and notifications
  async createMasterCompanyUpdate(update: any): Promise<any> {
    const [newUpdate] = await db.insert(masterCompanyUpdates).values(update).returning();
    return newUpdate;
  }

  async getMasterCompanyUpdates(masterCompanyId: number): Promise<any[]> {
    return await db
      .select()
      .from(masterCompanyUpdates)
      .where(eq(masterCompanyUpdates.masterCompanyId, masterCompanyId))
      .orderBy(desc(masterCompanyUpdates.publishedAt));
  }

  async getUpdatesForCompany(companyId: number): Promise<any[]> {
    // Get updates from all master companies this company subscribes to
    const subscriptions = await db
      .select({ masterCompanyId: companyMasterSubscriptions.masterCompanyId })
      .from(companyMasterSubscriptions)
      .where(and(
        eq(companyMasterSubscriptions.companyId, companyId),
        eq(companyMasterSubscriptions.isActive, true)
      ));

    if (subscriptions.length === 0) return [];

    const masterCompanyIds = subscriptions.map(s => s.masterCompanyId);
    
    return await db
      .select()
      .from(masterCompanyUpdates)
      .where(sql`${masterCompanyUpdates.masterCompanyId} = ANY(${masterCompanyIds})`)
      .orderBy(desc(masterCompanyUpdates.publishedAt));
  }

  // Company user operations
  async addUserToCompany(companyUser: InsertCompanyUser): Promise<CompanyUser> {
    const [newCompanyUser] = await db.insert(companyUsers).values(companyUser).returning();
    return newCompanyUser;
  }

  async getCompanyUsers(companyId: number): Promise<(CompanyUser & { user: User })[]> {
    const result = await db
      .select()
      .from(companyUsers)
      .innerJoin(users, eq(companyUsers.userId, users.id))
      .where(eq(companyUsers.companyId, companyId));
    
    return result.map(r => ({ ...r.company_users, user: r.users }));
  }

  async getUserRole(userId: string, companyId: number): Promise<string | undefined> {
    const [result] = await db
      .select({ role: companyUsers.role })
      .from(companyUsers)
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.companyId, companyId)));
    
    return result?.role;
  }

  // CSCS card operations
  async createCSCSCard(card: InsertCSCSCard): Promise<CSCSCard> {
    const [newCard] = await db.insert(cscsCards).values(card).returning();
    return newCard;
  }

  async getCSCSCards(companyId: number): Promise<CSCSCard[]> {
    return await db.select().from(cscsCards).where(eq(cscsCards.companyId, companyId));
  }

  async getExpiringCSCSCards(companyId: number, days: number): Promise<CSCSCard[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db
      .select()
      .from(cscsCards)
      .where(
        and(
          eq(cscsCards.companyId, companyId),
          eq(cscsCards.isActive, true),
          lte(cscsCards.expiryDate, futureDate.toISOString().split('T')[0])
        )
      );
  }

  // Risk assessment operations
  async createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [newAssessment] = await db.insert(riskAssessments).values(assessment).returning();
    return newAssessment;
  }

  async getRiskAssessments(companyId: number): Promise<RiskAssessment[]> {
    return await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.companyId, companyId))
      .orderBy(desc(riskAssessments.createdAt));
  }

  async updateRiskAssessment(id: number, assessment: Partial<InsertRiskAssessment>): Promise<RiskAssessment> {
    const [updated] = await db
      .update(riskAssessments)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(riskAssessments.id, id))
      .returning();
    return updated;
  }

  // Method statement operations
  async createMethodStatement(statement: InsertMethodStatement): Promise<MethodStatement> {
    const [newStatement] = await db.insert(methodStatements).values(statement).returning();
    return newStatement;
  }

  async getMethodStatements(companyId: number): Promise<MethodStatement[]> {
    return await db
      .select()
      .from(methodStatements)
      .where(eq(methodStatements.companyId, companyId))
      .orderBy(desc(methodStatements.createdAt));
  }

  // Toolbox talk operations
  async createToolboxTalk(talk: InsertToolboxTalk): Promise<ToolboxTalk> {
    const [newTalk] = await db.insert(toolboxTalks).values(talk).returning();
    return newTalk;
  }

  async getToolboxTalks(companyId: number): Promise<ToolboxTalk[]> {
    return await db
      .select()
      .from(toolboxTalks)
      .where(eq(toolboxTalks.companyId, companyId))
      .orderBy(desc(toolboxTalks.date));
  }

  async getToolboxTalksThisMonth(companyId: number): Promise<number> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const firstDayString = firstDayOfMonth.toISOString().split('T')[0];
    
    const [result] = await db
      .select({ count: count() })
      .from(toolboxTalks)
      .where(
        and(
          eq(toolboxTalks.companyId, companyId),
          gte(toolboxTalks.date, firstDayString)
        )
      );
    
    return result.count;
  }

  // Compliance operations
  async createComplianceItem(item: InsertComplianceItem): Promise<ComplianceItem> {
    const [newItem] = await db.insert(complianceItems).values(item).returning();
    return newItem;
  }

  async getComplianceItems(companyId: number): Promise<ComplianceItem[]> {
    return await db
      .select()
      .from(complianceItems)
      .where(eq(complianceItems.companyId, companyId))
      .orderBy(complianceItems.dueDate);
  }

  async getOverdueComplianceItems(companyId: number): Promise<ComplianceItem[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return await db
      .select()
      .from(complianceItems)
      .where(
        and(
          eq(complianceItems.companyId, companyId),
          eq(complianceItems.status, "pending"),
          lte(complianceItems.dueDate, today)
        )
      );
  }

  async updateComplianceItemStatus(id: number, status: string): Promise<ComplianceItem> {
    const [updated] = await db
      .update(complianceItems)
      .set({ 
        status, 
        completedAt: status === "completed" ? new Date() : null 
      })
      .where(eq(complianceItems.id, id))
      .returning();
    return updated;
  }

  // Dashboard metrics
  async getComplianceMetrics(companyId: number): Promise<{
    cscsCardsTotal: number;
    cscsCardsExpiring: number;
    riskAssessmentsTotal: number;
    riskAssessmentsDue: number;
    toolboxTalksThisMonth: number;
    complianceScore: number;
  }> {
    // CSCS cards metrics
    const [cscsTotal] = await db
      .select({ count: count() })
      .from(cscsCards)
      .where(and(eq(cscsCards.companyId, companyId), eq(cscsCards.isActive, true)));

    const cscsExpiring = await this.getExpiringCSCSCards(companyId, 30);

    // Risk assessments metrics
    const [riskTotal] = await db
      .select({ count: count() })
      .from(riskAssessments)
      .where(eq(riskAssessments.companyId, companyId));

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const [riskDue] = await db
      .select({ count: count() })
      .from(riskAssessments)
      .where(
        and(
          eq(riskAssessments.companyId, companyId),
          lte(riskAssessments.reviewDate, futureDate.toISOString().split('T')[0])
        )
      );

    // Toolbox talks this month
    const toolboxCount = await this.getToolboxTalksThisMonth(companyId);

    // Remove fake compliance score - no ISO compliance tracking yet
    let score = 0;

    return {
      cscsCardsTotal: cscsTotal.count,
      cscsCardsExpiring: cscsExpiring.length,
      riskAssessmentsTotal: riskTotal.count,
      riskAssessmentsDue: riskDue.count,
      toolboxTalksThisMonth: toolboxCount,
      complianceScore: Math.max(0, score),
    };
  }

  // Document generation operations
  async createGeneratedDocument(document: InsertGeneratedDocument): Promise<GeneratedDocument> {
    const [doc] = await db
      .insert(generatedDocuments)
      .values(document)
      .returning();
    return doc;
  }

  async getGeneratedDocuments(companyId: number): Promise<GeneratedDocument[]> {
    return await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.companyId, companyId))
      .orderBy(desc(generatedDocuments.createdAt));
  }

  async getGeneratedDocument(id: number): Promise<GeneratedDocument | undefined> {
    const [doc] = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.id, id));
    return doc || undefined;
  }

  async updateGeneratedDocumentStatus(id: number, status: string): Promise<GeneratedDocument> {
    const [doc] = await db
      .update(generatedDocuments)
      .set({ status, updatedAt: new Date() })
      .where(eq(generatedDocuments.id, id))
      .returning();
    return doc;
  }

  // Document template operations
  async getDocumentTemplates(category?: string): Promise<DocumentTemplate[]> {
    if (category) {
      return await db
        .select()
        .from(documentTemplates)
        .where(
          and(
            eq(documentTemplates.isActive, true),
            eq(documentTemplates.category, category)
          )
        );
    }
    
    return await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.isActive, true));
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [created] = await db
      .insert(documentTemplates)
      .values(template)
      .returning();
    return created;
  }

  async createBasicStarterDocumentsForCompany(companyId: number, tradeType: string, userId: string): Promise<GeneratedDocument[]> {
    const { createBasicStarterDocuments } = await import("./iso9001Templates");
    const starterDocs = await createBasicStarterDocuments(companyId, tradeType, userId);
    
    if (starterDocs.length === 0) {
      return [];
    }
    
    const createdDocs = await db
      .insert(generatedDocuments)
      .values(starterDocs)
      .returning();
      
    return createdDocs;
  }

  async createPremiumStarterDocumentsForCompany(companyId: number, tradeType: string, userId: string): Promise<GeneratedDocument[]> {
    const { createPremiumStarterDocuments } = await import("./iso9001Templates");
    const starterDocs = await createPremiumStarterDocuments(companyId, tradeType, userId);
    
    if (starterDocs.length === 0) {
      return [];
    }
    
    const createdDocs = await db
      .insert(generatedDocuments)
      .values(starterDocs)
      .returning();
      
    return createdDocs;
  }

  // Document annotation operations
  async createDocumentAnnotation(annotation: InsertDocumentAnnotation): Promise<DocumentAnnotation> {
    const [created] = await db
      .insert(documentAnnotations)
      .values(annotation)
      .returning();
    return created;
  }

  async getDocumentAnnotations(documentId: number): Promise<(DocumentAnnotation & { user: User })[]> {
    const annotations = await db
      .select({
        annotation: documentAnnotations,
        user: users,
      })
      .from(documentAnnotations)
      .leftJoin(users, eq(documentAnnotations.userId, users.id))
      .where(eq(documentAnnotations.documentId, documentId))
      .orderBy(desc(documentAnnotations.createdAt));
    
    return annotations.map(item => ({
      ...item.annotation,
      user: item.user!,
    }));
  }

  async updateAnnotationStatus(id: number, status: string): Promise<DocumentAnnotation> {
    const [updated] = await db
      .update(documentAnnotations)
      .set({ status, updatedAt: new Date() })
      .where(eq(documentAnnotations.id, id))
      .returning();
    return updated;
  }

  async deleteDocumentAnnotation(id: number): Promise<void> {
    await db
      .delete(documentAnnotations)
      .where(eq(documentAnnotations.id, id));
  }

  // Document review operations
  async createDocumentReview(review: InsertDocumentReview): Promise<DocumentReview> {
    const [created] = await db
      .insert(documentReviews)
      .values(review)
      .returning();
    return created;
  }

  async getDocumentReviews(documentId: number): Promise<(DocumentReview & { reviewer: User })[]> {
    const reviews = await db
      .select({
        review: documentReviews,
        reviewer: users,
      })
      .from(documentReviews)
      .leftJoin(users, eq(documentReviews.reviewerId, users.id))
      .where(eq(documentReviews.documentId, documentId))
      .orderBy(desc(documentReviews.createdAt));
    
    return reviews.map(item => ({
      ...item.review,
      reviewer: item.reviewer!,
    }));
  }

  async updateDocumentReviewStatus(documentId: number, reviewerId: string, status: string, comments?: string): Promise<DocumentReview> {
    const [updated] = await db
      .update(documentReviews)
      .set({ 
        status, 
        comments,
        completedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(documentReviews.documentId, documentId),
          eq(documentReviews.reviewerId, reviewerId)
        )
      )
      .returning();
    return updated;
  }

  // Smart dashboard implementations
  async getDashboardData(companyId: number): Promise<{
    completedDocuments: number;
    documentsInProgress: number;
    overdueDocuments: number;
    complianceScore: number;
    pendingDocuments: number;
    totalReports: number;
    recentDocuments: any[];
  }> {
    const documents = await db.select().from(generatedDocuments).where(eq(generatedDocuments.companyId, companyId));
    
    const completedDocuments = documents.filter(doc => doc.status === 'published' || doc.reviewStatus === 'approved').length;
    const documentsInProgress = documents.filter(doc => doc.status === 'generated' && doc.reviewStatus === 'pending').length;
    const overdueDocuments = documents.filter(doc => {
      const createdDate = new Date(doc.createdAt!);
      const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated > 7 && doc.reviewStatus === 'pending';
    }).length;
    
    const complianceScore = documents.length > 0 ? Math.round((completedDocuments / documents.length) * 100) : 0;
    const recentDocuments = documents
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10);

    return {
      completedDocuments,
      documentsInProgress,
      overdueDocuments,
      complianceScore,
      pendingDocuments: documentsInProgress,
      totalReports: documents.length,
      recentDocuments,
    };
  }

  async getDocumentProgress(companyId: number): Promise<any[]> {
    const documents = await db
      .select({
        id: generatedDocuments.id,
        documentName: generatedDocuments.documentName,
        siteName: generatedDocuments.siteName,
        templateType: generatedDocuments.templateType,
        status: generatedDocuments.status,
        reviewStatus: generatedDocuments.reviewStatus,
        createdAt: generatedDocuments.createdAt,
        generatedBy: generatedDocuments.generatedBy,
      })
      .from(generatedDocuments)
      .where(eq(generatedDocuments.companyId, companyId));

    // Simulate workflow data for existing documents
    return documents.map(doc => ({
      ...doc,
      workflowStage: this.mapStatusToWorkflowStage(doc.status, doc.reviewStatus),
      priority: this.assignPriority(doc.createdAt),
      completionPercentage: this.calculateCompletionPercentage(doc.status, doc.reviewStatus),
      assignedTo: doc.generatedBy,
      assignedToName: "Current User",
      dueDate: this.calculateDueDate(doc.createdAt),
      isOverdue: this.isDocumentOverdue(doc.createdAt),
      estimatedCompletionTime: 8,
      emailNotificationsSent: 0,
      workflowNotes: null,
    }));
  }

  private mapStatusToWorkflowStage(status: string | null, reviewStatus: string | null): string {
    if (reviewStatus === 'approved') return 'approved';
    if (reviewStatus === 'in_review') return 'in_review';
    if (status === 'published') return 'published';
    return 'created';
  }

  private assignPriority(createdAt: Date | null): string {
    if (!createdAt) return 'medium';
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 14) return 'urgent';
    if (daysSinceCreated > 7) return 'high';
    return 'medium';
  }

  private calculateCompletionPercentage(status: string | null, reviewStatus: string | null): number {
    if (reviewStatus === 'approved') return 100;
    if (reviewStatus === 'in_review') return 75;
    if (status === 'generated') return 50;
    return 25;
  }

  private calculateDueDate(createdAt: Date | null): Date | null {
    if (!createdAt) return null;
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from creation
    return dueDate;
  }

  private isDocumentOverdue(createdAt: Date | null): boolean {
    if (!createdAt) return false;
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated > 14;
  }

  async updateDocumentProgress(documentId: number, progress: number, notes?: string): Promise<void> {
    // For now, update the review status based on progress
    let newStatus = 'pending';
    if (progress >= 100) {
      newStatus = 'approved';
    } else if (progress >= 75) {
      newStatus = 'in_review';
    }

    await db
      .update(generatedDocuments)
      .set({ 
        reviewStatus: newStatus,
        updatedAt: new Date()
      })
      .where(eq(generatedDocuments.id, documentId));
  }

  async sendDocumentNotification(documentId: number, companyId: number, type: string): Promise<boolean> {
    // Simulate sending email notification
    console.log(`Sending ${type} notification for document ${documentId} in company ${companyId}`);
    return true;
  }

  async getUserNotifications(companyId: number): Promise<any[]> {
    // Return recent activity notifications
    const documents = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.companyId, companyId))
      .orderBy(desc(generatedDocuments.updatedAt))
      .limit(10);

    return documents.map(doc => ({
      id: doc.id,
      title: `Document ${doc.reviewStatus === 'approved' ? 'Approved' : 'Updated'}`,
      description: `${doc.documentName} - ${doc.siteName}`,
      createdAt: doc.updatedAt,
      type: 'document_update',
    }));
  }

  // Voucher code operations
  async getVoucherByCode(code: string): Promise<VoucherCode | undefined> {
    const [voucher] = await db
      .select()
      .from(voucherCodes)
      .where(eq(voucherCodes.code, code));
    return voucher;
  }

  async createVoucher(voucherData: InsertVoucherCode): Promise<VoucherCode> {
    const [voucher] = await db
      .insert(voucherCodes)
      .values(voucherData)
      .returning();
    return voucher;
  }

  async recordVoucherUsage(usageData: InsertVoucherUsage): Promise<VoucherUsage> {
    const [usage] = await db
      .insert(voucherUsage)
      .values(usageData)
      .returning();
    return usage;
  }

  async incrementVoucherUsage(voucherId: number): Promise<void> {
    await db
      .update(voucherCodes)
      .set({
        usedCount: sql`${voucherCodes.usedCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(voucherCodes.id, voucherId));
  }

  async updateUserPlanStatus(userId: string, updates: {
    planStatus: string;
    selectedPlan: string;
    subscriptionType: string;
    contractStartDate: Date;
    contractEndDate: Date;
    nextBillingDate: Date;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        planStatus: updates.planStatus,
        selectedPlan: updates.selectedPlan,
        subscriptionType: updates.subscriptionType,
        contractStartDate: updates.contractStartDate,
        contractEndDate: updates.contractEndDate,
        nextBillingDate: updates.nextBillingDate,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Company branding operations
  async upsertCompanyBranding(companyId: number, brandingData: any): Promise<CompanyBranding> {
    // Try to find existing branding record
    const [existing] = await db
      .select()
      .from(companyBranding)
      .where(eq(companyBranding.companyId, companyId));

    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(companyBranding)
        .set({
          ...brandingData,
          updatedAt: new Date()
        })
        .where(eq(companyBranding.companyId, companyId))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db
        .insert(companyBranding)
        .values({
          companyId,
          ...brandingData
        })
        .returning();
      return created;
    }
  }

  async getCompanyBranding(companyId: number): Promise<CompanyBranding | undefined> {
    const [branding] = await db
      .select()
      .from(companyBranding)
      .where(eq(companyBranding.companyId, companyId));
    return branding;
  }

  // Document generation operations
  async createDocumentGenerationRequest(requestData: InsertDocumentGenerationRequest): Promise<DocumentGenerationRequest> {
    const [request] = await db
      .insert(documentGenerationRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async updateDocumentGenerationRequest(requestId: number, updates: Partial<InsertDocumentGenerationRequest>): Promise<DocumentGenerationRequest> {
    const [updated] = await db
      .update(documentGenerationRequests)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(documentGenerationRequests.id, requestId))
      .returning();
    return updated;
  }


}

export const storage = new DatabaseStorage();
