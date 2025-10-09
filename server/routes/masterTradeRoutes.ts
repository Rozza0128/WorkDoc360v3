/**
 * Master Trade Company API Routes
 * Handles industry oracles that maintain compliance standards and feed updates to member companies
 */

import { Router } from "express";
import { db } from "../db";
import {
  masterTradeCompanies,
  masterDocuments,
  companySubscriptions,
  updateRecommendations,
  industryExperts,
  companies,
  insertMasterTradeCompanySchema,
  insertMasterDocumentSchema,
  insertCompanySubscriptionSchema,
  insertUpdateRecommendationSchema,
  insertIndustryExpertSchema,
  type MasterTradeCompany,
  type MasterDocument,
  type CompanySubscription,
  type UpdateRecommendation
} from "../../shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { UK_CONSTRUCTION_TRADES_MASTERS } from "../../shared/master-trade-system";

const router = Router();

/**
 * GET /api/master-trades
 * List all master trade companies with their statistics
 */
router.get("/", async (req, res) => {
  try {
    const masterTrades = await db
      .select({
        id: masterTradeCompanies.id,
        tradeType: masterTradeCompanies.tradeType,
        name: masterTradeCompanies.name,
        description: masterTradeCompanies.description,
        totalMemberCompanies: masterTradeCompanies.totalMemberCompanies,
        totalDocuments: masterTradeCompanies.totalDocuments,
        basicMonthlyFee: masterTradeCompanies.basicMonthlyFee,
        premiumMonthlyFee: masterTradeCompanies.premiumMonthlyFee,
        enterpriseMonthlyFee: masterTradeCompanies.enterpriseMonthlyFee,
        status: masterTradeCompanies.status,
        certifyingBodies: masterTradeCompanies.certifyingBodies,
        industryStandards: masterTradeCompanies.industryStandards,
        createdAt: masterTradeCompanies.createdAt,
      })
      .from(masterTradeCompanies)
      .where(eq(masterTradeCompanies.status, "active"));

    res.json(masterTrades);
  } catch (error) {
    console.error("Error fetching master trades:", error);
    res.status(500).json({ error: "Failed to fetch master trades" });
  }
});

/**
 * GET /api/master-trades/:tradeType
 * Get detailed information about a specific master trade company
 */
