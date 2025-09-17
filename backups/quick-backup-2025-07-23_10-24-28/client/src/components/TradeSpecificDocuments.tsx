import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Crown, 
  CheckCircle,
  AlertTriangle,
  Shield,
  Users,
  Building,
  Zap
} from "lucide-react";

interface TradeSpecificDocumentsProps {
  tradeType: string;
  userPlan: string;
}

export function TradeSpecificDocuments({ tradeType, userPlan }: TradeSpecificDocumentsProps) {
  
  // Trade-specific document templates
  const getTradeDocuments = (trade: string) => {
    const baseDocuments = [
      {
        id: 1,
        name: "Site-Specific Risk Assessment",
        description: "Customisable risk assessment template",
        category: "Health & Safety",
        included: true,
        icon: <Shield className="h-5 w-5" />
      },
      {
        id: 2,
        name: "Method Statement Template",
        description: "Step-by-step work procedure template",
        category: "Health & Safety", 
        included: true,
        icon: <FileText className="h-5 w-5" />
      },
      {
        id: 3,
        name: "Toolbox Talk Records",
        description: "Daily safety briefing templates",
        category: "Health & Safety",
        included: true,
        icon: <Users className="h-5 w-5" />
      }
    ];

    const tradeSpecific = {
      scaffolder: [
        ...baseDocuments,
        {
          id: 4,
          name: "CISRS Scaffold Inspection Checklist",
          description: "Daily, weekly & handover inspections",
          category: "Trade Specific",
          included: true,
          icon: <Building className="h-5 w-5" />
        },
        {
          id: 5,
          name: "TG20/TG30:24 Compliance Certificate",
          description: "Technical guidance compliance documentation",
          category: "Trade Specific",
          included: true,
          icon: <CheckCircle className="h-5 w-5" />
        },
        {
          id: 6,
          name: "Scaffold Design Calculations",
          description: "Load calculations & design drawings",
          category: "Premium ISO 9001",
          included: userPlan === "professional" || userPlan === "enterprise",
          icon: <Crown className="h-5 w-5" />
        }
      ],
      plasterer: [
        ...baseDocuments,
        {
          id: 4,
          name: "Material Safety Data Sheets",
          description: "Chemical composition & safety protocols",
          category: "Trade Specific",
          included: true,
          icon: <AlertTriangle className="h-5 w-5" />
        },
        {
          id: 5,
          name: "Wet Work Health Assessment",
          description: "Skin protection & dermatitis prevention",
          category: "Trade Specific",
          included: true,
          icon: <Shield className="h-5 w-5" />
        },
        {
          id: 6,
          name: "Quality Assurance Procedures",
          description: "ISO 9001 quality control processes",
          category: "Premium ISO 9001",
          included: userPlan === "professional" || userPlan === "enterprise",
          icon: <Crown className="h-5 w-5" />
        }
      ],
      electrician: [
        ...baseDocuments,
        {
          id: 4,
          name: "Electrical Installation Certificate",
          description: "BS 7671 18th Edition compliance",
          category: "Trade Specific", 
          included: true,
          icon: <Zap className="h-5 w-5" />
        },
        {
          id: 5,
          name: "Periodic Inspection & Testing",
          description: "EICR documentation templates",
          category: "Trade Specific",
          included: true,
          icon: <CheckCircle className="h-5 w-5" />
        },
        {
          id: 6,
          name: "NICEIC Quality Management System",
          description: "ISO 9001 electrical contractor procedures",
          category: "Premium ISO 9001",
          included: userPlan === "professional" || userPlan === "enterprise",
          icon: <Crown className="h-5 w-5" />
        }
      ]
    };

    return tradeSpecific[trade as keyof typeof tradeSpecific] || baseDocuments;
  };

  const documents = getTradeDocuments(tradeType);
  const includedDocs = documents.filter(doc => doc.included);
  const premiumDocs = documents.filter(doc => !doc.included);

  return (
    <div className="space-y-6">
      {/* Included Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-compliant-green" />
            <span>Your Document Library</span>
            <Badge variant="secondary" className="bg-compliant-green bg-opacity-20 text-compliant-green">
              {includedDocs.length} Templates Available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {includedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-compliant-green bg-opacity-10 rounded-lg flex items-center justify-center text-compliant-green">
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-charcoal text-sm">{doc.name}</h4>
                  <p className="text-steel-gray text-xs">{doc.description}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {doc.category}
                  </Badge>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Upgrade Section */}
      {premiumDocs.length > 0 && (
        <Card className="border-construction-orange bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-construction-orange" />
              <span>Premium ISO 9001 Documents</span>
              <Badge className="bg-construction-orange text-white">
                Professional Plan
              </Badge>
            </CardTitle>
            <p className="text-steel-gray text-sm">
              Upgrade to Professional plan (£129/month) for complete ISO 9001:2015 quality management documentation
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {premiumDocs.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-3 p-3 border border-construction-orange bg-white rounded-lg opacity-75">
                  <div className="w-10 h-10 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center text-construction-orange">
                    {doc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-charcoal text-sm">{doc.name}</h4>
                    <p className="text-steel-gray text-xs">{doc.description}</p>
                    <Badge variant="outline" className="text-xs mt-1 border-construction-orange text-construction-orange">
                      {doc.category}
                    </Badge>
                  </div>
                  <Button disabled size="sm" variant="outline">
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade Required
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex space-x-3">
              <Button className="bg-construction-orange hover:bg-orange-600">
                Upgrade to Professional
              </Button>
              <Button variant="outline">
                View All Premium Features
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}