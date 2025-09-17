import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { DocumentProgress } from "./DocumentProgress";
import { ComplianceMetrics } from "./ComplianceMetrics";
import { ComplianceAlerts } from "./ComplianceAlerts";
import {
  TrendingUp,
  Users,
  FileText,
  Bell,
  Calendar,
  Clock,
  Target,
  Activity,
  AlertCircle,
  CheckCircle,
  Mail,
  Settings,
  Plus,
  ArrowRight,
  BarChart3
} from "lucide-react";

interface SmartDashboardProps {
  companyId: number;
  userRole: string;
  onTabChange: (tab: string) => void;
}

export function SmartDashboard({ companyId, userRole, onTabChange }: SmartDashboardProps) {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState("overview");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "dashboard"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/companies", companyId, "user-stats"],
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/companies", companyId, "notifications"],
  });

  const getPermissionLevel = () => {
    switch (userRole) {
      case "admin": return { level: "Administrator", color: "bg-red-500", permissions: ["Full Access", "User Management", "Billing", "Settings"] };
      case "manager": return { level: "Manager", color: "bg-orange-500", permissions: ["Document Management", "User Assignment", "Reports"] };
      case "user": return { level: "User", color: "bg-blue-500", permissions: ["Document Viewing", "File Uploads", "Basic Reports"] };
      default: return { level: "Guest", color: "bg-gray-500", permissions: ["Read Only"] };
    }
  };

  const permission = getPermissionLevel();

  const quickActions = [
    {
      title: "Create Document",
      description: "Generate new compliance document",
      icon: <FileText className="h-5 w-5" />,
      action: () => onTabChange("documents"),
      permission: ["admin", "manager", "user"],
      color: "bg-construction-orange",
      count: dashboardData?.pendingDocuments || 0
    },
    {
      title: "Review Progress",
      description: "Track document completion",
      icon: <TrendingUp className="h-5 w-5" />,
      action: () => setSelectedView("progress"),
      permission: ["admin", "manager"],
      color: "bg-blue-500",
      count: dashboardData?.documentsInProgress || 0
    },
    {
      title: "Manage Users",
      description: "Add or edit team members",
      icon: <Users className="h-5 w-5" />,
      action: () => onTabChange("users"),
      permission: ["admin", "manager"],
      color: "bg-green-500",
      count: userStats?.totalUsers || 0
    },
    {
      title: "View Reports",
      description: "Compliance and activity reports",
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => onTabChange("reports"),
      permission: ["admin", "manager", "user"],
      color: "bg-purple-500",
      count: dashboardData?.totalReports || 0
    }
  ];

  const filteredActions = quickActions.filter(action => 
    action.permission.includes(userRole)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Level Indicator */}
      <Card className="border-l-4 border-l-construction-orange">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${permission.color}`}></div>
              <div>
                <h3 className="font-semibold text-charcoal">{permission.level} Access</h3>
                <p className="text-sm text-steel-gray">
                  {permission.permissions.join(" • ")}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-construction-orange bg-opacity-10 text-construction-orange border-construction-orange">
              {userRole.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Completed</p>
                <p className="text-2xl font-bold text-charcoal">{dashboardData?.completedDocuments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">In Progress</p>
                <p className="text-2xl font-bold text-charcoal">{dashboardData?.documentsInProgress || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Overdue</p>
                <p className="text-2xl font-bold text-charcoal">{dashboardData?.overdueDocuments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-steel-gray">Compliance Score</p>
                <p className="text-2xl font-bold text-charcoal">{dashboardData?.complianceScore || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-construction-orange" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={action.action}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                      <div className={`text-white`} style={{ color: action.color.replace('bg-', '') }}>
                        {action.icon}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {action.count}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-charcoal mb-1">{action.title}</h3>
                  <p className="text-sm text-steel-gray mb-3">{action.description}</p>
                  <div className="flex items-center text-sm text-construction-orange group-hover:translate-x-1 transition-transform">
                    <span>Go to {action.title.toLowerCase()}</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Content Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <ComplianceMetrics companyId={companyId} />
          
          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentDocuments?.slice(0, 5).map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-steel-gray" />
                      <div>
                        <p className="font-medium text-charcoal">{doc.documentName}</p>
                        <p className="text-sm text-steel-gray">{doc.siteName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.status}
                      </Badge>
                      <span className="text-sm text-steel-gray">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-6 text-steel-gray">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent documents</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <DocumentProgress companyId={companyId} userRole={userRole} />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <ComplianceAlerts companyId={companyId} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications?.slice(0, 10).map((notification: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border-l-2 border-construction-orange bg-construction-orange bg-opacity-5">
                    <div className="p-1 bg-construction-orange bg-opacity-20 rounded">
                      <Activity className="h-4 w-4 text-construction-orange" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">{notification.title}</p>
                      <p className="text-sm text-steel-gray">{notification.description}</p>
                      <span className="text-xs text-steel-gray">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-6 text-steel-gray">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}