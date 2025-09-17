import { useState } from "react";
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
  FileText, 
  Shield,
  HardHat,
  ArrowRight,
  Clock,
  Download,
  Plus,
  Crown,
  AlertTriangle,
  X
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

  const getTradeLabel = (tradeType: string) => {
    switch (tradeType) {
      case "scaffolder":
        return "Scaffolder";
      case "plasterer":
        return "Plasterer";
      case "electrician":
        return "Electrician";
      default:
        return "Construction";
    }
  };

  // Direct demo view for featured company
  const company = featuredCompany;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">
            🚀 See AI Create Documents in 28 Seconds
          </h1>
          <p className="text-xl opacity-90 mb-3">
            Don't take our word for it — here's a scaffold RAMS document created in 27 seconds by our AI.
          </p>
          <div className="inline-flex items-center bg-white/20 rounded-lg px-4 py-2 text-sm">
            <Clock className="mr-2 h-4 w-4" />
            No signup required • Instant preview • Real AI generation
          </div>
          <p className="text-sm mt-3 opacity-75">
            Want to save, download, or generate more documents? 
            <button 
              className="underline font-semibold ml-1 hover:text-green-200"
              onClick={() => setLocation("/auth")}
            >
              Subscribe to unlock full access
            </button>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Choose a Demo Company</h1>
              <p className="text-steel-gray">Experience WorkDoc360 from different trade perspectives</p>
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoCompanies.map((company) => (
            <Card 
              key={company.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer hover:border-construction-orange group relative overflow-hidden" 
              onClick={() => setSelectedCompany(company.id)}
            >
              <div className="absolute top-2 right-2 text-construction-orange text-xs font-bold opacity-30 transform rotate-12">
                DEMO
              </div>
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
                  <ArrowRight className="h-4 w-4 text-steel-gray group-hover:text-construction-orange transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-steel-gray">Team Members:</span>
                    <span className="font-medium">{company.teamMembers}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-steel-gray">Documents:</span>
                    <span className="font-medium">{company.documents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-steel-gray">Compliance:</span>
                    <Badge className="bg-compliant-green text-white text-xs">
                      {company.complianceScore}%
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full bg-construction-orange hover:bg-orange-600 group-hover:shadow-md transition-shadow">
                    Explore {company.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-construction-orange to-orange-600 text-white border-none">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of UK construction businesses managing their compliance with WorkDoc360
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  size="lg" 
                  className="bg-white text-construction-orange hover:bg-gray-100" 
                  onClick={() => setLocation("/auth")}
                >
                  Start Subscription - £65/month
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-construction-orange"
                >
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}