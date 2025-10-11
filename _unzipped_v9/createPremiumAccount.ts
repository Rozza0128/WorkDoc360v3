import { storage } from "./storage";
import { hashPassword } from "./auth";
import type { InsertUser, InsertCompany, InsertCompanyUser } from "@shared/schema";

export async function createRobAndSonAccount() {
  console.log("Creating premium test account for Rob & Son Scaffolding...");
  
  try {
    // Check if account already exists (check both old and new email)
    let existingUser = await storage.getUserByEmail("info@rnsscaff.co.uk");
    if (!existingUser) {
      existingUser = await storage.getUserByEmail("robandsonscaffoldingservicesltd@gmail.com");
    }
    
    if (existingUser) {
      console.log("Rob & Son account already exists. ID:", existingUser.id);
      
      // Update email if using old email
      if (existingUser.email === "robandsonscaffoldingservicesltd@gmail.com") {
        console.log("Updating email to official business address...");
        existingUser = await storage.updateUser(existingUser.id, {
          email: "info@rnsscaff.co.uk"
        });
        console.log("✅ Email updated to:", existingUser.email);
      }
      
      // Update password to ensure it's properly hashed
      console.log("Updating password to ensure proper hashing...");
      const hashedPassword = await hashPassword("RobScaffolding2025!");
      existingUser = await storage.updateUser(existingUser.id, {
        password: hashedPassword
      });
      console.log("✅ Password updated with proper hashing");
      
      // Get the company and return complete data
      const companies = await storage.getCompaniesByUserId(existingUser.id);
      const company = companies.find(c => c.name.includes("Rob & Son"));
      
      if (company) {
        const companyUsers = await storage.getCompanyUsers(company.id);
        const companyUser = companyUsers.find(cu => cu.userId === existingUser.id);
        
        return {
          user: existingUser,
          company,
          companyUser,
          loginUrl: "/auth",
          credentials: {
            email: "info@rnsscaff.co.uk",
            password: "RobScaffolding2025!"
          }
        };
      }
    }

    // Create premium user account
    const hashedPassword = await hashPassword("RobScaffolding2025!");
    const userData: Omit<InsertUser, 'id'> = {
      email: "info@rnsscaff.co.uk", // Official business email from website
      password: hashedPassword, // Properly hashed password
      firstName: "Rob",
      lastName: "Son", // Family business - Rob & Son
      profileImageUrl: "https://primary.jwwb.nl/public/n/u/h/temp-wehiizkggejfbjdybiao/r_s_logo-removebg-preview-high-0pghj1.png",
      emailVerified: true,
      twoFactorEnabled: false,
      selectedPlan: "professional", // £129/month plan with ISO 9001 access
      planStatus: "active", // Skip payment requirements
      subscriptionType: "yearly", // 17% savings
      contractStartDate: new Date(),
      contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      nextBillingDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      yearlyDiscount: true,
      twoFactorSecret: null,
      backupCodes: null
    };

    const user = await storage.createUser(userData);
    console.log("✅ User created:", user.id);

    // Create company profile
    const companyData: Omit<InsertCompany, 'id'> = {
      name: "Rob & Son Scaffolding Services Ltd",
      businessType: "limited_company",
      tradeType: "scaffolding", // Family-run scaffolding company
      registrationNumber: "14567892", // Companies House number
      address: "Birmingham, West Midlands",
      postcode: "B77 4ET",
      phone: "+44 7837 781757", // Real phone from website
      logoUrl: "https://primary.jwwb.nl/public/n/u/h/temp-wehiizkggejfbjdybiao/r_s_logo-removebg-preview-high-0pghj1.png",
      ownerId: user.id
    };

    const company = await storage.createCompany(companyData);
    console.log("✅ Company created:", company.id);

    // Set user as company admin
    const companyUserData: Omit<InsertCompanyUser, 'id'> = {
      userId: user.id,
      companyId: company.id,
      role: "admin" // Full access to all features
    };

    const companyUser = await storage.addUserToCompany(companyUserData);
    console.log("✅ Company user role created:", companyUser.id);

    console.log(`
🎉 Premium test account created successfully!

📧 Email: info@rnsscaff.co.uk
🔑 Password: RobScaffolding2025!
🏢 Company: Rob & Son Scaffolding Services Ltd (ID: ${company.id})
📍 Location: Birmingham, West Midlands (B77 4ET)
📞 Phone: +44 7837 781757
🌐 Website: https://www.rnsscaff.co.uk/
📋 Plan: Professional (£129/month) - Active
🎯 Trade: Family-run Scaffolding (Residential/Commercial/Industrial)
👤 Role: Admin (full access)

✅ Ready for document upload and assessment testing!
`);

    return {
      user,
      company,
      companyUser,
      loginUrl: "/auth",
      credentials: {
        email: "info@rnsscaff.co.uk",
        password: "RobScaffolding2025!"
      }
    };

  } catch (error) {
    console.error("❌ Error creating Rob & Son account:", error);
    throw error;
  }
}

