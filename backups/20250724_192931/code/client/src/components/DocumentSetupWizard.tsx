import { useState, useEffect } from "react";
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
  Clipboard,
  Zap,
  Rocket,
  Download,
  Star,
  Award,
  Wand2,
  Globe,
  TrendingUp,
  Info,
  CheckCircle2,
  AlertCircle,
  Timer,
  Eye,
  Lightbulb,
  Package,
  Calendar,
  MapPin,
  User,
  Save,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronRight,
  ChevronDown,
  Filter,
  Search,
  Heart,
  Bookmark,
  Plus
} from "lucide-react";
import { DocumentGenerationProgress } from "./DocumentGenerationProgress";

const documentSelectionSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters").max(100, "Site name too long"),
  siteAddress: z.string().min(5, "Please enter a complete address").max(200, "Address too long"),
  projectManager: z.string().min(2, "Project manager name must be at least 2 characters").max(100, "Name too long"),
  selectedDocuments: z.array(z.string()).min(1, "Please select at least one document type"),
  urgentDocuments: z.array(z.string()).optional(),
  projectStartDate: z.string().optional(),
  projectDuration: z.string().optional(),
  specialRequirements: z.string().optional(),
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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedDraft, setSavedDraft] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [documentFilter, setDocumentFilter] = useState<'all' | 'required' | 'optional' | 'recommended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const { toast } = useToast();

  // Enhanced step management
  const steps = [
    { id: 1, title: 'Welcome', description: 'Project overview', icon: Rocket, estimatedTime: 2 },
    { id: 2, title: 'Site Details', description: 'Project information', icon: MapPin, estimatedTime: 5 },
    { id: 3, title: 'Documents', description: 'Select templates', icon: FileText, estimatedTime: 8 },
    { id: 4, title: 'Generate', description: 'Create documents', icon: Wand2, estimatedTime: 3 }
  ];

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Form initialization will be done after getDocumentTypes

  // Auto-save draft functionality
  useEffect(() => {
    const formData = form.getValues();
    if (formData.siteName || formData.siteAddress || formData.projectManager) {
      const draft = {
        ...formData,
        step: currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem(`wizard-draft-${companyId}`, JSON.stringify(draft));
      setSavedDraft(draft);
    }
  }, [form.watch(), currentStep, companyId]);

  // Load saved draft on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`wizard-draft-${companyId}`);
    if (savedData) {
      try {
        const draft = JSON.parse(savedData);
        setSavedDraft(draft);
        // Auto-restore if recent (within 24 hours)
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          form.reset(draft);
          setCurrentStep(draft.step || 1);
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Enhanced step navigation
  const goToStep = (step: number) => {
    if (step <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(step);
    }
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  // Smart document recommendations
  const getRecommendedDocuments = () => {
    const baseRecommendations = documentTypes.filter(doc => doc.required);
    const formData = form.getValues();
    
    // Add recommendations based on project context
    const recommendations = [...baseRecommendations];
    
    if (formData.siteAddress?.toLowerCase().includes('city') || formData.siteAddress?.toLowerCase().includes('urban')) {
      recommendations.push(...documentTypes.filter(doc => doc.id.includes('noise') || doc.id.includes('traffic')));
    }
    
    if (formData.projectDuration === 'long-term') {
      recommendations.push(...documentTypes.filter(doc => doc.id.includes('environmental') || doc.id.includes('community')));
    }
    
    return recommendations.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );
  };

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

  const form = useForm<DocumentSelectionData>({
    resolver: zodResolver(documentSelectionSchema),
    mode: "onChange",
    defaultValues: {
      siteName: "",
      siteAddress: "",
      projectManager: "",
      selectedDocuments: requiredDocs.map(doc => doc.id),
      urgentDocuments: [],
      projectStartDate: "",
      projectDuration: "",
      specialRequirements: "",
    },
  });

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
          docType,
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
  const selectedDocTypes = documentTypes.filter(doc => form.watch("selectedDocuments")?.includes(doc.id));
  const calculatedTime = selectedDocTypes.reduce((total, doc) => total + parseInt(doc.estimatedTime), 0);
  
  // Update estimated time when selection changes
  useEffect(() => {
    setEstimatedTime(calculatedTime);
  }, [calculatedTime]);

  // Enhanced document filtering
  const getFilteredDocuments = () => {
    let filtered = documentTypes;
    
    // Apply category filter
    switch (documentFilter) {
      case 'required':
        filtered = filtered.filter(doc => doc.required);
        break;
      case 'optional':
        filtered = filtered.filter(doc => !doc.required);
        break;
      case 'recommended':
        filtered = getRecommendedDocuments();
        break;
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Document cost estimation
  const calculateDocumentCost = () => {
    const baseCost = selectedCount * 2.5; // £2.50 per document
    const urgentCount = form.watch("urgentDocuments")?.length || 0;
    const urgentSurcharge = urgentCount * 1.0; // £1 surcharge for urgent
    return baseCost + urgentSurcharge;
  };

  // Smart form suggestions
  const getAddressSuggestions = (query: string) => {
    // Mock address suggestions - in real app would use Google Places API
    const commonSites = [
      'Manchester City Centre',
      'Birmingham Business District', 
      'London Borough of Camden',
      'Leeds Industrial Estate',
      'Glasgow Merchant City'
    ];
    
    return commonSites.filter(addr => 
      addr.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getProjectManagerSuggestions = () => {
    // Common project manager names in construction
    return [
      'John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Brown', 'David Jones'
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-construction-orange bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-construction-orange to-blue-500 bg-opacity-5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Enhanced Header with Smart Status */}
        <div className="mb-8 backdrop-blur-lg bg-white bg-opacity-80 rounded-3xl p-8 border border-white border-opacity-20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-construction-orange to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-charcoal via-construction-orange to-charcoal bg-clip-text text-transparent">
                  Document Creation Wizard
                </h1>
                <p className="text-steel-gray text-lg">Create professional compliance documents in minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Online/Offline Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              
              {/* Draft Status */}
              {savedDraft && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  <Save className="w-4 h-4 mr-1" />
                  Draft Saved
                </Badge>
              )}
              
              {/* Time Estimate */}
              <Badge variant="outline" className="bg-gradient-to-r from-construction-orange to-orange-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                <Timer className="w-4 h-4 mr-1" />
                Step {currentStep} of 4
              </Badge>
            </div>
          </div>
          
          {/* Enhanced Clickable Progress Navigation */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner mb-4">
              <div 
                className="bg-gradient-to-r from-construction-orange to-orange-600 h-4 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${getStepProgress()}%` }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent opacity-40"></div>
              </div>
            </div>
            
            {/* Interactive Step Indicators */}
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const isClickable = step.id <= Math.max(...completedSteps, currentStep);
                const StepIcon = step.icon;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && goToStep(step.id)}
                    disabled={!isClickable}
                    className={`group flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-300 ${
                      isClickable ? 'cursor-pointer hover:bg-white hover:bg-opacity-50 hover:scale-105' : 'cursor-not-allowed opacity-50'
                    } ${isCurrent ? 'bg-white bg-opacity-60 shadow-lg' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted ? 'bg-green-500 text-white' : 
                      isCurrent ? 'bg-construction-orange text-white' : 
                      'bg-gray-200 text-gray-500'
                    } ${isClickable ? 'group-hover:scale-110' : ''}`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${isCurrent ? 'text-construction-orange' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                      <div className="text-xs text-gray-400 flex items-center justify-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.estimatedTime}m
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Overall Progress Summary */}
            <div className="mt-6 flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-gray-600">
                  {estimatedTime > 0 && `~${estimatedTime} min remaining`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Total cost estimate:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  £{calculateDocumentCost().toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: Welcome & Overview */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-700">
              {/* Hero Section */}
              <Card className="backdrop-blur-lg bg-white bg-opacity-90 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-construction-orange to-orange-600 p-8 text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                        <Rocket className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">Welcome to {companyName}!</h2>
                        <p className="text-orange-100 text-lg">Your compliance journey starts here</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8 space-y-8">
                  {/* Feature Cards */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-charcoal mb-2">Essential Documents</h3>
                      <p className="text-steel-gray text-sm">UK-compliant risk assessments and method statements</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-charcoal mb-2">Safety Templates</h3>
                      <p className="text-steel-gray text-sm">Professional toolbox talks and safety procedures</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-charcoal mb-2">AI-Powered</h3>
                      <p className="text-steel-gray text-sm">Generated in minutes with intelligent automation</p>
                    </div>
                  </div>

                  {/* Benefits Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center mb-4">
                      <Award className="h-6 w-6 text-construction-orange mr-2" />
                      <h4 className="font-bold text-charcoal text-lg">What You'll Get</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-charcoal">UK-compliant templates for {tradeType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-charcoal">Professional company branding</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-charcoal">Editable templates for future use</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-charcoal">Instant PDF and Word downloads</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        setCurrentStep(2);
                        markStepComplete(1);
                      }} 
                      className="bg-gradient-to-r from-construction-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Rocket className="mr-2 h-5 w-5" />
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Site Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-700">
              <Card className="backdrop-blur-lg bg-white bg-opacity-95 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                        <Building className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">Site Information</h2>
                        <p className="text-blue-100 text-lg">Tell us about your project site</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-lg font-semibold text-charcoal flex items-center">
                            <Globe className="h-5 w-5 mr-2 text-construction-orange" />
                            Site/Project Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Warehouse Extension Project" 
                              className="h-12 rounded-xl border-2 border-gray-200 focus:border-construction-orange transition-all duration-300 text-lg px-4"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="siteAddress"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-lg font-semibold text-charcoal flex items-center">
                            <Building className="h-5 w-5 mr-2 text-construction-orange" />
                            Site Address
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Full site address including postcode" 
                              className="min-h-24 rounded-xl border-2 border-gray-200 focus:border-construction-orange transition-all duration-300 text-lg px-4 py-3 resize-none"
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
                        <FormItem className="group">
                          <FormLabel className="text-lg font-semibold text-charcoal flex items-center">
                            <Users className="h-5 w-5 mr-2 text-construction-orange" />
                            Project Manager/Site Contact
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Site manager or project contact name" 
                              className="h-12 rounded-xl border-2 border-gray-200 focus:border-construction-orange transition-all duration-300 text-lg px-4"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button 
                      onClick={async () => {
                        const isValid = await form.trigger(['siteName', 'siteAddress', 'projectManager']);
                        if (isValid) {
                          setCurrentStep(3);
                          markStepComplete(2);
                        }
                      }}
                      disabled={!form.watch("siteName") || !form.watch("siteAddress") || !form.watch("projectManager")}
                      className="bg-gradient-to-r from-construction-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Continue to Documents
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Enhanced Document Selection with Smart Features */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-left duration-700">
              {/* Enhanced Header with Smart Controls */}
              <Card className="backdrop-blur-lg bg-white bg-opacity-95 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Document Selection</h2>
                        <p className="text-purple-100">Choose the compliance documents you need</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                        {selectedCount} selected
                      </Badge>
                      <Badge variant="outline" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                        ~{estimatedTime}m to generate
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Smart Controls */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-gray-50 rounded-2xl p-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-construction-orange transition-all duration-300"
                      />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex space-x-2">
                      {[
                        { key: 'all', label: 'All', icon: Package },
                        { key: 'required', label: 'Required', icon: AlertTriangle },
                        { key: 'optional', label: 'Optional', icon: CheckCircle },
                        { key: 'recommended', label: 'Recommended', icon: Lightbulb }
                      ].map(({ key, label, icon: Icon }) => (
                        <Button
                          key={key}
                          variant={documentFilter === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDocumentFilter(key as any)}
                          className={`rounded-lg transition-all duration-300 ${
                            documentFilter === key 
                              ? 'bg-construction-orange text-white shadow-lg' 
                              : 'hover:border-construction-orange hover:text-construction-orange'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-1" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Smart Recommendations Banner */}
                  {getRecommendedDocuments().length > 0 && documentFilter === 'all' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Lightbulb className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">AI Recommendations</h4>
                          <p className="text-blue-700 text-sm mb-3">
                            Based on your project details, we recommend these additional documents:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {getRecommendedDocuments()
                              .filter(doc => !form.watch("selectedDocuments")?.includes(doc.id))
                              .slice(0, 3)
                              .map(doc => (
                                <Button
                                  key={doc.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const current = form.getValues("selectedDocuments");
                                    form.setValue("selectedDocuments", [...current, doc.id]);
                                  }}
                                  className="text-blue-700 border-blue-300 hover:bg-blue-100 rounded-lg"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  {doc.name}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Grid with Enhanced Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredDocuments().map((doc, index) => {
                      const isSelected = form.watch("selectedDocuments")?.includes(doc.id);
                      const isUrgent = form.watch("urgentDocuments")?.includes(doc.id);
                      const isRecommended = getRecommendedDocuments().some(r => r.id === doc.id);

                      return (
                        <div
                          key={doc.id}
                          className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'border-construction-orange bg-orange-50 shadow-lg scale-105' 
                              : 'border-gray-200 bg-white hover:border-construction-orange hover:shadow-md hover:scale-102'
                          }`}
                          onClick={() => handleDocumentToggle(doc.id, !isSelected)}
                        >
                          {/* Document Type Badge */}
                          <div className="flex items-center justify-between mb-4">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                doc.required 
                                  ? 'bg-red-50 text-red-700 border-red-200' 
                                  : isRecommended
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {doc.required ? 'Required' : isRecommended ? 'Recommended' : 'Optional'}
                            </Badge>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDocument(doc.id);
                                }}
                                className="p-2 hover:bg-construction-orange hover:text-white rounded-lg transition-all duration-300"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {isSelected && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUrgentToggle(doc.id, !isUrgent);
                                  }}
                                  className={`p-2 rounded-lg transition-all duration-300 ${
                                    isUrgent 
                                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                      : 'hover:bg-orange-100 hover:text-orange-600'
                                  }`}
                                >
                                  {isUrgent ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Document Icon & Content */}
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isSelected 
                                ? 'bg-construction-orange text-white' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-construction-orange group-hover:text-white'
                            }`}>
                              {doc.icon}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className={`font-bold mb-2 transition-all duration-300 ${
                                isSelected ? 'text-construction-orange' : 'text-charcoal group-hover:text-construction-orange'
                              }`}>
                                {doc.name}
                              </h4>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {doc.description}
                              </p>
                              
                              {/* Document Metadata */}
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {doc.estimatedTime}
                                </span>
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  {doc.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <div className="w-6 h-6 bg-construction-orange rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Urgent Indicator */}
                          {isUrgent && (
                            <div className="absolute bottom-3 right-3">
                              <Badge className="bg-red-500 text-white text-xs">
                                Urgent
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selection Summary */}
                  {selectedCount > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-green-900 mb-2">Selection Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="text-green-700">{selectedCount} documents</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Timer className="w-4 h-4 text-green-600" />
                              <span className="text-green-700">~{estimatedTime} minutes</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-green-600" />
                              <span className="text-green-700">{form.watch("urgentDocuments")?.length || 0} urgent</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-green-600" />
                              <span className="text-green-700">£{calculateDocumentCost().toFixed(2)} total</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            form.setValue("selectedDocuments", []);
                            form.setValue("urgentDocuments", []);
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Navigation */}
                  <div className="flex justify-between items-center pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-construction-orange transition-all duration-300"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Site Details
                    </Button>
                    
                    <div className="flex items-center space-x-4">
                      {/* Validation Status */}
                      <div className="text-sm text-gray-600 flex items-center space-x-2">
                        {selectedCount > 0 ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-600 font-medium">Ready to generate</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            <span>Select at least one document</span>
                          </>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => {
                          if (selectedCount > 0) {
                            setCurrentStep(4);
                            markStepComplete(3);
                          }
                        }}
                        disabled={selectedCount === 0}
                        className="bg-gradient-to-r from-construction-orange to-orange-600 hover:from-orange-600 hover:to-construction-orange text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generate Documents
                        <Wand2 className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Enhanced Document Generation */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-700">
              <Card className="backdrop-blur-lg bg-white bg-opacity-95 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <Wand2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Generate Documents</h2>
                        <p className="text-green-100">Creating your professional compliance documents</p>
                      </div>
                    </div>
                    {!isGenerating && generatedDocuments.length === 0 && (
                      <Badge variant="outline" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                        Ready to Generate
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Generation Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="font-bold text-charcoal mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-construction-orange" />
                      Generation Summary
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-charcoal">{selectedCount} documents</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="text-charcoal">{form.getValues("siteName")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-blue-600" />
                        <span className="text-charcoal">~{estimatedTime} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-blue-600" />
                        <span className="text-charcoal">£{calculateDocumentCost().toFixed(2)} total</span>
                      </div>
                    </div>
                  </div>

                  {/* Generation Progress */}
                  {isGenerating && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-8 h-8 bg-construction-orange rounded-full flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <div>
                          <h4 className="font-bold text-charcoal">Generating Documents</h4>
                          <p className="text-gray-600 text-sm">AI is creating your professional compliance documents...</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div className="bg-gradient-to-r from-construction-orange to-orange-600 h-3 rounded-full transition-all duration-1000 ease-out animate-pulse" style={{width: '75%'}}></div>
                      </div>
                    </div>
                  )}

                  {/* Generated Documents List */}
                  {generatedDocuments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-charcoal text-lg flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                        Generated Documents
                      </h3>
                      <div className="grid gap-4">
                        {generatedDocuments.map((doc, index) => (
                          <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-charcoal">{doc.name}</h4>
                                  <p className="text-gray-600 text-sm">Ready for download</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-construction-orange text-construction-orange hover:bg-construction-orange hover:text-white"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-construction-orange text-white hover:bg-orange-600"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(3)}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-construction-orange transition-all duration-300"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Selection
                    </Button>
                    
                    <div className="flex items-center space-x-4">
                      {generatedDocuments.length === 0 ? (
                        <Button 
                          type="submit"
                          disabled={isGenerating || selectedCount === 0}
                          className="bg-gradient-to-r from-construction-orange to-orange-600 hover:from-orange-600 hover:to-construction-orange text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-5 w-5" />
                              Start Generation
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setGeneratedDocuments([]);
                              setCurrentStep(1);
                            }}
                            className="border-gray-300 hover:border-construction-orange transition-all duration-300"
                          >
                            <Plus className="mr-2 h-5 w-5" />
                            Create More
                          </Button>
                          <Button 
                            onClick={onComplete}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Complete Setup
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </form>
      </Form>
      </div>
    </div>
  );
};

export default DocumentSetupWizard;