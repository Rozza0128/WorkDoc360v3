import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
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
  Search
} from "lucide-react";

const onboardingSchema = insertCompanySchema.extend({
  businessType: z.enum(["limited_company", "sole_trader", "partnership", "llp", "charity", "other"]),
  tradeType: z.enum([
    // Core Building Trades
    "general_contractor", "bricklayer", "carpenter", "roofer", "concrete_specialist",
    // Building Services
    "electrician", "plumber", "heating_engineer", "air_conditioning", "building_services",
    // Finishing Trades  
    "plasterer", "painter_decorator", "flooring_specialist", "glazier", "ceiling_fixer",
    // Specialized Trades
    "scaffolder", "steelwork", "insulation_specialist", "demolition", "asbestos_removal",
    // Infrastructure & Civil
    "civil_engineer", "groundworker", "drainage_specialist", "highways", "utilities",
    // Emerging Specialties
    "renewable_energy", "modular_construction", "restoration_specialist", "sustainability_consultant",
    "heritage_restoration",
    // Other
    "other_trade"
  ]),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [tradeSearch, setTradeSearch] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast, setLocation]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      businessType: "sole_trader",
      tradeType: "general_contractor",
      registrationNumber: "",
      address: "",
      postcode: "",
      phone: "",
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
      
      toast({
        title: "Success!",
        description: `Company "${company.name}" created successfully. Redirecting to home...`,
      });
      
      setTimeout(() => {
        setLocation("/");
      }, 1500);
    },
    onError: (error) => {
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
      
      toast({
        title: "Error",
        description: `Failed to create company: ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/")} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-charcoal">Company Setup</h1>
                <p className="text-steel-gray">Step {step} of 2</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-construction-orange' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-construction-orange' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Trade Specialisation</CardTitle>
                <p className="text-steel-gray">Select your primary trade to get customised compliance templates and documentation</p>
                
                {/* Search/Filter */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search trades (e.g. plasterer, roofer, painter)..."
                    value={tradeSearch}
                    onChange={(e) => setTradeSearch(e.target.value)}
                    className="pl-10"
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
                      <div className="grid md:grid-cols-2 gap-4">
                        {filteredTradeOptions.map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              className="absolute top-4 left-4 z-10"
                            />
                            <Label
                              htmlFor={option.value}
                              className="block cursor-pointer"
                            >
                              <Card className={`transition-all h-full ${form.watch("tradeType") === option.value ? 'border-construction-orange bg-orange-50' : 'hover:border-gray-300'}`}>
                                <CardContent className="p-4 pl-12">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 text-construction-orange">
                                      {option.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-charcoal mb-1 text-sm">{option.title}</h4>
                                      <p className="text-steel-gray text-xs mb-2 leading-relaxed">{option.description}</p>
                                      <div className="space-y-1">
                                        {option.features.slice(0, 3).map((feature, index) => (
                                          <div key={index} className="flex items-center space-x-1 text-xs">
                                            <CheckCircle className="h-3 w-3 text-compliant-green flex-shrink-0" />
                                            <span className="text-charcoal truncate">{feature}</span>
                                          </div>
                                        ))}
                                        {option.features.length > 3 && (
                                          <p className="text-xs text-steel-gray">+{option.features.length - 3} more requirements</p>
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
                          <p className="text-sm text-steel-gray mt-2">Try searching for: roofer, plasterer, painter, electrician, scaffolder</p>
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
                          <h3 className="text-lg font-semibold text-charcoal border-b pb-2">{category} Trades</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {categoryOptions.map((option) => (
                              <div key={option.value} className="relative">
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  className="absolute top-4 left-4 z-10"
                                />
                                <Label
                                  htmlFor={option.value}
                                  className="block cursor-pointer"
                                >
                                  <Card className={`transition-all h-full ${form.watch("tradeType") === option.value ? 'border-construction-orange bg-orange-50' : 'hover:border-gray-300'}`}>
                                    <CardContent className="p-4 pl-12">
                                      <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 text-construction-orange">
                                          {option.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-charcoal mb-1 text-sm">{option.title}</h4>
                                          <p className="text-steel-gray text-xs mb-2 leading-relaxed">{option.description}</p>
                                          <div className="space-y-1">
                                            {option.features.slice(0, 3).map((feature, index) => (
                                              <div key={index} className="flex items-center space-x-1 text-xs">
                                                <CheckCircle className="h-3 w-3 text-compliant-green flex-shrink-0" />
                                                <span className="text-charcoal truncate">{feature}</span>
                                              </div>
                                            ))}
                                            {option.features.length > 3 && (
                                              <p className="text-xs text-steel-gray">+{option.features.length - 3} more requirements</p>
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

                <div className="flex justify-end mt-8">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-construction-orange hover:bg-orange-600"
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
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <p className="text-steel-gray">Tell us about your company to set up your compliance profile</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Business Type *</Label>
                    <RadioGroup
                      value={form.watch("businessType")}
                      onValueChange={(value) => form.setValue("businessType", value as any)}
                      className="grid md:grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="limited_company" id="limited_company" />
                        <Label htmlFor="limited_company" className="cursor-pointer">Limited Company</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sole_trader" id="sole_trader" />
                        <Label htmlFor="sole_trader" className="cursor-pointer">Sole Trader</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partnership" id="partnership" />
                        <Label htmlFor="partnership" className="cursor-pointer">Partnership</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="llp" id="llp" />
                        <Label htmlFor="llp" className="cursor-pointer">Limited Liability Partnership (LLP)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="charity" id="charity" />
                        <Label htmlFor="charity" className="cursor-pointer">Charity/Non-profit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">Other</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.businessType && (
                      <p className="text-sm text-red-600">{form.formState.errors.businessType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
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
                    />
                    <p className="text-xs text-steel-gray">
                      {form.watch("businessType") === "limited_company" && "Required for limited companies"}
                      {form.watch("businessType") === "sole_trader" && "Your Unique Taxpayer Reference from HMRC"}
                      {form.watch("businessType") === "partnership" && "Partnership registration number if applicable"}
                      {form.watch("businessType") === "llp" && "LLP registration number from Companies House"}
                      {form.watch("businessType") === "charity" && "Charity registration number"}
                      {form.watch("businessType") === "other" && "Any relevant registration number"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...form.register("address")}
                    placeholder="Enter your company address"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      {...form.register("postcode")}
                      placeholder="e.g., SW1A 1AA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="e.g., +44 20 1234 5678"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCompanyMutation.isPending}
                    className="bg-construction-orange hover:bg-orange-600"
                  >
                    {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </main>
    </div>
  );
}
