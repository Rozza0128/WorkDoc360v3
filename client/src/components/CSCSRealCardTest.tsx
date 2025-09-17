import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Bot, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Camera,
  Download,
  FileImage
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CardholderPhotoDisplay } from "./CardholderPhotoDisplay";

export function CSCSRealCardTest() {
  // Pre-fill with extracted card number from the uploaded image
  const [cardNumber, setCardNumber] = useState('JW027401');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toast } = useToast();

  const verifyRealCard = async () => {
    if (!cardNumber.trim()) {
      toast({
        title: "Card Number Required",
        description: "Please enter the CSCS card number from your uploaded card",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      toast({
        title: "Starting Real RPA Verification",
        description: "Connecting to cscssmartcheck.co.uk with your card number...",
        variant: "default"
      });

      const response = await fetch('/api/test-rpa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cardNumber: cardNumber.trim(), 
          scheme: 'CSCS' 
        })
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const result = await response.json();
      setVerificationResult(result);

      toast({
        title: "Real RPA Verification Complete",
        description: `Status: ${result.status.toUpperCase()}${result.holderPhotoBase64 ? ' - Photo extracted!' : ''}`,
        variant: result.status === 'valid' ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Real RPA verification error:', error);
      toast({
        title: "RPA Verification Failed",
        description: "Could not connect to CSCS verification system",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expired': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'revoked': case 'invalid': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Bot className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800 border-green-300';
      case 'expired': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'revoked': case 'invalid': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Card Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-green-600" />
            Your Real CSCS Card - RPA Verification Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Image */}
            <div>
              <h4 className="font-semibold mb-3">Your Uploaded Green CSCS Card:</h4>
              <img 
                src="/attached_assets/IMG-20250721-WA0000_1753362174747.jpg"
                alt="Green CSCS Scaffolding Labourer Card"
                className="w-full max-w-md rounded-lg border shadow-lg"
              />
              <div className="mt-3 space-y-2">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Green CSCS Scaffolding Labourer
                </Badge>
                <p className="text-sm text-gray-600">
                  <strong>Features Visible:</strong> Photo ID, Security watermarks, TESTED marking, Professional layout
                </p>
              </div>
            </div>

            {/* Verification Input */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Real RPA Verification:</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Enter your card number to run actual RPA verification against the official CSCS database.
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Automated browser visits cscssmartcheck.co.uk</li>
                  <li>• Enters your card number automatically</li>
                  <li>• Extracts real verification results</li>
                  <li>• Downloads cardholder photo if available</li>
                  <li>• Saves to company photo archive</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="realCardNumber">CSCS Card Number</Label>
                  <Input
                    id="realCardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Enter card number from your uploaded card"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Card number extracted from your uploaded image: JW027401
                  </p>
                </div>

                <Button
                  onClick={verifyRealCard}
                  disabled={isVerifying}
                  className="w-full"
                  size="lg"
                >
                  {isVerifying ? (
                    <>
                      <Bot className="h-4 w-4 mr-2 animate-spin" />
                      RPA Verifying Real Card...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Verify Real Card with RPA
                    </>
                  )}
                </Button>
              </div>

              {isVerifying && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm">
                    <Bot className="h-4 w-4 inline mr-1" />
                    Real RPA automation in progress... Connecting to official CSCS verification system.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Verification Results */}
      {verificationResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(verificationResult.status)}
                  <span className="ml-2">Real CSCS Verification Results</span>
                </div>
                <Badge className={`${getStatusColor(verificationResult.status)} border`}>
                  {verificationResult.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Official CSCS Database Results:</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Card Number:</span> <span className="font-mono">{verificationResult.cardNumber}</span></p>
                    {verificationResult.holderName && (
                      <p><span className="text-gray-600">Cardholder:</span> {verificationResult.holderName}</p>
                    )}
                    {verificationResult.cardType && (
                      <p><span className="text-gray-600">Card Type:</span> {verificationResult.cardType}</p>
                    )}
                    {verificationResult.expiryDate && (
                      <p><span className="text-gray-600">Expiry:</span> {verificationResult.expiryDate}</p>
                    )}
                    <p><span className="text-gray-600">Verified:</span> {new Date(verificationResult.verificationTimestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">RPA Process Results:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Connected to cscssmartcheck.co.uk
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Card verification completed
                    </div>
                    {verificationResult.holderPhotoBase64 && (
                      <div className="flex items-center text-sm text-green-600">
                        <Camera className="h-4 w-4 mr-2" />
                        Cardholder photo extracted
                      </div>
                    )}
                    {verificationResult.savedPhotoUrl && (
                      <div className="flex items-center text-sm text-green-600">
                        <FileImage className="h-4 w-4 mr-2" />
                        Photo saved to archive
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {verificationResult.errorMessage && (
                <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">{verificationResult.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real Photo Display */}
          {(verificationResult.holderPhotoBase64 || verificationResult.cardImageBase64) && (
            <CardholderPhotoDisplay
              cardNumber={verificationResult.cardNumber}
              holderName={verificationResult.holderName}
              holderPhotoUrl={verificationResult.holderPhotoUrl}
              holderPhotoBase64={verificationResult.holderPhotoBase64}
              savedPhotoUrl={verificationResult.savedPhotoUrl}
              cardImageUrl={verificationResult.cardImageUrl}
              cardImageBase64={verificationResult.cardImageBase64}
              verificationStatus={verificationResult.status}
            />
          )}
        </>
      )}

      {/* Real Verification Info */}
      <Card>
        <CardHeader>
          <CardTitle>Real CSCS Verification Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">What This Tests:</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Actual RPA Connection:</strong> Real browser automation</li>
                <li>• <strong>Official CSCS Database:</strong> Live verification against cscssmartcheck.co.uk</li>
                <li>• <strong>Real Photo Extraction:</strong> Downloads actual cardholder photos</li>
                <li>• <strong>Live Results:</strong> Genuine card status from CSCS</li>
                <li>• <strong>Complete Workflow:</strong> End-to-end verification process</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Expected Results:</h4>
              <ul className="text-sm space-y-1">
                <li>• Card status (Valid/Expired/Revoked)</li>
                <li>• Cardholder name and details</li>
                <li>• Card type and scheme information</li>
                <li>• Extracted cardholder photo (if available)</li>
                <li>• Verification timestamp and audit trail</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm">
              <strong>Real Verification:</strong> This uses actual RPA automation to verify your card 
              against the official CSCS database and extract real cardholder photos for compliance records.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}