import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import { UserRoleManagement } from "@/components/UserRoleManagement";
import { BillingManagement } from "@/components/BillingManagement";
import { ComplianceAlerts } from "@/components/ComplianceAlerts";
import { ComplianceMetrics } from "@/components/ComplianceMetrics";
import { PaymentButton } from "@/components/PaymentButton";
import { PlanManager } from "@/components/PlanManager";
import { SmartDashboard } from "@/components/SmartDashboard";
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
  PaintRoller
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
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="documents">Generate</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
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
                  {getTradeIcon((company as any)?.tradeType || '')}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-charcoal">{(company as any)?.name || 'Company Dashboard'}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {getTradeLabel((company as any)?.tradeType || '')}
                    </Badge>
                    <span className="text-sm text-steel-gray">
                      Last updated: {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-charcoal">Compliant</span>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="upload">Assessment</TabsTrigger>
            <TabsTrigger value="recommended">MRL</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8 mt-6">
            <SmartDashboard 
              companyId={parseInt(companyId)} 
              userRole={(userRole as any)?.role || "user"} 
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentGenerator companyId={parseInt(companyId)} tradeType={(company as any)?.tradeType || ''} />
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