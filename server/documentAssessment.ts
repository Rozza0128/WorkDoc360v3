import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DocumentAssessmentResult {
  overallScore: number; // 0-100
  complianceGaps: ComplianceGap[];
  recommendations: Recommendation[];
  strengths: string[];
  criticalIssues: CriticalIssue[];
  improvementPlan: ImprovementStep[];
}

interface ComplianceGap {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  regulation: string;
  requiredAction: string;
}

interface Recommendation {
  title: string;
  description: string;
  priority: number;
  estimatedHours: number;
  costImplication: 'none' | 'low' | 'medium' | 'high';
}

interface CriticalIssue {
  title: string;
  description: string;
  immediateAction: string;
  legalImplication: string;
}

interface ImprovementStep {
  step: number;
  action: string;
  timeline: string;
  responsible: string;
  deliverable: string;
}

export async function assessDocument(
  documentContent: string,
  documentType: string,
  tradeType: string,
  companyName: string
): Promise<DocumentAssessmentResult> {

  const tradeSpecificRequirements = getTradeRequirements(tradeType);

  const systemPrompt = `You are a UK construction compliance expert specializing in document assessment for ${tradeType} companies. 

Your role is to thoroughly assess construction compliance documents against:
- HSE (Health and Safety Executive) guidelines
- CDM Regulations 2015
- CSCS requirements
- ${tradeType === 'scaffolding' ? 'CISRS standards and TG20:13 guidelines' : 'Industry-specific standards'}
- ISO 9001:2015 quality management principles
- UK construction best practices

Provide detailed, actionable assessments with specific regulatory references.

CRITICAL: Return your response as a valid JSON object with the following structure:
{
  "overallScore": number (0-100),
  "complianceGaps": [
    {
      "category": "string",
      "description": "string", 
      "severity": "low|medium|high|critical",
      "regulation": "string",
      "requiredAction": "string"
    }
  ],
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "priority": number (1-10),
      "estimatedHours": number,
      "costImplication": "none|low|medium|high"
    }
  ],
  "strengths": ["string"],
  "criticalIssues": [
    {
      "title": "string",
      "description": "string", 
      "immediateAction": "string",
      "legalImplication": "string"
    }
  ],
  "improvementPlan": [
    {
      "step": number,
      "action": "string",
      "timeline": "string", 
      "responsible": "string",
      "deliverable": "string"
    }
  ]
}`;

  const userPrompt = `Assess this ${documentType} document for ${companyName} (${tradeType} contractor):

DOCUMENT CONTENT:
${documentContent}

TRADE-SPECIFIC REQUIREMENTS:
${tradeSpecificRequirements}

Provide a comprehensive assessment covering:
1. Regulatory compliance (HSE, CDM 2015, industry standards)
2. Risk identification completeness
3. Control measures adequacy
4. Documentation quality and clarity
5. Legal liability coverage
6. Best practice alignment

Focus on practical, actionable improvements that will enhance compliance and safety outcomes.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\n${userPrompt}`
      }]
    });

    const assessmentText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from the response
    const jsonMatch = assessmentText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const assessmentResult: DocumentAssessmentResult = JSON.parse(jsonMatch[0]);

    // Validate and clean the result
    return validateAssessmentResult(assessmentResult);

  } catch (error) {
    const msg = (error && (error as any).message) ? (error as any).message : String(error);
    console.error('Error in document assessment:', msg);
    throw new Error(`Failed to assess document: ${msg}`);
  }
}

function getTradeRequirements(tradeType: string): string {
  const requirements = {
    'scaffolding': `
- CISRS certification requirements for operatives
- TG20:13 design guidance compliance
- SG4:15 preventing falls in scaffolding work
- Work at Height Regulations 2005
- Scaffold inspection requirements (every 7 days/after adverse weather)
- Foundation and ground bearing capacity assessments
- Loading calculations and design certificates
- Handover certificates and acceptance procedures
    `,
    'plastering': `
- COSHH assessments for materials and dust
- Manual handling assessments
- Working platform safety requirements
- Dust control and respiratory protection
- Material storage and handling procedures
    `,
    'general_building': `
- CDM 2015 principal contractor duties
- Construction phase plan requirements
- Site safety management systems
- Welfare facility provisions
- Emergency procedures and incident reporting
    `
  };

  return (requirements as Record<string, string>)[tradeType] || requirements['general_building'];
}

function validateAssessmentResult(result: any): DocumentAssessmentResult {
  // Ensure all required fields exist with defaults
  return {
    overallScore: Math.max(0, Math.min(100, result.overallScore || 0)),
    complianceGaps: Array.isArray(result.complianceGaps) ? result.complianceGaps : [],
    recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    criticalIssues: Array.isArray(result.criticalIssues) ? result.criticalIssues : [],
    improvementPlan: Array.isArray(result.improvementPlan) ? result.improvementPlan : []
  };
}

export async function generateImprovementDocument(
  assessment: DocumentAssessmentResult,
  originalDocument: string,
  companyName: string,
  tradeType: string
): Promise<string> {

  const systemPrompt = `You are a UK construction compliance consultant creating improvement documents. 
  
Generate a professional improvement plan document that addresses the identified gaps and recommendations.
Use British English and construction industry terminology.
Structure as a formal business document suitable for management review.`;

  const userPrompt = `Based on this assessment, create a comprehensive improvement plan document:

COMPANY: ${companyName}
TRADE: ${tradeType}

ASSESSMENT RESULTS:
Overall Score: ${assessment.overallScore}/100

COMPLIANCE GAPS:
${assessment.complianceGaps.map(gap => `- ${gap.category}: ${gap.description} (${gap.severity})`).join('\n')}

RECOMMENDATIONS:
${assessment.recommendations.map(rec => `- ${rec.title}: ${rec.description}`).join('\n')}

CRITICAL ISSUES:
${assessment.criticalIssues.map(issue => `- ${issue.title}: ${issue.description}`).join('\n')}

Create a structured improvement plan with:
1. Executive Summary
2. Current State Assessment
3. Priority Actions (based on severity and legal requirements)
4. Implementation Timeline
5. Resource Requirements
6. Success Metrics
7. Review Schedule

Format as a professional business document.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 3000,
      temperature: 0.4,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\n${userPrompt}`
      }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    const msg = (error && (error as any).message) ? (error as any).message : String(error);
    console.error('Error generating improvement document:', msg);
    throw new Error(`Failed to generate improvement plan: ${msg}`);
  }
}