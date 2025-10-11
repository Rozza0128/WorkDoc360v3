/**
 * Master Trade Companies Dashboard
 * Demonstrates the industry oracle system for UK construction trades
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Bell, 
  Shield, 
  Star,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Crown,
  Target
} from "lucide-react";

interface MasterTradeCompany {
  id: string;
  tradeType: string;
  name: string;
  description: string;
  totalMemberCompanies: number;
  totalDocuments: number;
  basicMonthlyFee: number;
  premiumMonthlyFee: number;
  enterpriseMonthlyFee: number;
  status: string;
  certifyingBodies: string[];
  industryStandards: string[];
  createdAt: string;
}

interface MasterDocument {
  id: string;
  title: string;
  documentType: string;
  version: string;
  urgencyLevel: string;
  distributedToCompanies: string[];
  acknowledgedByCompanies: string[];
  createdAt: string;
  updatedAt: string;
}

interface UpdateRecommendation {
  id: string;
  title: string;
  description: string;
  recommendationType: string;
  priority: string;
  targetCompanyIds: string[];
  status: string;
  createdAt: string;
}

function MasterTradesPage() {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedTier, setSelectedTier] = useState("basic");

  // Fetch all master trade companies
  const { data: masterTrades, isLoading } = useQuery<MasterTradeCompany[]>({
    queryKey: ['/api/master-trades'],
  });

  // Fetch detailed information for selected trade
  const { data: tradeDetails } = useQuery({
    queryKey: ['/api/master-trades', selectedTrade],
    enabled: !!selectedTrade,
  });

  // Initialize default master trades
  const initializeMasterTrades = useMutation({
    mutationFn: () => fetch('/api/master-trades/initialize-defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json()),
    onSuccess: () => {
      window.location.reload();
    },
  });

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  const getTradeIcon = (tradeType: string) => {
    const icons: Record<string, React.ReactNode> = {
      scaffolding: <Building2 className="h-6 w-6 text-blue-600" />,
      plastering: <Target className="h-6 w-6 text-orange-600" />,
      roofing: <Shield className="h-6 w-6 text-green-600" />,
      electrical: <TrendingUp className="h-6 w-6 text-yellow-600" />,
      plumbing: <Users className="h-6 w-6 text-purple-600" />,
    };
    return icons[tradeType] || <Building2 className="h-6 w-6 text-gray-600" />;
  };

  const getUrgencyColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[level] || colors.medium;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Master Trade Companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Master Trade Companies</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Industry oracles that maintain definitive compliance standards for UK construction trades. 
          Each master company serves as the authoritative source for trade-specific documentation, 
          regulations, and best practices.
        </p>
        
        {(!masterTrades || masterTrades.length === 0) && (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Initialize Master Trade System</CardTitle>
              <CardDescription>
                Set up the default master trade companies for UK construction trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => initializeMasterTrades.mutate()}
                disabled={initializeMasterTrades.isPending}
                className="w-full"
              >
                {initializeMasterTrades.isPending ? "Initializing..." : "Initialize Master Trades"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {masterTrades && masterTrades.length > 0 && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterTrades.map((trade) => (
              <Card 
                key={trade.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTrade === trade.tradeType ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedTrade(trade.tradeType)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {getTradeIcon(trade.tradeType)}
                    <Badge variant="secondary" className="text-xs">
                      {trade.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{trade.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {trade.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Member Companies:</span>
                      <span className="font-semibold">{trade.totalMemberCompanies}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Master Documents:</span>
                      <span className="font-semibold">{trade.totalDocuments}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 mb-1">Subscription Tiers:</div>
                      <div className="flex justify-between text-sm">
                        <span>Basic: {formatPrice(trade.basicMonthlyFee)}</span>
                        <span>Premium: {formatPrice(trade.premiumMonthlyFee)}</span>
                        <span>Enterprise: {formatPrice(trade.enterpriseMonthlyFee)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed View */}
          {selectedTrade && tradeDetails && (
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTradeIcon(selectedTrade)}
                    <div>
                      <CardTitle className="text-xl">{tradeDetails.name}</CardTitle>
                      <CardDescription>
                        Trade Type: {selectedTrade.charAt(0).toUpperCase() + selectedTrade.slice(1)}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowSubscribeDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Subscribe Company
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-600" />
                            Subscription Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {tradeDetails.subscriptionStats?.map((stat: any) => (
                            <div key={stat.tier} className="flex justify-between py-1">
                              <span className="capitalize text-sm">{stat.tier}:</span>
                              <span className="font-semibold">{stat.count}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-green-600" />
                            Certifying Bodies
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {tradeDetails.certifyingBodies?.map((body: string) => (
                              <Badge key={body} variant="outline" className="text-xs">
                                {body}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            Industry Standards
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {tradeDetails.industryStandards?.map((standard: string) => (
                              <Badge key={standard} variant="secondary" className="text-xs">
                                {standard}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Recent Master Documents</h3>
                      <Badge variant="secondary">
                        {tradeDetails.recentDocuments?.length || 0} Active Documents
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {tradeDetails.recentDocuments?.map((doc: MasterDocument) => (
                        <Card key={doc.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold">{doc.title}</h4>
                                  <Badge className={getUrgencyColor(doc.urgencyLevel)}>
                                    {doc.urgencyLevel}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Type: {doc.documentType.replace(/_/g, ' ')}</span>
                                  <span>Version: {doc.version}</span>
                                  <span>Distributed: {doc.distributedToCompanies?.length || 0}</span>
                                  <span>Acknowledged: {doc.acknowledgedByCompanies?.length || 0}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {(!tradeDetails.recentDocuments || tradeDetails.recentDocuments.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No master documents available yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="updates" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Recent Update Recommendations</h3>
                      <Button size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Create Update
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {tradeDetails.recentUpdates?.map((update: UpdateRecommendation) => (
                        <Card key={update.id} className="border-l-4 border-l-orange-500">
                          <CardContent className="py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{update.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getUrgencyColor(update.priority)}>
                                    {update.priority}
                                  </Badge>
                                  <Badge variant="outline">
                                    {update.status}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{update.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Type: {update.recommendationType.replace(/_/g, ' ')}</span>
                                <span>Target Companies: {update.targetCompanyIds?.length || 0}</span>
                                <span>Created: {new Date(update.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {(!tradeDetails.recentUpdates || tradeDetails.recentUpdates.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No recent update recommendations.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="members" className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Member company management will be available once companies subscribe to this master trade.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe Company to Master Trade</DialogTitle>
            <DialogDescription>
              Connect a company to receive master documents and compliance updates from this trade oracle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyId">Company ID</Label>
              <Input
                id="companyId"
                placeholder="Enter company ID"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="tier">Subscription Tier</Label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
              >
                <option value="basic">Basic - {selectedTrade && masterTrades && formatPrice(masterTrades.find(t => t.tradeType === selectedTrade)?.basicMonthlyFee || 0)}/month</option>
                <option value="premium">Premium - {selectedTrade && masterTrades && formatPrice(masterTrades.find(t => t.tradeType === selectedTrade)?.premiumMonthlyFee || 0)}/month</option>
                <option value="enterprise">Enterprise - {selectedTrade && masterTrades && formatPrice(masterTrades.find(t => t.tradeType === selectedTrade)?.enterpriseMonthlyFee || 0)}/month</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSubscribeDialog(false)}>
                Subscribe Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MasterTradesPage;