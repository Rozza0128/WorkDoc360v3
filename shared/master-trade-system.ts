/**
 * Master Trade Company System
 * Creates industry "oracles" that maintain definitive compliance standards
 * for each UK construction trade and feed updates to member companies
 */

export interface MasterTradeCompany {
  id: string;
  tradeType: string; // e.g., "scaffolding", "plastering", "roofing"
  name: string; // e.g., "Master Scaffolding Standards UK"
  description: string;
  
  // Master document library
  masterDocuments: MasterDocument[];
  
  // Member companies that subscribe to this master
  memberCompanyIds: string[];
  
  // Update frequency and notification settings
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  lastUpdateCheck: Date;
  nextUpdateCheck: Date;
  
  // Industry expertise and credentials
  certifyingBodies: string[]; // e.g., ["NASC", "CITB", "HSE"]
  industryExperts: IndustryExpert[];
  
  // Business model
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  membershipFee: number; // Monthly fee for companies to join this master
  
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterDocument {
  id: string;
  masterTradeId: string;
  
  // Document classification
  documentType: 'method_statement' | 'risk_assessment' | 'toolbox_talk' | 
                'safety_procedure' | 'industry_standard' | 'regulation_update';
  
  title: string;
  description: string;
  content: string; // The master document content
  version: string; // e.g., "v2.3"
  
  // Industry compliance
  regulatoryBodies: string[]; // ["HSE", "CDM", "CITB"]
  complianceStandards: string[]; // ["BS EN 12811", "TG20:13"]
  lastReviewDate: Date;
  nextReviewDate: Date;
  
  // Distribution tracking
  distributedToCompanies: string[]; // Company IDs that received this document
  acknowledgmentRequired: boolean;
  acknowledgedByCompanies: string[];
  
  // Change management
  changeHistory: DocumentChange[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChange {
  id: string;
  documentId: string;
  changeType: 'content_update' | 'regulatory_change' | 'safety_enhancement' | 'version_increment';
  description: string;
  previousVersion: string;
  newVersion: string;
  changeReason: string; // Why the change was made
  impactLevel: 'minor' | 'major' | 'critical';
  notificationSent: boolean;
  createdAt: Date;
  createdBy: string; // Expert ID
}

export interface IndustryExpert {
  id: string;
  name: string;
  email: string;
  expertise: string[]; // e.g., ["scaffolding_safety", "height_regulations"]
  qualifications: string[];
  yearsExperience: number;
  role: 'lead_expert' | 'specialist' | 'reviewer';
}

export interface CompanySubscription {
  id: string;
  companyId: string;
  masterTradeId: string;
  
  // Subscription details
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  monthlyFee: number;
  startDate: Date;
  renewalDate: Date;
  status: 'active' | 'suspended' | 'cancelled';
  
  // Update preferences
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inAppNotification: boolean;
    urgentUpdatesOnly: boolean;
  };
  
  // Compliance tracking
  lastSyncDate: Date;
  pendingDocuments: string[]; // Document IDs awaiting acknowledgment
  overrideDocuments: string[]; // Company has customised versions
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateRecommendation {
  id: string;
  masterTradeId: string;
  targetCompanyIds: string[];
  
  // Recommendation details
  title: string;
  description: string;
  recommendationType: 'document_update' | 'new_requirement' | 'safety_alert' | 'best_practice';
  
  // Associated documents
  affectedDocuments: string[];
  newDocuments: string[];
  
  // Implementation details
  implementationDeadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImplementationTime: number; // hours
  
  // Tracking
  sentToCompanies: string[];
  implementedByCompanies: string[];
  rejectedByCompanies: Array<{
    companyId: string;
    reason: string;
    alternativeAction?: string;
  }>;
  
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * UK Construction Trades - Master Company Configuration
 */
export const UK_CONSTRUCTION_TRADES_MASTERS = {
  scaffolding: {
    name: "Master Scaffolding Standards UK",
    description: "The definitive source for scaffolding compliance, safety standards, and industry best practices across the UK construction sector",
    certifyingBodies: ["NASC", "CITB", "HSE", "PASMA"],
    keyStandards: ["BS EN 12811", "TG20:13", "SG4:15"],
    membershipTiers: {
      basic: { monthlyFee: 45, maxDocuments: 50 },
      premium: { monthlyFee: 85, maxDocuments: 200 },
      enterprise: { monthlyFee: 150, unlimited: true }
    }
  },
  
  plastering: {
    name: "Master Plastering Guild UK",
    description: "Industry-leading standards for plastering, rendering, and dry lining trades throughout the UK",
    certifyingBodies: ["CITB", "Construction Skills", "British Gypsum"],
    keyStandards: ["BS 5492", "BS EN 13914", "British Standard 8000"],
    membershipTiers: {
      basic: { monthlyFee: 35, maxDocuments: 30 },
      premium: { monthlyFee: 65, maxDocuments: 120 },
      enterprise: { monthlyFee: 120, unlimited: true }
    }
  },
  
  roofing: {
    name: "Master Roofing Institute UK",
    description: "Comprehensive roofing standards covering pitched, flat, and specialist roofing systems",
    certifyingBodies: ["NFRC", "CITB", "HSE", "STA"],
    keyStandards: ["BS 5534", "BS 6229", "BS 8217"],
    membershipTiers: {
      basic: { monthlyFee: 55, maxDocuments: 60 },
      premium: { monthlyFee: 95, maxDocuments: 250 },
      enterprise: { monthlyFee: 175, unlimited: true }
    }
  },
  
  electrical: {
    name: "Master Electrical Compliance UK",
    description: "Electrical installation standards and safety protocols for construction projects",
    certifyingBodies: ["NICEIC", "ECA", "CITB", "JTL"],
    keyStandards: ["BS 7671", "IET Wiring Regulations", "CDM 2015"],
    membershipTiers: {
      basic: { monthlyFee: 65, maxDocuments: 80 },
      premium: { monthlyFee: 125, maxDocuments: 300 },
      enterprise: { monthlyFee: 225, unlimited: true }
    }
  },
  
  plumbing: {
    name: "Master Plumbing Standards UK",
    description: "Plumbing and heating installation standards for residential and commercial construction",
    certifyingBodies: ["CIPHE", "Gas Safe Register", "WaterSafe", "CITB"],
    keyStandards: ["BS EN 806", "BS 6700", "Water Supply Regulations"],
    membershipTiers: {
      basic: { monthlyFee: 40, maxDocuments: 40 },
      premium: { monthlyFee: 75, maxDocuments: 150 },
      enterprise: { monthlyFee: 135, unlimited: true }
    }
  }
} as const;

/**
 * Update Distribution System
 */
export interface UpdateDistributionJob {
  id: string;
  masterTradeId: string;
  triggerType: 'scheduled' | 'regulatory_change' | 'safety_incident' | 'manual';
  
  // Processing status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  
  // Distribution details
  targetCompanies: string[];
  distributedUpdates: UpdateRecommendation[];
  
  // Results tracking
  successfulDistributions: number;
  failedDistributions: number;
  pendingAcknowledgments: number;
  
  errors?: Array<{
    companyId: string;
    error: string;
    timestamp: Date;
  }>;
}

/**
 * Revenue Model for Master Trade Companies
 */
export interface MasterTradeRevenue {
  masterTradeId: string;
  
  // Subscription revenue
  monthlySubscriptionRevenue: number;
  totalActiveSubscribers: number;
  subscriptionsByTier: {
    basic: number;
    premium: number;
    enterprise: number;
  };
  
  // Document distribution metrics
  documentsDistributedThisMonth: number;
  acknowledgmentRate: number; // percentage
  implementationRate: number; // percentage
  
  // Growth metrics
  newSubscribersThisMonth: number;
  churnRate: number;
  customerLifetimeValue: number;
  
  // Compliance impact
  complianceImprovementScore: number; // 0-100
  safetyIncidentsReduced: number;
  regulatoryViolationsPrevented: number;
  
  reportingMonth: Date;
}