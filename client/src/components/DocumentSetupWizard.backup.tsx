import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Shield, 
  Users, 
  Building, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Clock,
  AlertTriangle,
  Target,
  BookOpen,
  Clipboard
} from "lucide-react";

const documentSelectionSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteAddress: z.string().min(1, "Site address is required"),
  projectManager: z.string().min(1, "Project manager name is required"),
  selectedDocuments: z.array(z.string()).min(1, "Please select at least one document type"),
  urgentDocuments: z.array(z.string()).optional(),
});

interface DocumentSetupWizardProps {
  companyId: number;
  companyName: string;
  tradeType: string;
  onComplete: () => void;
}

type DocumentSelectionData = z.infer<typeof documentSelectionSchema>;

export function DocumentSetupWizard({ companyId, companyName, tradeType, onComplete }: DocumentSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<DocumentSelectionData>({
    resolver: zodResolver(documentSelectionSchema),
    defaultValues: {
      siteName: "",
      siteAddress: "",
      projectManager: "",
      selectedDocuments: [],
      urgentDocuments: [],
    },
  });

  // Get trade-specific document types
  const getDocumentTypes = () => {
    const commonDocuments = [
      {
        id: "risk-assessment",
        name: "Risk Assessment",
        description: "Identify and evaluate workplace hazards",
        icon: <AlertTriangle className="h-5 w-5" />,
        category: "Essential",
        estimatedTime: "5 minutes",
        required: true
      },
      {
        id: "method-statement",
        name: "Method Statement",
        description: "Step-by-step work procedure documentation",
        icon: <Clipboard className="h-5 w-5" />,
        category: "Essential",
        estimatedTime: "7 minutes",
        required: true
      },
      {
        id: "toolbox-talk",
        name: "Toolbox Talk Template",
        description: "Daily safety briefing template",
        icon: <Users className="h-5 w-5" />,
        category: "Health & Safety",
        estimatedTime: "3 minutes",
        required: false
      },
      {
        id: "permit-to-work",
        name: "Permit to Work",
        description: "Authorization for high-risk activities",
        icon: <Shield className="h-5 w-5" />,
        category: "Safety Control",
        estimatedTime: "4 minutes",
        required: false
      }
    ];

    const tradeSpecificDocs = {
      scaffolding: [
        {
          id: "scaffold-inspection",
          name: "Scaffold Inspection Checklist",
          description: "Daily scaffold safety inspection record",
          icon: <Building className="h-5 w-5" />,
          category: "Trade Specific",
          estimatedTime: "6 minutes",
          required: true
        },
        {
          id: "scaffold-handover",
          name: "Scaffold Handover Certificate",
          description: "Completion and handover documentation",
          icon: <FileText className="h-5 w-5" />,
          category: "Trade Specific",
          estimatedTime: "5 minutes",
          required: false
        }
      ],
      plastering: [
        {
          id: "surface-preparation",
          name: "Surface Preparation Checklist",
          description: "Pre-plastering surface assessment",
          icon: <Target className="h-5 w-5" />,
          category: "Trade Specific",
          estimatedTime: "4 minutes",
          required: true
        },
        {
          id: "material-specification",
          name: "Material Specification Sheet",
          description: "Plaster mix and material requirements",
          icon: <BookOpen className="h-5 w-5" />,
          category: "Trade Specific",
          estimatedTime: "5 minutes",
          required: false
        }
      ],
      general_contractor: [
        {
          id: "site-setup",
          name: "Site Setup Checklist",
          description: "Initial site establishment procedures",
          icon: <Building className="h-5 w-5" />,
          category: "Trade Specific", 
          estimatedTime: "8 minutes",
          required: true
        }
      ]
    };

    return [
      ...commonDocuments,
      ...(tradeSpecificDocs[tradeType as keyof typeof tradeSpecificDocs] || [])
    ];
  };

  const documentTypes = getDocumentTypes();
  const requiredDocs = documentTypes.filter(doc => doc.required);
  const optionalDocs = documentTypes.filter(doc => !doc.required);

  const generateDocumentsMutation = useMutation({
    mutationFn: async (data: DocumentSelectionData) => {
      const results = [];
      
      for (const docType of data.selectedDocuments) {
        const docInfo = documentTypes.find(d => d.id === docType);
        if (!docInfo) continue;

        const response = await apiRequest("POST", "/api/generate-document", {
          companyId,
          templateType: docType,
          siteName: data.siteName,
          siteAddress: data.siteAddress,
          projectManager: data.projectManager,
          isUrgent: data.urgentDocuments?.includes(docType) || false,
          tradeType
        });

        results.push({
          type: docType,
          name: docInfo.name,
          ...response
        });
      }

      return results;
    },
    onSuccess: (documents) => {
      setGeneratedDocuments(documents);
      setCurrentStep(4);
      toast({
        title: "Documents Generated Successfully!",
        description: `Created ${documents.length} compliance documents for ${companyName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate documents. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: DocumentSelectionData) => {
    setIsGenerating(true);
    try {
      await generateDocumentsMutation.mutateAsync(data);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDocumentToggle = (docId: string, checked: boolean) => {
    const currentSelected = form.getValues("selectedDocuments");
    if (checked) {
      form.setValue("selectedDocuments", [...currentSelected, docId]);
    } else {
      form.setValue("selectedDocuments", currentSelected.filter(id => id !== docId));
    }
  };

  const handleUrgentToggle = (docId: string, checked: boolean) => {
    const currentUrgent = form.getValues("urgentDocuments") || [];
    if (checked) {
      form.setValue("urgentDocuments", [...currentUrgent, docId]);
    } else {
      form.setValue("urgentDocuments", currentUrgent.filter(id => id !== docId));
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 1: return 25;
      case 2: return 50;
      case 3: return 75;
      case 4: return 100;
      default: return 0;
    }
  };

  const selectedCount = form.watch("selectedDocuments")?.length || 0;
  const estimatedTime = documentTypes
    .filter(doc => form.watch("selectedDocuments")?.includes(doc.id))
    .reduce((total, doc) => total + parseInt(doc.estimatedTime), 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-charcoal">Document Setup Wizard</h1>
          <Badge variant="outline" className="bg-construction-orange bg-opacity-10">
            Step {currentStep} of 4
          </Badge>
        </div>
        <Progress value={getStepProgress()} className="w-full h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: Welcome & Overview */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-construction-orange" />
                  <span>Welcome to {companyName}!</span>
                </CardTitle>
                <CardDescription>
                  Let's create your essential compliance documents to get you started quickly and safely.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-construction-orange mx-auto mb-2" />
                    <h3 className="font-semibold">Essential Documents</h3>
                    <p className="text-sm text-steel-gray">Risk assessments and method statements</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Shield className="h-8 w-8 text-construction-orange mx-auto mb-2" />
                    <h3 className="font-semibold">Safety Templates</h3>
                    <p className="text-sm text-steel-gray">Toolbox talks and safety procedures</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-construction-orange mx-auto mb-2" />
                    <h3 className="font-semibold">Quick Setup</h3>
                    <p className="text-sm text-steel-gray">Generated in minutes, not hours</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">What You'll Get:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• UK-compliant templates tailored for {tradeType.replace('_', ' ')}</li>
                    <li>• Professional documents with your company branding</li>
                    <li>• Editable templates for future projects</li>
                    <li>• Instant download in PDF and Word formats</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)} className="bg-construction-orange hover:bg-orange-600">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Site Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Enter details for your first project site. This will be used in all generated documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site/Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Warehouse Extension Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Full site address including postcode" 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectManager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager/Site Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Site manager or project contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={!form.watch("siteName") || !form.watch("siteAddress") || !form.watch("projectManager")}
                    className="bg-construction-orange hover:bg-orange-600"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Document Selection */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Documents to Generate</CardTitle>
                <CardDescription>
                  Choose the compliance documents you need. Required documents are pre-selected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Required Documents */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    Essential Documents (Required)
                  </h3>
                  <div className="grid gap-3">
                    {requiredDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-red-50 border-red-200">
                        <Checkbox 
                          checked={true}
                          disabled={true}
                          onCheckedChange={() => handleDocumentToggle(doc.id, true)}
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          {doc.icon}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{doc.name}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{doc.category}</Badge>
                                <span className="text-xs text-steel-gray">~{doc.estimatedTime}</span>
                              </div>
                            </div>
                            <p className="text-sm text-steel-gray">{doc.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Documents */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Additional Documents (Optional)
                  </h3>
                  <div className="grid gap-3">
                    {optionalDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox 
                          checked={form.watch("selectedDocuments")?.includes(doc.id) || false}
                          onCheckedChange={(checked) => handleDocumentToggle(doc.id, checked as boolean)}
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          {doc.icon}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{doc.name}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{doc.category}</Badge>
                                <span className="text-xs text-steel-gray">~{doc.estimatedTime}</span>
                              </div>
                            </div>
                            <p className="text-sm text-steel-gray">{doc.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generation Summary */}
                <div className="bg-construction-orange bg-opacity-10 border border-construction-orange rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-charcoal">Generation Summary</h4>
                      <p className="text-sm text-steel-gray">
                        {selectedCount} documents selected • Estimated time: ~{estimatedTime} minutes
                      </p>
                    </div>
                    <Sparkles className="h-6 w-6 text-construction-orange" />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={selectedCount === 0 || isGenerating}
                    className="bg-construction-orange hover:bg-orange-600"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Documents...
                      </>
                    ) : (
                      <>
                        Generate {selectedCount} Documents
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Completion */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span>Documents Generated Successfully!</span>
                </CardTitle>
                <CardDescription>
                  Your compliance documents are ready for download and use.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  {generatedDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-construction-orange" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-steel-gray">Ready for download</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Review and customise your documents as needed</li>
                    <li>• Upload any existing compliance documentation</li>
                    <li>• Set up your team members and roles</li>
                    <li>• Schedule regular compliance reviews</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button onClick={onComplete} className="bg-construction-orange hover:bg-orange-600">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </form>
      </Form>
    </div>
  );
}