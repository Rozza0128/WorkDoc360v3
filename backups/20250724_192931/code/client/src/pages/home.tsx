import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Building, 
  Plus, 
  Users, 
  FileText, 
  Shield,
  HardHat,
  ArrowRight,
  Clock
} from "lucide-react";
import { TradeSpecificDocuments } from "@/components/TradeSpecificDocuments";
import { CompanyManager } from "@/components/CompanyManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Company } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/auth");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);



  const { data: companies, isLoading: companiesLoading, error } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!user,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/auth");
      }, 500);
      return;
    }
  }, [error, toast]);

  if (isLoading || companiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleCreateCompany = () => {
    setLocation("/onboarding");
  };

  // Type guard to ensure companies is properly typed
  const companiesList = Array.isArray(companies) ? companies : [];

  const getTradeIcon = (tradeType: string) => {
    switch (tradeType) {
      case "scaffolder":
        return <Building className="h-6 w-6" />;
      case "plasterer":
        return <Shield className="h-6 w-6" />;
      case "general_builder":
        return <HardHat className="h-6 w-6" />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Welcome back, {(user as any)?.firstName || "User"}!</h1>
              <p className="text-steel-gray">Manage your construction compliance and documentation</p>
            </div>
            <div className="flex items-center space-x-4">
              {(!companiesList || companiesList.length === 0) && (
                <Button onClick={handleCreateCompany} className="bg-construction-orange hover:bg-orange-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Company
                </Button>
              )}
              <Button variant="outline" onClick={async () => {
                try {
                  await apiRequest("POST", "/api/logout");
                  queryClient.setQueryData(["/api/user"], null);
                  setLocation("/");
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Company Management for admin@workdoc360.com */}
        {(user as any)?.email === 'admin@workdoc360.com' && (
          <Tabs defaultValue="companies" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="companies">My Companies</TabsTrigger>
              <TabsTrigger value="manage">Manage Companies (Admin)</TabsTrigger>
            </TabsList>
            <TabsContent value="companies" className="mt-6">
              {/* Regular company view for admin */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-charcoal">Your Companies</h2>
                </div>

                {companiesList && companiesList.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companiesList.map((company: Company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                  console.log("Clicking company:", company.id, company.name);
                  setLocation(`/dashboard/${company.id}`)
                }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                          {getTradeIcon(company.tradeType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {getTradeLabel(company.tradeType)}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-steel-gray" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-steel-gray">Registration:</span>
                        <span className="font-medium">{company.registrationNumber || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-steel-gray">Location:</span>
                        <span className="font-medium truncate ml-2">{company.postcode || "Not set"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-steel-gray">Created:</span>
                        <span className="font-medium">{new Date(company.createdAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Empty State
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">No companies yet</h3>
                <p className="text-steel-gray mb-6 max-w-md mx-auto">
                  Get started by creating your first company profile. Choose your trade specialization and we'll set up the right compliance templates for you.
                </p>
                <Button onClick={handleCreateCompany} className="bg-construction-orange hover:bg-orange-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Company
                </Button>
              </CardContent>
            </Card>
          )}
              </div>

              {/* Trade-Specific Documents for admin */}
              {companiesList && companiesList.length > 0 && companiesList[0] && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-charcoal mb-6">
                    Document Library for {getTradeLabel(companiesList[0].tradeType)}
                  </h2>
                  <TradeSpecificDocuments 
                    tradeType={companiesList[0].tradeType} 
                    userPlan="essential" 
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="manage" className="mt-6">
              <CompanyManager />
            </TabsContent>
          </Tabs>
        )}

        {/* Regular user view (non-admin) */}
        {(user as any)?.email !== 'admin@workdoc360.com' && (
          <>
            {/* Companies Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Your Companies</h2>
              </div>

              {companiesList && companiesList.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companiesList.map((company: Company) => (
                    <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/dashboard/${company.id}`)}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                              {getTradeIcon(company.tradeType)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{company.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {getTradeLabel(company.tradeType)}
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-steel-gray" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-steel-gray">Registration:</span>
                            <span className="font-medium">{company.registrationNumber || "Not set"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-steel-gray">Location:</span>
                            <span className="font-medium truncate ml-2">{company.postcode || "Not set"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-steel-gray">Created:</span>
                            <span className="font-medium">{new Date(company.createdAt!).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Empty State
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal mb-2">No companies yet</h3>
                    <p className="text-steel-gray mb-6 max-w-md mx-auto">
                      Get started by creating your first company profile. Choose your trade specialization and we'll set up the right compliance templates for you.
                    </p>
                    <Button onClick={handleCreateCompany} className="bg-construction-orange hover:bg-orange-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Company
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Trade-Specific Documents */}
            {companiesList && companiesList.length > 0 && companiesList[0] && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-charcoal mb-6">
                  Document Library for {getTradeLabel(companiesList[0].tradeType)}
                </h2>
                <TradeSpecificDocuments 
                  tradeType={companiesList[0].tradeType} 
                  userPlan="essential" 
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

