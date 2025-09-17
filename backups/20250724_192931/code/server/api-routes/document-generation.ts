// API routes for document generation and website scraping

import express from 'express';
import { scrapeCompanyWebsite } from '../website-scraper';
import { documentGenerator } from '../document-generator';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';
import { insertCompanyBrandingSchema, insertDocumentGenerationRequestSchema } from '../../shared/schema';
import { DocumentRecommendation } from '../../shared/document-recommendations';

const router = express.Router();

// Website scraping endpoint
router.post('/scrape-website', requireAuth, async (req, res) => {
  try {
    const { websiteUrl } = req.body;
    
    if (!websiteUrl) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    console.log(`Scraping website for user ${req.session.userId}: ${websiteUrl}`);
    
    const companyDetails = await scrapeCompanyWebsite(websiteUrl);
    
    // Store the scraped data in the database
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's active company
    const userCompanies = await storage.getCompaniesByUserId(user.id);
    if (userCompanies.length === 0) {
      return res.status(400).json({ error: 'No company found for user' });
    }

    const activeCompany = userCompanies[0]; // Use first company for now

    // Store or update company branding
    try {
      await storage.upsertCompanyBranding(activeCompany.id, {
        websiteUrl,
        logoUrl: companyDetails.branding?.logoUrl,
        businessDescription: companyDetails.businessDescription,
        tagline: companyDetails.branding?.tagline,
        services: companyDetails.services || [],
        certifications: companyDetails.certifications || [],
        yearEstablished: companyDetails.yearEstablished,
        contactInfo: companyDetails.contactInfo || {},
        lastScraped: new Date(),
        scrapingStatus: 'success'
      });
    } catch (dbError) {
      console.error('Error storing branding data:', dbError);
      // Continue even if DB storage fails
    }

    res.json(companyDetails);
    
  } catch (error) {
    console.error('Website scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape website',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Document generation endpoint with streaming
router.post('/generate-documents', requireAuth, async (req, res) => {
  try {
    const { companyId, documents, context } = req.body;
    
    if (!companyId || !documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify user has access to the company
    const userCompany = await storage.getCompanyUserByIds(user.id, companyId);
    if (!userCompany) {
      return res.status(403).json({ error: 'Access denied to company' });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    const sendUpdate = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };

    try {
      // Create generation request record
      const generationRequest = await storage.createDocumentGenerationRequest({
        companyId,
        userId: user.id,
        requestedDocuments: documents.map((doc: DocumentRecommendation) => doc.id),
        generationContext: context,
        status: 'in_progress',
        totalDocuments: documents.length,
        startedAt: new Date()
      });

      const generatedDocuments = [];
      let completedCount = 0;

      // Generate documents one by one with progress updates
      for (const document of documents) {
        sendUpdate('progress', {
          progress: (completedCount / documents.length) * 100,
          currentDocument: document.title
        });

        try {
          const generatedDoc = await documentGenerator.generateDocument(
            document.id,
            document.title,
            context
          );

          // Store the generated document
          const storedDoc = await storage.createGeneratedDocument({
            companyId,
            documentName: generatedDoc.title,
            documentType: generatedDoc.documentType,
            content: generatedDoc.content,
            siteName: context.companyName || 'Main Site',
            generatedBy: user.id,
            reviewStatus: 'draft',
            wordCount: generatedDoc.wordCount,
            sections: generatedDoc.sections,
            aiGenerated: true,
            documentId: document.id
          });

          generatedDocuments.push({
            ...storedDoc,
            ...generatedDoc
          });

          sendUpdate('document', { document: storedDoc });
          
        } catch (docError) {
          console.error(`Error generating document ${document.title}:`, docError);
          sendUpdate('error', {
            document: document.title,
            error: docError instanceof Error ? docError.message : 'Generation failed'
          });
        }

        completedCount++;
      }

      // Update generation request status
      await storage.updateDocumentGenerationRequest(generationRequest.id, {
        status: 'completed',
        completedDocuments: completedCount,
        completedAt: new Date()
      });

      sendUpdate('complete', {
        totalGenerated: generatedDocuments.length,
        documents: generatedDocuments
      });

    } catch (error) {
      console.error('Document generation process error:', error);
      sendUpdate('error', {
        error: 'Generation process failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    res.end();
    
  } catch (error) {
    console.error('Document generation API error:', error);
    res.status(500).json({ 
      error: 'Failed to start document generation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get document recommendations for a trade
router.get('/document-recommendations/:tradeType', requireAuth, async (req, res) => {
  try {
    const { tradeType } = req.params;
    
    // Import dynamically to avoid circular dependency issues
    const { getRecommendationsForTrade } = await import('../../shared/document-recommendations');
    const recommendations = getRecommendationsForTrade(tradeType);
    
    res.json({
      tradeType,
      recommendations,
      totalRecommendations: recommendations.length,
      essentialCount: recommendations.filter(doc => doc.priority === 'essential').length
    });
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get document recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;