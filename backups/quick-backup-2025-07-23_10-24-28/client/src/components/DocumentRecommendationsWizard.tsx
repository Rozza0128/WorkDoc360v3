import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Globe, FileText, CheckCircle, Loader2, ExternalLink, Building2 } from 'lucide-react';
import { getRecommendationsForTrade, DocumentRecommendation } from '../../../shared/document-recommendations';

interface CompanyDetails {
  companyName?: string;
  businessDescription?: string;
  services?: string[];
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  branding?: {
    logoUrl?: string;
    tagline?: string;
  };
  certifications?: string[];
  yearEstablished?: string;
}

interface DocumentRecommendationsWizardProps {
  companyId: number;
  tradeType: string;
  onComplete: (generatedDocuments: any[]) => void;
}

export function DocumentRecommendationsWizard({ 
  companyId, 
  tradeType, 
  onComplete 
}: DocumentRecommendationsWizardProps) {
  const [currentStep, setCurrentStep] = useState<'recommendations' | 'website' | 'details' | 'generating'>('recommendations');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({});
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [specificAnswers, setSpecificAnswers] = useState<Record<string, string>>({});
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentlyGenerating, setCurrentlyGenerating] = useState('');
  
  const { toast } = useToast();
  const recommendations = getRecommendationsForTrade(tradeType);
  const essentialDocs = recommendations.filter(doc => doc.priority === 'essential');
  const recommendedDocs = recommendations.filter(doc => doc.priority === 'recommended');

  // Pre-select essential documents
  useEffect(() => {
    setSelectedDocuments(essentialDocs.map(doc => doc.id));
  }, [tradeType]);

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleWebsiteScraping = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Website Required",
        description: "Please enter your company website URL",
        variant: "destructive"
      });
      return;
    }

    setIsScrapingWebsite(true);
    try {
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: websiteUrl.trim() })
      });

      if (!response.ok) throw new Error('Failed to scrape website');
      
      const scrapedDetails = await response.json();
      setCompanyDetails(scrapedDetails);
      
      toast({
        title: "Website Analysed",
        description: "Company details extracted successfully. Please review and confirm.",
        variant: "default"
      });
      
      setCurrentStep('details');
    } catch (error) {
      console.error('Website scraping error:', error);
      toast({
        title: "Website Analysis Failed",
        description: "We couldn't extract details from your website. You can enter them manually.",
        variant: "destructive"
      });
      setCurrentStep('details');
    } finally {
      setIsScrapingWebsite(false);
    }
  };

  const skipWebsiteScraping = () => {
    setCurrentStep('details');
  };

  const generateDocuments = async () => {
    if (!detailsConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm your company details before generating documents",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('generating');
    setGenerationProgress(0);

    try {
      const selectedRecommendations = recommendations.filter(doc => 
        selectedDocuments.includes(doc.id)
      );

      const generationContext = {
        companyName: companyDetails.companyName || `${tradeType} Company`,
        tradeType,
        businessDescription: companyDetails.businessDescription,
        services: companyDetails.services,
        contactInfo: companyDetails.contactInfo,
        branding: companyDetails.branding,
        certifications: companyDetails.certifications,
        yearEstablished: companyDetails.yearEstablished,
        specificAnswers
      };

      const response = await fetch('/api/generate-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          documents: selectedRecommendations,
          context: generationContext
        })
      });

      if (!response.ok) throw new Error('Failed to generate documents');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const generatedDocuments: any[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'progress') {
                  setGenerationProgress(data.progress);
                  setCurrentlyGenerating(data.currentDocument);
                } else if (data.type === 'document') {
                  generatedDocuments.push(data.document);
                } else if (data.type === 'complete') {
                  onComplete(generatedDocuments);
                  return;
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate documents. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'recommendations': return 25;
      case 'website': return 50;
      case 'details': return 75;
      case 'generating': return 100;
      default: return 0;
    }
  };

  const renderRecommendationsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Recommended Documents for {tradeType}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Based on your trade specialisation, we recommend these compliance documents. 
          Essential documents are pre-selected for immediate compliance needs.
        </p>
      </div>

      {/* Essential Documents */}
      <div>
        <h4 className="font-medium text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Essential Documents (Pre-selected)
        </h4>
        <div className="grid gap-3">
          {essentialDocs.map(doc => (
            <Card key={doc.id} className="border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox 
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => handleDocumentToggle(doc.id)}
                        id={doc.id}
                      />
                      <Label htmlFor={doc.id} className="font-medium cursor-pointer">
                        {doc.title}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {doc.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recommended Documents */}
      {recommendedDocs.length > 0 && (
        <div>
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-3">
            Additional Recommended Documents
          </h4>
          <div className="grid gap-3">
            {recommendedDocs.map(doc => (
              <Card key={doc.id} className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox 
                          checked={selectedDocuments.includes(doc.id)}
                          onCheckedChange={() => handleDocumentToggle(doc.id)}
                          id={doc.id}
                        />
                        <Label htmlFor={doc.id} className="font-medium cursor-pointer">
                          {doc.title}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {doc.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
        </p>
        <Button 
          onClick={() => setCurrentStep('website')}
          disabled={selectedDocuments.length === 0}
          className="ml-auto"
        >
          Next: Company Details
        </Button>
      </div>
    </div>
  );

  const renderWebsiteStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Company Website Analysis</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your company website and we'll automatically extract branding details, 
          services, and contact information to personalise your documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website URL
          </CardTitle>
          <CardDescription>
            We'll analyse your website to extract company branding and details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website">Company Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://your-company-website.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleWebsiteScraping}
              disabled={isScrapingWebsite || !websiteUrl.trim()}
              className="flex-1"
            >
              {isScrapingWebsite ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysing Website...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Analyse Website
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={skipWebsiteScraping}
              disabled={isScrapingWebsite}
            >
              Skip & Enter Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirm Company Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Review and complete your company information. This will be used to personalise 
          all generated documents with your branding and details.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={companyDetails.companyName || ''}
                onChange={(e) => setCompanyDetails(prev => ({
                  ...prev,
                  companyName: e.target.value
                }))}
                placeholder="Your Company Ltd"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="business-description">Business Description</Label>
              <Textarea
                id="business-description"
                value={companyDetails.businessDescription || ''}
                onChange={(e) => setCompanyDetails(prev => ({
                  ...prev,
                  businessDescription: e.target.value
                }))}
                placeholder="Brief description of your construction business"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={companyDetails.contactInfo?.address || ''}
                onChange={(e) => setCompanyDetails(prev => ({
                  ...prev,
                  contactInfo: {
                    ...prev.contactInfo,
                    address: e.target.value
                  }
                }))}
                placeholder="Full business address including postcode"
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services & Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Key Services</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {companyDetails.services?.map((service, index) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
              {(!companyDetails.services || companyDetails.services.length === 0) && (
                <p className="text-sm text-muted-foreground mt-2">
                  No services detected. You can add them manually if needed.
                </p>
              )}
            </div>

            <div>
              <Label>Current Certifications</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {companyDetails.certifications?.map((cert, index) => (
                  <Badge key={index} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
              {(!companyDetails.certifications || companyDetails.certifications.length === 0) && (
                <p className="text-sm text-muted-foreground mt-2">
                  No certifications detected. This is optional for document generation.
                </p>
              )}
            </div>

            {companyDetails.yearEstablished && (
              <div>
                <Label>Year Established</Label>
                <p className="mt-1 text-sm font-medium">{companyDetails.yearEstablished}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-details"
              checked={detailsConfirmed}
              onCheckedChange={(checked) => setDetailsConfirmed(!!checked)}
            />
            <Label htmlFor="confirm-details" className="cursor-pointer">
              I confirm that the above company details are accurate and can be used in the generated documents
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep('website')}>
          Back
        </Button>
        <Button 
          onClick={generateDocuments}
          disabled={!detailsConfirmed || !companyDetails.companyName?.trim()}
        >
          Generate Documents ({selectedDocuments.length})
        </Button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Generating Your Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Our AI is creating {selectedDocuments.length} professional compliance documents 
          tailored to your business. This may take a few minutes.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Generation Progress</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="h-3" />
            </div>
            
            {currentlyGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Currently generating: {currentlyGenerating}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              AI-Powered Document Generation
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Each document is being created with your specific trade requirements, 
              company branding, and UK compliance standards. You'll be able to review, 
              edit, and download them once generation is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>Document Recommendations & Generation</CardTitle>
          <CardDescription>
            AI-powered compliance document creation tailored to your trade
          </CardDescription>
          
          <div className="mt-4">
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Select Documents</span>
              <span>Website Analysis</span>
              <span>Company Details</span>
              <span>Generate</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {currentStep === 'recommendations' && renderRecommendationsStep()}
          {currentStep === 'website' && renderWebsiteStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'generating' && renderGeneratingStep()}
        </CardContent>
      </Card>
    </motion.div>
  );
}