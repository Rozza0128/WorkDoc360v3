import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  IdCard, 
  AlertTriangle, 
  Users, 
  Shield,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface ComplianceMetricsProps {
  companyId: number;
}

export function ComplianceMetrics({ companyId }: ComplianceMetricsProps) {
  const { data: metrics, isLoading, error } = useQuery<{
    cscsCardsTotal: number;
    cscsCardsExpiring: number;
    riskAssessmentsTotal: number;
    riskAssessmentsDue: number;
    toolboxTalksThisMonth: number;
    complianceScore: number;
  }>({
    queryKey: ["/api/companies", companyId, "metrics"],
    enabled: !!companyId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Unable to load metrics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusIcon = (current: number, total: number, expiring: number = 0) => {
    if (expiring > 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    if (current === total && total > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return null;
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {/* CSCS Cards */}
      <Card className={metrics?.cscsCardsExpiring > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">CSCS Cards</p>
              <p className="text-2xl font-bold text-gray-900">
                {(metrics?.cscsCardsTotal || 0) - (metrics?.cscsCardsExpiring || 0)}/{metrics?.cscsCardsTotal || 0}
              </p>
              <div className="flex items-center space-x-1">
                {(metrics?.cscsCardsExpiring || 0) > 0 ? (
                  <Badge variant="destructive" className="text-xs">
                    {metrics?.cscsCardsExpiring || 0} expiring soon
                  </Badge>
                ) : (
                  <p className="text-xs text-green-600">All current</p>
                )}
                {getStatusIcon((metrics?.cscsCardsTotal || 0) - (metrics?.cscsCardsExpiring || 0), metrics?.cscsCardsTotal || 0, metrics?.cscsCardsExpiring || 0)}
              </div>
            </div>
            <IdCard className={`h-6 w-6 ${(metrics?.cscsCardsExpiring || 0) > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
          </div>
        </CardContent>
      </Card>
      
      {/* Risk Assessments */}
      <Card className={(metrics?.riskAssessmentsDue || 0) > 0 ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Risk Assessments</p>
              <p className="text-2xl font-bold text-gray-900">
                {(metrics?.riskAssessmentsTotal || 0) - (metrics?.riskAssessmentsDue || 0)}/{metrics?.riskAssessmentsTotal || 0}
              </p>
              <div className="flex items-center space-x-1">
                {(metrics?.riskAssessmentsDue || 0) > 0 ? (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    {metrics?.riskAssessmentsDue || 0} due for review
                  </Badge>
                ) : (
                  <p className="text-xs text-blue-600">Up to date</p>
                )}
                {getStatusIcon((metrics?.riskAssessmentsTotal || 0) - (metrics?.riskAssessmentsDue || 0), metrics?.riskAssessmentsTotal || 0, metrics?.riskAssessmentsDue || 0)}
              </div>
            </div>
            <AlertTriangle className={`h-6 w-6 ${(metrics?.riskAssessmentsDue || 0) > 0 ? 'text-yellow-600' : 'text-blue-600'}`} />
          </div>
        </CardContent>
      </Card>
      
      {/* Toolbox Talks */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Toolbox Talks</p>
              <p className="text-2xl font-bold text-blue-900">{metrics?.toolboxTalksThisMonth || 0}</p>
              <p className="text-xs text-blue-600">This month</p>
            </div>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      {/* ISO Compliance Score */}
      <Card className={`border ${getScoreColor(metrics?.complianceScore || 0)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">ISO Compliance</p>
              <p className="text-2xl font-bold">{metrics?.complianceScore || 0}%</p>
              <div className="flex items-center space-x-1">
                <p className={`text-xs ${(metrics?.complianceScore || 0) >= 90 ? 'text-green-600' : (metrics?.complianceScore || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(metrics?.complianceScore || 0) >= 90 ? 'Excellent' : (metrics?.complianceScore || 0) >= 70 ? 'Good' : 'Needs attention'}
                </p>
                {(metrics?.complianceScore || 0) >= 90 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (metrics?.complianceScore || 0) < 70 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            </div>
            <Shield className={`h-6 w-6 ${metrics.complianceScore >= 90 ? 'text-green-600' : metrics.complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
