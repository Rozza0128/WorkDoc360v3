import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Camera, Upload, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSCSImageVerificationProps {
  companyId: string;
  onCardVerified?: (cardData: any) => void;
}

interface VerificationResult {
  cardNumber: string;
  holderName: string;
  cardType: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'revoked' | 'invalid';
  tradeQualification: string;
  testDate: string;
  imageAnalysis: {
    cardTypeDetected: string;
    securityFeatures: string[];
    visualAuthenticity: 'genuine' | 'suspicious' | 'invalid';
  };
}

export function CSCSImageVerification({ companyId, onCardVerified }: CSCSImageVerificationProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [manualCardNumber, setManualCardNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationMode, setVerificationMode] = useState<'image' | 'manual'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeCardImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select a CSCS card image to verify.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Convert image to base64 for analysis
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('companyId', companyId);

      const response = await fetch(`/api/companies/${companyId}/verify-cscs-image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Image verification failed');
      }

      const result = await response.json();
      setVerificationResult(result);

      if (onCardVerified && result.status === 'valid') {
        onCardVerified(result);
      }

      toast({
        title: "Card Verified",
        description: `CSCS card verification completed - Status: ${result.status.toUpperCase()}`,
        variant: result.status === 'valid' ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Image verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify CSCS card image. Please try manual entry.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyManualEntry = async () => {
    if (!manualCardNumber.trim()) {
      toast({
        title: "Card Number Required",
        description: "Please enter a CSCS card number to verify.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`/api/companies/${companyId}/verify-cscs-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: manualCardNumber,
          verificationType: 'manual'
        })
      });

      if (!response.ok) {
        throw new Error('Manual verification failed');
      }

      const result = await response.json();
      setVerificationResult(result);

      if (onCardVerified && result.status === 'valid') {
        onCardVerified(result);
      }

      toast({
        title: "Card Verified",
        description: `CSCS card verification completed - Status: ${result.status.toUpperCase()}`,
        variant: result.status === 'valid' ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Manual verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify CSCS card. Please check the card number and try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expired': return <Clock className="h-5 w-5 text-amber-600" />;
      case 'revoked': case 'invalid': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-amber-100 text-amber-800';
      case 'revoked': case 'invalid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Mode Selection */}
      <div className="flex space-x-4">
        <Button
          variant={verificationMode === 'image' ? 'default' : 'outline'}
          onClick={() => setVerificationMode('image')}
          className="flex items-center"
        >
          <Camera className="h-4 w-4 mr-2" />
          Image Upload
        </Button>
        <Button
          variant={verificationMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setVerificationMode('manual')}
          className="flex items-center"
        >
          <Eye className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>

      {/* Image Upload Mode */}
      {verificationMode === 'image' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              CSCS Card Image Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="CSCS Card Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
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
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSCS Card Image
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a clear photo of the front of the CSCS card
                    </p>
                  </div>
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

            {selectedImage && (
              <Button
                onClick={analyzeCardImage}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? 'Analyzing Card...' : 'Verify CSCS Card'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Entry Mode */}
      {verificationMode === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Manual CSCS Card Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">CSCS Card Number</Label>
              <Input
                id="cardNumber"
                value={manualCardNumber}
                onChange={(e) => setManualCardNumber(e.target.value)}
                placeholder="Enter CSCS card number"
                className="mt-1"
              />
            </div>

            <Button
              onClick={verifyManualEntry}
              disabled={isVerifying || !manualCardNumber.trim()}
              className="w-full"
            >
              {isVerifying ? 'Verifying Card...' : 'Verify CSCS Card'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Results */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(verificationResult.status)}
              <span className="ml-2">Verification Results</span>
              <Badge className={`ml-auto ${getStatusColor(verificationResult.status)}`}>
                {verificationResult.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Cardholder Name</Label>
                <p className="text-lg font-semibold">{verificationResult.holderName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Card Number</Label>
                <p className="text-lg font-mono">{verificationResult.cardNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Card Type</Label>
                <p className="text-lg">{verificationResult.cardType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Trade Qualification</Label>
                <p className="text-lg">{verificationResult.tradeQualification}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Test Date</Label>
                <p className="text-lg">{verificationResult.testDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                <p className="text-lg font-semibold">{verificationResult.expiryDate}</p>
              </div>
            </div>

            {verificationResult.imageAnalysis && verificationMode === 'image' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Image Analysis Results</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Card Type Detected</Label>
                    <p>{verificationResult.imageAnalysis.cardTypeDetected}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Visual Authenticity</Label>
                    <Badge className={`ml-2 ${
                      verificationResult.imageAnalysis.visualAuthenticity === 'genuine' 
                        ? 'bg-green-100 text-green-800'
                        : verificationResult.imageAnalysis.visualAuthenticity === 'suspicious'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {verificationResult.imageAnalysis.visualAuthenticity.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Security Features</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {verificationResult.imageAnalysis.securityFeatures.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {verificationResult.status !== 'valid' && (
              <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-50">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Card Validation Issue</h4>
                    <p className="text-red-700 text-sm mt-1">
                      This CSCS card {verificationResult.status === 'expired' ? 'has expired' : 
                        verificationResult.status === 'revoked' ? 'has been revoked' : 'is not valid'}.
                      The cardholder should not be permitted on site until a valid card is provided.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}