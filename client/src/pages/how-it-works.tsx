import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  HardHat, 
  ArrowLeft,
  Brain,
  FileText,
  CheckCircle,
  Download,
  Upload,
  Settings,
  Zap,
  Clock,
  Shield,
  Users,
  Target,
  ArrowRight,
  Play
} from "lucide-react";

export default function HowItWorks() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header - Consistent with Homepage */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setLocation("/")}
                className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="relative">
                  <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center">
                    <HardHat className="text-white text-lg" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                    WorkDoc360
                  </span>
                </div>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              <Button 
                variant="ghost" 
                className="text-slate-600 hover:text-blue-600 transition-colors font-medium whitespace-nowrap text-sm xl:text-base px-2 xl:px-4"
                onClick={() => setLocation("/how-it-works")}
              >
                How It Works
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 hover:text-blue-600 transition-colors font-medium whitespace-nowrap text-sm xl:text-base px-2 xl:px-4"
                onClick={() => setLocation("/about")}
              >
                About
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 hover:text-blue-600 transition-colors font-medium whitespace-nowrap text-sm xl:text-base px-2 xl:px-4"
                onClick={() => setLocation("/contact")}
              >
                Contact
              </Button>
              
              <div className="flex items-center space-x-1 border-l border-slate-200 pl-2 ml-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium px-2 xl:px-3 text-sm" 
                  onClick={() => setLocation("/auth")}
                >
                  Login
                </Button>
                <Button 
                  size="sm"
                  className="btn-ai text-white shadow-lg px-2 xl:px-3 ml-1 text-sm" 
                  onClick={() => setLocation("/pricing")}
                >
                  Subscribe
                </Button>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-1">
              <Button 
                size="sm"
                className="ai-gradient text-white border-0 px-3" 
                onClick={() => setLocation("/pricing")}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-construction-orange text-white mb-4">How It Works</Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            From Project Details to 
            <span className="block text-blue-600">Compliant Documents in Minutes</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            See how our AI transforms basic project information into comprehensive, 
            HSE-compliant construction documentation in minutes, not hours.
          </p>
          <Button 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setLocation("/cscs-verification")}
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Live Demo
          </Button>
        </div>

        {/* Process Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Simple 4-Step Process
          </h2>
          
          <div className="grid lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Enter Project Details</h3>
                <p className="text-slate-600">
                  Simply provide basic project information: location, work type, dates, 
                  and key hazards. Our forms guide you through the essentials.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-construction-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-construction-orange" />
                </div>
                <div className="bg-construction-orange text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Analysis</h3>
                <p className="text-slate-600">
                  Our AI analyses your project details against UK construction regulations, 
                  HSE guidance, and CDM 2015 requirements in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Document Generation</h3>
                <p className="text-slate-600">
                  Complete risk assessments, method statements, and compliance documents 
                  are generated with site-specific content and control measures.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">4</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Download & Use</h3>
                <p className="text-slate-600">
                  Download professional documents ready for site use, client submission, 
                  or HSE inspector review. All in proper UK English.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What Makes It Different */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            What Makes Our AI Different
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">UK Construction Trained</h3>
                    <p className="text-slate-600">
                      Our AI is specifically trained on UK construction regulations, HSE guidance, 
                      and real construction site scenarios from experienced professionals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-construction-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="h-4 w-4 text-construction-orange" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Trade-Specific Intelligence</h3>
                    <p className="text-slate-600">
                      Understands the unique requirements of different trades - from scaffolding 
                      regulations to electrical safety standards and gas work procedures.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Real-Time Updates</h3>
                    <p className="text-slate-600">
                      Continuously updated with the latest HSE guidance, regulation changes, 
                      and industry best practices to ensure ongoing compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Site Manager Approved</h3>
                    <p className="text-slate-600">
                      Built and tested by working site managers to ensure documents meet 
                      real-world inspection standards and practical site requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                  Speed Comparison
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Manual Writing</span>
                      <span className="font-bold text-slate-900">3.5 hours</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div className="bg-slate-400 h-4 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">WorkDoc360 AI</span>
                      <span className="font-bold text-green-600">2-5 minutes</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div className="bg-green-500 h-4 rounded-full" style={{width: '3.8%'}}></div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4 border-t border-slate-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">95%+</div>
                    <div className="text-slate-600">Time Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Documents We Generate
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">Risk Assessments</h3>
                <p className="text-slate-600 mb-4">
                  Comprehensive RAMS documents identifying hazards, assessing risks, 
                  and detailing control measures for your specific work activities.
                </p>
                <div className="text-sm text-slate-500">
                  • CDM 2015 compliant
                  • Site-specific hazards
                  • Control measures included
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Settings className="h-12 w-12 text-construction-orange mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">Method Statements</h3>
                <p className="text-slate-600 mb-4">
                  Step-by-step procedures detailing how work will be carried out safely, 
                  including equipment, personnel, and safety measures.
                </p>
                <div className="text-sm text-slate-500">
                  • Trade-specific procedures
                  • Equipment requirements
                  • Safety protocols
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">Compliance Docs</h3>
                <p className="text-slate-600 mb-4">
                  Additional compliance documentation including permits, checklists, 
                  and regulatory forms required for your specific trade.
                </p>
                <div className="text-sm text-slate-500">
                  • Permit to work forms
                  • Safety checklists
                  • Inspection records
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Metrics */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Proven Results
            </h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">28s</div>
                <div className="text-slate-600">Average generation time</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">£212</div>
                <div className="text-slate-600">Labour cost saved per document</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-construction-orange mb-2">100%</div>
                <div className="text-slate-600">CDM 2015 compliance rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">99%</div>
                <div className="text-slate-600">Time reduction vs manual</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to See It in Action?
          </h3>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven construction compliance. 
            See how quickly we can transform your project details into professional documentation.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setLocation("/cscs-verification")}
            >
              <Play className="mr-2 h-5 w-5" />
              Try Live Demo
            </Button>
            <Button 
              size="lg"
              className="bg-construction-orange hover:bg-orange-600 text-white"
              onClick={() => setLocation("/auth")}
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}