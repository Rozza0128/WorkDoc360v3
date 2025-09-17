import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCompanySchema } from "@shared/schema";
import { 
  Building, 
  PaintRoller, 
  Hammer, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Zap,
  Wrench,
  Home,
  Thermometer,
  Mountain,
  Layers,
  Sun,
  MoreHorizontal,
  Construction,
  Cpu,
  Search,
  Brain,
  Loader2
} from "lucide-react";
import { DocumentSetupWizard } from "@/components/DocumentSetupWizard";
import { UsageCounter } from "@/components/UsageCounter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const onboardingSchema = insertCompanySchema.extend({
  businessType: z.enum(["limited_company", "sole_trader", "partnership", "llp", "charity", "other"]),
  tradeType: z.enum([
    // Core Building Trades
    "general_contractor", "bricklayer", "carpenter", "roofer", "concrete_specialist",
    // Building Services
    "electrician", "plumber", "heating_engineer", "air_conditioning", "building_services", "cabling",
    // Finishing Trades  
    "plasterer", "painter_decorator", "flooring_specialist", "glazier", "ceiling_fixer",
    // Specialized Trades
    "scaffolder", "scaffolding", "steelwork", "insulation_specialist", "demolition", "asbestos_removal",
    // Infrastructure & Civil
    "civil_engineer", "groundworker", "drainage_specialist", "highways", "utilities",
    // Emerging Specialties
    "renewable_energy", "modular_construction", "restoration_specialist", "sustainability_consultant",
    "heritage_restoration", "window_fitter", "data_cabling", "fibre_optic_installer", "telecoms_engineer",
    // Other
    "other_trade"
  ]),
  // FIXED: Make UTR/registration number truly optional for all business types
  registrationNumber: z.string().optional(),
  // FIXED: Make postcode more flexible for UK postcodes (with or without spaces)
  postcode: z.string().regex(/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i, "Please enter a valid UK postcode").optional().or(z.literal("")),
  // FIXED: Make phone optional to prevent form validation errors
  phone: z.string().optional(),
  // FIXED: Make address less strict
  address: z.string().min(1, "Address is required"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [tradeSearch, setTradeSearch] = useState("");
  const [showDocumentWizard, setShowDocumentWizard] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<any>(null);
  const [customTradeInput, setCustomTradeInput] = useState("");
  const [showCustomTradeDialog, setShowCustomTradeDialog] = useState(false);
  const [aiTradeAnalysis, setAiTradeAnalysis] = useState<any>(null);
  const [isAnalyzingTrade, setIsAnalyzingTrade] = useState(false);
  const [showFreemiumPrompt, setShowFreemiumPrompt] = useState(false);

  // Check if user already has companies
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/companies"],
    enabled: isAuthenticated && !isLoading,
  });

  // TEMPORARY: Skip auth check to allow live user registrations
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     toast({
  //       title: "Unauthorized", 
  //       description: "You need to log in to create a company.",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       setLocation("/auth");
  //     }, 500);
  //     return;
  //   }
  // }, [isAuthenticated, isLoading, toast, setLocation]);

  // TEMPORARY: Skip existing company redirect to allow live registrations
  // useEffect(() => {
  //   if (!companiesLoading && companies && Array.isArray(companies) && companies.length > 0) {
  //     const company = companies[0];
  //     toast({
  //       title: "Company Already Created",
  //       description: `You already have "${company.name}". Redirecting to dashboard...`,
  //     });
  //     setTimeout(() => {
  //       setLocation(`/dashboard/${company.id}`);
  //     }, 1500);
  //     return;
  //   }
  // }, [companies, companiesLoading, toast, setLocation]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      businessType: "sole_trader",
      tradeType: "cabling",
      registrationNumber: "",
      address: "",
      postcode: "",
      phone: "",
    },
  });

  // AI Trade Analysis Mutation
  const analyzeTradeTypeMutation = useMutation({
    mutationFn: async (tradeDescription: string) => {
      const response = await apiRequest("POST", "/api/analyze-trade-type", {
        tradeDescription,
        additionalInfo: customTradeInput
      });
      return await response.json();
    },
    onSuccess: (analysis) => {
      setAiTradeAnalysis(analysis);
      setIsAnalyzingTrade(false);
    },
    onError: (error) => {
      console.error("Trade analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze trade type. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzingTrade(false);
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return await response.json();
    },
    onSuccess: (company) => {
      // Invalidate companies cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      
      // Store company data and move to freemium step
      setCreatedCompany(company);
      
      toast({
        title: "Company Created Successfully!",
        description: `${company.name} is ready. Now let's generate your first free compliance document!`,
      });
      
      // Move to step 3 - Freemium document generation
      setStep(3);
    },
    onError: (error: any) => {
      console.error("Company creation error:", error);
      
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You need to log in to create a company.",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 500);
        return;
      }

      // Handle one company per account limit
      if (error.status === 409 && error.error === "ONE_COMPANY_LIMIT") {
        toast({
          title: "Account Already Has Company",
          description: `You already have "${error.existingCompanyName}" registered. You can only have one company per account.`,
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/dashboard");
        }, 3000);
        return;
      }

      // Handle duplicate company name error
      if (error.status === 409 && error.error === "DUPLICATE_COMPANY_NAME") {
        toast({
          title: "Company Name Already Exists",
          description: `"${error.existingCompanyName}" is already registered. If this is your company, please log in to your existing account instead.`,
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 3000);
        return;
      }
      
      // Handle existing company case with redirect to existing company
      if (error.message?.includes("You already have a company")) {
        const existingCompany = error.existingCompany || (companies && companies.length > 0 ? companies[0] : null);
        if (existingCompany) {
          toast({
            title: "Company Already Exists",
            description: `Welcome back to ${existingCompany.name}! Redirecting to your dashboard.`,
            variant: "default",
          });
          setTimeout(() => {
            setLocation(`/dashboard/${existingCompany.id}`);
          }, 2000);
          return;
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to create company: ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    console.log('=== FORM SUBMIT DEBUG ===');
    console.log('Form data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    console.log('Mutation pending:', createCompanyMutation.isPending);
    
    createCompanyMutation.mutate(data);
  };

  const tradeOptions = [
    {
      value: "general_contractor",
      title: "General Contractor",
      description: "Main contracting, project management, CDM 2015 principal contractor duties",
      icon: <Building className="h-8 w-8" />,
      category: "Core Building",
      features: [
        "CDM 2015 Principal Contractor documentation",
        "Construction Phase Plans",
        "Multi-trade risk assessment coordination",
        "Site safety management systems",
        "Building Control liaison documents"
      ]
    },
    {
      value: "electrician",
      title: "Electrician",
      description: "18th Edition compliance, Part P certification, electrical installation certificates",
      icon: <Zap className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "18th Edition BS 7671 compliance",
        "Part P Building Regulations certification",
        "Electrical Installation Certificates (EIC)",
        "Periodic Inspection & Testing (EICR)",
        "NICEIC/ELECSA registration tracking"
      ]
    },
    {
      value: "cabling",
      title: "Cabling & Data Networks",
      description: "Structured cabling systems, fibre optic installation, network infrastructure",
      icon: <Cpu className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "Cat5e/Cat6/Cat6a structured cabling",
        "Fibre optic installation & termination",
        "Network infrastructure design",
        "Data centre cabling systems",
        "Telecommunications installation"
      ]
    },
    {
      value: "plumber",
      title: "Plumber",
      description: "Gas Safe registration, water regulations compliance, heating system certification",
      icon: <Wrench className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "Gas Safe Register certification",
        "Water Supply (Water Fittings) Regulations",
        "Central heating system commissioning",
        "Legionella risk assessments",
        "Unvented hot water system certificates"
      ]
    },
    {
      value: "bricklayer",
      title: "Bricklayer",
      description: "NVQ Level 2/3 certification, structural masonry compliance, heritage work",
      icon: <Building className="h-8 w-8" />,
      category: "Core Building",
      features: [
        "NVQ Level 2/3 Bricklaying certification",
        "Structural masonry design compliance",
        "Heritage building restoration protocols",
        "Mortar mix design specifications",
        "Cavity wall insulation requirements"
      ]
    },
    {
      value: "carpenter",
      title: "Carpenter & Joiner",
      description: "City & Guilds certification, timber frame compliance, fire door installation",
      icon: <Hammer className="h-8 w-8" />,
      category: "Core Building",
      features: [
        "City & Guilds carpentry qualifications",
        "Timber frame construction standards",
        "Fire door installation certification",
        "Roof truss design compliance",
        "Heritage joinery restoration"
      ]
    },
    {
      value: "roofer",
      title: "Roofer",
      description: "NFRC membership, flat roof waterproofing, solar panel mounting systems",
      icon: <Home className="h-8 w-8" />,
      category: "Core Building",
      features: [
        "NFRC (National Federation of Roofing Contractors)",
        "Flat roof waterproofing systems",
        "Solar panel mounting compliance",
        "Fall protection systems",
        "Lead work health & safety protocols"
      ]
    },
    {
      value: "plasterer",
      title: "Plasterer",
      description: "CSCS 2025 compliance, material certificates, fire-resistant systems",
      icon: <PaintRoller className="h-8 w-8" />,
      category: "Finishing",
      features: [
        "CSCS card renewal tracking (2025 deadline)",
        "Fire-resistant material documentation",
        "Wet plastering health & safety",
        "Dry lining system compliance",
        "Heritage lime plastering protocols"
      ]
    },
    {
      value: "scaffolder",
      title: "Scaffolder",
      description: "CISRS certification, TG20/TG30:24 compliance, scaffold design calculations",
      icon: <Construction className="h-8 w-8" />,
      category: "Specialized",
      features: [
        "CISRS Certification tracking",
        "TG20/TG30:24 Compliance documents",
        "Local authority permits",
        "Daily inspection records",
        "Method statements for scaffold erection"
      ]
    },
    {
      value: "scaffolding",
      title: "Scaffolding Contractor",
      description: "Scaffold hire, erection & dismantle, NASC member compliance, TG20 design",
      icon: <Construction className="h-8 w-8" />,
      category: "Specialized",
      features: [
        "NASC membership compliance",
        "TG20/TG30 scaffold design",
        "CISRS card requirements",
        "Weekly scaffold inspections",
        "Emergency scaffold services"
      ]
    },
    {
      value: "heating_engineer",
      title: "Heating Engineer",
      description: "Gas Safe registration, renewable heating systems, energy efficiency assessments",
      icon: <Thermometer className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "Gas Safe Register ACS certification",
        "Heat pump installation compliance",
        "Boiler efficiency standards",
        "Renewable heating incentive schemes",
        "Energy Performance Certificate liaison"
      ]
    },
    {
      value: "groundworker",
      title: "Groundworker",
      description: "Excavation safety, foundation compliance, drainage regulations",
      icon: <Mountain className="h-8 w-8" />,
      category: "Infrastructure",
      features: [
        "Excavation safety procedures",
        "Foundation design compliance",
        "Drainage system regulations",
        "Contaminated land protocols",
        "Utilities avoidance procedures"
      ]
    },
    {
      value: "steelwork",
      title: "Steel Erector/Fixer",
      description: "BCSA membership, structural steel compliance, welding certifications",
      icon: <Layers className="h-8 w-8" />,
      category: "Specialized",
      features: [
        "BCSA (British Constructional Steelwork Association)",
        "Structural steel erection procedures",
        "Welding certification tracking",
        "Fall protection for steel work",
        "Crane operation liaison"
      ]
    },
    {
      value: "renewable_energy",
      title: "Renewable Energy Installer",
      description: "MCS certification, solar PV installation, heat pump systems, EV charging",
      icon: <Sun className="h-8 w-8" />,
      category: "Emerging",
      features: [
        "MCS (Microgeneration Certification Scheme)",
        "Solar PV installation standards",
        "Heat pump compliance requirements",
        "EV charging point installation",
        "Smart Energy Code requirements"
      ]
    },
    {
      value: "painter_decorator",
      title: "Painter & Decorator",
      description: "CHAS certification, lead paint protocols, specialist coatings",
      icon: <PaintRoller className="h-8 w-8" />,
      category: "Finishing",
      features: [
        "CHAS (Contractors Health & Safety Assessment)",
        "Lead paint safety procedures",
        "VOC emission compliance",
        "Fire retardant coating certification",
        "Heritage restoration techniques"
      ]
    },
    {
      value: "flooring_specialist",
      title: "Flooring Specialist",
      description: "NICF certification, underfloor heating, acoustic compliance",
      icon: <Layers className="h-8 w-8" />,
      category: "Finishing",
      features: [
        "NICF (National Institute of Carpet & Floorlayers)",
        "Underfloor heating installation",
        "Acoustic performance standards",
        "Moisture barrier compliance",
        "Commercial flooring health & safety"
      ]
    },
    {
      value: "glazier",
      title: "Glazier",
      description: "Glass & Glazing Federation, structural glazing, safety glass compliance",
      icon: <MoreHorizontal className="h-8 w-8" />,
      category: "Finishing",
      features: [
        "Glass & Glazing Federation membership",
        "Structural glazing certification",
        "Safety glass BS 6206 compliance",
        "Thermal performance standards",
        "Curtain wall installation protocols"
      ]
    },
    {
      value: "ceiling_fixer",
      title: "Ceiling Fixer",
      description: "Suspended ceiling systems, acoustic performance, fire rating compliance",
      icon: <Layers className="h-8 w-8" />,
      category: "Finishing",
      features: [
        "Suspended ceiling grid installation",
        "Acoustic performance certification",
        "Fire rating compliance testing",
        "Seismic bracing requirements",
        "Access panel integration"
      ]
    },
    {
      value: "insulation_specialist",
      title: "Insulation Specialist",
      description: "BBA certification, thermal bridging, air tightness testing",
      icon: <Layers className="h-8 w-8" />,
      category: "Specialized",
      features: [
        "BBA (British Board of Agrément) certification",
        "Thermal bridging calculations",
        "Air tightness testing protocols",
        "Cavity wall insulation compliance",
        "External wall insulation systems"
      ]
    },
    {
      value: "demolition",
      title: "Demolition Contractor",
      description: "NFDC membership, structural engineer liaison, hazardous material protocols",
      icon: <Construction className="h-8 w-8" />,
      category: "Specialized",
      features: [
        "NFDC (National Federation of Demolition Contractors)",
        "Structural engineer collaboration",
        "Asbestos survey requirements",
        "Noise and dust control measures",
        "Waste management licensing"
      ]
    },
    {
      value: "asbestos_removal",
      title: "Asbestos Removal Specialist",
      description: "HSE licensing, CAR 2012 compliance, air monitoring protocols",
      icon: <MoreHorizontal className="h-8 w-8" />,
      category: "Specialized",
      features: [
        "HSE licensed asbestos removal",
        "CAR 2012 (Control of Asbestos Regulations)",
        "Air monitoring and clearance testing",
        "Encapsulation and disposal protocols",
        "Medical surveillance requirements"
      ]
    },
    {
      value: "drainage_specialist",
      title: "Drainage Specialist",
      description: "WRc approval, CCTV survey certification, sustainable drainage systems",
      icon: <MoreHorizontal className="h-8 w-8" />,
      category: "Infrastructure",
      features: [
        "WRc (Water Research Centre) approval",
        "CCTV drainage survey certification",
        "Sustainable drainage systems (SuDS)",
        "Pumping station compliance",
        "Water quality monitoring protocols"
      ]
    },
    {
      value: "highways",
      title: "Highways Contractor",
      description: "NHSS certification, traffic management, road surface compliance",
      icon: <MoreHorizontal className="h-8 w-8" />,
      category: "Infrastructure",
      features: [
        "NHSS (National Highways Sector Scheme)",
        "Traffic management certification",
        "Road surface specification compliance",
        "Street works licensing",
        "Health & safety executive liaison"
      ]
    },
    {
      value: "utilities",
      title: "Utilities Contractor",
      description: "Multi-utility compliance, excavation safety, service location protocols",
      icon: <Zap className="h-8 w-8" />,
      category: "Infrastructure",
      features: [
        "Multi-utility service installation",
        "Cable avoidance tool certification",
        "Excavation near services protocols",
        "Utility company liaison procedures",
        "Emergency response planning"
      ]
    },
    {
      value: "modular_construction",
      title: "Modular Construction Specialist",
      description: "NHBC certification, off-site manufacturing, quality assurance systems",
      icon: <Cpu className="h-8 w-8" />,
      category: "Emerging",
      features: [
        "NHBC (National House Building Council)",
        "Off-site manufacturing quality systems",
        "Transportation and lifting protocols",
        "Module connection certification",
        "Modern Methods of Construction (MMC)"
      ]
    },
    {
      value: "heritage_restoration",
      title: "Heritage/Conservation Specialist",
      description: "IHBC accreditation, listed building consent, traditional building materials",
      icon: <MoreHorizontal className="h-8 w-8" />,
      category: "Emerging",
      features: [
        "IHBC (Institute of Historic Building Conservation)",
        "Listed building consent procedures",
        "Traditional building material sourcing",
        "Archaeological watching brief protocols",
        "Conservation philosophy compliance"
      ]
    },
    {
      value: "sustainability_consultant",
      title: "Sustainability Consultant",
      description: "BREEAM assessment, carbon footprint analysis, green building certification",
      icon: <Sun className="h-8 w-8" />,
      category: "Emerging",
      features: [
        "BREEAM assessment methodology",
        "Carbon footprint calculation",
        "Green building certification processes",
        "Sustainable material sourcing",
        "Energy performance optimization"
      ]
    },
    {
      value: "window_fitter",
      title: "Window Fitter",
      description: "FENSA/CERTASS certified window installation, Building Regulations Part L compliance",
      icon: <Home className="h-8 w-8" />,
      category: "Finishing",
      features: [
        "FENSA or CERTASS certification",
        "Building Regulations Part L compliance",
        "Window Energy Rating standards",
        "Working at height training",
        "Manual handling certification"
      ]
    },
    {
      value: "data_cabling",
      title: "Data Cabling Specialist",
      description: "Structured cabling systems, fibre optic networks, telecommunications infrastructure",
      icon: <Cpu className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "City & Guilds qualifications",
        "BS EN 50174 cabling standards",
        "Fibre optic installation certification",
        "Network infrastructure design",
        "Health & Safety training"
      ]
    },
    {
      value: "fibre_optic_installer",
      title: "Fibre Optic Installer",
      description: "High-speed broadband installation, FTTP connections, network terminations",
      icon: <Cpu className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "Fibre optic splicing certification",
        "FTTP installation training",
        "Network testing equipment",
        "Working at height certification",
        "Openreach accreditation"
      ]
    },
    {
      value: "telecoms_engineer",
      title: "Telecommunications Engineer",
      description: "Phone systems, broadband, mobile coverage solutions, business communications",
      icon: <Zap className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "Telecoms engineering qualifications",
        "Broadband installation certification",
        "Mobile network knowledge",
        "Business phone systems",
        "Emergency communications"
      ]
    },
    {
      value: "air_conditioning",
      title: "Air Conditioning Engineer", 
      description: "HVAC systems, cooling solutions, F-Gas certification, refrigeration compliance",
      icon: <Thermometer className="h-8 w-8" />,
      category: "Building Services",
      features: [
        "F-Gas certification (Category I-IV)",
        "City & Guilds HVAC qualifications", 
        "Refrigerant handling certification",
        "Energy efficiency assessments",
        "BESA membership compliance"
      ]
    },
    {
      value: "building_services",
      title: "Building Services Engineer",
      description: "MEP design, building systems integration, energy efficiency, BIM coordination",
      icon: <Construction className="h-8 w-8" />,
      category: "Building Services", 
      features: [
        "CIBSE membership requirements",
        "Building Services engineering degree",
        "BIM Level 2 certification",
        "Energy modelling software",
        "MEP systems coordination"
      ]
    },
    {
      value: "civil_engineer",
      title: "Civil Engineer",
      description: "Infrastructure design, structural calculations, CDM Principal Designer duties",
      icon: <Mountain className="h-8 w-8" />,
      category: "Infrastructure",
      features: [
        "ICE chartered engineer status",
        "Structural calculations certification", 
        "CDM 2015 Principal Designer",
        "Infrastructure design standards",
        "Health & Safety competence"
      ]
    },
    {
      value: "concrete_specialist", 
      title: "Concrete Specialist",
      description: "Concrete structures, reinforcement, waterproofing, structural repairs",
      icon: <Layers className="h-8 w-8" />,
      category: "Core Building",
      features: [
        "Concrete Society membership",
        "Structural concrete standards BS EN 1992",
        "Reinforcement certification",
        "Waterproofing systems",
        "Structural repair techniques"
      ]
    },
    {
      value: "restoration_specialist",
      title: "Restoration Specialist", 
      description: "Building restoration, heritage conservation, lime mortar, traditional techniques",
      icon: <Sun className="h-8 w-8" />,
      category: "Specialized",
      features: [
        "Heritage building techniques",
        "Lime mortar application", 
        "Conservation area regulations",
        "Traditional materials certification",
        "Listed building consent procedures"
      ]
    },
    {
      value: "other_trade",
      title: "Other Trade (Not Listed)",
      description: "Bespoke consultation service - we'll research and create custom compliance documentation for your specific trade at £150/hour",
      icon: <MoreHorizontal className="h-8 w-8" />,
      category: "Other",
      features: [
        "Bespoke compliance document research",
        "Custom health & safety protocols",
        "Trade-specific risk assessments", 
        "Regulatory requirement analysis",
        "Professional consultation service (£150/hour)"
      ]
    }
  ];

  // Filter trades based on search
  const filteredTradeOptions = tradeOptions.filter(trade =>
    trade.title.toLowerCase().includes(tradeSearch.toLowerCase()) ||
    trade.description.toLowerCase().includes(tradeSearch.toLowerCase()) ||
    trade.category.toLowerCase().includes(tradeSearch.toLowerCase()) ||
    trade.features.some(feature => feature.toLowerCase().includes(tradeSearch.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-orange mx-auto mb-4"></div>
          <p className="text-steel-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/")} className="p-2 touch-manipulation">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-2xl font-bold text-charcoal leading-tight">Company Setup</h1>
                <p className="text-sm text-steel-gray">Step {step} of 2</p>
              </div>
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-construction-orange' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-construction-orange' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <Card>
              <CardHeader className="text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl">Choose Your Trade Specialisation</CardTitle>
                <p className="text-steel-gray text-sm sm:text-base">Select your primary trade to get customised compliance templates and documentation</p>
                
                {/* Search/Filter */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search trades (e.g. plasterer, roofer, painter)..."
                    value={tradeSearch}
                    onChange={(e) => setTradeSearch(e.target.value)}
                    className="pl-10 touch-manipulation text-base sm:text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={form.watch("tradeType")}
                  onValueChange={(value) => form.setValue("tradeType", value as any)}
                  className="space-y-8"
                >
                  {tradeSearch ? (
                    // Show filtered results when searching
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-charcoal border-b pb-2">
                        Search Results ({filteredTradeOptions.length} found)
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                        {filteredTradeOptions.map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              className="absolute top-3 left-3 z-10 touch-manipulation"
                            />
                            <Label
                              htmlFor={option.value}
                              className="block cursor-pointer touch-manipulation"
                            >
                              <Card className={`transition-all h-full touch-manipulation ${form.watch("tradeType") === option.value ? 'border-construction-orange bg-orange-50' : 'hover:border-gray-300'}`}>
                                <CardContent className="p-3 pl-10 sm:p-4 sm:pl-12">
                                  <div className="flex items-start space-x-2 sm:space-x-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 text-construction-orange">
                                      {option.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-charcoal mb-1 text-sm sm:text-base">{option.title}</h4>
                                      <p className="text-steel-gray text-xs sm:text-sm mb-2 leading-relaxed">{option.description}</p>
                                      <div className="space-y-1">
                                        {option.features.slice(0, 2).map((feature, index) => (
                                          <div key={index} className="flex items-center space-x-1 text-xs">
                                            <CheckCircle className="h-3 w-3 text-compliant-green flex-shrink-0" />
                                            <span className="text-charcoal truncate">{feature}</span>
                                          </div>
                                        ))}
                                        {option.features.length > 2 && (
                                          <p className="text-xs text-steel-gray">+{option.features.length - 2} more requirements</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Label>
                          </div>
                        ))}
                      </div>
                      {filteredTradeOptions.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-steel-gray">No trades found matching "{tradeSearch}"</p>
                          <p className="text-sm text-steel-gray mt-2">Can't find your trade? Let our AI help categorise it!</p>
                          <Button
                            type="button"
                            onClick={() => {
                              setCustomTradeInput(tradeSearch);
                              setShowCustomTradeDialog(true);
                            }}
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                          >
                            Analyse "{tradeSearch}" with AI
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show categorized view when not searching
                    ["Core Building", "Building Services", "Finishing", "Specialized", "Infrastructure", "Emerging", "Other"].map((category) => {
                      const categoryOptions = tradeOptions.filter(option => option.category === category);
                      if (categoryOptions.length === 0) return null;
                    
                      return (
                        <div key={category} className="space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-charcoal border-b pb-2">{category} Trades</h3>
                          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                            {categoryOptions.map((option) => (
                              <div key={option.value} className="relative">
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  className="absolute top-3 left-3 z-10 touch-manipulation"
                                />
                                <Label
                                  htmlFor={option.value}
                                  className="block cursor-pointer touch-manipulation"
                                >
                                  <Card className={`transition-all h-full touch-manipulation ${form.watch("tradeType") === option.value ? 'border-construction-orange bg-orange-50' : 'hover:border-gray-300'}`}>
                                    <CardContent className="p-3 pl-10 sm:p-4 sm:pl-12">
                                      <div className="flex items-start space-x-2 sm:space-x-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 text-construction-orange">
                                          {option.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-charcoal mb-1 text-sm sm:text-base">{option.title}</h4>
                                          <p className="text-steel-gray text-xs sm:text-sm mb-2 leading-relaxed">{option.description}</p>
                                          <div className="space-y-1">
                                            {option.features.slice(0, 2).map((feature, index) => (
                                              <div key={index} className="flex items-center space-x-1 text-xs">
                                                <CheckCircle className="h-3 w-3 text-compliant-green flex-shrink-0" />
                                                <span className="text-charcoal truncate">{feature}</span>
                                              </div>
                                            ))}
                                            {option.features.length > 2 && (
                                              <p className="text-xs text-steel-gray">+{option.features.length - 2} more requirements</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </RadioGroup>

                {/* Can't find trade button for main view */}
                <div className="text-center pt-6 border-t">
                  <p className="text-steel-gray mb-3">Can't find your trade?</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCustomTradeInput("");
                      setShowCustomTradeDialog(true);
                    }}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Get AI Help to Categorise Your Trade
                  </Button>
                </div>

                <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-construction-orange hover:bg-orange-600 w-full sm:w-auto touch-manipulation py-3 text-base"
                    disabled={!form.watch("tradeType")}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader className="text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl">Company Information</CardTitle>
                <p className="text-steel-gray text-sm sm:text-base">Tell us about your company to set up your compliance profile</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Business Type *</Label>
                    <RadioGroup
                      value={form.watch("businessType")}
                      onValueChange={(value) => form.setValue("businessType", value as any)}
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      <div className="flex items-center space-x-2 touch-manipulation py-1">
                        <RadioGroupItem value="limited_company" id="limited_company" className="touch-manipulation" />
                        <Label htmlFor="limited_company" className="cursor-pointer text-sm sm:text-base">Limited Company</Label>
                      </div>
                      <div className="flex items-center space-x-2 touch-manipulation py-1">
                        <RadioGroupItem value="sole_trader" id="sole_trader" className="touch-manipulation" />
                        <Label htmlFor="sole_trader" className="cursor-pointer text-sm sm:text-base">Sole Trader</Label>
                      </div>
                      <div className="flex items-center space-x-2 touch-manipulation py-1">
                        <RadioGroupItem value="partnership" id="partnership" className="touch-manipulation" />
                        <Label htmlFor="partnership" className="cursor-pointer text-sm sm:text-base">Partnership</Label>
                      </div>
                      <div className="flex items-center space-x-2 touch-manipulation py-1">
                        <RadioGroupItem value="llp" id="llp" className="touch-manipulation" />
                        <Label htmlFor="llp" className="cursor-pointer text-sm sm:text-base">Limited Liability Partnership (LLP)</Label>
                      </div>
                      <div className="flex items-center space-x-2 touch-manipulation py-1">
                        <RadioGroupItem value="charity" id="charity" className="touch-manipulation" />
                        <Label htmlFor="charity" className="cursor-pointer text-sm sm:text-base">Charity/Non-profit</Label>
                      </div>
                      <div className="flex items-center space-x-2 touch-manipulation py-1">
                        <RadioGroupItem value="other" id="other" className="touch-manipulation" />
                        <Label htmlFor="other" className="cursor-pointer text-sm sm:text-base">Other</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.businessType && (
                      <p className="text-sm text-red-600">{form.formState.errors.businessType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {form.watch("businessType") === "sole_trader" ? "Business Name" : "Company Name"} *
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder={
                        form.watch("businessType") === "sole_trader" 
                          ? "Enter your business name (or your own name)"
                          : "Enter your company name"
                      }
                      className="touch-manipulation text-base sm:text-sm"
                    />
                    {form.formState.errors.name && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                        <p className="text-sm text-red-800 font-medium">{form.formState.errors.name.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">
                      {form.watch("businessType") === "limited_company" 
                        ? "Company Registration Number" 
                        : form.watch("businessType") === "sole_trader"
                        ? "UTR Number (Optional)"
                        : "Registration Number (Optional)"
                      }
                    </Label>
                    <Input
                      id="registrationNumber"
                      {...form.register("registrationNumber")}
                      placeholder={
                        form.watch("businessType") === "limited_company" 
                          ? "e.g., 12345678"
                          : form.watch("businessType") === "sole_trader"
                          ? "e.g., 1234567890"
                          : "Enter registration number"
                      }
                      className="touch-manipulation text-base sm:text-sm"
                    />
                    <p className="text-xs text-steel-gray">
                      {form.watch("businessType") === "limited_company" && "Optional - Company registration number from Companies House"}
                      {form.watch("businessType") === "sole_trader" && "Optional - Your Unique Taxpayer Reference from HMRC"}
                      {form.watch("businessType") === "partnership" && "Optional - Partnership registration number if applicable"}
                      {form.watch("businessType") === "llp" && "Optional - LLP registration number from Companies House"}
                      {form.watch("businessType") === "charity" && "Optional - Charity registration number"}
                      {form.watch("businessType") === "other" && "Optional - Any relevant registration number"}
                    </p>
                    {form.formState.errors.registrationNumber && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                        <p className="text-sm text-red-800 font-medium">{form.formState.errors.registrationNumber.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...form.register("address")}
                    placeholder="Enter your company address"
                    rows={3}
                    className="touch-manipulation text-base sm:text-sm"
                  />
                  {form.formState.errors.address && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                      <p className="text-sm text-red-800 font-medium">{form.formState.errors.address.message}</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      {...form.register("postcode")}
                      placeholder="e.g., SW1A 1AA"
                      className="touch-manipulation text-base sm:text-sm"
                    />
                    {form.formState.errors.postcode && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                        <p className="text-sm text-red-800 font-medium">{form.formState.errors.postcode.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="e.g., +44 20 1234 5678"
                      className="touch-manipulation text-base sm:text-sm"
                    />
                    {form.formState.errors.phone && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                        <p className="text-sm text-red-800 font-medium">{form.formState.errors.phone.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto touch-manipulation py-3"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={createCompanyMutation.isPending}
                    className="bg-construction-orange hover:bg-orange-600 w-full sm:w-auto touch-manipulation py-3 text-base"
                    onClick={async () => {
                      // CRITICAL: Prevent duplicate submissions
                      if (createCompanyMutation.isPending) {
                        console.log('⚠️ Company creation already in progress - ignoring duplicate click');
                        return;
                      }
                      
                      console.log('=== STAGE 2 CREATE COMPANY BUTTON CLICKED ===');
                      const formData = form.getValues();
                      console.log('Form data:', formData);
                      console.log('Form errors:', form.formState.errors);
                      
                      // FIXED: Direct submission without form validation blocking
                      if (!formData.name || !formData.address) {
                        toast({
                          title: "Missing Information",
                          description: "Please enter company name and address.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      // Clean postcode format if provided
                      if (formData.postcode) {
                        formData.postcode = formData.postcode.replace(/\s+/g, ' ').trim().toUpperCase();
                      }
                      
                      console.log('Submitting company data:', formData);
                      
                      try {
                        createCompanyMutation.mutate(formData);
                      } catch (error) {
                        console.error('Company creation error:', error);
                        toast({
                          title: "Error",
                          description: "Failed to create company. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    {createCompanyMutation.isPending ? "Creating Company..." : "Complete Sign Up"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Freemium Document Generation */}
          {step === 3 && createdCompany && (
            <div className="space-y-6">
              {/* Usage Counter at top */}
              <UsageCounter showUpgradePrompt={false} />

              <Card className="border-2 border-construction-orange border-dashed">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-construction-orange to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-charcoal">Generate Your First Free Document</CardTitle>
                  <p className="text-steel-gray text-lg">
                    Experience the power of AI-generated UK construction compliance documents.
                    Try it free, then upgrade for unlimited access.
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => {
                        setShowDocumentWizard(true);
                      }}
                      className="flex flex-col items-center justify-center h-24 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800"
                      variant="outline"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Risk Assessment</span>
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowDocumentWizard(true);
                      }}
                      className="flex flex-col items-center justify-center h-24 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800"
                      variant="outline"
                    >
                      <CheckCircle className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Method Statement</span>
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowDocumentWizard(true);
                      }}
                      className="flex flex-col items-center justify-center h-24 bg-construction-orange bg-opacity-10 hover:bg-construction-orange hover:bg-opacity-20 border border-construction-orange text-construction-orange"
                      variant="outline"
                    >
                      <Construction className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Toolbox Talk</span>
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-amber-800 mb-2">🎯 What You'll Experience:</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• AI-powered, UK construction-specific content</li>
                        <li>• Professional documents ready in seconds</li>
                        <li>• Fully compliant with HSE and industry standards</li>
                        <li>• Customised for your specific trade and company</li>
                      </ul>
                    </div>
                    
                    <p className="text-steel-gray text-sm">
                      After generating your free document, you'll see our subscription options to unlock unlimited access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </form>
      </main>

      {/* Document Setup Wizard */}
      {showDocumentWizard && createdCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <DocumentSetupWizard 
              companyId={createdCompany.id}
              companyName={createdCompany.name}
              tradeType={createdCompany.tradeType}
              onComplete={(documentGenerated) => {
                setShowDocumentWizard(false);
                
                if (documentGenerated) {
                  // User generated their free document
                  toast({
                    title: "Document Generated Successfully!",
                    description: "That's your free document! Upgrade now for unlimited access to AI compliance documents.",
                  });
                  
                  // Show upgrade prompt after completing free document
                  setShowFreemiumPrompt(true);
                } else {
                  // Just close wizard without generation
                  setTimeout(() => {
                    setLocation(`/dashboard/${createdCompany.id}`);
                  }, 1000);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Freemium Upgrade Prompt */}
      <Dialog open={showFreemiumPrompt} onOpenChange={setShowFreemiumPrompt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Crown className="h-6 w-6 text-construction-orange" />
              Congratulations! Your Document is Ready
            </DialogTitle>
            <DialogDescription className="text-lg">
              You've successfully generated your first compliance document. See how easy it is with WorkDoc360?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                What you just experienced:
              </h3>
              <ul className="text-steel-gray space-y-2">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Professional document generated in under 30 seconds
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  UK construction-specific compliance content
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Customized for your trade and company details
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Ready-to-use, fully compliant with HSE standards
                </li>
              </ul>
            </div>

            <div className="text-center">
              <UsageCounter showUpgradePrompt={true} />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setLocation("/select-plan")}
                className="flex-1 bg-construction-orange hover:bg-orange-600 text-lg py-3"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade Now - From £35/month
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFreemiumPrompt(false);
                  setTimeout(() => {
                    setLocation(`/dashboard/${createdCompany.id}`);
                  }, 500);
                }}
                className="px-6"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Trade Analysis Dialog */}
      <Dialog open={showCustomTradeDialog} onOpenChange={setShowCustomTradeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Trade Analysis
            </DialogTitle>
            <DialogDescription>
              Help us understand your trade so we can provide the right compliance tools and documents.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="trade-input">What type of work do you do?</Label>
              <Input
                id="trade-input"
                value={customTradeInput}
                onChange={(e) => setCustomTradeInput(e.target.value)}
                placeholder="e.g., scaffolding, cabling, window fitting, tiling, etc."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="trade-details">Tell us more about your business (optional)</Label>
              <Textarea
                id="trade-details"
                placeholder="What services do you provide? Any specialisations? What compliance requirements do you typically deal with?"
                className="mt-1"
                rows={3}
              />
            </div>

            {aiTradeAnalysis && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">AI Analysis Results</h4>
                <p className="text-blue-800 mb-3">{aiTradeAnalysis.description}</p>
                <div className="mb-3">
                  <strong className="text-blue-900">Suggested Category:</strong> {aiTradeAnalysis.category}
                </div>
                <div className="mb-3">
                  <strong className="text-blue-900">Relevant Compliance:</strong>
                  <ul className="list-disc list-inside ml-2 text-blue-800">
                    {aiTradeAnalysis.complianceRequirements?.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCustomTradeDialog(false);
                  setAiTradeAnalysis(null);
                  setCustomTradeInput("");
                }}
              >
                Cancel
              </Button>
              
              {!aiTradeAnalysis ? (
                <Button
                  onClick={() => {
                    setIsAnalyzingTrade(true);
                    analyzeTradeTypeMutation.mutate(customTradeInput);
                  }}
                  disabled={!customTradeInput.trim() || isAnalyzingTrade}
                >
                  {isAnalyzingTrade ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Trade
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    // Use the AI-suggested trade type
                    form.setValue("tradeType", aiTradeAnalysis.suggestedTradeType || "other_trade");
                    
                    // Add this trade to our system for future users
                    try {
                      const tradeData = {
                        value: aiTradeAnalysis.suggestedTradeType || `custom_${Date.now()}`,
                        title: customTradeInput,
                        description: aiTradeAnalysis.description,
                        category: aiTradeAnalysis.category,
                        complianceRequirements: aiTradeAnalysis.complianceRequirements
                      };
                      
                      await apiRequest("POST", "/api/add-analyzed-trade", { tradeData });
                      
                      toast({
                        title: "Trade Added Successfully",
                        description: `"${customTradeInput}" has been added to our trade database for future users.`,
                      });
                    } catch (error) {
                      console.log("Could not add trade to system:", error);
                      // Continue anyway - this is not critical
                    }
                    
                    setShowCustomTradeDialog(false);
                    setAiTradeAnalysis(null);
                    setCustomTradeInput("");
                    setStep(2); // Move to company setup
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Use This Classification & Add to System
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
