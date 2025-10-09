import Anthropic from '@anthropic-ai/sdk';
import { CSCSVerificationResult } from './cscsVerification';

// AI-powered CSCS card verification using image analysis
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CardImageAnalysis {
  cardNumber: string | null;
  holderName: string | null;
  cardType: string | null;
  expiryDate: string | null;
  issueDate: string | null;
  cardColour: string | null;
  securityFeatures: {
    hologramPresent: boolean;
    correctFont: boolean;
    properLayout: boolean;
    validQRCode: boolean | null;
  };
  qualityScore: number; // 0-100 confidence in image quality
  fraudIndicators: string[];
  extractedText: string;
}

export interface CSCSRegisterCheck {
  cardNumber: string;
  isRegistered: boolean;
  holderName: string | null;
  validUntil: string | null;
  cardStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'NOT_FOUND';
  lastVerified: Date;
}

export class AICardVerificationService {

  /**
   * Analyse CSCS card image using Claude AI vision
   */
  async analyseCardImage(imageBase64: string): Promise<CardImageAnalysis> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse this CSCS card image and extract all information. Look for:

1. Card number (usually 8-12 digits)
2. Holder's name
3. Card type/level (e.g., Blue Skilled Worker, Green Labourer, Gold Supervisory)
4. Expiry date
5. Issue date
6. Card colour (Green, Blue, Gold, Black, White, Red, Yellow)
7. Security features:
   - Holographic elements
   - Correct CSCS fonts and layout
   - QR codes
   - Print quality

Check for potential fraud indicators:
- Poor print quality
- Incorrect fonts or spacing
- Missing holograms
- Wrong colour schemes
- Suspicious text alignment

Provide a quality score (0-100) for image clarity and a detailed analysis.

Format response as JSON with these fields:
{
  "cardNumber": "string or null",
  "holderName": "string or null", 
  "cardType": "string or null",
  "expiryDate": "string or null",
  "issueDate": "string or null",
  "cardColour": "string or null",
  "securityFeatures": {
    "hologramPresent": boolean,
    "correctFont": boolean,
    "properLayout": boolean,
    "validQRCode": boolean or null
  },
  "qualityScore": number,
  "fraudIndicators": ["array of strings"],
  "extractedText": "all visible text"
}`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      });

      const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';

      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI analysis response');
      }

      const analysis: CardImageAnalysis = JSON.parse(jsonMatch[0]);

      // Validate and clean the analysis
      return this.validateAnalysis(analysis);

    } catch (error) {
      console.error('AI card analysis failed:', error);
      return {
        cardNumber: null,
        holderName: null,
        cardType: null,
        expiryDate: null,
        issueDate: null,
        cardColour: null,
        securityFeatures: {
          hologramPresent: false,
          correctFont: false,
          properLayout: false,
          validQRCode: null
        },
        qualityScore: 0,
        fraudIndicators: ['AI analysis failed'],
        extractedText: ''
      };
    }
  }

  /**
   * Check card details against CSCS official register
   * Note: This would require integration with CSCS database
   */
  async checkCSCSRegister(cardNumber: string, holderName?: string): Promise<CSCSRegisterCheck> {
    // This would integrate with the official CSCS verification system
    // Currently, CSCS provides a web checker at cscs.uk.com but no public API

    try {
      // Placeholder for CSCS register integration
      // In practice, this might involve:
      // 1. Web scraping the CSCS checker (not recommended)
      // 2. Official API partnership with CSCS
      // 3. Integration with third-party verification services

      const registerResult = await this.queryCSCSDatabase(cardNumber, holderName);
      return registerResult;

    } catch (error) {
      console.error('CSCS register check failed:', error);
      return {
        cardNumber,
        isRegistered: false,
        holderName: null,
        validUntil: null,
        cardStatus: 'NOT_FOUND',
        lastVerified: new Date()
      };
    }
  }

  /**
   * Complete AI-powered verification combining image analysis + register check
   */
  async verifyCardWithAI(imageBase64: string): Promise<{
    imageAnalysis: CardImageAnalysis;
    registerCheck: CSCSRegisterCheck | null;
    overallResult: CSCSVerificationResult;
  }> {
    // Step 1: Analyse the card image
    const imageAnalysis = await this.analyseCardImage(imageBase64);

    let registerCheck: CSCSRegisterCheck | null = null;
    let overallResult: CSCSVerificationResult;

    // Step 2: If we found a card number, check the register
    if (imageAnalysis.cardNumber) {
      registerCheck = await this.checkCSCSRegister(imageAnalysis.cardNumber, imageAnalysis.holderName || undefined);
    }

    // Step 3: Combine results for overall verification
    overallResult = this.combineVerificationResults(imageAnalysis, registerCheck);

    return {
      imageAnalysis,
      registerCheck,
      overallResult
    };
  }

  /**
   * Mock CSCS database query - in production this would be real API
   */
  private async queryCSCSDatabase(cardNumber: string, holderName?: string): Promise<CSCSRegisterCheck> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, simulate some responses
    // In production, this would make actual API calls to CSCS

    // Simulate different scenarios based on card number patterns
    if (cardNumber.startsWith('1234')) {
      return {
        cardNumber,
        isRegistered: true,
        holderName: holderName || 'John Smith',
        validUntil: '2025-12-31',
        cardStatus: 'ACTIVE',
        lastVerified: new Date()
      };
    } else if (cardNumber.startsWith('9999')) {
      return {
        cardNumber,
        isRegistered: true,
        holderName: holderName || 'Jane Doe',
        validUntil: '2024-06-30',
        cardStatus: 'EXPIRED',
        lastVerified: new Date()
      };
    } else {
      // Most cards would need real verification
      throw new Error('CSCS register integration required');
    }
  }

  /**
   * Combine image analysis and register check into final result
   */
  private combineVerificationResults(
    imageAnalysis: CardImageAnalysis,
    registerCheck: CSCSRegisterCheck | null
  ): CSCSVerificationResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check image quality
    if (imageAnalysis.qualityScore < 70) {
      warnings.push('Image quality is poor - recommend retaking photo');
    }

    // Check for fraud indicators
    if (imageAnalysis.fraudIndicators.length > 0) {
      warnings.push(...imageAnalysis.fraudIndicators);
      recommendations.push('Manual verification required due to potential fraud indicators');
    }

    // Check security features
    if (!imageAnalysis.securityFeatures.hologramPresent) {
      warnings.push('No hologram detected - may indicate counterfeit card');
    }

    if (!imageAnalysis.securityFeatures.correctFont || !imageAnalysis.securityFeatures.properLayout) {
      warnings.push('Card layout or fonts appear incorrect');
    }

    // Determine overall status
    let status: CSCSVerificationResult['status'] = 'INVALID';
    let isValid = false;

    if (registerCheck) {
      // We have register information
      status = registerCheck.cardStatus === 'ACTIVE' ? 'VALID' :
        registerCheck.cardStatus === 'EXPIRED' ? 'EXPIRED' :
          registerCheck.cardStatus === 'SUSPENDED' ? 'SUSPENDED' : 'INVALID';
      isValid = status === 'VALID';
    } else if (imageAnalysis.cardNumber && imageAnalysis.fraudIndicators.length === 0) {
      // No register check but image looks legitimate
      status = 'VALID';
      isValid = true;
      recommendations.push('Register verification recommended for complete validation');
    }

    return {
      isValid,
      cardNumber: imageAnalysis.cardNumber || '',
      holderName: imageAnalysis.holderName ?? undefined,
      // Convert null -> undefined to match CSCSVerificationResult.cardType?: string
      cardType: imageAnalysis.cardType ?? undefined,
      expiryDate: imageAnalysis.expiryDate || undefined,
      status,
      lastChecked: new Date(),
      verificationMethod: 'PHOTO_VERIFICATION',
      warnings: warnings.length > 0 ? warnings : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }

  /**
   * Validate and clean AI analysis results
   */
  private validateAnalysis(analysis: CardImageAnalysis): CardImageAnalysis {
    // Clean and validate card number
    if (analysis.cardNumber) {
      analysis.cardNumber = analysis.cardNumber.replace(/[^0-9]/g, '');
      if (analysis.cardNumber.length < 6 || analysis.cardNumber.length > 15) {
        analysis.fraudIndicators.push('Card number length unusual');
      }
    }

    // Validate dates
    if (analysis.expiryDate) {
      const expiryDate = new Date(analysis.expiryDate);
      if (expiryDate < new Date()) {
        analysis.fraudIndicators.push('Card appears to be expired');
      }
    }

    // Quality score validation
    analysis.qualityScore = Math.max(0, Math.min(100, analysis.qualityScore));

    return analysis;
  }

  /**
   * Generate fraud risk assessment
   */
  generateFraudAssessment(analysis: CardImageAnalysis): {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    riskFactors: string[];
    recommendations: string[];
  } {
    let riskScore = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Image quality factors
    if (analysis.qualityScore < 50) {
      riskScore += 30;
      riskFactors.push('Very poor image quality');
      recommendations.push('Request clearer photo of card');
    }

    // Security feature factors
    if (!analysis.securityFeatures.hologramPresent) {
      riskScore += 40;
      riskFactors.push('Missing security hologram');
      recommendations.push('Verify card has authentic CSCS hologram');
    }

    if (!analysis.securityFeatures.correctFont) {
      riskScore += 25;
      riskFactors.push('Incorrect font detected');
    }

    if (!analysis.securityFeatures.properLayout) {
      riskScore += 25;
      riskFactors.push('Layout inconsistencies detected');
    }

    // Fraud indicators
    riskScore += analysis.fraudIndicators.length * 15;
    riskFactors.push(...analysis.fraudIndicators);

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (riskScore >= 80) {
      riskLevel = 'CRITICAL';
      recommendations.push('DO NOT ACCEPT - High probability of counterfeit card');
    } else if (riskScore >= 60) {
      riskLevel = 'HIGH';
      recommendations.push('Manual verification required before acceptance');
    } else if (riskScore >= 30) {
      riskLevel = 'MEDIUM';
      recommendations.push('Additional checks recommended');
    } else {
      riskLevel = 'LOW';
      recommendations.push('Card appears authentic');
    }

    return {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      riskFactors,
      recommendations
    };
  }
}

export const aiCardVerificationService = new AICardVerificationService();