import { Router } from "express";
import { storage } from "../storage";
import type { CompanyRequest } from "../middleware/subdomainDetection";

const router = Router();

// Company subdomain homepage data
router.get("/api/company/homepage", async (req: CompanyRequest, res) => {
  try {
    // If this is a company subdomain, return company-specific data
    if (req.isCompanySubdomain && req.company) {
      const company = req.company;
      
      // Get basic dashboard stats for the company
      const dashboardData = {
        activeDocuments: 12, // TODO: Get real count from database
        teamMembers: 8,
        complianceScore: 92,
        pendingActions: 2,
        recentDocuments: [] // TODO: Get recent documents
      };

      return res.json({
        isCompanySubdomain: true,
        company: {
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          tradeType: company.tradeType,
          address: company.address,
          brandingColors: company.brandingColors || {
            primary: "#F97316",
            secondary: "#1E40AF",
            accent: "#10B981"
          }
        },
        dashboard: dashboardData
      });
    }

    // Not a company subdomain
    res.json({
      isCompanySubdomain: false
    });
  } catch (error) {
    console.error("Error fetching company homepage data:", error);
    res.status(500).json({ error: "Failed to fetch company data" });
  }
});

// Company branding customization
router.put("/api/company/:id/branding", async (req: CompanyRequest, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const { brandingColors } = req.body;

    // TODO: Add authentication check to ensure user can modify this company

    const updatedCompany = await storage.updateCompany(companyId, {
      brandingColors
    });

    res.json({
      success: true,
      company: updatedCompany
    });
  } catch (error) {
    console.error("Error updating company branding:", error);
    res.status(500).json({ error: "Failed to update branding" });
  }
});

// Serve the main React app for company subdomains
router.get("/", async (req: CompanyRequest, res, next) => {
  try {
    // If this is a company subdomain, serve the React app
    if (req.isCompanySubdomain && req.company) {
      // For now, redirect to the main app which will handle the subdomain routing
      return res.redirect('/');
    }
    
    // Not a company subdomain, pass to next middleware (Vite)
    next();
  } catch (error) {
    console.error("Error serving company homepage:", error);
    res.status(500).send('Server Error');
  }
});

export default router;