import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  Users, 
  XCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface ComplianceAlertsProps {
  companyId: number;
}

export function ComplianceAlerts({ companyId }: ComplianceAlertsProps) {
  const { data: overdueItems, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "compliance-items/overdue"],
    enabled: !!companyId,
    retry: false,
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/companies", companyId, "metrics"],
    enabled: !!companyId,
    retry: false,
  });

  const { data: recentToolboxTalks } = useQuery({
    queryKey: ["/api/companies", companyId, "toolbox-talks"],
    enabled: !!companyId,
    retry: false,
  });

  if (isLoading) {
    return null;
  }

  // Check for various compliance issues
  const alerts = [];

  // CSCS cards expiring soon
  if (metrics?.cscsCardsExpiring > 0) {
    alerts.push({
      type: "warning",
      icon: <Clock className="h-4 w-4" />,
      title: "CSCS Cards Expiring Soon",
      description: `${metrics.cscsCardsExpiring} CSCS cards are due for renewal within 30 days. Get these sorted before the lads can't work on site!`,
      action: "Review CSCS Cards",
      urgent: true
    });
  }

  // Risk assessments due for review
  if (metrics?.riskAssessmentsDue > 0) {
    alerts.push({
      type: "warning",
      icon: <FileText className="h-4 w-4" />,
      title: "Risk Assessments Need Review",
      description: `${metrics.riskAssessmentsDue} risk assessments are due for review. Keep the paperwork current to stay compliant.`,
      action: "Review Risk Assessments",
      urgent: false
    });
  }

  // Not enough toolbox talks this month
  if (metrics && metrics.toolboxTalksThisMonth < 4) {
    const needed = 4 - metrics.toolboxTalksThisMonth;
    alerts.push({
      type: "info",
      icon: <Users className="h-4 w-4" />,
      title: "Toolbox Talks Behind Schedule",
      description: `Only ${metrics.toolboxTalksThisMonth} toolbox talks recorded this month. Need ${needed} more to meet HSE requirements.`,
      action: "Record Toolbox Talk",
      urgent: false
    });
  }

  // No recent toolbox talks at all
  if (recentToolboxTalks && recentToolboxTalks.length === 0) {
    alerts.push({
      type: "error",
      icon: <XCircle className="h-4 w-4" />,
      title: "No Toolbox Talks Recorded",
      description: "Right then, no toolbox talks on record yet. Get the daily safety briefings logged to keep everyone safe and compliant.",
      action: "Start First Toolbox Talk",
      urgent: true
    });
  }

  // Overdue compliance items
  if (overdueItems && overdueItems.length > 0) {
    alerts.push({
      type: "error",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Overdue Compliance Items",
      description: `${overdueItems.length} compliance items are overdue. These need sorting immediately to avoid potential issues.`,
      action: "Review Overdue Items",
      urgent: true
    });
  }

  // Low compliance score
  if (metrics && metrics.complianceScore < 70) {
    alerts.push({
      type: "error",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Compliance Score Needs Attention",
      description: `Current compliance score is ${metrics.complianceScore}%. Time to get the documentation in order, mate.`,
      action: "Improve Compliance",
      urgent: true
    });
  }

  if (alerts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Spot On!</AlertTitle>
        <AlertDescription className="text-green-700">
          All compliance requirements are up to date. Proper job keeping everything sorted!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <Alert 
          key={index} 
          className={`${
            alert.type === 'error' ? 'border-red-200 bg-red-50' :
            alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            'border-blue-200 bg-blue-50'
          }`}
        >
          <div className={`${
            alert.type === 'error' ? 'text-red-600' :
            alert.type === 'warning' ? 'text-yellow-600' :
            'text-blue-600'
          }`}>
            {alert.icon}
          </div>
          <AlertTitle className={`${
            alert.type === 'error' ? 'text-red-800' :
            alert.type === 'warning' ? 'text-yellow-800' :
            'text-blue-800'
          }`}>
            {alert.title}
            {alert.urgent && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Urgent
              </Badge>
            )}
          </AlertTitle>
          <AlertDescription className={`${
            alert.type === 'error' ? 'text-red-700' :
            alert.type === 'warning' ? 'text-yellow-700' :
            'text-blue-700'
          } mb-3`}>
            {alert.description}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm"
            className={`${
              alert.type === 'error' ? 'border-red-300 text-red-700 hover:bg-red-100' :
              alert.type === 'warning' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' :
              'border-blue-300 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {alert.action}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  );
}