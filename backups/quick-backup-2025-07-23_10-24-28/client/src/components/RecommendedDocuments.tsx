import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Download, 
  Star, 
  CheckCircle, 
  Clock, 
  Shield,
  HardHat,
  Users,
  Package,
  Sparkles
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecommendedDocumentsProps {
  companyId: number;
  companyName: string;
  tradeType: string;
  planType: string;
}

export function RecommendedDocuments({ 
  companyId, 
  companyName, 
  tradeType, 
  planType 
}: RecommendedDocumentsProps) {
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [generatingDocuments, setGeneratingDocuments] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();



  // Trade-specific document recommendations
  const getRecommendedDocuments = () => {
    const baseDocuments = [
      {
        id: "risk-assessment-general",
        title: "General Risk Assessment Template",
        description: "Comprehensive risk assessment for daily operations",
        category: "Health & Safety",
        priority: "high",
        estimatedTime: "15 mins",
        icon: Shield,
        included: true
      },
      {
        id: "method-statement-core",
        title: "Core Method Statement",
        description: "Standard operating procedures for your trade",
        category: "Health & Safety", 
        priority: "high",
        estimatedTime: "20 mins",
        icon: FileText,
        included: true
      },
      {
        id: "toolbox-talk-safety",
        title: "Weekly Safety Toolbox Talk",
        description: "Pre-recorded safety briefing templates",
        category: "Health & Safety",
        priority: "medium",
        estimatedTime: "10 mins", 
        icon: Users,
        included: true
      }
    ];

    const scaffoldingDocuments = [
      {
        id: "scaffold-inspection",
        title: "Scaffold Inspection Checklist",
        description: "CISRS-compliant daily inspection forms",
        category: "Trade Specific",
        priority: "high",
        estimatedTime: "12 mins",
        icon: HardHat,
        included: true
      },
      {
        id: "working-at-height",
        title: "Working at Height Risk Assessment", 
        description: "Specialised risk assessment for elevated work",
        category: "Trade Specific",
        priority: "high",
        estimatedTime: "18 mins",
        icon: Shield,
        included: true
      },
      {
        id: "scaffold-erection-method",
        title: "Scaffold Erection Method Statement",
        description: "Step-by-step scaffold construction procedures",
        category: "Trade Specific", 
        priority: "high",
        estimatedTime: "25 mins",
        icon: FileText,
        included: true
      }
    ];

    const premiumDocuments = [
      {
        id: "iso-quality-manual",
        title: "ISO 9001:2015 Quality Manual",
        description: "Complete quality management system documentation",
        category: "ISO 9001",
        priority: "premium",
        estimatedTime: "45 mins",
        icon: Star,
        included: planType === "professional" || planType === "enterprise"
      },
      {
        id: "iso-procedures",
        title: "ISO 9001 Procedures Suite",
        description: "Document control, corrective actions, and audit procedures",
        category: "ISO 9001", 
        priority: "premium",
        estimatedTime: "60 mins",
        icon: Package,
        included: planType === "professional" || planType === "enterprise"
      },
      {
        id: "quality-policy",
        title: "Quality Policy & Objectives",
        description: "Customised quality policy for your business",
        category: "ISO 9001",
        priority: "premium", 
        estimatedTime: "30 mins",
        icon: FileText,
        included: planType === "professional" || planType === "enterprise"
      }
    ];

    let documents = [...baseDocuments];
    
    if (tradeType === "scaffolding") {
      documents.push(...scaffoldingDocuments);
    }
    
    documents.push(...premiumDocuments);
    
    return documents;
  };

  const documentSuites = [
    {
      id: "essential-compliance",
      name: "Essential Compliance Suite",
      description: "Core health & safety documents required for all construction work",
      documents: ["risk-assessment-general", "method-statement-core", "toolbox-talk-safety"],
      estimatedTime: "45 mins",
      included: true,
      popular: true
    },
    {
      id: "trade-specialist", 
      name: `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} Specialist Suite`,
      description: "Trade-specific documents tailored to your specialisation",
      documents: tradeType === "scaffolding" 
        ? ["scaffold-inspection", "working-at-height", "scaffold-erection-method"]
        : ["risk-assessment-general", "method-statement-core"],
      estimatedTime: tradeType === "scaffolding" ? "55 mins" : "35 mins", 
      included: true,
      popular: false
    },
    {
      id: "iso-9001-complete",
      name: "Complete ISO 9001:2015 Suite",
      description: "Full quality management system for professional businesses",
      documents: ["iso-quality-manual", "iso-procedures", "quality-policy"],
      estimatedTime: "135 mins",
      included: planType === "professional" || planType === "enterprise",
      popular: planType === "professional" || planType === "enterprise"
    }
  ];

  const generateDocumentSuite = useMutation({
    mutationFn: async (suiteId: string) => {
      setGeneratingDocuments(true);
      const response = await apiRequest("POST", `/api/companies/${companyId}/generate-document-suite`, {
        suiteId,
        companyName,
        tradeType
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "documents"] });
      toast({
        title: "Documents Generated Successfully!",
        description: `${(data as any).documentCount} documents have been added to your library.`,
      });
      setGeneratingDocuments(false);
      setSelectedSuite(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed", 
        description: error.message,
        variant: "destructive",
      });
      setGeneratingDocuments(false);
    },
  });

  const recommendedDocs = getRecommendedDocuments();

  console.log('RecommendedDocuments rendering with:', {
    companyId,
    companyName,
    tradeType,
    planType,
    recommendedDocsCount: recommendedDocs.length
  });

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
        <strong>Debug Info:</strong> Company: {companyName}, Trade: {tradeType}, Plan: {planType}, Documents: {recommendedDocs.length}
      </div>
      
      {/* Quick Generate Document Suites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-construction-orange" />
            Quick Document Suite Generation for {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} Contractors
          </CardTitle>
          <CardDescription>
            Generate complete document packages tailored to your business type and trade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {documentSuites.map((suite) => (
              <Card 
                key={suite.id}
                className={`cursor-pointer transition-all ${
                  selectedSuite === suite.id ? 'ring-2 ring-construction-orange' : ''
                } ${!suite.included ? 'opacity-60' : ''}`}
                onClick={() => suite.included && setSelectedSuite(suite.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{suite.name}</h4>
                        {suite.popular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suite.description}
                      </p>
                    </div>
                    {!suite.included && (
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {suite.estimatedTime}
                    </span>
                    <span>{suite.documents.length} docs</span>
                  </div>

                  {suite.included ? (
                    <Button
                      size="sm"
                      className="w-full bg-construction-orange hover:bg-construction-orange/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateDocumentSuite.mutate(suite.id);
                      }}
                      disabled={generatingDocuments}
                    >
                      {generatingDocuments ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-2" />
                          Generate Suite
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Upgrade Required",
                          description: "This suite requires a Professional plan or higher.",
                        });
                      }}
                    >
                      Upgrade to Access
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Document Recommendations */}
      <Tabs defaultValue="included" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="included">Included Documents</TabsTrigger>
          <TabsTrigger value="premium">Premium Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="included" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedDocs
              .filter(doc => doc.included)
              .map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-construction-orange/10 rounded-lg">
                        <doc.icon className="h-4 w-4 text-construction-orange" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {doc.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={doc.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {doc.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doc.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.estimatedTime}
                      </span>
                    </div>

                    <Button size="sm" variant="outline" className="w-full">
                      <FileText className="h-3 w-3 mr-2" />
                      Generate Document
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          {planType !== "professional" && planType !== "enterprise" && (
            <Alert>
              <Star className="h-4 w-4" />
              <AlertDescription>
                Upgrade to Professional plan (£129/month) to access ISO 9001:2015 quality management documents and advanced templates.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedDocs
              .filter(doc => doc.priority === 'premium')
              .map((doc) => (
                <Card 
                  key={doc.id} 
                  className={`hover:shadow-md transition-shadow ${!doc.included ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <doc.icon className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {doc.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                            Premium
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doc.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {doc.estimatedTime}
                      </span>
                    </div>

                    {doc.included ? (
                      <Button size="sm" variant="outline" className="w-full">
                        <FileText className="h-3 w-3 mr-2" />
                        Generate Document
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full" disabled>
                        Upgrade Required
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}