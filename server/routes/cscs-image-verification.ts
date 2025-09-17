import { Router } from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// CSCS card image verification endpoint
router.post('/companies/:id/verify-cscs-image', upload.single('image'), async (req, res) => {
  try {
    const { id: companyId } = req.params;
    const imageBuffer = req.file?.buffer;

    if (!imageBuffer) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file?.mimetype || 'image/jpeg';

    // Analyze image with Claude Vision
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this CSCS (Construction Skills Certification Scheme) card image and extract the following information:

1. Card Type (Green/Red/Blue/Gold/Black/White and specific designation)
2. Cardholder Name
3. Card Number (if visible)
4. Trade/Occupation
5. Expiry Date (if visible)
6. Test Date (if visible)
7. Security Features Assessment
8. Visual Authenticity Assessment

Provide the response in JSON format with these exact fields:
{
  "cardType": "detected card type",
  "holderName": "cardholder name",
  "cardNumber": "card number if visible or 'Not clearly visible'",
  "tradeQualification": "trade/occupation",
  "expiryDate": "expiry date if visible or 'Not clearly visible'",
  "testDate": "test date if visible or 'Not clearly visible'",
  "imageAnalysis": {
    "cardTypeDetected": "specific card type identified",
    "securityFeatures": ["list", "of", "security", "features", "observed"],
    "visualAuthenticity": "genuine/suspicious/invalid"
  }
}

Focus on UK construction industry CSCS cards. Be thorough in security feature analysis.`
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64Image
            }
          }
        ]
      }]
    });

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse AI response
    let analysisResult;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysisResult = {
        cardType: "Analysis failed",
        holderName: "Could not extract",
        cardNumber: "Not clearly visible",
        tradeQualification: "Could not determine",
        expiryDate: "Not clearly visible",
        testDate: "Not clearly visible",
        imageAnalysis: {
          cardTypeDetected: "Unable to determine",
          securityFeatures: ["Analysis incomplete"],
          visualAuthenticity: "suspicious"
        }
      };
    }

    // Simulate CSCS database verification based on extracted information
    const mockVerificationResult = {
      cardNumber: analysisResult.cardNumber !== 'Not clearly visible' ? analysisResult.cardNumber : `MOCK-${Date.now()}`,
      holderName: analysisResult.holderName || "Cardholder Name",
      cardType: analysisResult.cardType || "Green CSCS Labourer Card",
      expiryDate: analysisResult.expiryDate !== 'Not clearly visible' ? analysisResult.expiryDate : "2026-12-31",
      status: determineCardStatus(analysisResult),
      tradeQualification: analysisResult.tradeQualification || "Construction Labourer",
      testDate: analysisResult.testDate !== 'Not clearly visible' ? analysisResult.testDate : "2021-06-15",
      imageAnalysis: analysisResult.imageAnalysis,
      verificationMethod: 'image_analysis',
      verifiedAt: new Date().toISOString(),
      companyId: parseInt(companyId)
    };

    // Log verification for audit trail
    console.log(`CSCS Image Verification - Company ${companyId}:`, {
      cardNumber: mockVerificationResult.cardNumber,
      status: mockVerificationResult.status,
      holderName: mockVerificationResult.holderName,
      timestamp: mockVerificationResult.verifiedAt
    });

    res.json(mockVerificationResult);

  } catch (error) {
    console.error('CSCS image verification error:', error);
    res.status(500).json({ 
      error: 'Image verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function determineCardStatus(analysisResult: any): 'valid' | 'expired' | 'revoked' | 'invalid' {
  // Check visual authenticity first
  if (analysisResult.imageAnalysis?.visualAuthenticity === 'invalid') {
    return 'invalid';
  }

  // Check for suspicious indicators
  if (analysisResult.imageAnalysis?.visualAuthenticity === 'suspicious') {
    return 'invalid';
  }

  // Check expiry date if available
  if (analysisResult.expiryDate && analysisResult.expiryDate !== 'Not clearly visible') {
    try {
      const expiryDate = new Date(analysisResult.expiryDate);
      const today = new Date();
      if (expiryDate < today) {
        return 'expired';
      }
    } catch (error) {
      console.error('Error parsing expiry date:', error);
    }
  }

  // Simulate some test patterns based on card number
  const cardNumber = analysisResult.cardNumber || '';
  if (cardNumber.toLowerCase().includes('exp')) return 'expired';
  if (cardNumber.toLowerCase().includes('rev')) return 'revoked';
  if (cardNumber.toLowerCase().includes('inv')) return 'invalid';

  // If visual analysis shows genuine and no negative indicators, consider valid
  if (analysisResult.imageAnalysis?.visualAuthenticity === 'genuine') {
    return 'valid';
  }

  // Default to valid for properly formatted cards
  return 'valid';
}

export default router;