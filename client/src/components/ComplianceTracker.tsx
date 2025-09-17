import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  Target,
  Building,
  CreditCard,
  QrCode
} from "lucide-react";
import { CSCSCardVerification } from "./CSCSCardVerification";
import { CSCSImageVerification } from "./CSCSImageVerification";
import { CSCSOnlineVerification } from "./CSCSOnlineVerification";
import { CSCSOnlineCheckGuide } from "./CSCSOnlineCheckGuide";
import { CSCSRPAVerification } from "./CSCSRPAVerification";
import { CSCSCardDemo } from "./CSCSCardDemo";
import { CSCSRealCardTest } from "./CSCSRealCardTest";
import { CSCSActualCardTest } from "./CSCSActualCardTest";

interface ComplianceItem {
  id: string;
  type: 'cscs' | 'insurance' | 'certification' | 'training' | 'document';
  title: string;
  holder: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  priority: 'high' | 'medium' | 'low';
  daysUntilExpiry: number;
}

interface ComplianceTrackerProps {
  companyId: number;
  userRole: string;
}

export function ComplianceTracker({ companyId, userRole }: ComplianceTrackerProps) {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [alerts, setAlerts] = useState<ComplianceItem[]>([]);

  // Mock compliance data - replace with real API calls
  useEffect(() => {
    const mockData: ComplianceItem[] = [
      {
        id: '1',
        type: 'cscs',
        title: 'CSCS Blue Card - Site Supervisor',
        holder: 'John Smith',
        expiryDate: '2025-03-15',
        status: 'expiring',
        priority: 'high',
        daysUntilExpiry: 52
      },
      {
        id: '2',
        type: 'insurance',
        title: 'Public Liability Insurance',
        holder: 'Company Policy',
        expiryDate: '2025-08-20',
        status: 'valid',
        priority: 'high',
        daysUntilExpiry: 209
      },
      {
        id: '3',
        type: 'certification',
        title: 'CISRS Basic Scaffolding',
        holder: 'Mark Johnson',
        expiryDate: '2025-01-10',
        status: 'expiring',
        priority: 'medium',
        daysUntilExpiry: 18
      },
      {
        id: '4',
        type: 'training',
        title: 'First Aid at Work Certificate',
        holder: 'Sarah Wilson',
        expiryDate: '2024-12-05',
        status: 'expired',
        priority: 'high',
        daysUntilExpiry: -50
      },
      {
        id: '5',
        type: 'document',
        title: 'Risk Assessment - High Level Work',
        holder: 'Site Documentation',
        expiryDate: '2025-06-30',
        status: 'valid',
        priority: 'medium',
        daysUntilExpiry: 158
      }
    ];

    setComplianceItems(mockData);
    
    // Calculate overall compliance score
    const validItems = mockData.filter(item => item.status === 'valid').length;
    const score = Math.round((validItems / mockData.length) * 100);
    setOverallScore(score);

    // Set alerts for expiring/expired items
    const alertItems = mockData.filter(item => 
      item.status === 'expired' || (item.status === 'expiring' && item.daysUntilExpiry <= 30)
    );
    setAlerts(alertItems);
  }, [companyId]);

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: 'default',
      expiring: 'secondary',
      expired: 'destructive'
    } as const;
    
    const labels = {
      valid: 'Valid',
      expiring: 'Expiring Soon',
      expired: 'Expired'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      cscs: Shield,
      insurance: Building,
      certification: Award,
      training: Users,
      document: FileText
    };
    
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-amber-600',
      low: 'text-green-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-construction-orange rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Overall Compliance</p>
                <p className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Active Alerts</p>
                <p className="text-2xl font-bold text-amber-600">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Valid Items</p>
                <p className="text-2xl font-bold text-green-600">
                  {complianceItems.filter(item => item.status === 'valid').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-900">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((item) => (
                <Alert key={item.id} className="border-amber-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.title}</span>
                        <span className="text-sm text-steel-gray ml-2">
                          ({item.holder})
                        </span>
                        {item.status === 'expired' ? (
                          <span className="text-red-600 ml-2 text-sm font-medium">
                            Expired {Math.abs(item.daysUntilExpiry)} days ago
                          </span>
                        ) : (
                          <span className="text-amber-600 ml-2 text-sm font-medium">
                            Expires in {item.daysUntilExpiry} days
                          </span>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Renew
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Compliance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.status === 'valid' ? 'bg-green-100 text-green-600' :
                    item.status === 'expiring' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {getTypeIcon(item.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-charcoal">{item.title}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-steel-gray">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {item.holder}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expires: {new Date(item.expiryDate).toLocaleDateString('en-GB')}
                      </span>
                      <span className={`flex items-center ${getPriorityColor(item.priority)}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {item.priority} priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {userRole === 'admin' && (
                    <>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Renew
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {complianceItems.length === 0 && (
            <div className="text-center py-8 text-steel-gray">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No compliance items tracked yet.</p>
              <Button className="mt-4" size="sm">
                Add Compliance Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Compliance Score</span>
                <span>{overallScore}%</span>
              </div>
              <Progress value={overallScore} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 font-semibold">
                  {complianceItems.filter(item => item.status === 'valid').length}
                </div>
                <div className="text-steel-gray">Valid</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-600 font-semibold">
                  {complianceItems.filter(item => item.status === 'expiring').length}
                </div>
                <div className="text-steel-gray">Expiring</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-red-600 font-semibold">
                  {complianceItems.filter(item => item.status === 'expired').length}
                </div>
                <div className="text-steel-gray">Expired</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-semibold">
                  {complianceItems.length}
                </div>
                <div className="text-steel-gray">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSCS Card Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            CSCS Card Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CSCSActualCardTest />
        </CardContent>
      </Card>
    </div>
  );
}