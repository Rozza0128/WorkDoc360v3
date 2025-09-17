import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  Upload, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Scan,
  Database,
  Eye
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AIVerificationResult {
  imageAnalysis: {
    cardNumber: string | null;
    holderName: string | null;
    cardType: string | null;
    expiryDate: string | null;
    cardColour: string | null;
    securityFeatures: {
      hologramPresent: boolean;
      correctFont: boolean;
      properLayout: boolean;
      validQRCode: boolean | null;
    };
    qualityScore: number;
    fraudIndicators: string[];
    extractedText: string;
  };
  registerCheck: {
    cardNumber: string;
    isRegistered: boolean;
    holderName: string | null;
    validUntil: string | null;
    cardStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'NOT_FOUND';
    lastVerified: string;
  } | null;
  overallResult: {
    isValid: boolean;
    cardNumber: string;
    holderName?: string;
    cardType?: string;
    expiryDate?: string;
    status: 'VALID' | 'EXPIRED' | 'SUSPENDED' | 'NOT_FOUND' | 'INVALID';
    lastChecked: string;
    verificationMethod: string;
    warnings?: string[];
    recommendations?: string[];
  };
}

interface FraudAssessmentResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  riskFactors: string[];
  recommendations: string[];
}

export function CSCSCardVerifier() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [manualCardNumber, setManualCardNumber] = useState('');
  const [manualHolderName, setManualHolderName] = useState('');

  const aiVerificationMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await apiRequest('POST', '/api/verify-card-image', { imageBase64 });
      return response.json() as Promise<AIVerificationResult>;
    },
    onError: (error: Error) => {
      toast({
        title: "AI Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const manualVerificationMutation = useMutation({
    mutationFn: async ({ cardNumber, holderName }: { cardNumber: string; holderName?: string }) => {
      const response = await apiRequest('POST', '/api/check-cscs-register', { cardNumber, holderName });
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Manual Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fraudAssessmentMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await apiRequest('POST', '/api/assess-card-fraud', { imageBase64 });
      return response.json() as Promise<{ fraudAssessment: FraudAssessmentResult }>;
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIVerification = () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload a CSCS card image first",
        variant: "destructive",
      });
      return;
    }

    aiVerificationMutation.mutate(selectedImage);
    if (selectedImage) {
      fraudAssessmentMutation.mutate(selectedImage);
    }
  };

  const handleManualVerification = () => {
    if (!manualCardNumber) {
      toast({
        title: "Card Number Required",
        description: "Please enter a CSCS card number",
        variant: "destructive",
      });
      return;
    }

    manualVerificationMutation.mutate({ 
      cardNumber: manualCardNumber, 
      holderName: manualHolderName || undefined 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'EXPIRED':
        return 'text-yellow-600 bg-yellow-50';
      case 'SUSPENDED':
      case 'INVALID':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-construction-orange" />
            <span>AI-Powered CSCS Card Verification</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Advanced verification using AI image analysis and official register checking
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="ai-verification" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-verification" className="flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span>AI Image Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="manual-verification" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Manual Register Check</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Image Verification */}
        <TabsContent value="ai-verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload CSCS Card Image</CardTitle>
              <p className="text-sm text-gray-600">
                Take a clear photo of the CSCS card or upload an existing image
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {selectedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={selectedImage} 
                      alt="CSCS Card"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Upload CSCS Card Image</p>
                      <p className="text-sm text-gray-600">
                        Support for JPG, PNG images up to 10MB
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Select Image
                    </Button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <Button 
                onClick={handleAIVerification}
                disabled={!selectedImage || aiVerificationMutation.isPending}
                className="w-full"
              >
                {aiVerificationMutation.isPending ? (
                  <>
                    <Scan className="h-4 w-4 mr-2 animate-spin" />
                    Analysing Card...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Verify with AI Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Verification Results */}
          {aiVerificationMutation.data && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>AI Analysis Results</span>
                    <Badge className={getStatusColor(aiVerificationMutation.data.overallResult.status)}>
                      {aiVerificationMutation.data.overallResult.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Quality */}
                  <div>
                    <Label>Image Quality Score</Label>
                    <Progress 
                      value={aiVerificationMutation.data.imageAnalysis.qualityScore} 
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      {aiVerificationMutation.data.imageAnalysis.qualityScore}% quality
                    </p>
                  </div>

                  {/* Extracted Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Card Number</Label>
                      <p className="font-mono text-sm">
                        {aiVerificationMutation.data.imageAnalysis.cardNumber || 'Not detected'}
                      </p>
                    </div>
                    <div>
                      <Label>Holder Name</Label>
                      <p className="text-sm">
                        {aiVerificationMutation.data.imageAnalysis.holderName || 'Not detected'}
                      </p>
                    </div>
                    <div>
                      <Label>Card Type</Label>
                      <p className="text-sm">
                        {aiVerificationMutation.data.imageAnalysis.cardType || 'Not detected'}
                      </p>
                    </div>
                    <div>
                      <Label>Expiry Date</Label>
                      <p className="text-sm">
                        {aiVerificationMutation.data.imageAnalysis.expiryDate || 'Not detected'}
                      </p>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div>
                    <Label>Security Features</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        {aiVerificationMutation.data.imageAnalysis.securityFeatures.hologramPresent ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Hologram</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {aiVerificationMutation.data.imageAnalysis.securityFeatures.correctFont ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Correct Font</span>
                      </div>
                    </div>
                  </div>

                  {/* Warnings and Recommendations */}
                  {aiVerificationMutation.data.overallResult.warnings && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {aiVerificationMutation.data.overallResult.warnings.map((warning, index) => (
                            <p key={index} className="text-sm">• {warning}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Fraud Risk Assessment */}
              {fraudAssessmentMutation.data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Fraud Risk Assessment</span>
                      <Badge className={getRiskColor(fraudAssessmentMutation.data.fraudAssessment.riskLevel)}>
                        {fraudAssessmentMutation.data.fraudAssessment.riskLevel} RISK
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Risk Score</Label>
                      <Progress 
                        value={fraudAssessmentMutation.data.fraudAssessment.riskScore} 
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        {fraudAssessmentMutation.data.fraudAssessment.riskScore}/100 risk points
                      </p>
                    </div>

                    {fraudAssessmentMutation.data.fraudAssessment.riskFactors.length > 0 && (
                      <div>
                        <Label>Risk Factors</Label>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          {fraudAssessmentMutation.data.fraudAssessment.riskFactors.map((factor, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <Label>Recommendations</Label>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        {fraudAssessmentMutation.data.fraudAssessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Manual Verification */}
        <TabsContent value="manual-verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manual CSCS Register Check</CardTitle>
              <p className="text-sm text-gray-600">
                Check card details against the official CSCS register
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    value={manualCardNumber}
                    onChange={(e) => setManualCardNumber(e.target.value)}
                    placeholder="Enter CSCS card number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="holderName">Holder Name (Optional)</Label>
                  <Input
                    id="holderName"
                    value={manualHolderName}
                    onChange={(e) => setManualHolderName(e.target.value)}
                    placeholder="Enter card holder name"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleManualVerification}
                disabled={!manualCardNumber || manualVerificationMutation.isPending}
                className="w-full"
              >
                {manualVerificationMutation.isPending ? (
                  <>
                    <Database className="h-4 w-4 mr-2 animate-spin" />
                    Checking Register...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Check CSCS Register
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Verification Results */}
          {manualVerificationMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Register Check Results</span>
                  <Badge className={getStatusColor(manualVerificationMutation.data.status)}>
                    {manualVerificationMutation.data.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Card Number</Label>
                    <p className="font-mono text-sm">
                      {manualVerificationMutation.data.cardNumber}
                    </p>
                  </div>
                  <div>
                    <Label>Verification Method</Label>
                    <p className="text-sm">
                      {manualVerificationMutation.data.verificationMethod}
                    </p>
                  </div>
                  {manualVerificationMutation.data.holderName && (
                    <div>
                      <Label>Holder Name</Label>
                      <p className="text-sm">
                        {manualVerificationMutation.data.holderName}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label>Last Checked</Label>
                    <p className="text-sm">
                      {new Date(manualVerificationMutation.data.lastChecked).toLocaleString()}
                    </p>
                  </div>
                </div>

                {manualVerificationMutation.data.recommendations && (
                  <div>
                    <Label>Recommendations</Label>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      {manualVerificationMutation.data.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}