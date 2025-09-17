import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Users,
  Zap,
  Database,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CardholderPhotoDisplay } from "./CardholderPhotoDisplay";

interface CSCSRPAVerificationProps {
  companyId: string;
}

interface RPAResult {
  cardNumber: string;
  status: 'valid' | 'expired' | 'revoked' | 'invalid' | 'not_found' | 'error';
  holderName?: string;
  cardType?: string;
  expiryDate?: string;
  scheme?: string;
  errorMessage?: string;
  verificationTimestamp: string;
  holderPhotoUrl?: string;
  holderPhotoBase64?: string;
  cardImageUrl?: string;
  cardImageBase64?: string;
  savedPhotoUrl?: string;
}

export function CSCSRPAVerification({ companyId }: CSCSRPAVerificationProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [scheme, setScheme] = useState('CSCS');
  const [batchCardNumbers, setBatchCardNumbers] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [rpaResult, setRpaResult] = useState<RPAResult | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const { toast } = useToast();

  const testRPAConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('/api/test-rpa-connection');
      const result = await response.json();
      setConnectionStatus(result);
      
      toast({
        title: result.connected ? "RPA Connection Success" : "RPA Connection Failed",
        description: result.connected 
          ? "Successfully connected to cscssmartcheck.co.uk" 
          : "Could not connect to CSCS website",
        variant: result.connected ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Error testing RPA connection",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const verifySingleCard = async () => {
    if (!cardNumber.trim()) {
      toast({
        title: "Card Number Required",
        description: "Please enter a CSCS card number for RPA verification.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/verify-cscs-rpa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: cardNumber.trim(), scheme })
      });

      if (!response.ok) throw new Error('RPA verification failed');
      
      const result = await response.json();
      setRpaResult(result);
      
      toast({
        title: "RPA Verification Complete",
        description: `Automated check completed - Status: ${result.status.toUpperCase()}`,
        variant: result.status === 'valid' ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "RPA Verification Error",
        description: "Automated verification failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyBatchCards = async () => {
    const cardNumbers = batchCardNumbers
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (cardNumbers.length === 0) {
      toast({
        title: "No Card Numbers",
        description: "Please enter card numbers for batch verification.",
        variant: "destructive"
      });
      return;
    }

    setIsBatchVerifying(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/verify-cscs-batch-rpa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumbers, scheme })
      });

      if (!response.ok) throw new Error('Batch RPA verification failed');
      
      const result = await response.json();
      setBatchResults(result);
      
      toast({
        title: "Batch RPA Verification Complete",
        description: `Verified ${result.summary.successful}/${result.summary.total} cards`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Batch Verification Error",
        description: "Batch automated verification failed.",
        variant: "destructive"
      });
    } finally {
      setIsBatchVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expired': return <Clock className="h-5 w-5 text-amber-600" />;
      case 'revoked': case 'invalid': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'not_found': return <AlertTriangle className="h-5 w-5 text-gray-600" />;
      default: return <Bot className="h-5 w-5 text-blue-600" />;
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

  return (
    <div className="space-y-6">
      {/* RPA System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-6 w-6 mr-2 text-blue-600" />
            Automated CSCS Verification (RPA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-blue-800">
                    <p className="font-semibold mb-1">RPA Automation</p>
                    <p className="text-sm">
                      Automated robots interact directly with cscssmartcheck.co.uk to verify cards 
                      without manual intervention.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">RPA Capabilities:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Direct website automation</li>
                  <li>• Batch processing support</li>
                  <li>• Real-time result parsing</li>
                  <li>• Error handling & retry logic</li>
                  <li>• Audit trail generation</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={testRPAConnection}
                disabled={isTestingConnection}
                variant="outline"
                className="w-full"
              >
                {isTestingConnection ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Testing RPA Connection...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Test RPA Connection
                  </>
                )}
              </Button>

              {connectionStatus && (
                <div className={`p-3 rounded-lg border ${
                  connectionStatus.connected 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {connectionStatus.connected ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      connectionStatus.connected ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {connectionStatus.connected ? 'Connected' : 'Connection Failed'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    connectionStatus.connected ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {connectionStatus.connected 
                      ? 'RPA can access cscssmartcheck.co.uk'
                      : connectionStatus.error || 'Unable to reach CSCS website'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single Card RPA Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Single Card RPA Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cardNumber">CSCS Card Number</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Enter card number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="scheme">CSCS Scheme</Label>
              <Select value={scheme} onValueChange={setScheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSCS">CSCS</SelectItem>
                  <SelectItem value="JIB">JIB</SelectItem>
                  <SelectItem value="CPCS">CPCS</SelectItem>
                  <SelectItem value="NPORS">NPORS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={verifySingleCard}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Bot className="h-4 w-4 mr-2 animate-spin" />
                    RPA Verifying...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Verify with RPA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single Card Results */}
      {rpaResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(rpaResult.status)}
                <span className="ml-2">RPA Verification Result</span>
              </div>
              <Badge className={`${getStatusColor(rpaResult.status)} border`}>
                {rpaResult.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Card Number</Label>
                <p className="text-lg font-mono">{rpaResult.cardNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Verification Time</Label>
                <p className="text-lg">{new Date(rpaResult.verificationTimestamp).toLocaleString()}</p>
              </div>
            </div>

            {rpaResult.holderName && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Cardholder Name</Label>
                <p className="text-lg">{rpaResult.holderName}</p>
              </div>
            )}

            {rpaResult.errorMessage && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm">{rpaResult.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cardholder Photo Display */}
      {rpaResult && (
        <CardholderPhotoDisplay
          cardNumber={rpaResult.cardNumber}
          holderName={rpaResult.holderName}
          holderPhotoUrl={rpaResult.holderPhotoUrl}
          holderPhotoBase64={rpaResult.holderPhotoBase64}
          savedPhotoUrl={rpaResult.savedPhotoUrl}
          cardImageUrl={rpaResult.cardImageUrl}
          cardImageBase64={rpaResult.cardImageBase64}
          verificationStatus={rpaResult.status}
        />
      )}

      {/* Batch RPA Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Batch RPA Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="batchCards">Card Numbers (one per line)</Label>
            <Textarea
              id="batchCards"
              value={batchCardNumbers}
              onChange={(e) => setBatchCardNumbers(e.target.value)}
              placeholder="12345678&#10;87654321&#10;11223344"
              className="mt-1 h-32"
            />
          </div>

          <Button
            onClick={verifyBatchCards}
            disabled={isBatchVerifying}
            className="w-full"
          >
            {isBatchVerifying ? (
              <>
                <Bot className="h-4 w-4 mr-2 animate-spin" />
                Batch RPA Processing...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Verify Batch with RPA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Batch Results */}
      {batchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Batch RPA Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{batchResults.summary.total}</p>
                <p className="text-sm text-blue-800">Total Cards</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{batchResults.summary.successful}</p>
                <p className="text-sm text-green-800">Successful</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{batchResults.summary.errors}</p>
                <p className="text-sm text-red-800">Errors</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Individual Results:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {batchResults.results.map((result: RPAResult, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono text-sm">{result.cardNumber}</span>
                    <Badge className={`${getStatusColor(result.status)} border text-xs`}>
                      {result.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RPA Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle>RPA Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">How RPA Works:</h4>
              <ul className="text-sm space-y-1">
                <li>• Puppeteer browser automation</li>
                <li>• Form field population</li>
                <li>• reCAPTCHA handling (where possible)</li>
                <li>• Result parsing & extraction</li>
                <li>• Error detection & recovery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Limitations:</h4>
              <ul className="text-sm space-y-1">
                <li>• Subject to website changes</li>
                <li>• reCAPTCHA may block automation</li>
                <li>• Rate limiting by CSCS</li>
                <li>• Network connectivity required</li>
                <li>• Slower than direct API access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}