router.get("/:tradeType", async (req, res) => {
  try {
    const { tradeType } = req.params;

    // Get master trade company
    const [masterTrade] = await db
      .select()
      .from(masterTradeCompanies)
      .where(and(
        eq(masterTradeCompanies.tradeType, tradeType),
        eq(masterTradeCompanies.status, "active")
      ));

    if (!masterTrade) {
      return res.status(404).json({ error: "Master trade company not found" });
    }

    // Get recent documents
    const recentDocuments = await db
      .select()
      .from(masterDocuments)
      .where(and(
        eq(masterDocuments.masterTradeId, masterTrade.id),
        eq(masterDocuments.status, "active")
      ))
      .orderBy(desc(masterDocuments.updatedAt))
      .limit(10);

    // Get subscription statistics
    const subscriptionStats = await db
      .select({
        tier: companySubscriptions.subscriptionTier,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(companySubscriptions)
      .where(and(
        eq(companySubscriptions.masterTradeId, masterTrade.id),
        eq(companySubscriptions.status, "active")
      ))
      .groupBy(companySubscriptions.subscriptionTier);

    // Get recent updates/recommendations
    const recentUpdates = await db
      .select()
      .from(updateRecommendations)
      .where(eq(updateRecommendations.masterTradeId, masterTrade.id))
      .orderBy(desc(updateRecommendations.createdAt))
      .limit(5);

    const response = {
      ...masterTrade,
      recentDocuments,
      subscriptionStats,
      recentUpdates,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching master trade details:", error);
    res.status(500).json({ error: "Failed to fetch master trade details" });
  }
});

/**
 * POST /api/master-trades
 * Create a new master trade company (admin only)
 */
router.post("/", async (req, res) => {
  try {
    const validatedData = insertMasterTradeCompanySchema.parse(req.body);

    const [masterTrade] = await db
      .insert(masterTradeCompanies)
      .values(validatedData)
      .returning();

    res.status(201).json(masterTrade);
  } catch (error) {
    console.error("Error creating master trade company:", error);
    res.status(500).json({ error: "Failed to create master trade company" });
  }
});

/**
 * GET /api/master-trades/:tradeType/documents
 * Get all master documents for a specific trade
 */
router.get("/:tradeType/documents", async (req, res) => {
  try {
    const { tradeType } = req.params;
    const { documentType, urgencyLevel, limit = 50 } = req.query;

    // Get master trade company ID
    const [masterTrade] = await db
      .select({ id: masterTradeCompanies.id })
      .from(masterTradeCompanies)
      .where(and(
        eq(masterTradeCompanies.tradeType, tradeType),
        eq(masterTradeCompanies.status, "active")
      ));

    if (!masterTrade) {
      return res.status(404).json({ error: "Master trade company not found" });
    }

    // Build query conditions
    let conditions = [
      eq(masterDocuments.masterTradeId, masterTrade.id),
      eq(masterDocuments.status, "active")
    ];

    if (documentType) {
      conditions.push(eq(masterDocuments.documentType, documentType as string));
    }

    if (urgencyLevel) {
      conditions.push(eq(masterDocuments.urgencyLevel, urgencyLevel as string));
    }

    const documents = await db
      .select()
      .from(masterDocuments)
      .where(and(...conditions))
      .orderBy(desc(masterDocuments.updatedAt))
      .limit(Number(limit));

    res.json(documents);
  } catch (error) {
    console.error("Error fetching master documents:", error);
    res.status(500).json({ error: "Failed to fetch master documents" });
  }
});

/**
 * POST /api/master-trades/:tradeType/documents
 * Create a new master document
 */
router.post("/:tradeType/documents", async (req, res) => {
  try {
    const { tradeType } = req.params;

    // Get master trade company ID
    const [masterTrade] = await db
      .select({ id: masterTradeCompanies.id })
      .from(masterTradeCompanies)
      .where(and(
        eq(masterTradeCompanies.tradeType, tradeType),
        eq(masterTradeCompanies.status, "active")
      ));

    if (!masterTrade) {
      return res.status(404).json({ error: "Master trade company not found" });
    }

    const validatedData = insertMasterDocumentSchema.parse({
      ...req.body,
      masterTradeId: masterTrade.id,
    });

    const [document] = await db
      .insert(masterDocuments)
      .values(validatedData)
      .returning();

    // Update document count in master trade company
    await db
      .update(masterTradeCompanies)
      .set({
        totalDocuments: sql`${masterTradeCompanies.totalDocuments} + 1`,
        updatedAt: new Date()
      })
      .where(eq(masterTradeCompanies.id, masterTrade.id));

    res.status(201).json(document);
  } catch (error) {
    console.error("Error creating master document:", error);
    res.status(500).json({ error: "Failed to create master document" });
  }
});

/**
 * POST /api/master-trades/:tradeType/subscribe
 * Subscribe a company to a master trade company
 */
router.post("/:tradeType/subscribe", async (req, res) => {
  try {
    const { tradeType } = req.params;
    const { companyId, subscriptionTier } = req.body;

    if (!companyId || !subscriptionTier) {
      return res.status(400).json({ error: "Company ID and subscription tier are required" });
    }

    // Get master trade company
    const [masterTrade] = await db
      .select()
      .from(masterTradeCompanies)
      .where(and(
        eq(masterTradeCompanies.tradeType, tradeType),
        eq(masterTradeCompanies.status, "active")
      ));

    if (!masterTrade) {
      return res.status(404).json({ error: "Master trade company not found" });
    }

    // Check if company exists
    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId));

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Check if already subscribed
    const [existingSubscription] = await db
      .select()
      .from(companySubscriptions)
      .where(and(
        eq(companySubscriptions.companyId, companyId),
        eq(companySubscriptions.masterTradeId, masterTrade.id)
      ));

    if (existingSubscription) {
      return res.status(400).json({ error: "Company already subscribed to this master trade" });
    }

    // Determine monthly fee based on tier
    let monthlyFee: number;
    switch (subscriptionTier) {
      case 'basic':
        monthlyFee = masterTrade.basicMonthlyFee || 4500;
        break;
      case 'premium':
        monthlyFee = masterTrade.premiumMonthlyFee || 8500;
        break;
      case 'enterprise':
        monthlyFee = masterTrade.enterpriseMonthlyFee || 15000;
        break;
      default:
        return res.status(400).json({ error: "Invalid subscription tier" });
    }

    // Create subscription
    const subscriptionData = {
      companyId,
      masterTradeId: masterTrade.id,
      subscriptionTier,
      monthlyFee,
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    };

    const [subscription] = await db
      .insert(companySubscriptions)
      .values(subscriptionData)
      .returning();

    // Update member count in master trade company
    await db
      .update(masterTradeCompanies)
      .set({
        totalMemberCompanies: sql`${masterTradeCompanies.totalMemberCompanies} + 1`,
        updatedAt: new Date()
      })
      .where(eq(masterTradeCompanies.id, masterTrade.id));

    res.status(201).json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

/**
 * GET /api/master-trades/:tradeType/updates
 * Get recent update recommendations for a trade
 */
router.get("/:tradeType/updates", async (req, res) => {
  try {
    const { tradeType } = req.params;
    const { priority, status, limit = 20 } = req.query;

    // Get master trade company ID
    const [masterTrade] = await db
      .select({ id: masterTradeCompanies.id })
      .from(masterTradeCompanies)
      .where(and(
        eq(masterTradeCompanies.tradeType, tradeType),
        eq(masterTradeCompanies.status, "active")
      ));

    if (!masterTrade) {
      return res.status(404).json({ error: "Master trade company not found" });
    }

    // Build query conditions
    let conditions = [eq(updateRecommendations.masterTradeId, masterTrade.id)];

    if (priority) {
      conditions.push(eq(updateRecommendations.priority, priority as string));
    }

    if (status) {
      conditions.push(eq(updateRecommendations.status, status as string));
    }

    const updates = await db
      .select()
      .from(updateRecommendations)
      .where(and(...conditions))
      .orderBy(desc(updateRecommendations.createdAt))
      .limit(Number(limit));

    res.json(updates);
  } catch (error) {
    console.error("Error fetching update recommendations:", error);
    res.status(500).json({ error: "Failed to fetch update recommendations" });
  }
});

/**
 * POST /api/master-trades/:tradeType/updates
 * Create a new update recommendation to distribute to member companies
 */
router.post("/:tradeType/updates", async (req, res) => {
  try {
    const { tradeType } = req.params;

    // Get master trade company ID
    const [masterTrade] = await db
      .select({ id: masterTradeCompanies.id })
      .from(masterTradeCompanies)
      .where(and(
        eq(masterTradeCompanies.tradeType, tradeType),
        eq(masterTradeCompanies.status, "active")
      ));

    if (!masterTrade) {
      return res.status(404).json({ error: "Master trade company not found" });
    }

    // Get all subscribed companies for target distribution
    const subscribedCompanies = await db
      .select({ companyId: companySubscriptions.companyId })
      .from(companySubscriptions)
      .where(and(
        eq(companySubscriptions.masterTradeId, masterTrade.id),
        eq(companySubscriptions.status, "active")
      ));

    const targetCompanyIds = subscribedCompanies.map(sub => sub.companyId.toString());

    const validatedData = insertUpdateRecommendationSchema.parse({
      ...req.body,
      masterTradeId: masterTrade.id,
      targetCompanyIds,
    });

    const [updateRecommendation] = await db
      .insert(updateRecommendations)
      .values(validatedData)
      .returning();

    res.status(201).json({
      ...updateRecommendation,
      distributionSummary: {
        totalTargetCompanies: targetCompanyIds.length,
        targetCompanyIds,
      },
    });
  } catch (error) {
    console.error("Error creating update recommendation:", error);
    res.status(500).json({ error: "Failed to create update recommendation" });
  }
});

/**
 * GET /api/master-trades/initialize-defaults
 * Initialize the default master trade companies for UK construction trades
 * (Development/admin endpoint)
 */
router.post("/initialize-defaults", async (req, res) => {
  try {
    const createdMasterTrades = [];

    for (const [tradeKey, tradeConfig] of Object.entries(UK_CONSTRUCTION_TRADES_MASTERS)) {
      // Check if already exists
      const [existing] = await db
        .select({ id: masterTradeCompanies.id })
        .from(masterTradeCompanies)
        .where(eq(masterTradeCompanies.tradeType, tradeKey));

      if (!existing) {
        const masterTradeData = {
          tradeType: tradeKey,
          name: tradeConfig.name,
          description: tradeConfig.description,
          certifyingBodies: tradeConfig.certifyingBodies,
          industryStandards: tradeConfig.keyStandards,
          basicMonthlyFee: tradeConfig.membershipTiers.basic.monthlyFee * 100, // Convert to pence
          premiumMonthlyFee: tradeConfig.membershipTiers.premium.monthlyFee * 100,
          enterpriseMonthlyFee: tradeConfig.membershipTiers.enterprise.monthlyFee * 100,
        };

        const [created] = await db
          .insert(masterTradeCompanies)
          .values([masterTradeData as any])
          .returning();

        createdMasterTrades.push(created);
      }
    }

    res.json({
      message: `Initialized ${createdMasterTrades.length} master trade companies`,
      createdMasterTrades,
    });
  } catch (error) {
    console.error("Error initializing default master trades:", error);
    res.status(500).json({ error: "Failed to initialize default master trades" });
  }
});

export { router as masterTradeRoutes };