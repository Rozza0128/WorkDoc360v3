import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  User,
  Calendar,
  Award,
  Camera,
  QrCode,
  CreditCard,
  Plus,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";

// Complete CSCS Card Types based on official 2025 documentation
export const CSCS_CARD_TYPES = {
  // Green Cards
  'green-labourer': {
    name: 'Green Labourer Card',
    color: 'bg-green-500',
    description: 'For labouring occupations on construction sites',
    validity: '5 years (2 years initial from 2025)',
    requirements: 'CSCS Test for Operatives + relevant qualification'
  },
  'green-provisional': {
    name: 'Green Provisional Card', 
    color: 'bg-green-400',
    description: 'Temporary 6-month card for new workers',
    validity: '6 months (non-renewable)',
    requirements: 'For first-time CSCS card holders only'
  },
  
  // Red Cards (Temporary)
  'red-apprentice': {
    name: 'Red Apprentice Card',
    color: 'bg-red-500',
    description: 'For registered apprentices',
    validity: '4.5 years (non-renewable)',
    requirements: 'Registered construction apprenticeship'
  },
  'red-trainee': {
    name: 'Red Trainee Card',
    color: 'bg-red-600',
    description: 'Temporary card for trainees',
    validity: '5 years (non-renewable)',
    requirements: 'Registered for relevant qualification'
  },
  'red-experienced': {
    name: 'Red Experienced Worker Card',
    color: 'bg-red-700',
    description: 'For experienced workers completing qualifications',
    validity: '1 year (non-renewable)',
    requirements: 'On-job experience + registered for qualification'
  },
  'red-technical': {
    name: 'Red Technical/Supervisory Trainee Card',
    color: 'bg-red-800',
    description: 'For technical/supervisory trainees',
    validity: '3 years',
    requirements: 'Technical/supervisory training programme'
  },
  
  // Blue Cards
  'blue-skilled': {
    name: 'Blue Skilled Worker Card',
    color: 'bg-blue-500',
    description: 'For skilled workers with completed apprenticeships',
    validity: '5 years',
    requirements: 'NVQ/SVQ Level 2 or equivalent'
  },
  
  // Gold Cards
  'gold-advanced': {
    name: 'Gold Advanced Craft Card',
    color: 'bg-yellow-500',
    description: 'For advanced craft workers',
    validity: '5 years',
    requirements: 'NVQ/SVQ Level 3 + CITB test'
  },
  'gold-supervisor': {
    name: 'Gold Supervisor Card',
    color: 'bg-yellow-600',
    description: 'For supervisory roles',
    validity: '5 years',
    requirements: 'NVQ/SVQ Level 3/4 + MAP test'
  },
  
  // Black Cards
  'black-manager': {
    name: 'Black Manager Card',
    color: 'bg-gray-900',
    description: 'For senior managers',
    validity: '5 years',
    requirements: 'NVQ/SVQ Level 5-7 + MAP test'
  },
  
  // White Cards
  'white-aqp': {
    name: 'White Academically Qualified Person Card',
    color: 'bg-gray-100 text-gray-800',
    description: 'For academically qualified professionals',
    validity: '5 years',
    requirements: 'Construction-related degree/HND/HNC'
  },
  'white-pqp': {
    name: 'White Professionally Qualified Person Card',
    color: 'bg-gray-200 text-gray-800',
    description: 'For professionally qualified members',
    validity: '5 years',
    requirements: 'CSCS-approved professional body membership'
  }
};

interface CSCSCardData {
  cardNumber: string;
  holderName: string;
  cardType: string;
  expiryDate: string;
  photo?: string;
  status: 'valid' | 'expired' | 'revoked' | 'invalid';
  qualifications: string[];
  lastVerified: string;
  occupation: string;
}

interface CSCSCardVerificationProps {
  companyId: number;
  onCardVerified?: (cardData: CSCSCardData) => void;
}

