import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DocumentsTab } from "@/components/DocumentsTab";
import { ComplianceTracker } from "@/components/ComplianceTracker";
import { ToolboxTalkManager } from "@/components/ToolboxTalkManager";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import { UserRoleManagement } from "@/components/UserRoleManagement";
import { BillingManagement } from "@/components/BillingManagement";
import { ComplianceAlerts } from "@/components/ComplianceAlerts";
import { ComplianceMetrics } from "@/components/ComplianceMetrics";
import { PaymentButton } from "@/components/PaymentButton";
import { PlanManager } from "@/components/PlanManager";
import { EnhancedSmartDashboard } from "@/components/EnhancedSmartDashboard";
import { MasterRecordsLibrary } from "@/components/MasterRecordsLibrary";
import { DocumentUploadAssessment } from "@/components/DocumentUploadAssessment";
import { LogoManager } from "@/components/LogoManager";
import { RecommendedDocuments } from "@/components/RecommendedDocuments";
import { DocumentUploadArea } from "@/components/DocumentUploadArea";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Download, 
  Settings, 
  AlertTriangle, 
  FileText, 
  Users, 
  ArrowRight,
  Wrench,
  HardHat,
  Building,
  Construction,
  PaintRoller,
  Shield,
  MessageSquare
} from "lucide-react";

export default function Dashboard() {
  const { companyId } = useParams<{ companyId: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId,
  });

  const { data: userRole } = useQuery({
    queryKey: ["/api/companies", companyId, "role"],
    enabled: !!companyId,
  });

  const getTradeIcon = (tradeType: string) => {
    switch (tradeType) {
      case "scaffolder":
        return <Construction className="h-6 w-6 text-construction-orange" />;
      case "plasterer":
        return <PaintRoller className="h-6 w-6 text-construction-orange" />;
      case "general_building_contractor":
        return <Building className="h-6 w-6 text-construction-orange" />;
      default:
        return <HardHat className="h-6 w-6 text-construction-orange" />;
    }
  };

  const getTradeLabel = (tradeType: string) => {
    switch (tradeType) {
      case "scaffolder":
        return "Scaffolding Contractor";
      case "plasterer":
        return "Plastering Contractor";
      case "general_building_contractor":
        return "General Building";
      default:
        return "Construction Trade";
    }
  };

  // Debug logging
  console.log("Dashboard rendering:", { companyId, companyLoading, company, activeTab });

  // Show tabs immediately, even while loading company data
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => setLocation("/")} className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                    <HardHat className="h-6 w-6 text-construction-orange" />
                  </div>
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs - Show immediately */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="documents">Generate</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="toolbox">Toolbox Talks</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-8 mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Company Not Found</h1>
            <p className="text-gray-600 mb-4">
              The company you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 smooth-scroll">
      {/* Mobile-Optimized Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            {/* Mobile: Back button and company info in one row */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/")} className="p-2 touch-manipulation">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getTradeIcon((company as any)?.tradeType || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-charcoal truncate">
                    {(company as any)?.name || 'Company Dashboard'}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                    <Badge variant="secondary" className="w-fit text-xs">
                      {getTradeLabel((company as any)?.tradeType || '')}
                    </Badge>
                    <span className="text-xs sm:text-sm text-steel-gray">
                      Last updated: {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile: Action buttons row */}
            <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-charcoal">Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="px-2 sm:px-4 touch-manipulation"
                  onClick={() => {
                    toast({
                      title: "Report Generation",
                      description: "Compliance report feature coming soon",
                    });
                  }}
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Generate Report</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="px-2 sm:px-4 touch-manipulation"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-Optimized Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile-First Tab Navigation */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-10 h-auto p-1 touch-manipulation">
              <TabsTrigger value="dashboard" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">Documents</TabsTrigger>
              <TabsTrigger value="library" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">Library</TabsTrigger>
              <TabsTrigger value="upload" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Assessment</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="recommended" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">MRL</span>
                <span className="sm:hidden">Rec</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Compliance</span>
                <span className="sm:hidden">Comp</span>
              </TabsTrigger>
              <TabsTrigger value="toolbox" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Toolbox Talks</span>
                <span className="sm:hidden">Talks</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">Users</TabsTrigger>
              <TabsTrigger value="billing" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Billing</span>
                <span className="sm:hidden">Bill</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap px-3 py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-8 mt-4 sm:mt-6">
            <EnhancedSmartDashboard 
              companyId={parseInt(companyId)} 
              userRole={(userRole as any)?.role || "user"} 
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <DocumentsTab 
              companyId={parseInt(companyId)} 
              companyName={(company as any)?.name || 'Company'}
              tradeType={(company as any)?.tradeType || ''}
              userRole={(userRole as any)?.role || "user"}
            />
          </TabsContent>

          <TabsContent value="recommended" className="mt-6">
            <div className="space-y-6">
              {!company ? (
                <div>Loading company data...</div>
              ) : (
                <RecommendedDocuments 
                  companyId={parseInt(companyId)} 
                  companyName={(company as any)?.name || "Unknown Company"}
                  tradeType={(company as any)?.tradeType || "scaffolding"} 
                  planType={(user as any)?.selectedPlan || "professional"}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <div className="space-y-6">
              <DocumentUploadArea 
                companyId={parseInt(companyId)} 
                companyName={(company as any)?.name || ""}
                tradeType={(company as any)?.tradeType || ""} 
              />
              <DocumentUploadAssessment 
                companyId={parseInt(companyId)} 
                companyName={(company as any)?.name || ""}
                tradeType={(company as any)?.tradeType || ""} 
              />
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <div className="space-y-6">
              <DocumentLibrary companyId={parseInt(companyId)} />
              <MasterRecordsLibrary 
                companyId={parseInt(companyId)} 
                companyName={(company as any)?.name || ""} 
                tradeType={(company as any)?.tradeType || ""} 
              />
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceTracker 
              companyId={parseInt(companyId)}
              userRole={(userRole as any)?.role || "user"}
            />
          </TabsContent>

          <TabsContent value="toolbox" className="mt-6">
            <ToolboxTalkManager 
              companyId={parseInt(companyId)}
              userRole={(userRole as any)?.role || "user"}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserRoleManagement companyId={parseInt(companyId)} currentUserRole={(userRole as any)?.role || "user"} />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="space-y-6">
              {(user as any)?.planStatus === 'pending_payment' && (
                <PaymentButton onPaymentComplete={() => window.location.reload()} />
              )}
              <PlanManager />
              <BillingManagement companyId={parseInt(companyId)} currentUserRole={(userRole as any)?.role || "user"} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <LogoManager 
                companyId={parseInt(companyId)} 
                companyName={(company as any)?.name || ""} 
              />
              <Card>
                <CardHeader>
                  <CardTitle>Additional Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-steel-gray">Additional company settings and configuration options will be available here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}