import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentRecommendationsWizard } from '@/components/DocumentRecommendationsWizard';
import { ArrowLeft, FileText, Shield, Building2, Sparkles } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  tradeType: string;
}

export default function DocumentRecommendationsPage() {
  const [location, navigate] = useLocation();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Fetch user's companies
  const { data: companies, isLoading } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    }
  });

  // Auto-select first company if only one exists
  useEffect(() => {
    if (companies && companies.length === 1 && !selectedCompany) {
      setSelectedCompany(companies[0]);
    }
  }, [companies, selectedCompany]);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setShowWizard(true);
  };

  const handleWizardComplete = (generatedDocuments: any[]) => {
    console.log('Generated documents:', generatedDocuments);
    navigate('/dashboard?tab=Documents');
  };

  if (showWizard && selectedCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setShowWizard(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Company Selection
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Document Generation</h1>
              <p className="text-muted-foreground">
                Creating compliance documents for {selectedCompany.name}
              </p>
            </div>
          </div>

          <DocumentRecommendationsWizard
            companyId={selectedCompany.id}
            tradeType={selectedCompany.tradeType}
            onComplete={handleWizardComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              AI Document Generation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate professional compliance documents tailored to your trade with 
            AI-powered branding integration and UK construction standards.
          </p>
        </motion.div>

        {/* Company Selection */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-3 text-muted-foreground">Loading companies...</span>
                </div>
              </CardContent>
            </Card>
          ) : companies && companies.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Select Company</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {companies.map((company: Company, index: number) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600"
                      onClick={() => handleCompanySelect(company)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Building2 className="h-6 w-6 text-orange-600" />
                          {company.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {company.tradeType.replace('_', ' ')}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            ISO 9001 & Health & Safety compliance
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Trade-specific document recommendations
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                            AI-powered branding integration
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
                          onClick={() => handleCompanySelect(company)}
                        >
                          Generate Documents
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardContent className="p-8 text-center">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Companies Found</h3>
                  <p className="text-muted-foreground mb-6">
                    You need to create a company before generating documents.
                  </p>
                  <Button onClick={() => navigate('/onboarding')}>
                    Create Company
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-6xl mx-auto mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">
            AI-Powered Document Generation Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Website Scraping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically extract company branding, services, and contact details 
                  from your website to personalise all generated documents.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Trade-Specific Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Documents tailored to your specific trade with relevant UK regulations, 
                  industry standards, and compliance requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Professional Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Audit-ready documents with proper structure, legal compliance, 
                  and professional presentation suitable for client work.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}