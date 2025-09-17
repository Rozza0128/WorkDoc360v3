import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradeSpecificDocuments } from "@/components/TradeSpecificDocuments";
import { DemoDocumentViewer } from "@/components/DemoDocumentViewer";
import { DemoProjectFolders } from "@/components/DemoProjectFolders";
import { 
  Building, 
  Users, 
  Shield,
  HardHat,
  Crown,
  Clock
} from "lucide-react";

export default function Demo() {
  const [, setLocation] = useLocation();
  
  // Featured demo company with comprehensive document library
  const featuredCompany = {
    id: "demo-scaffolder",
    name: "Premier Scaffolding Ltd", 
    tradeType: "scaffolder",
    registrationNumber: "SC123456",
    postcode: "M1 4AE",
    teamMembers: 12,
    documents: 24,
    lastActivity: "2 hours ago",
    complianceScore: 94,
    masterRecords: {
      riskAssessments: 8,
      methodStatements: 6,
      toolboxTalks: 12,
      cscsCards: 11,
      qualifications: 15,
      equipmentCerts: 9
    }
  };

  const getTradeIcon = (tradeType: string) => {
    switch (tradeType) {
      case "scaffolder":
        return <Building className="h-6 w-6" />;
      case "plasterer":
        return <Shield className="h-6 w-6" />;
      case "electrician":
        return <HardHat className="h-6 w-6" />;
      default:
        return <Building className="h-6 w-6" />;
    }
  };

  // Direct demo view for featured company
  const company = featuredCompany;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Watermark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-construction-orange text-8xl sm:text-9xl lg:text-[12rem] font-bold opacity-5 transform rotate-45 select-none">
            DEMO
          </div>
        </div>
        <div className="absolute top-1/4 left-1/4 text-construction-orange text-6xl sm:text-7xl font-bold opacity-5 transform -rotate-12 select-none">
          WORKDOC360
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-construction-orange text-6xl sm:text-7xl font-bold opacity-5 transform rotate-12 select-none">
          DEMO
        </div>
      </div>

      {/* Demo Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">
            🚀 Live Demo: {company.name}
          </h1>
          <p className="text-xl opacity-90 mb-3">
            Experience our AI-powered compliance platform with real document generation
          </p>
          <div className="inline-flex items-center bg-white/20 rounded-lg px-4 py-2 text-sm">
            <Clock className="mr-2 h-4 w-4" />
            No signup required • Real AI generation • Live platform demo
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">{company.name} - Demo Dashboard</h1>
              <p className="text-steel-gray">Scaffolding Specialists • Manchester • {company.teamMembers} Team Members</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setLocation("/")}>
                Back to Landing
              </Button>
              <Button className="bg-construction-orange hover:bg-orange-600" onClick={() => setLocation("/auth")}>
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Company Overview */}
        <div className="mb-8">
          <Card className="border-2 border-construction-orange border-dashed relative overflow-hidden">
            <div className="absolute top-4 right-4 text-construction-orange text-2xl font-bold opacity-20 transform rotate-12">
              DEMO
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                    {getTradeIcon(company.tradeType)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Scaffolding Specialists</Badge>
                      <Badge className="bg-orange-100 text-construction-orange border-construction-orange">
                        DEMO COMPANY
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">
                  {company.complianceScore}% Compliant
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-6 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-charcoal">{company.teamMembers}</div>
                  <div className="text-sm text-steel-gray">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-charcoal">{company.documents}</div>
                  <div className="text-sm text-steel-gray">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-charcoal">{company.masterRecords.riskAssessments}</div>
                  <div className="text-sm text-steel-gray">Risk Assessments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-charcoal">{company.masterRecords.cscsCards}</div>
                  <div className="text-sm text-steel-gray">CSCS Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-charcoal">3</div>
                  <div className="text-sm text-steel-gray">Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-charcoal">12</div>
                  <div className="text-sm text-steel-gray">Days to Renewal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Master Records Library */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
            📋 Master Records Library (MRL)
            <Badge variant="outline" className="ml-3 text-blue-600 border-blue-600">
              COMPANY RECORDS
            </Badge>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-red-600" />
                  Risk & Safety Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Risk Assessments</span>
                    <Badge variant="outline">{company.masterRecords.riskAssessments}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Method Statements</span>
                    <Badge variant="outline">{company.masterRecords.methodStatements}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Toolbox Talks</span>
                    <Badge variant="outline">{company.masterRecords.toolboxTalks}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  Personnel Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">CSCS Cards</span>
                    <Badge variant="outline">{company.masterRecords.cscsCards}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Qualifications</span>
                    <Badge variant="outline">{company.masterRecords.qualifications}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Training Records</span>
                    <Badge variant="outline">18</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <HardHat className="mr-2 h-5 w-5 text-amber-600" />
                  Equipment Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Equipment Certificates</span>
                    <Badge variant="outline">{company.masterRecords.equipmentCerts}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inspection Records</span>
                    <Badge variant="outline">14</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">PAT Testing</span>
                    <Badge variant="outline">7</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Document Generator */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
            🤖 Real AI Document Generator
            <Badge variant="outline" className="ml-3 text-green-600 border-green-600">
              LIVE AI GENERATION
            </Badge>
          </h2>
          <DemoDocumentViewer 
            tradeType={company.tradeType} 
            companyName={company.name}
          />
        </div>

        {/* Document Library */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
            Document Library for Scaffolding Specialists
            <Badge variant="outline" className="ml-3 text-construction-orange border-construction-orange">
              DEMO CONTENT
            </Badge>
          </h2>
          <TradeSpecificDocuments 
            tradeType={company.tradeType} 
            userPlan="essential" 
          />
        </div>

        {/* Project Folders */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
            Project Management
            <Badge variant="outline" className="ml-3 text-construction-orange border-construction-orange">
              DEMO PROJECTS
            </Badge>
          </h2>
          <DemoProjectFolders 
            companyName={company.name}
            tradeType={company.tradeType}
          />
        </div>

        {/* Subscription Prompt */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-construction-orange to-orange-600 text-white border-none">
            <CardContent className="py-12 text-center">
              <Crown className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">Ready for Full Access?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                You've seen what {company.name} can achieve with WorkDoc360. Now unlock the full power 
                for your construction business with unlimited document generation, project management, and compliance tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button 
                  size="lg" 
                  className="bg-white text-construction-orange hover:bg-gray-100 flex-1"
                  onClick={() => setLocation("/auth")}
                >
                  Start Subscription - From £35/month
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-construction-orange flex-1"
                  onClick={() => setLocation("/#pricing")}
                >
                  View Pricing
                </Button>
              </div>
              <p className="text-sm mt-4 opacity-75">
                12-month commitment • UK compliance guaranteed • Professional support
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}