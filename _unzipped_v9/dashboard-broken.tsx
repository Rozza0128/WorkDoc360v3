import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceMetrics } from "@/components/ComplianceMetrics";
import { ComplianceAlerts } from "@/components/ComplianceAlerts";
import { BillingManagement } from "@/components/BillingManagement";
import { UserRoleManagement } from "@/components/UserRoleManagement";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import { PlanManager } from "@/components/PlanManager";
import { PaymentButton } from "@/components/PaymentButton";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft,
  Building,
  PaintRoller,
  Hammer,
  Users,
  FileText,
  AlertTriangle,
  Download,
  Plus,
  Settings,
  Shield
} from "lucide-react";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import type { Company } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const companyId = parseInt(params.companyId || "0");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: ["/api/companies", companyId],
    enabled: !!user && !!companyId,
    retry: false,
  });

  const { data: overdueItems, isLoading: overdueLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "compliance-items/overdue"],
    enabled: !!user && !!companyId,
    retry: false,
  });

  const { data: userRole } = useQuery({
    queryKey: ["/api/companies", companyId, "user-role"],
    enabled: !!user && !!companyId,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (companyError && isUnauthorizedError(companyError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [companyError, toast]);

  const getTradeIcon = (tradeType: string) => {
    switch (tradeType) {
      case "scaffolder":
        return <Building className="h-6 w-6" />;
      case "plasterer":
        return <PaintRoller className="h-6 w-6" />;
      case "general_builder":
        return <Hammer className="h-6 w-6" />;
      default:
        return <Building className="h-6 w-6" />;
    }
  };

  const getTradeLabel = (tradeType: string) => {
    switch (tradeType) {
      case "scaffolder":
        return "Scaffolder";
      case "plasterer":
        return "Plasterer";
      case "general_builder":
        return "General Builder";
      default:
        return "Construction";
    }
  };

  if (isLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
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
                  {getTradeIcon(company.tradeType)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-charcoal">{company.name}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {getTradeLabel(company.tradeType)}
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
                <div className="w-3 h-3 bg-compliant-green rounded-full"></div>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8 mt-6">
            {/* Compliance Metrics */}
            <ComplianceMetrics companyId={companyId} />

            {/* Compliance Alerts */}
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-4">Compliance Status</h2>
              <ComplianceAlerts companyId={companyId} />
            </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-construction-orange" 
              onClick={() => setActiveTab("documents")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-construction-orange bg-opacity-10 rounded-lg">
                      <FileText className="h-6 w-6 text-construction-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal">Create New</h3>
                      <p className="text-sm text-steel-gray">Risk Assessment</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-construction-orange" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => setActiveTab("documents")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal">Record Talk</h3>
                      <p className="text-sm text-steel-gray">Toolbox Talk</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-green-500"
              onClick={() => setActiveTab("documents")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Wrench className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal">Create New</h3>
                      <p className="text-sm text-steel-gray">Method Statement</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-purple-500"
              onClick={() => setActiveTab("library")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Download className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal">View Library</h3>
                      <p className="text-sm text-steel-gray">Document Templates</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-steel-gray">Today 2:45 PM</span>
                    <span className="text-charcoal">Toolbox talk completed for Site A excavation work</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-steel-gray">Yesterday 4:30 PM</span>
                    <span className="text-charcoal">Risk assessment approved for high-rise scaffold installation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-steel-gray">2 days ago</span>
                    <span className="text-charcoal">CSCS card renewal reminder sent to John Smith</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentGenerator companyId={companyId} tradeType={company.tradeType} />
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <DocumentLibrary companyId={companyId} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserRoleManagement companyId={companyId} currentUserRole={userRole?.role || "user"} />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="space-y-6">
              {user?.planStatus === 'pending_payment' && (
                <PaymentButton onPaymentComplete={() => window.location.reload()} />
              )}
              <PlanManager />
              <BillingManagement companyId={companyId} currentUserRole={userRole?.role || "user"} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-steel-gray">Company settings and configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