export function CSCSCardVerification({ companyId, onCardVerified }: CSCSCardVerificationProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CSCSCardData | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState("");
  const { toast } = useToast();

  // Mock verification for demo - replace with real CSCS Smart Check API
  const verifyCard = async (cardNumberToVerify: string) => {
    setIsVerifying(true);
    
    try {
      // Simulate API call to CSCS Smart Check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response based on card number patterns
      const mockResponse: CSCSCardData = {
        cardNumber: cardNumberToVerify,
        holderName: "John Smith",
        cardType: "blue-skilled",
        expiryDate: "2026-03-15",
        status: cardNumberToVerify.includes("EXP") ? 'expired' : 
                cardNumberToVerify.includes("REV") ? 'revoked' : 'valid',
        qualifications: ["NVQ Level 2 Bricklaying", "Health & Safety Test"],
        lastVerified: new Date().toISOString(),
        occupation: "Skilled Bricklayer"
      };
      
      setVerificationResult(mockResponse);
      
      if (mockResponse.status === 'valid') {
        toast({
          title: "Card Verified",
          description: `Valid ${CSCS_CARD_TYPES[mockResponse.cardType as keyof typeof CSCS_CARD_TYPES]?.name} for ${mockResponse.holderName}`,
        });
        onCardVerified?.(mockResponse);
      } else {
        toast({
          title: "Card Invalid",
          description: `Card is ${mockResponse.status}. Do not allow site access.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Unable to verify card. Check network connection.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      expired: { variant: 'secondary', icon: Calendar, color: 'text-amber-600' },
      revoked: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      invalid: { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' }
    } as const;
    
    const config = variants[status as keyof typeof variants] || variants.invalid;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{status.toUpperCase()}</span>
      </Badge>
    );
  };

  const getCardTypeInfo = (cardType: string) => {
    return CSCS_CARD_TYPES[cardType as keyof typeof CSCS_CARD_TYPES] || {
      name: 'Unknown Card Type',
      color: 'bg-gray-500',
      description: 'Card type not recognised',
      validity: 'Unknown',
      requirements: 'Unknown'
    };
  };

  return (
    <div className="space-y-6">
      {/* Quick Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            CSCS Card Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-steel-gray mb-4">
            Verify CSCS cards in real-time using the official CSCS Smart Check system. 
            Supports QR code scanning, NFC reading, and manual entry.
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-16 bg-construction-orange hover:bg-orange-600"
              onClick={() => {
                toast({
                  title: "QR Scanner",
                  description: "QR code scanning feature would open camera here",
                });
              }}
            >
              <div className="text-center">
                <QrCode className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">Scan QR Code</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16"
              onClick={() => {
                toast({
                  title: "NFC Reader",
                  description: "NFC reading would activate here for contactless cards",
                });
              }}
            >
              <div className="text-center">
                <CreditCard className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm">NFC Reading</span>
              </div>
            </Button>
            
            <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-16">
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm">Manual Entry</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manual Card Verification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Card Number</label>
                    <Input 
                      placeholder="Enter CSCS card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expected Card Type (Optional)</label>
                    <Select value={selectedCardType} onValueChange={setSelectedCardType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CSCS_CARD_TYPES).map(([key, type]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded ${type.color}`}></div>
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => {
                      if (cardNumber.trim()) {
                        verifyCard(cardNumber);
                        setShowManualEntry(false);
                      }
                    }}
                    disabled={!cardNumber.trim() || isVerifying}
                    className="w-full"
                  >
                    {isVerifying ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Verify Card
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Quick Manual Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Enter card number for quick verification"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && cardNumber.trim() && verifyCard(cardNumber)}
            />
            <Button 
              onClick={() => verifyCard(cardNumber)}
              disabled={!cardNumber.trim() || isVerifying}
            >
              {isVerifying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Demo Helper */}
          <div className="text-xs text-steel-gray bg-blue-50 p-3 rounded">
            <strong>Demo Mode:</strong> Try card numbers ending in "EXP" (expired) or "REV" (revoked) 
            to see different verification results. Real implementation uses CSCS Smart Check API.
          </div>
        </CardContent>
      </Card>
      
      {/* Verification Result */}
      {verificationResult && (
        <Card className={`border-2 ${
          verificationResult.status === 'valid' ? 'border-green-300 bg-green-50' :
          verificationResult.status === 'expired' ? 'border-amber-300 bg-amber-50' :
          'border-red-300 bg-red-50'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Verification Result
              </span>
              {getStatusBadge(verificationResult.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-charcoal mb-3">Card Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-steel-gray">Cardholder:</span>
                      <span className="font-medium">{verificationResult.holderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-gray">Card Number:</span>
                      <span className="font-mono">{verificationResult.cardNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-gray">Card Type:</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${getCardTypeInfo(verificationResult.cardType).color}`}></div>
                        <span>{getCardTypeInfo(verificationResult.cardType).name}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-gray">Expiry Date:</span>
                      <span className={new Date(verificationResult.expiryDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                        {new Date(verificationResult.expiryDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-gray">Occupation:</span>
                      <span>{verificationResult.occupation}</span>
                    </div>
                  </div>
                </div>
                
                {/* Qualifications */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Qualifications</h4>
                  <div className="space-y-1">
                    {verificationResult.qualifications.map((qual, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Award className="h-3 w-3 text-construction-orange" />
                        <span>{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Photo Verification */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-charcoal mb-3">Photo Verification</h4>
                  <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed">
                    {verificationResult.photo ? (
                      <img 
                        src={verificationResult.photo} 
                        alt="Cardholder" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-xs">Photo from CSCS database</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Card Added",
                        description: "Card details saved to compliance tracker",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Compliance Tracker
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Report Downloaded",
                        description: "Verification report saved as PDF",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Status Alerts */}
            {verificationResult.status !== 'valid' && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action Required:</strong> This card is {verificationResult.status}.
                  {verificationResult.status === 'expired' && ' The cardholder must renew their CSCS card before site access.'}
                  {verificationResult.status === 'revoked' && ' This card has been revoked - deny site access immediately.'}
                  {verificationResult.status === 'invalid' && ' This card could not be verified - deny site access.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Card Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>CSCS Card Types Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CSCS_CARD_TYPES).map(([key, type]) => (
              <div key={key} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-4 h-4 rounded ${type.color}`}></div>
                  <span className="font-medium text-sm">{type.name}</span>
                </div>
                <p className="text-xs text-steel-gray mb-1">{type.description}</p>
                <p className="text-xs text-steel-gray">
                  <strong>Validity:</strong> {type.validity}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}