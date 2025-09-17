import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Crown, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UsageCounterProps {
  showUpgradePrompt?: boolean;
  className?: string;
}

export function UsageCounter({ showUpgradePrompt = false, className = "" }: UsageCounterProps) {
  const [, setLocation] = useLocation();

  // Get current user to check usage
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  }) as { data: any };

  if (!user) return null;

  const isFreeTrial = user.planStatus === 'free_trial';
  const documentsUsed = user.freeDocumentsUsed || 0;
  const documentsLimit = user.freeDocumentsLimit || 1;
  const isLimitReached = documentsUsed >= documentsLimit;
  const progressPercentage = (documentsUsed / documentsLimit) * 100;

  // Don't show if user has a paid plan
  if (!isFreeTrial) return null;

  return (
    <Card className={`${className} border-l-4 border-l-construction-orange`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-construction-orange" />
            <CardTitle className="text-lg">Free Trial Usage</CardTitle>
          </div>
          <Badge variant={isLimitReached ? "destructive" : "secondary"}>
            {documentsUsed} of {documentsLimit} used
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-steel-gray">
            {isLimitReached 
              ? "You've used all your free documents! Upgrade to continue generating." 
              : `${documentsLimit - documentsUsed} free document${documentsLimit - documentsUsed === 1 ? '' : 's'} remaining.`
            }
          </p>
        </div>

        {(showUpgradePrompt || isLimitReached) && (
          <div className="space-y-3 pt-2 border-t">
            <div className="bg-gradient-to-r from-construction-orange/10 to-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-charcoal mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4 text-construction-orange" />
                Unlock Unlimited Documents
              </h4>
              <ul className="text-sm text-steel-gray space-y-1 mb-3">
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  Generate unlimited risk assessments & method statements
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  AI-powered toolbox talks for your specific trades
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  CSCS card tracking and expiry alerts
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-green-500" />
                  Premium UK construction compliance templates
                </li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setLocation("/select-plan")}
                className="flex-1 bg-construction-orange hover:bg-orange-600"
              >
                Upgrade Now - From £35/month
              </Button>
              {!isLimitReached && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "mailto:hello@workdoc360.com?subject=Enterprise Demo Request"}
                  className="text-construction-orange border-construction-orange hover:bg-construction-orange hover:text-white"
                >
                  Contact Sales
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}