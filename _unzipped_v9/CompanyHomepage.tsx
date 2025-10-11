import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  FileText, 
  Shield, 
  Users, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

interface CompanyHomepageProps {
  company: {
    id: number;
    name: string;
    logoUrl?: string;
    tradeType: string;
    address?: string;
    brandingColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
}

export function CompanyHomepage({ company }: CompanyHomepageProps) {
  const { user } = useAuth();
  
  // Fetch company dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/companies/${company.id}/dashboard`],
    enabled: !!company.id
  });

  // Apply company branding
  const primaryColor = company.brandingColors?.primary || "#F97316";
  const secondaryColor = company.brandingColors?.secondary || "#1E40AF";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Company Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {company.logoUrl && (
                <img 
                  src={company.logoUrl} 
                  alt={`${company.name} logo`}
                  className="h-12 w-auto object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-sm text-gray-600 capitalize">
                  {company.tradeType.replace('_', ' ')} Compliance Portal
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {user?.firstName}
              </span>
              <Link href={`/dashboard/${company.id}`}>
                <Button>
                  <Building2 className="h-4 w-4 mr-2" />
                  Full Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.activeDocuments || 0}</div>
              <p className="text-xs text-muted-foreground">Compliance documents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.teamMembers || 0}</div>
              <p className="text-xs text-muted-foreground">Active personnel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.complianceScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData?.complianceScore >= 90 ? 'Excellent' : 
                 dashboardData?.complianceScore >= 75 ? 'Good' : 'Needs attention'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.pendingActions || 0}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                Quick Document Generation
              </CardTitle>
              <CardDescription>
                Generate compliance documents for your {company.tradeType.replace('_', ' ')} projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/dashboard/${company.id}?tab=documents`}>
                <Button className="w-full" style={{ backgroundColor: primaryColor }}>
                  Generate Risk Assessment
                </Button>
              </Link>
              <Link href={`/dashboard/${company.id}?tab=documents`}>
                <Button variant="outline" className="w-full">
                  Create Method Statement
                </Button>
              </Link>
              <Link href={`/dashboard/${company.id}?tab=documents`}>
                <Button variant="outline" className="w-full">
                  Toolbox Talk Template
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" style={{ color: secondaryColor }} />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage CSCS cards and personnel compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/dashboard/${company.id}?tab=personnel`}>
                <Button className="w-full" variant="outline">
                  Add Team Member
                </Button>
              </Link>
              <Link href={`/dashboard/${company.id}?tab=personnel`}>
                <Button variant="outline" className="w-full">
                  Verify CSCS Cards
                </Button>
              </Link>
              <Link href={`/dashboard/${company.id}?tab=compliance`}>
                <Button variant="outline" className="w-full">
                  View Compliance Status
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentDocuments?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentDocuments.slice(0, 5).map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.documentName}</p>
                        <p className="text-sm text-gray-600">{doc.templateType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{doc.status}</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent documents generated</p>
                <p className="text-sm">Generate your first compliance document to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}