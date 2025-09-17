import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Globe, Search, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSCSOnlineVerificationProps {
  companyId: string;
  onCardVerified?: (cardData: any) => void;
}

interface OnlineVerificationResult {
  cardNumber: string;
  holderName: string;
  cardType: string;
  expiryDate: string;
  issueDate: string;
  status: 'valid' | 'expired' | 'revoked' | 'invalid' | 'not_found';
  tradeQualification: string;
  scheme: string;
  verificationSource: 'cscs_smart_check' | 'cscs_alliance' | 'mock_demo';
  lastUpdated: string;
  cardColour: string;
  qualificationLevel: string;
}

export function CSCSOnlineVerification({ companyId, onCardVerified }: CSCSOnlineVerificationProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<OnlineVerificationResult | null>(null);
  const { toast } = useToast();

  const verifyCardOnline = async () => {
    if (!cardNumber.trim()) {
      toast({
        title: "Card Number Required",
        description: "Please enter a CSCS card number to verify online.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Call our backend which interfaces with CSCS Smart Check API
      const response = await fetch(`/api/companies/${companyId}/verify-cscs-online`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: cardNumber.trim(),
          holderName: holderName.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Online verification failed');
      }

      const result = await response.json();
      setVerificationResult(result);

      // If card is valid, add to compliance tracking
      if (onCardVerified && result.status === 'valid') {
        onCardVerified(result);
      }

      toast({
        title: "Online Verification Complete",
        description: `CSCS database check completed - Status: ${result.status.toUpperCase()}`,
        variant: result.status === 'valid' ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Online verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify card online. Please check the card number and try again.",
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
      case 'not_found': return <AlertTriangle className="h-5 w-5 text-gray-600" />;
      default: return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800 border-green-300';
      case 'expired': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'revoked': case 'invalid': return 'bg-red-100 text-red-800 border-red-300';
      case 'not_found': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getCardColourBadge = (colour: string) => {
    const colourMap: { [key: string]: string } = {
      'green': 'bg-green-500 text-white',
      'red': 'bg-red-500 text-white',
      'blue': 'bg-blue-500 text-white',
      'gold': 'bg-yellow-500 text-black',
      'black': 'bg-black text-white',
      'white': 'bg-gray-100 text-black border border-gray-300'
    };
    
    return colourMap[colour.toLowerCase()] || 'bg-gray-500 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Online Verification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            CSCS Smart Check Online Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardNumber">CSCS Card Number *</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Enter CSCS card number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="holderName">Cardholder Name (Optional)</Label>
              <Input
                id="holderName"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Enter cardholder name"
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>CSCS Smart Check:</strong> Real-time verification against the official CSCS database 
              covering 2.3+ million cards across all 38 CSCS Alliance schemes.
            </p>
          </div>

          <Button
            onClick={verifyCardOnline}
            disabled={isVerifying || !cardNumber.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Verifying with CSCS Database...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Verify Card Online
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(verificationResult.status)}
                <span className="ml-2">Online Verification Results</span>
              </div>
              <Badge className={`${getStatusColor(verificationResult.status)} border`}>
                {verificationResult.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Card Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getCardColourBadge(verificationResult.cardColour)}>
                      {verificationResult.cardColour.toUpperCase()}
                    </Badge>
                    <span className="text-lg">{verificationResult.cardType}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Issue Date</Label>
                  <p className="text-lg">{verificationResult.issueDate}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                  <p className="text-lg font-semibold">{verificationResult.expiryDate}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Trade Qualification</Label>
                  <p className="text-lg">{verificationResult.tradeQualification}</p>
                </div>
              </div>
            </div>

            {/* Scheme Information */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">CSCS Scheme</Label>
                  <p className="text-lg">{verificationResult.scheme}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Qualification Level</Label>
                  <p className="text-lg">{verificationResult.qualificationLevel}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-lg">{verificationResult.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Status-specific alerts */}
            {verificationResult.status === 'expired' && (
              <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Card Expired</h4>
                    <p className="text-amber-700 text-sm">
                      This CSCS card expired on {verificationResult.expiryDate}. The cardholder must renew 
                      before being permitted on construction sites.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationResult.status === 'revoked' && (
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Card Revoked</h4>
                    <p className="text-red-700 text-sm">
                      This CSCS card has been revoked and is no longer valid. Contact CSCS for more information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationResult.status === 'not_found' && (
              <div className="border-l-4 border-gray-500 bg-gray-50 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Card Not Found</h4>
                    <p className="text-gray-700 text-sm">
                      This card number was not found in the CSCS database. Please verify the number and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationResult.status === 'valid' && (
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">Valid CSCS Card</h4>
                    <p className="text-green-700 text-sm">
                      This card is valid and the cardholder is authorised for construction site access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Source */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Verification Source: {verificationResult.verificationSource.replace('_', ' ').toUpperCase()}</span>
                <span>Verified at: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}