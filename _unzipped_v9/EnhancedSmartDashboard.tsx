import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  BarChart3,
  Zap,
  Shield,
  Download,
  Filter,
  Search,
  RefreshCw,
  Star,
  Award,
  Briefcase,
  HardHat,
  Clipboard,
  BookOpen,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  TrendingDown,
  User,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Building
} from "lucide-react";

// Enhanced TypeScript interfaces
interface DashboardData {
  completedDocuments: number;
  documentsInProgress: number;
  overdueDocuments: number;
  complianceScore: number;
  pendingDocuments: number;
  totalReports: number;
  recentDocuments: DocumentItem[];
  monthlyProgress: MonthlyProgressItem[];
  upcomingDeadlines: DeadlineItem[];
  teamActivity: ActivityItem[];
  certificationStatus: CertificationItem[];
}

interface DocumentItem {
  id: string;
  documentName: string;
  siteName: string;
  status: 'draft' | 'pending' | 'approved' | 'expired';
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  category: string;
}

interface MonthlyProgressItem {
  month: string;
  completed: number;
  target: number;
}

interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string;
  type: 'certification' | 'document' | 'training';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: 'document' | 'user' | 'system' | 'certification';
  userId?: string;
  userName?: string;
}

interface CertificationItem {
  id: string;
  name: string;
  status: 'valid' | 'expiring' | 'expired';
  expiryDate: string;
  provider: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingInvites: number;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}

interface EnhancedSmartDashboardProps {
  companyId: number;
  userRole: string;
  onTabChange: (tab: string) => void;
}

