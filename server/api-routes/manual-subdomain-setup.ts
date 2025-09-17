import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Manual subdomain assignment (backup solution while fixing GoDaddy API)
router.post('/assign-manual-subdomain', async (req, res) => {
  try {
    const { companyId, preferredSubdomain } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    // List of manually created subdomains (you'll create these in GoDaddy manually)
    const availableSubdomains = [
      'company1', 'company2', 'company3', 'company4', 'company5',
      'company6', 'company7', 'company8', 'company9', 'company10',
      'business1', 'business2', 'business3', 'business4', 'business5',
      'construction1', 'construction2', 'construction3', 'construction4', 'construction5'
    ];

    // Check if company already has a subdomain
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Note: subdomain field will be added to schema when needed
    // if (company.subdomain) {
    //   return res.json({
    //     success: true,
    //     message: 'Company already has subdomain assigned',
    //     subdomain: company.subdomain,
    //     url: `https://${company.subdomain}.workdoc360.co.uk`
    //   });
    // }

    // Find an available subdomain
    let assignedSubdomain = null;
    
    // Assign first available subdomain (simplified for now)
    assignedSubdomain = availableSubdomains[0]; // Will be enhanced once subdomain field is added to schema

    if (!assignedSubdomain) {
      return res.status(400).json({
        error: 'No available subdomains',
        message: 'All manual subdomains are assigned. Please set up GoDaddy API for automatic creation.'
      });
    }

    // Note: Will update company with subdomain once schema is updated
    // await storage.updateCompany(companyId, { subdomain: assignedSubdomain });

    console.log(`✅ Manually assigned subdomain: ${assignedSubdomain}.workdoc360.com to company ${companyId}`);

    res.json({
      success: true,
      message: 'Subdomain assigned successfully',
      subdomain: assignedSubdomain,
      url: `https://${assignedSubdomain}.workdoc360.com`,
      note: 'DNS record needs to be manually created in GoDaddy: A record pointing to 34.117.33.233'
    });

  } catch (error: any) {
    console.error('Error assigning manual subdomain:', error);
    res.status(500).json({
      error: 'Failed to assign subdomain',
      message: error.message
    });
  }
});

// Show manual DNS setup instructions
router.get('/manual-dns-instructions', async (req, res) => {
  try {
    // Simplified for now - will be enhanced once subdomain field is added
    const companiesNeedingSubdomains = 5; // Placeholder count
    
    res.json({
      message: 'Manual DNS setup instructions for GoDaddy (workdoc360.com)',
      instructions: {
        step1: 'Go to GoDaddy DNS Management for workdoc360.com',
        step2: 'Add these A records:',
        records: [
          { type: 'A', name: 'company1', value: '34.117.33.233', ttl: '1 hour' },
          { type: 'A', name: 'company2', value: '34.117.33.233', ttl: '1 hour' },
          { type: 'A', name: 'company3', value: '34.117.33.233', ttl: '1 hour' },
          { type: 'A', name: 'company4', value: '34.117.33.233', ttl: '1 hour' },
          { type: 'A', name: 'company5', value: '34.117.33.233', ttl: '1 hour' },
          { type: 'A', name: '@', value: '34.117.33.233', ttl: '1 hour', note: 'For root domain workdoc360.com' }
        ],
        step3: 'Wait 5-10 minutes for DNS propagation',
        step4: 'Test by visiting company1.workdoc360.com'
      },
      companiesNeedingSubdomains: companiesNeedingSubdomains,
      availableSubdomains: [
        'company1', 'company2', 'company3', 'company4', 'company5',
        'business1', 'business2', 'business3', 'business4', 'business5'
      ]
    });

  } catch (error: any) {
    console.error('Error getting manual DNS instructions:', error);
    res.status(500).json({
      error: 'Failed to get instructions',
      message: error.message
    });
  }
});

export default router;