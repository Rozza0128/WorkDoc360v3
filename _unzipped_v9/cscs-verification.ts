import { Request, Response } from "express";
import { z } from "zod";

// CSCS Smart Check API integration
// Note: In production, you'll need to apply for CSCS IT Partner status
// Contact: ITPartner@cscs.co.uk

interface CSCSApiResponse {
  cardNumber: string;
  holderName: string;
  cardType: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'revoked' | 'invalid';
  qualifications: string[];
  photo?: string;
  occupation: string;
  schemeProvider: string;
}

const verifyCardSchema = z.object({
  cardNumber: z.string().min(1, "Card number is required"),
  verificationType: z.enum(['qr', 'nfc', 'manual']).default('manual'),
  companyId: z.number().min(1)
});

class CSCSVerificationService {
  private readonly baseUrl = process.env.CSCS_SMART_CHECK_API_URL || 'https://api.cscssmartcheck.co.uk/v1';
  private readonly apiKey = process.env.CSCS_API_KEY;
  
  async verifyCard(cardNumber: string, verificationType: string): Promise<CSCSApiResponse> {
    if (!this.apiKey) {
      throw new Error('CSCS API key not configured. Contact ITPartner@cscs.co.uk to become an approved IT partner.');
    }
    
    try {
      // Real CSCS Smart Check API call structure
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '2024-01'
        },
        body: JSON.stringify({
          cardNumber: cardNumber.trim(),
          verificationType,
          includePhoto: true,
          includeQualifications: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`CSCS API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        cardNumber: data.cardNumber,
        holderName: data.holderName,
        cardType: this.mapCardType(data.cardType),
        expiryDate: data.expiryDate,
        status: this.determineStatus(data),
        qualifications: data.qualifications || [],
        photo: data.photo,
        occupation: data.occupation,
        schemeProvider: data.schemeProvider
      };
      
    } catch (error) {
      console.error('CSCS verification error:', error);
      throw new Error('Failed to verify card with CSCS Smart Check');
    }
  }
  
  private mapCardType(apiCardType: string): string {
    // Map CSCS API card types to our internal types
    const typeMap: { [key: string]: string } = {
      'LABOURER': 'green-labourer',
      'PROVISIONAL': 'green-provisional',
      'APPRENTICE': 'red-apprentice',
      'TRAINEE': 'red-trainee',
      'EXPERIENCED_WORKER': 'red-experienced',
      'TECHNICAL_TRAINEE': 'red-technical',
      'SKILLED_WORKER': 'blue-skilled',
      'ADVANCED_CRAFT': 'gold-advanced',
      'SUPERVISOR': 'gold-supervisor',
      'MANAGER': 'black-manager',
      'ACADEMICALLY_QUALIFIED': 'white-aqp',
      'PROFESSIONALLY_QUALIFIED': 'white-pqp'
    };
    
    return typeMap[apiCardType] || 'unknown';
  }
  
  private determineStatus(data: any): 'valid' | 'expired' | 'revoked' | 'invalid' {
    if (data.revoked) return 'revoked';
    if (data.expired || new Date(data.expiryDate) < new Date()) return 'expired';
    if (data.valid === false) return 'invalid';
    return 'valid';
  }
  
  // Demo method for development - remove in production
  async mockVerifyCard(cardNumber: string): Promise<CSCSApiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock response based on card number patterns
    const isExpired = cardNumber.includes('EXP');
    const isRevoked = cardNumber.includes('REV');
    const isInvalid = cardNumber.includes('INV');
    
    return {
      cardNumber,
      holderName: this.generateMockName(),
      cardType: this.generateMockCardType(cardNumber),
      expiryDate: isExpired ? '2023-12-31' : '2026-03-15',
      status: isRevoked ? 'revoked' : isExpired ? 'expired' : isInvalid ? 'invalid' : 'valid',
      qualifications: this.generateMockQualifications(),
      occupation: 'Skilled Construction Worker',
      schemeProvider: 'CSCS'
    };
  }
  
  private generateMockName(): string {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Rachel'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }
  
  private generateMockCardType(cardNumber: string): string {
    // Return card type based on first digit
    const firstDigit = parseInt(cardNumber[0]) || 0;
    const types = ['green-labourer', 'blue-skilled', 'gold-advanced', 'gold-supervisor', 'black-manager'];
    return types[firstDigit % types.length];
  }
  
  private generateMockQualifications(): string[] {
    const qualifications = [
      'CSCS Health & Safety Test',
      'NVQ Level 2 Construction',
      'First Aid at Work',
      'Manual Handling Training',
      'Working at Height Training',
      'CISRS Basic Scaffolding',
      'Plant Operations Safety'
    ];
    
    const count = Math.floor(Math.random() * 3) + 2;
    return qualifications.slice(0, count);
  }
}

const cscsService = new CSCSVerificationService();

export async function verifyCSCSCard(req: Request, res: Response) {
  try {
    const { cardNumber, verificationType, companyId } = verifyCardSchema.parse(req.body);
    
    // In development, use mock service
    // In production, use real CSCS Smart Check API
    const verificationResult = process.env.NODE_ENV === 'production' 
      ? await cscsService.verifyCard(cardNumber, verificationType)
      : await cscsService.mockVerifyCard(cardNumber);
    
    // Log verification for compliance audit trail
    console.log(`CSCS Verification: Company ${companyId}, Card ${cardNumber}, Status: ${verificationResult.status}`);
    
    // Store verification result in database for compliance tracking
    // TODO: Add database storage for verification history
    
    res.json({
      success: true,
      data: verificationResult,
      timestamp: new Date().toISOString(),
      apiVersion: '2024-01'
    });
    
  } catch (error) {
    console.error('CSCS verification error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Card verification failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getCSCSCardTypes(req: Request, res: Response) {
  // Return complete CSCS card types for frontend
  const cardTypes = {
    'green-labourer': {
      name: 'Green Labourer Card',
      color: '#22c55e',
      description: 'For labouring occupations on construction sites',
      validity: '5 years (2 years initial from 2025)',
      requirements: 'CSCS Test for Operatives + relevant qualification'
    },
    'green-provisional': {
      name: 'Green Provisional Card', 
      color: '#4ade80',
      description: 'Temporary 6-month card for new workers',
      validity: '6 months (non-renewable)',
      requirements: 'For first-time CSCS card holders only'
    },
    'red-apprentice': {
      name: 'Red Apprentice Card',
      color: '#ef4444',
      description: 'For registered apprentices',
      validity: '4.5 years (non-renewable)',
      requirements: 'Registered construction apprenticeship'
    },
    'red-trainee': {
      name: 'Red Trainee Card',
      color: '#dc2626',
      description: 'Temporary card for trainees',
      validity: '5 years (non-renewable)',
      requirements: 'Registered for relevant qualification'
    },
    'red-experienced': {
      name: 'Red Experienced Worker Card',
      color: '#b91c1c',
      description: 'For experienced workers completing qualifications',
      validity: '1 year (non-renewable)',
      requirements: 'On-job experience + registered for qualification'
    },
    'red-technical': {
      name: 'Red Technical/Supervisory Trainee Card',
      color: '#991b1b',
      description: 'For technical/supervisory trainees',
      validity: '3 years',
      requirements: 'Technical/supervisory training programme'
    },
    'blue-skilled': {
      name: 'Blue Skilled Worker Card',
      color: '#3b82f6',
      description: 'For skilled workers with completed apprenticeships',
      validity: '5 years',
      requirements: 'NVQ/SVQ Level 2 or equivalent'
    },
    'gold-advanced': {
      name: 'Gold Advanced Craft Card',
      color: '#eab308',
      description: 'For advanced craft workers',
      validity: '5 years',
      requirements: 'NVQ/SVQ Level 3 + CITB test'
    },
    'gold-supervisor': {
      name: 'Gold Supervisor Card',
      color: '#ca8a04',
      description: 'For supervisory roles',
      validity: '5 years',
      requirements: 'NVQ/SVQ Level 3/4 + MAP test'
    },
    'black-manager': {
      name: 'Black Manager Card',
      color: '#1f2937',
      description: 'For senior managers',
      validity: '5 years',
      requirements: 'NVQ/SVQ Level 5-7 + MAP test'
    },
    'white-aqp': {
      name: 'White Academically Qualified Person Card',
      color: '#f3f4f6',
      description: 'For academically qualified professionals',
      validity: '5 years',
      requirements: 'Construction-related degree/HND/HNC'
    },
    'white-pqp': {
      name: 'White Professionally Qualified Person Card',
      color: '#e5e7eb',
      description: 'For professionally qualified members',
      validity: '5 years',
      requirements: 'CSCS-approved professional body membership'
    }
  };
  
  res.json({
    success: true,
    data: cardTypes,
    totalTypes: Object.keys(cardTypes).length
  });
}

// Bulk verification for workforce management
export async function bulkVerifyCards(req: Request, res: Response) {
  try {
    const { cardNumbers, companyId } = z.object({
      cardNumbers: z.array(z.string()).min(1).max(100),
      companyId: z.number().min(1)
    }).parse(req.body);
    
    const results = [];
    
    for (const cardNumber of cardNumbers) {
      try {
        const result = process.env.NODE_ENV === 'production' 
          ? await cscsService.verifyCard(cardNumber, 'bulk')
          : await cscsService.mockVerifyCard(cardNumber);
        
        results.push({
          cardNumber,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          cardNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Verification failed'
        });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    res.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed
      },
      results
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid bulk verification request',
      details: error instanceof z.ZodError ? error.errors : undefined
    });
  }
}