export function EnhancedSmartDashboard({ companyId, userRole, onTabChange }: EnhancedSmartDashboardProps) {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState("overview");
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Enhanced data queries with proper typing
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/companies", companyId, "dashboard", timeFilter],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/companies", companyId, "user-stats"],
  });

  const { data: notifications } = useQuery<NotificationItem[]>({
    queryKey: ["/api/companies", companyId, "notifications"],
  });

  // Online/offline detection
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const getPermissionLevel = () => {
    switch (userRole) {
      case "admin": 
        return { 
          level: "Administrator", 
          color: "bg-red-500", 
          permissions: ["Full Access", "User Management", "Billing", "Settings"],
          icon: <Shield className="h-4 w-4" />
        };
      case "manager": 
        return { 
          level: "Manager", 
          color: "bg-orange-500", 
          permissions: ["Document Management", "User Assignment", "Reports"],
          icon: <Briefcase className="h-4 w-4" />
        };
      case "user": 
        return { 
          level: "User", 
          color: "bg-blue-500", 
          permissions: ["Document Viewing", "File Uploads", "Basic Reports"],
          icon: <User className="h-4 w-4" />
        };
      default: 
        return { 
          level: "Guest", 
          color: "bg-gray-500", 
          permissions: ["Read Only"],
          icon: <Eye className="h-4 w-4" />
        };
    }
  };

  const permission = getPermissionLevel();

  // Enhanced quick actions with better categorization
  const quickActions = [
    {
      title: "Generate Document",
      description: "Create new compliance documents",
      icon: <FileText className="h-5 w-5" />,
      action: () => onTabChange("documents"),
      permission: ["admin", "manager", "user"],
      color: "from-construction-orange to-orange-600",
      count: dashboardData?.pendingDocuments || 0,
      category: "primary"
    },
    {
      title: "Record Toolbox Talk",
      description: "Log safety briefing session",
      icon: <HardHat className="h-5 w-5" />,
      action: () => onTabChange("toolbox"),
      permission: ["admin", "manager", "user"],
      color: "from-blue-500 to-blue-600",
      count: 0,
      category: "primary"
    },
    {
      title: "Upload Documents",
      description: "Add existing documentation",
      icon: <Plus className="h-5 w-5" />,
      action: () => onTabChange("upload"),
      permission: ["admin", "manager", "user"],
      color: "from-green-500 to-green-600",
      count: 0,
      category: "primary"
    },
    {
      title: "Review Progress",
      description: "Track completion status",
      icon: <TrendingUp className="h-5 w-5" />,
      action: () => setSelectedView("progress"),
      permission: ["admin", "manager"],
      color: "from-purple-500 to-purple-600",
      count: dashboardData?.documentsInProgress || 0,
      category: "secondary"
    },
    {
      title: "Manage Team",
      description: "Add or edit team members",
      icon: <Users className="h-5 w-5" />,
      action: () => onTabChange("users"),
      permission: ["admin", "manager"],
      color: "from-indigo-500 to-indigo-600",
      count: userStats?.totalUsers || 0,
      category: "secondary"
    },
    {
      title: "View Reports",
      description: "Compliance analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => onTabChange("reports"),
      permission: ["admin", "manager", "user"],
      color: "from-teal-500 to-teal-600",
      count: dashboardData?.totalReports || 0,
      category: "secondary"
    }
  ];

  const filteredActions = quickActions.filter(action => 
    action.permission.includes(userRole)
  );

  const primaryActions = filteredActions.filter(action => action.category === "primary");
  const secondaryActions = filteredActions.filter(action => action.category === "secondary");

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      expired: { color: "bg-red-100 text-red-800", label: "Expired" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} border-0 text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  // Priority indicator component
  const PriorityIndicator = ({ priority }: { priority: string }) => {
    const priorityConfig = {
      low: { color: "bg-gray-400", icon: "●" },
      medium: { color: "bg-yellow-400", icon: "●" },
      high: { color: "bg-orange-400", icon: "●" },
      urgent: { color: "bg-red-500", icon: "●" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
    
    return (
      <div className={`w-2 h-2 rounded-full ${config.color}`} title={priority} />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Enhanced loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Mobile-First Status Indicators */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Dashboard Overview</h1>
            <p className="text-steel-gray mt-1 text-sm sm:text-base">Monitor your compliance status and team activity</p>
          </div>
          
          {/* Mobile-Optimized Status Indicator */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs sm:text-sm text-steel-gray">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        {/* Mobile-First Control Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Refresh Button - Full width on mobile */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="w-full sm:w-auto justify-center sm:justify-start"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh Data</span>
          </Button>
          
          {/* Time Filter - Full width on mobile with larger touch targets */}
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-construction-orange touch-manipulation"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {/* Enhanced Permission Level Card - Mobile Optimized */}
      <Card className="border-l-4 border-l-construction-orange bg-gradient-to-r from-construction-orange/5 to-orange-50">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${permission.color} flex items-center justify-center flex-shrink-0`}>
                <div className="text-white">
                  {permission.icon}
                </div>
              </div>
              <div className="flex-1 sm:flex-initial">
                <h3 className="font-bold text-charcoal text-base sm:text-lg">{permission.level} Access</h3>
                <p className="text-xs sm:text-sm text-steel-gray">
                  <span className="hidden sm:inline">{permission.permissions.join(" • ")}</span>
                  <span className="sm:hidden">{permission.permissions[0]}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              <Badge variant="outline" className="bg-construction-orange bg-opacity-10 text-construction-orange border-construction-orange font-semibold text-xs px-2 py-1">
                {userRole.toUpperCase()}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onTabChange("settings")}
                className="text-xs sm:text-sm px-3 py-2"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Config</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Key Metrics with Mobile-First Progress Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-steel-gray">Completed</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal">{dashboardData?.completedDocuments || 0}</p>
              </div>
              <div className="space-y-2">
                <Progress value={85} className="h-1.5 sm:h-2" />
                <p className="text-xs text-green-600 font-medium">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-steel-gray">In Progress</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal">{dashboardData?.documentsInProgress || 0}</p>
              </div>
              <div className="space-y-2">
                <Progress value={60} className="h-1.5 sm:h-2" />
                <p className="text-xs text-yellow-600 font-medium">5 due this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
                  <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-steel-gray">Overdue</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal">{dashboardData?.overdueDocuments || 0}</p>
              </div>
              <div className="space-y-2">
                <Progress value={20} className="h-1.5 sm:h-2" />
                <p className="text-xs text-red-600 font-medium">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                  <Target className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-steel-gray">Compliance</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal">{dashboardData?.complianceScore || 0}%</p>
              </div>
              <div className="space-y-2">
                <Progress value={dashboardData?.complianceScore || 0} className="h-1.5 sm:h-2" />
                <p className="text-xs text-blue-600 font-medium">Industry avg: 75%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions with Categories */}
      <div className="space-y-6">
        {/* Mobile-Optimized Primary Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-construction-orange" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {primaryActions.map((action, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-white to-gray-50 touch-manipulation" onClick={action.action}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${action.color} shadow-lg`}>
                        <div className="text-white">
                          {action.icon}
                        </div>
                      </div>
                      {action.count > 0 && (
                        <Badge variant="outline" className="bg-construction-orange text-white border-0 px-2 py-1 text-xs">
                          {action.count}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-charcoal mb-2 text-base sm:text-lg">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-steel-gray mb-3 sm:mb-4 line-clamp-2">{action.description}</p>
                    <div className="flex items-center text-xs sm:text-sm text-construction-orange group-hover:translate-x-2 transition-transform font-medium">
                      <span>Get started</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile-Optimized Secondary Actions for Managers/Admins */}
        {secondaryActions.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-steel-gray" />
                <span>Management Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {secondaryActions.map((action, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group touch-manipulation" onClick={action.action}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} bg-opacity-10`}>
                          <div className="text-gray-600">
                            {action.icon}
                          </div>
                        </div>
                        {action.count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-charcoal mb-1 text-sm sm:text-base">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-steel-gray mb-3 line-clamp-2">{action.description}</p>
                      <div className="flex items-center text-xs sm:text-sm text-construction-orange group-hover:translate-x-1 transition-transform">
                        <span>Access</span>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile-Optimized Content Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl touch-manipulation">
          <TabsTrigger value="overview" className="rounded-lg font-medium text-xs sm:text-sm py-2 sm:py-3">
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="rounded-lg font-medium text-xs sm:text-sm py-2 sm:py-3">
            <span className="hidden sm:inline">Progress</span>
            <span className="sm:hidden">Track</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg font-medium text-xs sm:text-sm py-2 sm:py-3">Alerts</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg font-medium text-xs sm:text-sm py-2 sm:py-3">
            <span className="hidden sm:inline">Activity</span>
            <span className="sm:hidden">Feed</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Mobile-Optimized Recent Documents */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-construction-orange" />
                  <span>Recent Documents</span>
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onTabChange("library")}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentDocuments?.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors space-y-2 sm:space-y-0">
                      <div className="flex items-start space-x-3 flex-1">
                        <PriorityIndicator priority={doc.priority} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                            <h4 className="font-medium text-charcoal text-sm sm:text-base truncate">{doc.documentName}</h4>
                            <StatusBadge status={doc.status} />
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-steel-gray">
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{doc.siteName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 justify-end sm:justify-start">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-6 sm:py-8 text-steel-gray">
                      <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                      <p className="text-base sm:text-lg font-medium mb-1">No recent documents</p>
                      <p className="text-xs sm:text-sm">Start by creating your first compliance document</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Compliance Metrics */}
            <ComplianceMetrics companyId={companyId} />
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <DocumentProgress companyId={companyId} userRole={userRole} />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <ComplianceAlerts companyId={companyId} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-construction-orange" />
                <span>Recent Activity</span>
              </CardTitle>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {notifications?.slice(0, 10).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border-l-4 border-l-construction-orange bg-construction-orange bg-opacity-5 rounded-r-lg">
                    <div className="p-1.5 sm:p-2 bg-construction-orange bg-opacity-20 rounded-lg flex-shrink-0">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-construction-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 space-y-1 sm:space-y-0">
                        <h4 className="font-medium text-charcoal text-sm sm:text-base line-clamp-1">{notification.title}</h4>
                        <span className="text-xs text-steel-gray flex-shrink-0">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-steel-gray line-clamp-2">{notification.description}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-6 sm:py-8 text-steel-gray">
                    <Bell className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                    <p className="text-base sm:text-lg font-medium mb-1">No recent activity</p>
                    <p className="text-xs sm:text-sm">Activity will appear here as your team works</p>
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