// Additional utility to create sample documents for testing
export async function createSampleDocuments(companyId: number, userId: string) {
  console.log("Creating sample documents for testing...");
  
  const sampleDocs = [
    {
      templateType: "scaffold-risk-assessment",
      documentName: "Residential Scaffolding Risk Assessment - House Extensions Birmingham",
      siteName: "Residential Property Development",
      siteAddress: "Sutton Coldfield, Birmingham, B74 2NF",
      projectManager: "Rob Son",
      hazards: "Working at height, Weather exposure, Public access areas, Adjacent properties",
      controlMeasures: "Family-run experienced team, Daily inspections, Weather monitoring, Resident liaison",
      specialRequirements: "Residential area considerations, Parking restrictions, Neighbour consultation"
    },
    {
      templateType: "scaffold-method-statement", 
      documentName: "Commercial Scaffolding Method Statement - Business Park",
      siteName: "Commercial Building Maintenance",
      siteAddress: "Erdington Business Park, Birmingham, B24 9QR",
      projectManager: "Rob Son",
      hazards: "Business operations, Vehicle access, Multi-storey access, Weather conditions",
      controlMeasures: "Professional scaffold design, Out-of-hours installation, Traffic management",
      specialRequirements: "Business continuity, Minimal disruption, Insurance compliance"
    },
    {
      templateType: "scaffold-inspection-checklist",
      documentName: "Industrial Scaffolding Weekly Inspection - Manufacturing Site",
      siteName: "Industrial Manufacturing Facility",
      siteAddress: "Castle Vale Industrial Estate, Birmingham, B35 7AG",
      projectManager: "Rob Son",
      hazards: "Heavy-duty structures, Industrial processes, Health & safety regulations, Load requirements", 
      controlMeasures: "Competent person inspections, Load calculations, Regular maintenance, Safety protocols",
      specialRequirements: "Industrial standards compliance, Worker safety priority, Regulatory adherence"
    }
  ];

  for (const docData of sampleDocs) {
    try {
      const document = await storage.createGeneratedDocument({
        companyId,
        templateType: docData.templateType,
        documentName: docData.documentName,
        siteName: docData.siteName,
        siteAddress: docData.siteAddress,
        projectManager: docData.projectManager,
        hazards: docData.hazards,
        controlMeasures: docData.controlMeasures,
        specialRequirements: docData.specialRequirements,
        status: 'generated',
        filePath: `/documents/${docData.templateType}-${companyId}-${Date.now()}.txt`,
        fileUrl: `https://workdoc360.replit.app/api/documents/${docData.templateType}-${companyId}-${Date.now()}.txt`,
        generatedBy: userId,
        reviewStatus: 'approved'
      });
      
      console.log(`✅ Sample document created: ${document.documentName}`);
    } catch (error) {
      console.error(`❌ Error creating sample document: ${docData.documentName}`, error);
    }
  }
}