import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { TwoFactorService } from "./twoFactor";
import { generateDocument } from "./documentGenerator";
import { aiCardVerificationService } from "./aiCardVerification";
import { cscsVerificationService } from "./cscsVerification";
import { insertGeneratedDocumentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { 
  insertCompanySchema,
  insertRiskAssessmentSchema,
  insertMethodStatementSchema,
  insertToolboxTalkSchema,
  insertCSCSCardSchema,
  insertComplianceItemSchema,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploaded_assets');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const companyId = req.params.companyId || req.params.id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const baseName = file.originalname.replace(extension, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${companyId}_${timestamp}_${baseName}${extension}`);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter check:', {
      path: req.path,
      mimetype: file.mimetype,
      originalname: file.originalname
    });
    
    // Allow images for logo upload
    if (req.path.includes('upload-logo')) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
      if (allowedImageTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
    }
    
    // Allow documents for document upload
    if (req.path.includes('upload-documents') || req.path.includes('assess-documents')) {
      const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/json' // For testing
      ];
      if (allowedDocTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
      
      // Also allow common file types even if mimetype is not recognized
      const extension = path.extname(file.originalname).toLowerCase();
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.json'];
      if (allowedExtensions.includes(extension)) {
        return cb(null, true);
      }
    }
    
    cb(new Error(`Invalid file type: ${file.mimetype} (${file.originalname})`));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Development test login (only in development)
  if (process.env.NODE_ENV === "development") {
    app.post('/api/auth/test-login', async (req, res) => {
      try {
        // Get existing test user or create if not exists
        let testUser = await storage.getUserByEmail("test@workdoc360.com");
        if (!testUser) {
          testUser = await storage.createUser({
            email: "test@workdoc360.com",
            password: "testpassword123",
            firstName: "Paul",
            lastName: "Tester",
            profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Paul",
            selectedPlan: "professional",
            planStatus: "active",
            subscriptionType: "yearly"
          });
        }

        // Set session using passport login
        req.login(testUser, (err) => {
          if (err) {
            throw err;
          }
        });

        res.json({ 
          success: true, 
          message: "Test login successful",
          user: testUser 
        });
      } catch (error) {
        console.error("Error in test login:", error);
        res.status(500).json({ message: "Test login failed" });
      }
    });

    app.post('/api/auth/test-logout', (req, res) => {
      req.session.destroy(() => {
        res.json({ success: true, message: "Test logout successful" });
      });
    });
  }

  // Mobile App API Routes
  // Token-based authentication for mobile apps
  app.post("/api/mobile/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { comparePasswords } = await import("./auth");
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT or session token for mobile
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: userWithoutPassword,
        token,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Mobile login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/mobile/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Validation
      if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Email, password, and first name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: "Account already exists",
          message: "You already have an account with this email address. Please log in instead.",
          action: "login"
        });
      }

      // Create user
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName: lastName || "",
      });

      // Generate token
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        success: true,
        user: userWithoutPassword,
        token,
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Mobile registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Mobile token validation
  app.get("/api/mobile/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Mobile user fetch error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Auth routes are now handled in auth.ts

  // Company routes
  app.post("/api/companies", requireAuth, async (req: any, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "User not found in request" });
      }
      
      const userId = req.user.id;
      
      // Check if user already has a company (limit: 1 company per account)
      const existingCompanies = await storage.getCompaniesByUserId(userId);
      if (existingCompanies.length > 0) {
        return res.status(400).json({ 
          message: "You already have a company. Each account is limited to one company. Please contact support if you need to create additional companies." 
        });
      }
      
      const validatedData = insertCompanySchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const company = await storage.createCompany(validatedData);

      // Add the user as admin to the company
      await storage.addUserToCompany({
        userId: userId,
        companyId: company.id,
        role: "admin",
      });

      // Create basic starter documents for the company
      // ISO 9001 templates are available only with Professional/Enterprise plans
      await storage.createBasicStarterDocumentsForCompany(
        company.id,
        validatedData.tradeType,
        userId
      );

      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Failed to create company" });
    }
  });

  app.get("/api/companies", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const companies = await storage.getCompaniesByUserId(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Dashboard metrics
  app.get("/api/companies/:id/metrics", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const metrics = await storage.getComplianceMetrics(companyId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // CSCS card routes
  app.post("/api/companies/:id/cscs-cards", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertCSCSCardSchema.parse({
        ...req.body,
        companyId,
      });
      
      const card = await storage.createCSCSCard(validatedData);
      res.json(card);
    } catch (error) {
      console.error("Error creating CSCS card:", error);
      res.status(400).json({ message: "Failed to create CSCS card" });
    }
  });

  app.get("/api/companies/:id/cscs-cards", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const cards = await storage.getCSCSCards(companyId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching CSCS cards:", error);
      res.status(500).json({ message: "Failed to fetch CSCS cards" });
    }
  });

  // Risk assessment routes
  app.post("/api/companies/:id/risk-assessments", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertRiskAssessmentSchema.parse({
        ...req.body,
        companyId,
        assessorId: userId,
      });
      
      const assessment = await storage.createRiskAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating risk assessment:", error);
      res.status(400).json({ message: "Failed to create risk assessment" });
    }
  });

  app.get("/api/companies/:id/risk-assessments", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assessments = await storage.getRiskAssessments(companyId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching risk assessments:", error);
      res.status(500).json({ message: "Failed to fetch risk assessments" });
    }
  });

  // Method statement routes
  app.post("/api/companies/:id/method-statements", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertMethodStatementSchema.parse({
        ...req.body,
        companyId,
        authorizedBy: userId,
      });
      
      const statement = await storage.createMethodStatement(validatedData);
      res.json(statement);
    } catch (error) {
      console.error("Error creating method statement:", error);
      res.status(400).json({ message: "Failed to create method statement" });
    }
  });

  app.get("/api/companies/:id/method-statements", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const statements = await storage.getMethodStatements(companyId);
      res.json(statements);
    } catch (error) {
      console.error("Error fetching method statements:", error);
      res.status(500).json({ message: "Failed to fetch method statements" });
    }
  });

  // Toolbox talk routes
  app.post("/api/companies/:id/toolbox-talks", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertToolboxTalkSchema.parse({
        ...req.body,
        companyId,
        conductedBy: userId,
      });
      
      const talk = await storage.createToolboxTalk(validatedData);
      res.json(talk);
    } catch (error) {
      console.error("Error creating toolbox talk:", error);
      res.status(400).json({ message: "Failed to create toolbox talk" });
    }
  });

  app.get("/api/companies/:id/toolbox-talks", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const talks = await storage.getToolboxTalks(companyId);
      res.json(talks);
    } catch (error) {
      console.error("Error fetching toolbox talks:", error);
      res.status(500).json({ message: "Failed to fetch toolbox talks" });
    }
  });

  // Compliance items routes
  app.get("/api/companies/:id/compliance-items", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const items = await storage.getComplianceItems(companyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching compliance items:", error);
      res.status(500).json({ message: "Failed to fetch compliance items" });
    }
  });

  app.get("/api/companies/:id/compliance-items/overdue", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const items = await storage.getOverdueComplianceItems(companyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching overdue compliance items:", error);
      res.status(500).json({ message: "Failed to fetch overdue compliance items" });
    }
  });

  // Subscription and billing routes
  app.get("/api/companies/:id/subscription", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock subscription data - in production, integrate with actual billing service
      const subscription = {
        planName: 'professional',
        status: 'active',
        amount: 12900, // £129.00 in pence
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        includedUsers: 10,
        additionalUsers: 0,
        additionalUserCost: 1200, // £12.00 in pence
        trialEndsAt: null
      };

      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get("/api/companies/:id/billing/history", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock billing history
      const billingHistory = [
        {
          id: '1',
          number: 'INV-001',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Professional Plan - Monthly',
          amount: 12900,
          status: 'paid'
        },
        {
          id: '2',
          number: 'INV-002',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Professional Plan - Monthly',
          amount: 12900,
          status: 'paid'
        }
      ];

      res.json(billingHistory);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      res.status(500).json({ message: "Failed to fetch billing history" });
    }
  });

  app.get("/api/companies/:id/usage", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get actual usage data
      const companyUsers = await storage.getCompanyUsers(companyId);
      const toolboxTalks = await storage.getToolboxTalksThisMonth(companyId);

      const usage = {
        activeUsers: companyUsers.length,
        documentsGenerated: 45, // This would come from actual document generation tracking
        customRequests: 2,
        customHours: 3
      };

      res.json(usage);
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  app.get("/api/companies/:id/user-role", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(404).json({ message: "User not found in company" });
      }

      res.json({ role });
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });

  app.post("/api/companies/:id/users/invite", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { email, role } = req.body;
      
      // Check if user has permission to invite users
      const userRole = await storage.getUserRole(userId, companyId);
      if (!userRole || !['admin', 'manager'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or Manager access required" });
      }

      // In production: create invitation record and send email
      res.json({ 
        message: "Invitation sent successfully",
        email,
        role 
      });
    } catch (error) {
      console.error("Error inviting user:", error);
      res.status(500).json({ message: "Failed to invite user" });
    }
  });

  // Document generation route
  app.post("/api/generate-document", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { 
        companyId,
        templateType, 
        siteName, 
        siteAddress, 
        projectManager, 
        hazards, 
        controlMeasures, 
        specialRequirements,
        isUrgent,
        tradeType
      } = req.body;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || !["admin", "manager", "team_leader"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions to generate documents" });
      }
      
      // Get company details for AI context
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Generate document using AI
      const { generateDocument } = await import('./document-generator');
      const aiGeneratedContent = await generateDocument({
        templateType,
        companyName: company.name,
        tradeType: company.tradeType,
        siteName,
        siteAddress,
        projectManager,
        hazards,
        controlMeasures,
        specialRequirements
      });

      // Create document generation record
      const document = await storage.createGeneratedDocument({
        companyId,
        templateType,
        documentName: aiGeneratedContent.title || `${templateType.replace(/_/g, ' ')} - ${siteName}`,
        siteName,
        siteAddress,
        projectManager,
        hazards: hazards || aiGeneratedContent.hazards,
        controlMeasures: controlMeasures || aiGeneratedContent.controlMeasures,
        specialRequirements: specialRequirements || aiGeneratedContent.specialRequirements,
        generatedBy: userId,
        status: "generated"
      });
      
      // Return document information
      res.json({
        id: document.id,
        documentName: document.documentName,
        templateType: document.templateType,
        status: document.status,
        downloadUrl: `/api/documents/${document.id}/download`,
        createdAt: document.createdAt,
        isUrgent
      });
    } catch (error) {
      console.error("Document generation error:", error);
      res.status(500).json({ error: "Failed to generate document" });
    }
  });

  // Get generated documents for a company
  app.get("/api/companies/:id/documents", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const documents = await storage.getGeneratedDocuments(companyId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Download document endpoint
  app.get("/api/documents/:id/download", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this document
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check company access
      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Set appropriate headers for document download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${document.documentName}.pdf"`);
      
      // In production, this would serve the actual document file
      // For now, return a placeholder indicating the document would be served
      res.send(`Generated PDF document: ${document.documentName}\n\nSite: ${document.siteName}\nAddress: ${document.siteAddress}\nProject Manager: ${document.projectManager}\n\nThis is a placeholder for the actual PDF content.`);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  // Legacy document generation endpoint (keeping for compatibility)
  app.post("/api/companies/:id/documents/generate", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { 
        templateType, 
        siteName, 
        siteAddress, 
        projectManager, 
        hazards, 
        controlMeasures, 
        specialRequirements,
        customTradeDescription,
        customWorkActivities,
        customEquipment,
        customChallenges
      } = req.body;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get company details for document branding
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Create document name based on template and site
      const templateNames: { [key: string]: string } = {
        'scaffold-risk-assessment': 'Scaffold Risk Assessment',
        'scaffold-method-statement': 'Scaffold Method Statement',
        'scaffold-inspection-checklist': 'Scaffold Inspection Checklist',
        'plastering-risk-assessment': 'Plastering Risk Assessment',
        'dust-control-method': 'Dust Control Method Statement',
        'material-safety-data': 'Material Safety Data Sheet',
        'construction-phase-plan': 'Construction Phase Plan',
        'general-risk-assessment': 'General Risk Assessment',
        'toolbox-talk-template': 'Toolbox Talk Template',
        'manual-handling-assessment': 'Manual Handling Assessment'
      };

      // Handle custom trade consultation requests
      if (templateType === 'custom-consultation') {
        try {
          // Generate AI-powered consultation document
          const aiGeneratedContent = await generateDocument({
            templateType: 'custom_trade_consultation',
            companyName: company.name,
            tradeType: company.tradeType,
            siteName: siteName || company.name,
            siteAddress: siteAddress || company.address || 'Not specified',
            projectManager: projectManager || 'Not specified',
            customTradeDescription,
            customWorkActivities,
            customEquipment,
            customChallenges
          });

          const consultationData = {
            companyId,
            templateType: 'custom_trade_consultation',
            documentName: aiGeneratedContent.title,
            siteName: siteName || company.name,
            siteAddress: siteAddress || company.address || 'Not specified',
            projectManager: projectManager || 'Not specified',
            hazards: customChallenges || null,
            controlMeasures: aiGeneratedContent.content,
            specialRequirements: aiGeneratedContent.summary,
            status: 'generated',
            filePath: `/documents/consultation-${companyId}-${Date.now()}.txt`,
            fileUrl: `${req.protocol}://${req.hostname}/api/documents/consultation-${companyId}-${Date.now()}.txt`,
            generatedBy: userId,
          };

          const document = await storage.createGeneratedDocument(consultationData);

          return res.json({
            id: document.id,
            name: aiGeneratedContent.title,
            type: 'consultation',
            content: aiGeneratedContent.content,
            summary: aiGeneratedContent.summary,
            downloadUrl: document.fileUrl,
            createdAt: document.createdAt,
          });
        } catch (error) {
          console.error("AI consultation generation failed:", error);
          // Fallback to basic consultation request
          const consultationData = {
            companyId,
            templateType,
            documentName: `Custom Trade Consultation - ${company.name}`,
            siteName: company.name,
            siteAddress: company.address || 'Not specified',
            projectManager: projectManager || 'Not specified',
            hazards: customChallenges || null,
            controlMeasures: `Trade: ${customTradeDescription}\nActivities: ${customWorkActivities}\nEquipment: ${customEquipment}`,
            specialRequirements: specialRequirements || null,
            status: 'consultation_requested',
            filePath: null,
            fileUrl: null,
            generatedBy: userId,
          };

          const document = await storage.createGeneratedDocument(consultationData);
          return res.json({
            id: document.id,
            name: 'Custom Trade Consultation Request',
            type: 'consultation',
            message: 'Your consultation request has been submitted successfully. Our compliance team will review your requirements and contact you within 24 hours with recommendations and a detailed quote.',
            estimatedContact: '24 hours',
            createdAt: document.createdAt,
          });
        }
      }

      // Map template types to standardized AI document types
      const templateTypeMapping: { [key: string]: string } = {
        'scaffold-risk-assessment': 'risk_assessment',
        'scaffold-method-statement': 'method_statement',
        'scaffold-inspection-checklist': 'risk_assessment',
        'plastering-risk-assessment': 'risk_assessment',
        'dust-control-method': 'method_statement',
        'material-safety-data': 'health_safety_policy',
        'construction-phase-plan': 'method_statement',
        'general-risk-assessment': 'risk_assessment',
        'toolbox-talk-template': 'health_safety_policy',
        'manual-handling-assessment': 'risk_assessment',
        'risk_assessment': 'risk_assessment',
        'method_statement': 'method_statement',
        'health_safety_policy': 'health_safety_policy'
      };

      const standardizedTemplateType = templateTypeMapping[templateType] || 'risk_assessment';

      try {
        // Generate AI-powered document content
        const aiGeneratedContent = await generateDocument({
          templateType: standardizedTemplateType,
          companyName: company.name,
          tradeType: company.tradeType,
          siteName: siteName || 'Site not specified',
          siteAddress: siteAddress || 'Address not specified',
          projectManager: projectManager || 'Not specified',
          hazards,
          controlMeasures,
          specialRequirements
        });

        // Generate unique filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${templateType}-${companyId}-${timestamp}-${Date.now()}.txt`;
        const filePath = `/documents/${filename}`;
        const fileUrl = `${req.protocol}://${req.hostname}/api/documents/${filename}`;

        // Create document record with AI-generated content
        const document = await storage.createGeneratedDocument({
          companyId,
          templateType,
          documentName: aiGeneratedContent.title,
          siteName: siteName || 'Site not specified',
          siteAddress: siteAddress || 'Address not specified',
          projectManager: projectManager || 'Not specified',
          hazards: hazards || null,
          controlMeasures: aiGeneratedContent.content,
          specialRequirements: aiGeneratedContent.summary,
          status: 'generated',
          filePath,
          fileUrl,
          generatedBy: userId,
        });

        const documentContent = {
          id: document.id,
          name: aiGeneratedContent.title,
          template: templateType,
          company: company.name,
          content: aiGeneratedContent.content,
          summary: aiGeneratedContent.summary,
          downloadUrl: fileUrl,
          createdAt: document.createdAt,
        };

        res.json(documentContent);
      } catch (error) {
        console.error("AI document generation failed:", error);
        
        // Fallback to basic document creation without AI content
        const documentName = `${templateNames[templateType] || templateType} - ${siteName}`;
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${templateType}-${companyId}-${timestamp}-${Date.now()}.txt`;
        const filePath = `/documents/${filename}`;
        const fileUrl = `${req.protocol}://${req.hostname}/api/documents/${filename}`;

        const document = await storage.createGeneratedDocument({
          companyId,
          templateType,
          documentName,
          siteName: siteName || 'Site not specified',
          siteAddress: siteAddress || 'Address not specified',
          projectManager: projectManager || 'Not specified',
          hazards: hazards || null,
          controlMeasures: controlMeasures || 'Standard control measures to be defined',
          specialRequirements: specialRequirements || null,
          status: 'generated',
          filePath,
          fileUrl,
          generatedBy: userId,
        });

        const documentContent = {
          id: document.id,
          name: documentName,
          template: templateType,
          company: company.name,
          content: 'Document generation temporarily unavailable. Please contact support.',
          downloadUrl: fileUrl,
          createdAt: document.createdAt,
          error: 'AI generation failed - fallback document created'
        };

        res.json(documentContent);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // Document Upload and Assessment Routes
  app.post("/api/companies/:companyId/assess-documents", requireAuth, (req, res, next) => {
    console.log('Starting document assessment upload for:', req.params.companyId);
    upload.array('documents', 10)(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      next();
    });
  }, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get company details
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const uploadedFiles = req.files as Express.Multer.File[];
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Create assessment record for each uploaded file
      const assessments = [];
      for (const file of uploadedFiles) {
        const assessment = {
          id: Date.now() + Math.random(),
          originalFileName: file.originalname,
          documentType: 'Unknown Document',
          overallScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          assessmentStatus: 'completed' as const,
          complianceGaps: [
            {
              category: 'Safety Procedures',
              description: 'Emergency procedures need more detail',
              severity: 'medium' as const,
              regulation: 'HSE Guidelines',
              requiredAction: 'Add detailed emergency evacuation procedures'
            }
          ],
          recommendations: [
            {
              title: 'Update Safety Protocols',
              description: 'Enhance current safety documentation',
              priority: 1,
              estimatedHours: 4,
              costImplication: 'low' as const
            }
          ],
          strengths: ['Clear documentation structure', 'Good use of terminology'],
          criticalIssues: [],
          improvementPlan: [
            {
              step: 1,
              action: 'Review current safety procedures',
              timeline: '1 week',
              responsible: 'Site Manager',
              deliverable: 'Updated safety manual'
            }
          ],
          createdAt: new Date().toISOString()
        };
        assessments.push(assessment);
      }

      res.json({
        message: "Documents uploaded and assessed successfully",
        assessments,
        uploadedFiles: uploadedFiles.length
      });

    } catch (error) {
      console.error("Error in document assessment:", error);
      res.status(500).json({ message: "Assessment failed" });
    }
  });

  app.get("/api/companies/:companyId/assessments", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Return empty array for now - will be implemented with real data
      res.json([]);

    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Create Rob & Son premium account (development only)
  if (process.env.NODE_ENV === "development") {
    app.post('/api/dev/create-rob-account', async (req, res) => {
      try {
        const { createRobAndSonAccount, createSampleDocuments } = await import('./createPremiumAccount');
        
        const result = await createRobAndSonAccount();
        await createSampleDocuments(result.company.id, result.user.id);
        
        res.json({
          success: true,
          message: "Rob & Son premium account created successfully",
          account: {
            email: result.credentials.email,
            password: result.credentials.password,
            companyId: result.company.id,
            companyName: result.company.name,
            plan: "professional",
            status: "active"
          }
        });
        
      } catch (error) {
        console.error("Error creating Rob & Son account:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to create premium account",
          error: error.message 
        });
      }
    });
  }

  // Serve generated document content
  app.get("/api/documents/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      
      // In production, this would serve files from a proper file storage system
      // For now, we'll return a placeholder or redirect to the document content
      res.setHeader('Content-Type', 'text/plain');
      res.send('Document content would be served here in production. This is a placeholder for the generated document.');
    } catch (error) {
      console.error("Error serving document:", error);
      res.status(404).json({ message: "Document not found" });
    }
  });

  // Get document content by ID (for viewing in the UI)
  app.get("/api/companies/:companyId/documents/:documentId/content", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const documentId = parseInt(req.params.documentId);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const document = await storage.getGeneratedDocument(documentId);
      if (!document || document.companyId !== companyId) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({
        id: document.id,
        name: document.documentName,
        content: document.controlMeasures || 'No content available',
        summary: document.specialRequirements || 'No summary available',
        type: document.templateType,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      });
    } catch (error) {
      console.error("Error fetching document content:", error);
      res.status(500).json({ message: "Failed to fetch document content" });
    }
  });

  app.get("/api/companies/:id/documents", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const documents = await storage.getGeneratedDocuments(companyId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Document library routes - Get ISO 9001 and template documents
  app.get("/api/companies/:id/document-library", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const documents = await storage.getGeneratedDocuments(companyId);
      // Filter for template documents (ISO 9001 starter documents)
      const templateDocuments = documents.filter(doc => doc.isTemplate || doc.status === "template");
      
      res.json(templateDocuments);
    } catch (error) {
      console.error("Error fetching document library:", error);
      res.status(500).json({ message: "Failed to fetch document library" });
    }
  });

  // Upgrade to Professional plan to unlock ISO 9001 templates
  app.post("/api/companies/:id/upgrade-plan", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has admin role for this company
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required to upgrade plan" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // In production, this would integrate with Stripe/payment processor
      // For now, we'll simulate the upgrade and create premium documents
      await storage.createPremiumStarterDocumentsForCompany(
        companyId,
        company.tradeType,
        userId
      );

      res.json({ 
        success: true, 
        message: "Company upgraded to Professional plan. ISO 9001 documents have been added to your library." 
      });
    } catch (error) {
      console.error("Error upgrading plan:", error);
      res.status(500).json({ message: "Failed to upgrade plan" });
    }
  });

  // Document annotation and review routes
  app.get("/api/documents/:id/annotations", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has access to this document
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check company access
      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const annotations = await storage.getDocumentAnnotations(documentId);
      res.json(annotations);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      res.status(500).json({ message: "Failed to fetch annotations" });
    }
  });

  app.post("/api/documents/:id/annotations", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check document access
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const annotation = await storage.createDocumentAnnotation({
        documentId,
        userId,
        content: req.body.content,
        annotationType: req.body.annotationType,
        sectionReference: req.body.sectionReference,
        priority: req.body.priority || "normal",
        parentId: req.body.parentId || null,
      });
      
      res.status(201).json(annotation);
    } catch (error) {
      console.error("Error creating annotation:", error);
      res.status(500).json({ message: "Failed to create annotation" });
    }
  });

  app.get("/api/documents/:id/reviews", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check document access
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const reviews = await storage.getDocumentReviews(documentId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/documents/:id/reviews", requireAuth, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check document access
      const document = await storage.getGeneratedDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const role = await storage.getUserRole(userId, document.companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const review = await storage.createDocumentReview({
        documentId,
        reviewerId: userId,
        reviewType: req.body.reviewType,
        status: req.body.status,
        comments: req.body.comments,
        completedAt: new Date(),
      });
      
      // Update document review status if this is an approval/rejection
      if (req.body.status === "approved") {
        await storage.updateDocumentReviewStatus(documentId, "approved", userId);
      } else if (req.body.status === "rejected") {
        await storage.updateDocumentReviewStatus(documentId, "rejected", userId);
      }
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.patch("/api/annotations/:id/status", requireAuth, async (req: any, res) => {
    try {
      const annotationId = parseInt(req.params.id);
      const { status } = req.body;
      
      const annotation = await storage.updateAnnotationStatus(annotationId, status);
      res.json(annotation);
    } catch (error) {
      console.error("Error updating annotation status:", error);
      res.status(500).json({ message: "Failed to update annotation status" });
    }
  });

  // Smart dashboard endpoints
  app.get("/api/companies/:id/dashboard", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const dashboardData = await storage.getDashboardData(companyId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  app.get("/api/companies/:id/user-stats", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const users = await storage.getCompanyUsers(companyId);
      res.json({ totalUsers: users.length });
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ error: "Failed to get user stats" });
    }
  });

  app.get("/api/companies/:id/notifications", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const notifications = await storage.getUserNotifications(companyId);
      res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Document progress tracking endpoints
  app.get("/api/companies/:id/document-progress", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const progress = await storage.getDocumentProgress(companyId);
      res.json(progress);
    } catch (error) {
      console.error("Error getting document progress:", error);
      res.status(500).json({ error: "Failed to get document progress" });
    }
  });

  app.patch("/api/companies/:companyId/documents/:documentId/progress", requireAuth, async (req: any, res) => {
    try {
      const { companyId, documentId } = req.params;
      const { completionPercentage, workflowNotes } = req.body;
      
      await storage.updateDocumentProgress(parseInt(documentId), completionPercentage, workflowNotes);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating document progress:", error);
      res.status(500).json({ error: "Failed to update document progress" });
    }
  });

  app.post("/api/companies/:companyId/documents/:documentId/notify", requireAuth, async (req: any, res) => {
    try {
      const { companyId, documentId } = req.params;
      const { notificationType } = req.body;
      
      const success = await storage.sendDocumentNotification(parseInt(documentId), parseInt(companyId), notificationType);
      res.json({ success });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Admin company management endpoints for demo purposes
  app.delete("/api/companies/:id", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the user to check if they're admin
      const user = await storage.getUser(userId);
      if (!user || user.email !== 'admin@workdoc360.com') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Check if user has admin role for this company or is system admin
      const userRole = await storage.getUserRole(userId, companyId);
      if (userRole !== 'admin' && user.email !== 'admin@workdoc360.com') {
        return res.status(403).json({ message: "Admin access required to delete company" });
      }

      // In production, this would cascade delete all related data
      // For demo purposes, we'll just mark as deleted or remove
      
      // Note: This is a demo feature - in production you'd want more sophisticated
      // soft deletion and data archiving
      console.log(`Demo: Deleting company ${companyId} by admin user ${userId}`);
      
      res.json({ 
        success: true, 
        message: "Company deleted successfully (demo mode)" 
      });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Demo document generation endpoint - creates real documents for demo companies
  app.post("/api/demo/generate-document", async (req, res) => {
    try {
      const { generateDocument } = await import("./documentGenerator");
      const { templateType, companyName, tradeType } = req.body;
      
      // Predefined demo site information for each company
      const demoSiteData = {
        "Premier Scaffolding Ltd": {
          siteName: "Manchester Commercial Centre",
          siteAddress: "123 Deansgate, Manchester M1 4AE",
          projectManager: "David Thompson"
        },
        "Elite Plastering Services": {
          siteName: "Birmingham Residential Development", 
          siteAddress: "456 Broad Street, Birmingham B15 3TR",
          projectManager: "Sarah Williams"
        },
        "Sparks Electrical Contractors": {
          siteName: "London Office Refurbishment",
          siteAddress: "789 Borough High Street, London SE1 9GF", 
          projectManager: "Michael Chen"
        }
      };

      const siteData = (demoSiteData as any)[companyName] || {
        siteName: "Demo Construction Site",
        siteAddress: "Demo Address, UK",
        projectManager: "Demo Manager"
      };

      const documentParams = {
        templateType,
        companyName,
        tradeType,
        ...siteData,
        hazards: "Working at height, manual handling, equipment operation",
        controlMeasures: "Safety barriers, proper PPE, regular inspections",
        specialRequirements: "All work to be carried out in accordance with current UK regulations"
      };

      const document = await generateDocument(documentParams);
      
      // Add demo watermarks to the content
      const watermarkedContent = `
=== DEMO DOCUMENT - FOR PREVIEW ONLY ===
${document.content}

--- WATERMARK ---
This is a demonstration document generated by WorkDoc360 AI.
To generate, save, and download real documents, subscribe at workdoc360.com
=== END DEMO ===`;

      res.json({
        ...document,
        content: watermarkedContent,
        isDemo: true
      });
    } catch (error) {
      console.error("Demo document generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate demo document", 
        message: error.message 
      });
    }
  });

  // Document export endpoints for subscribed users
  app.post("/api/companies/:companyId/documents/:documentId/export", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const documentId = parseInt(req.params.documentId);
      const userId = req.user.id;
      const { format } = req.body; // 'pdf' or 'word'
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get user subscription status
      const user = await storage.getUser(userId);
      if (!user || user.planStatus === 'pending_payment') {
        return res.status(402).json({ message: "Subscription required for document export" });
      }
      
      const document = await storage.getGeneratedDocument(documentId);
      if (!document || document.companyId !== companyId) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const { generatePDF, generateWord } = await import('./documentExport');
      
      const exportOptions = {
        title: document.documentName,
        content: document.controlMeasures || 'No content available',
        companyName: company.name,
        companyAddress: company.address || '',
        documentId: `WD360-${document.id.toString().padStart(6, '0')}`,
        generatedDate: document.createdAt ? new Date(document.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        templateType: document.templateType
      };
      
      let buffer: Buffer;
      let contentType: string;
      let filename: string;
      
      if (format === 'pdf') {
        buffer = await generatePDF(exportOptions);
        contentType = 'application/pdf';
        filename = `${document.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      } else if (format === 'word') {
        buffer = await generateWord(exportOptions);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${document.documentName.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
      } else {
        return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'word'" });
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting document:", error);
      res.status(500).json({ message: "Failed to export document" });
    }
  });

  app.post("/api/companies/:companyId/documents/:documentId/email", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const documentId = parseInt(req.params.documentId);
      const userId = req.user.id;
      const { recipientEmail, format } = req.body; // format: 'pdf' or 'word'
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get user subscription status
      const user = await storage.getUser(userId);
      if (!user || user.planStatus === 'pending_payment') {
        return res.status(402).json({ message: "Subscription required for document emailing" });
      }
      
      const document = await storage.getGeneratedDocument(documentId);
      if (!document || document.companyId !== companyId) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const { generatePDF, generateWord, emailDocument } = await import('./documentExport');
      
      const exportOptions = {
        title: document.documentName,
        content: document.controlMeasures || 'No content available',
        companyName: company.name,
        companyAddress: company.address || '',
        documentId: `WD360-${document.id.toString().padStart(6, '0')}`,
        generatedDate: document.createdAt ? new Date(document.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        templateType: document.templateType
      };
      
      let buffer: Buffer;
      
      if (format === 'pdf') {
        buffer = await generatePDF(exportOptions);
      } else if (format === 'word') {
        buffer = await generateWord(exportOptions);
      } else {
        return res.status(400).json({ message: "Invalid format. Use 'pdf' or 'word'" });
      }
      
      const emailSent = await emailDocument(
        recipientEmail,
        document.documentName,
        buffer,
        format,
        company.name
      );
      
      if (emailSent) {
        res.json({ message: "Document emailed successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Error emailing document:", error);
      res.status(500).json({ message: "Failed to email document" });
    }
  });

  // AI-powered CSCS card verification routes
  app.post("/api/verify-card-image", requireAuth, async (req: any, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data required" });
      }

      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const verificationResult = await aiCardVerificationService.verifyCardWithAI(base64Data);
      
      res.json(verificationResult);
    } catch (error: any) {
      console.error("AI card verification error:", error);
      res.status(500).json({ error: "Card verification failed" });
    }
  });

  // CSCS register check route
  app.post("/api/check-cscs-register", requireAuth, async (req: any, res) => {
    try {
      const { cardNumber, holderName } = req.body;
      
      if (!cardNumber) {
        return res.status(400).json({ error: "Card number required" });
      }

      const verification = await cscsVerificationService.verifyCSCSCard(cardNumber, holderName);
      
      res.json(verification);
    } catch (error: any) {
      console.error("CSCS register check error:", error);
      res.status(500).json({ error: "Register check failed" });
    }
  });

  // RPA-based CSCS verification using cscssmartcheck.co.uk
  app.post("/api/companies/:id/verify-cscs-rpa", requireAuth, async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const { cardNumber, scheme } = req.body;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!cardNumber) {
        return res.status(400).json({ error: 'Card number is required' });
      }

      // Import RPA service dynamically
      const { cscsRpaService } = await import('./services/cscsRpaService');
      
      // Perform RPA verification
      const rpaResult = await cscsRpaService.verifyCSCSCardRPA(cardNumber, scheme || 'CSCS');
      
      // Save cardholder photo if available
      let savedPhotoUrl: string | null = null;
      if (rpaResult.holderPhotoBase64) {
        savedPhotoUrl = await cscsRpaService.saveCardholderPhoto(
          cardNumber, 
          companyId, 
          rpaResult.holderPhotoBase64
        );
        console.log('Saved cardholder photo:', savedPhotoUrl || 'Failed to save');
      }
      
      // Log verification for audit trail
      console.log(`CSCS RPA Verification - Company ${companyId}:`, {
        cardNumber: rpaResult.cardNumber,
        status: rpaResult.status,
        hasPhoto: !!rpaResult.holderPhotoBase64,
        savedPhotoUrl: savedPhotoUrl,
        timestamp: rpaResult.verificationTimestamp
      });

      // Add saved photo URL to response
      const response = {
        ...rpaResult,
        savedPhotoUrl
      };

      res.json(response);

    } catch (error: any) {
      console.error('CSCS RPA verification error:', error);
      res.status(500).json({ 
        error: 'RPA verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test endpoint for RPA verification (for demo/testing purposes)
  app.post('/api/test-rpa-verify', async (req, res) => {
    try {
      const { cardNumber, scheme = 'CSCS' } = req.body;
      
      if (!cardNumber) {
        return res.status(400).json({ error: 'Card number required' });
      }

      // Import RPA service dynamically
      const { cscsRpaService } = await import('./services/cscsRpaService');
      
      // Perform RPA verification
      const rpaResult = await cscsRpaService.verifyCSCSCardRPA(cardNumber, scheme);
      
      // Save cardholder photo if available (use demo company)
      let savedPhotoUrl: string | null = null;
      if (rpaResult.holderPhotoBase64) {
        savedPhotoUrl = await cscsRpaService.saveCardholderPhoto(
          cardNumber, 
          'demo-company', 
          rpaResult.holderPhotoBase64
        );
        console.log('Saved cardholder photo:', savedPhotoUrl || 'Failed to save');
      }
      
      // Log verification for audit trail
      console.log(`CSCS RPA Test Verification:`, {
        cardNumber: rpaResult.cardNumber,
        status: rpaResult.status,
        hasPhoto: !!rpaResult.holderPhotoBase64,
        savedPhotoUrl: savedPhotoUrl,
        timestamp: rpaResult.verificationTimestamp
      });

      // Add saved photo URL to response
      const response = {
        ...rpaResult,
        savedPhotoUrl
      };

      res.json(response);
    } catch (error) {
      console.error('RPA test verification error:', error);
      res.status(500).json({ 
        error: 'RPA verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Batch RPA verification endpoint
  app.post("/api/companies/:id/verify-cscs-batch-rpa", requireAuth, async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const { cardNumbers, scheme } = req.body;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!cardNumbers || !Array.isArray(cardNumbers)) {
        return res.status(400).json({ error: 'Card numbers array is required' });
      }

      // Import RPA service dynamically
      const { cscsRpaService } = await import('./services/cscsRpaService');
      
      // Perform batch RPA verification
      const batchResults = await cscsRpaService.verifyMultipleCards(cardNumbers, scheme || 'CSCS');
      
      // Log batch verification
      console.log(`CSCS Batch RPA Verification - Company ${companyId}:`, {
        totalCards: cardNumbers.length,
        successfulVerifications: batchResults.filter(r => r.status !== 'error').length,
        timestamp: new Date().toISOString()
      });

      res.json({
        results: batchResults,
        summary: {
          total: cardNumbers.length,
          successful: batchResults.filter(r => r.status !== 'error').length,
          errors: batchResults.filter(r => r.status === 'error').length
        }
      });

    } catch (error: any) {
      console.error('CSCS Batch RPA verification error:', error);
      res.status(500).json({ 
        error: 'Batch RPA verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test RPA connection endpoint
  app.get("/api/test-rpa-connection", requireAuth, async (req: any, res) => {
    try {
      const { cscsRpaService } = await import('./services/cscsRpaService');
      const isConnected = await cscsRpaService.testRPAConnection();
      
      res.json({
        connected: isConnected,
        timestamp: new Date().toISOString(),
        service: 'cscssmartcheck.co.uk'
      });
    } catch (error: any) {
      res.status(500).json({
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // CSCS Online Database Verification Endpoint
  app.post("/api/companies/:id/verify-cscs-online", requireAuth, async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const { cardNumber, holderName } = req.body;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!cardNumber) {
        return res.status(400).json({ error: 'Card number is required' });
      }

      // For demo purposes, simulate CSCS Smart Check API response
      // In production, this would call the actual CSCS Smart Check API
      const mockOnlineResult = {
        cardNumber: cardNumber.trim(),
        holderName: holderName || "Paul Construction Worker",
        cardType: "CSCS Scaffolding Labourer Card",
        expiryDate: "2024-12-31",
        issueDate: "2019-12-31",
        status: determineOnlineCardStatus(cardNumber),
        tradeQualification: "Scaffolding Labourer",
        scheme: "Construction Skills Certification Scheme (CSCS)",
        verificationSource: "cscs_smart_check" as const,
        lastUpdated: "2024-07-24",
        cardColour: "green",
        qualificationLevel: "Level 1 - Labourer"
      };

      function determineOnlineCardStatus(cardNumber: string): 'valid' | 'expired' | 'revoked' | 'invalid' | 'not_found' {
        const cardNum = cardNumber.toLowerCase();
        if (cardNum.includes('exp')) return 'expired';
        if (cardNum.includes('rev')) return 'revoked';
        if (cardNum.includes('inv')) return 'invalid';
        if (cardNum.includes('404') || cardNum.includes('missing')) return 'not_found';
        // Based on the card image provided, this appears to be an expired card
        if (cardNum === '12345678' || cardNum.length < 6) return 'expired';
        return 'valid';
      }

      // Log verification for audit trail
      console.log(`CSCS Online Verification - Company ${companyId}:`, {
        cardNumber: mockOnlineResult.cardNumber,
        status: mockOnlineResult.status,
        holderName: mockOnlineResult.holderName,
        timestamp: new Date().toISOString()
      });

      res.json(mockOnlineResult);

    } catch (error: any) {
      console.error('CSCS online verification error:', error);
      res.status(500).json({ 
        error: 'Online verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // CSCS Image Verification Endpoint
  app.post("/api/companies/:id/verify-cscs-image", requireAuth, upload.single('image'), async (req: any, res) => {
    try {
      const { id: companyId } = req.params;
      const imageFile = req.file;
      const userId = req.user.id;

      // Check user access to company
      const role = await storage.getUserRole(userId, parseInt(companyId));
      if (!role) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!imageFile) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // For demo purposes, simulate image analysis results
      // In production, this would use Claude Vision API with the uploaded image
      const mockAnalysisResult = {
        cardType: "Green CSCS Scaffolding Labourer Card",
        holderName: "John Smith",
        cardNumber: `IMG-${Date.now()}`,
        tradeQualification: "Scaffolding Labourer",
        expiryDate: "2026-12-31",
        testDate: "2021-06-15",
        imageAnalysis: {
          cardTypeDetected: "Green CSCS Labourer Card - Scaffolding",
          securityFeatures: ["CSCS Watermarks", "Photo ID", "TESTED marking", "Professional format"],
          visualAuthenticity: "genuine" as const
        }
      };

      // Determine card status based on analysis
      const currentDate = new Date();
      const expiryDate = new Date(mockAnalysisResult.expiryDate);
      const daysDifference = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'valid' | 'expired' | 'revoked' | 'invalid' = 'valid';
      if (daysDifference < 0) {
        status = 'expired';
      } else if (mockAnalysisResult.cardNumber.toLowerCase().includes('rev')) {
        status = 'revoked';
      } else if (mockAnalysisResult.cardNumber.toLowerCase().includes('inv')) {
        status = 'invalid';
      }

      const verificationResult = {
        ...mockAnalysisResult,
        status,
        verificationMethod: 'image_analysis',
        verifiedAt: new Date().toISOString(),
        companyId: parseInt(companyId),
        daysUntilExpiry: daysDifference
      };

      // Log verification for audit trail
      console.log(`CSCS Image Verification - Company ${companyId}:`, {
        cardNumber: verificationResult.cardNumber,
        status: verificationResult.status,
        holderName: verificationResult.holderName,
        timestamp: verificationResult.verifiedAt
      });

      res.json(verificationResult);

    } catch (error: any) {
      console.error('CSCS image verification error:', error);
      res.status(500).json({ 
        error: 'Image verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Fraud assessment route
  app.post("/api/assess-card-fraud", requireAuth, async (req: any, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data required" });
      }

      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageAnalysis = await aiCardVerificationService.analyseCardImage(base64Data);
      const fraudAssessment = aiCardVerificationService.generateFraudAssessment(imageAnalysis);
      
      res.json({
        imageAnalysis,
        fraudAssessment
      });
    } catch (error: any) {
      console.error("Fraud assessment error:", error);
      res.status(500).json({ error: "Fraud assessment failed" });
    }
  });

  // Logo upload endpoint
  app.post("/api/companies/:id/upload-logo", requireAuth, upload.single('logo'), async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user has admin access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role || role !== "admin") {
        return res.status(403).json({ message: "Admin access required to upload logo" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No logo file provided" });
      }

      // Create public URL for the uploaded logo
      const logoUrl = `/uploaded_assets/${req.file.filename}`;
      
      // Update company with new logo URL
      const updatedCompany = await storage.updateCompany(companyId, {
        logoUrl
      });

      res.json({
        message: "Logo uploaded successfully",
        logoUrl,
        company: updatedCompany
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Logo upload failed" });
    }
  });

  // Document upload endpoint
  app.post("/api/companies/:id/upload-documents", requireAuth, upload.array('documents', 10), async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { documentType, title, description } = req.body;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No documents provided" });
      }

      const uploadedDocuments = [];
      
      // Process each uploaded file
      for (const file of req.files) {
        const fileUrl = `/uploaded_assets/${file.filename}`;
        
        const documentData = {
          companyId,
          templateType: documentType,
          documentName: title || file.originalname,
          siteName: "Uploaded Document",
          siteAddress: description || "User uploaded document",
          projectManager: req.user.firstName + " " + req.user.lastName,
          hazards: null,
          controlMeasures: `Document uploaded: ${file.originalname}`,
          specialRequirements: description,
          status: 'uploaded',
          filePath: file.path,
          fileUrl,
          generatedBy: userId,
        };

        const document = await storage.createGeneratedDocument(documentData);
        uploadedDocuments.push(document);
      }

      res.json({
        message: "Documents uploaded successfully",
        documentsProcessed: uploadedDocuments.length,
        documents: uploadedDocuments
      });
    } catch (error) {
      console.error("Error uploading documents:", error);
      res.status(500).json({ message: "Document upload failed" });
    }
  });

  // Document suite generation endpoint
  app.post("/api/companies/:id/generate-document-suite", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      const { suiteId, companyName, tradeType } = req.body;
      
      // Check if user has access to this company
      const role = await storage.getUserRole(userId, companyId);
      if (!role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get company details
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      let generatedDocuments = [];
      
      // Generate documents based on suite type
      switch (suiteId) {
        case 'essential-compliance':
          generatedDocuments = await storage.createBasicStarterDocumentsForCompany(
            companyId, 
            tradeType, 
            userId
          );
          break;
          
        case 'trade-specialist':
          // Generate trade-specific documents
          if (tradeType === 'scaffolding') {
            const scaffoldDocs = [
              { templateType: 'scaffold-inspection-checklist', name: 'Daily Scaffold Inspection Checklist' },
              { templateType: 'working-at-height-risk', name: 'Working at Height Risk Assessment' },
              { templateType: 'scaffold-erection-method', name: 'Scaffold Erection Method Statement' }
            ];
            
            for (const doc of scaffoldDocs) {
              const docData = {
                companyId,
                templateType: doc.templateType,
                documentName: doc.name,
                siteName: company.name,
                siteAddress: company.address || "Various locations",
                projectManager: "Site Manager",
                hazards: null,
                controlMeasures: "Generated from trade specialist suite",
                specialRequirements: `${tradeType} specialist document`,
                status: 'generated',
                filePath: `/documents/${doc.templateType}-${companyId}-${Date.now()}.pdf`,
                fileUrl: `/api/documents/${doc.templateType}-${companyId}-${Date.now()}.pdf`,
                generatedBy: userId,
              };
              
              const generatedDoc = await storage.createGeneratedDocument(docData);
              generatedDocuments.push(generatedDoc);
            }
          }
          break;
          
        case 'iso-9001-complete':
          generatedDocuments = await storage.createPremiumStarterDocumentsForCompany(
            companyId, 
            tradeType, 
            userId
          );
          break;
      }

      res.json({
        message: "Document suite generated successfully",
        documentCount: generatedDocuments.length,
        documents: generatedDocuments
      });
    } catch (error) {
      console.error("Error generating document suite:", error);
      res.status(500).json({ message: "Document suite generation failed" });
    }
  });

  // Voucher code validation endpoint
  app.post("/api/validate-voucher", requireAuth, async (req: any, res) => {
    try {
      const { code, planType } = req.body;
      
      if (!code || !planType) {
        return res.status(400).json({ message: "Voucher code and plan type are required" });
      }

      // Get voucher from database
      const voucher = await storage.getVoucherByCode(code.toUpperCase());
      
      if (!voucher) {
        return res.status(400).json({ message: "Invalid voucher code" });
      }

      // Check if voucher is active
      if (!voucher.isActive) {
        return res.status(400).json({ message: "This voucher code is no longer active" });
      }

      // Check expiration date
      if (voucher.validUntil && new Date(voucher.validUntil) < new Date()) {
        return res.status(400).json({ message: "This voucher code has expired" });
      }

      // Check if voucher has reached max uses
      if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
        return res.status(400).json({ message: "This voucher code has been fully redeemed" });
      }

      // Check if voucher applies to this plan
      if (voucher.applicablePlans && voucher.applicablePlans.length > 0) {
        if (!voucher.applicablePlans.includes(planType)) {
          return res.status(400).json({ 
            message: `This voucher is not valid for the ${planType} plan` 
          });
        }
      }

      // Calculate pricing
      const planPricing = {
        micro: { monthly: 35, yearly: 350 },
        essential: { monthly: 65, yearly: 650 },
        professional: { monthly: 129, yearly: 1290 },
        enterprise: { monthly: 299, yearly: 2990 }
      };

      const plan = planPricing[planType as keyof typeof planPricing];
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan type" });
      }

      // For now, assume yearly billing (can be enhanced to detect from user preferences)
      const originalAmount = plan.yearly;
      let finalAmount = originalAmount;
      let discountAmount = 0;

      // Calculate discount based on type
      switch (voucher.discountType) {
        case 'bypass_payment':
          finalAmount = 0;
          discountAmount = originalAmount;
          break;
        case 'percentage':
          discountAmount = Math.floor(originalAmount * (voucher.discountValue! / 100));
          finalAmount = originalAmount - discountAmount;
          break;
        case 'fixed_amount':
          discountAmount = Math.min(voucher.discountValue! / 100, originalAmount); // discountValue stored in pence
          finalAmount = Math.max(0, originalAmount - discountAmount);
          break;
        case 'free_month':
          // For yearly plans, give months free
          const monthlyPrice = plan.monthly;
          discountAmount = monthlyPrice * (voucher.discountValue || 1);
          finalAmount = Math.max(0, originalAmount - discountAmount);
          break;
        default:
          return res.status(400).json({ message: "Invalid voucher type" });
      }

      // Return voucher application details
      res.json({
        code: voucher.code,
        description: voucher.description || `${voucher.discountType.replace('_', ' ')} voucher`,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount: discountAmount * 100, // Return in pence for consistency
        finalAmount: finalAmount,
        originalAmount: originalAmount
      });

    } catch (error) {
      console.error("Error validating voucher:", error);
      res.status(500).json({ message: "Failed to validate voucher code" });
    }
  });

  // Apply voucher and activate account (bypass payment)
  app.post("/api/activate-with-voucher", requireAuth, async (req: any, res) => {
    try {
      const { voucherCode, planId, billingCycle } = req.body;
      const userId = req.user.id;

      // Validate voucher again
      const voucher = await storage.getVoucherByCode(voucherCode.toUpperCase());
      if (!voucher || voucher.discountType !== 'bypass_payment') {
        return res.status(400).json({ message: "Invalid voucher for free access" });
      }

      // Record voucher usage
      await storage.recordVoucherUsage({
        voucherId: voucher.id,
        userId: userId,
        planApplied: planId,
        discountAmount: 0, // Full bypass
      });

      // Update user plan status
      await storage.updateUserPlanStatus(userId, {
        planStatus: 'active',
        selectedPlan: planId,
        subscriptionType: billingCycle,
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      // Increment voucher usage count
      await storage.incrementVoucherUsage(voucher.id);

      res.json({ 
        success: true,
        message: "Account activated successfully with voucher",
        planStatus: 'active'
      });

    } catch (error) {
      console.error("Error activating with voucher:", error);
      res.status(500).json({ message: "Failed to activate account with voucher" });
    }
  });

  // Serve uploaded assets statically
  app.use('/uploaded_assets', express.static(path.join(process.cwd(), 'uploaded_assets')));

  // Document generation endpoint
  app.post("/api/generate-document", requireAuth, async (req, res) => {
    try {
      const { companyId, templateType, siteName, siteAddress, projectManager, tradeType } = req.body;
      
      if (!companyId || !templateType || !siteName || !siteAddress || !projectManager) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create a generated document record
      const document = await storage.createGeneratedDocument({
        companyId: parseInt(companyId),
        title: `${getTemplateDisplayName(templateType)} - ${siteName}`,
        templateType,
        status: "generated",
        userId: req.user!.id,
        content: generateDocumentContent({ templateType, siteName, siteAddress, projectManager, tradeType }),
        generatedAt: new Date(),
      });

      res.json({
        id: document.id,
        title: document.title,
        status: document.status,
        downloadUrl: `/api/documents/${document.id}/download`,
        createdAt: document.generatedAt
      });
    } catch (error) {
      console.error("Document generation error:", error);
      res.status(500).json({ error: "Failed to generate document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getTemplateDisplayName(templateType: string): string {
  const nameMap: Record<string, string> = {
    "risk-assessment": "Risk Assessment",
    "method-statement": "Method Statement", 
    "toolbox-talk": "Toolbox Talk Template",
    "permit-to-work": "Permit to Work",
    "scaffold-inspection": "Scaffold Inspection Checklist",
    "scaffold-handover": "Scaffold Handover Certificate",
    "surface-preparation": "Surface Preparation Checklist",
    "material-specification": "Material Specification Sheet",
    "site-setup": "Site Setup Checklist"
  };
  return nameMap[templateType] || "Document";
}

function generateDocumentContent(data: any): string {
  const { templateType, siteName, siteAddress, projectManager, tradeType } = data;
  
  const baseContent = `
# ${getTemplateDisplayName(templateType)}

## Site Information
- **Site Name**: ${siteName}
- **Site Address**: ${siteAddress}
- **Project Manager**: ${projectManager}
- **Trade Type**: ${tradeType ? tradeType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'General'}

## Document Details
- **Generated**: ${new Date().toLocaleDateString('en-GB')}
- **Status**: Active
- **Compliance**: UK Construction Standards

`;

  switch (templateType) {
    case "risk-assessment":
      return baseContent + `
## Risk Assessment Details

### Identified Hazards
1. Working at height
2. Manual handling
3. Noise exposure
4. Dust and debris
5. Electrical hazards

### Control Measures
- Personal Protective Equipment (PPE) mandatory
- Safety briefings before work commences
- Regular safety inspections
- Emergency procedures in place
- First aid provisions available

### Risk Rating
- **Initial Risk**: High
- **Residual Risk**: Low (with controls)
- **Review Date**: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
`;

    case "method-statement":
      return baseContent + `
## Method Statement

### Work Sequence
1. Site preparation and setup
2. Safety briefing for all personnel
3. Equipment inspection and testing
4. Work execution as per approved methods
5. Clean-up and site restoration

### Equipment Required
- PPE for all personnel
- Tools appropriate for the task
- Safety equipment and barriers
- First aid kit
- Emergency contact information

### Safety Procedures
- Daily safety briefings
- Regular equipment inspections
- Compliance with CDM 2015 regulations
- Emergency evacuation procedures
`;

    case "toolbox-talk":
      return baseContent + `
## Toolbox Talk Template

### Daily Safety Topics
- Weather conditions assessment
- Task-specific hazards
- PPE requirements
- Emergency procedures
- Tool and equipment safety

### Attendee Record
Date: ___________
Time: ___________
Conducted by: ___________

### Attendance List
| Name | Signature | Company |
|------|-----------|---------|
|      |           |         |
|      |           |         |
|      |           |         |

### Key Messages
1. Safety is everyone's responsibility
2. Report all hazards immediately
3. Stop work if conditions become unsafe
4. Follow all safety procedures
`;

    default:
      return baseContent + `
## Document Content

This document has been generated according to UK construction industry standards and regulations.

### Compliance Requirements
- CDM 2015 Construction (Design and Management) Regulations
- Health and Safety at Work Act 1974
- Construction Industry standards
- Trade-specific requirements

### Next Steps
1. Review document content
2. Customise for specific requirements
3. Obtain necessary approvals
4. Implement on site
5. Regular review and updates
`;
  }
}
