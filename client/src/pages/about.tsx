import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  HardHat, 
  Users, 
  Shield, 
  Award, 
  Building, 
  CheckCircle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export default function About() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-construction-orange text-white mb-4">About WorkDoc360</Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            Built by Construction Professionals,
            <span className="block text-blue-600">For Construction Professionals</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            WorkDoc360 was created by experienced site managers and industry experts who understand 
            the daily challenges of construction compliance and documentation.
          </p>
        </div>

        {/* Story Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Building className="mr-3 h-6 w-6 text-construction-orange" />
              Our Story
            </h2>
            <div className="prose prose-lg text-slate-600">
              <p className="mb-4">
                After spending countless hours manually creating risk assessments, method statements, 
                and compliance documents across multiple construction sites, our founding team recognised 
                there had to be a better way.
              </p>
              <p className="mb-4">
                We discovered that the average site manager spends 3.5 hours writing each risk assessment – 
                time that could be better spent ensuring site safety and project delivery. That's when we 
                decided to harness the power of AI to revolutionise construction documentation.
              </p>
              <p>
                Today, WorkDoc360 serves construction professionals across the UK, from sole traders 
                to large enterprises, helping them save thousands of hours and ensure consistent 
                HSE compliance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Safety First</h3>
              <p className="text-slate-600">
                Every document we generate prioritises worker safety and HSE compliance. 
                Our AI is trained on current UK construction regulations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-construction-orange mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Industry Expertise</h3>
              <p className="text-slate-600">
                Built by construction professionals with decades of combined experience 
                across scaffolding, building, and specialised trades.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Proven Results</h3>
              <p className="text-slate-600">
                Our customers save an average of £212 per document and achieve 
                100% HSE compliance rates with our AI-generated documentation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Certifications & Standards */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Certifications & Standards</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-slate-700">CDM 2015 Compliant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-slate-700">HSE Guidance Aligned</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-slate-700">ISO 9001:2015 Ready</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-slate-700">GDPR Compliant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-slate-700">SOC 2 Type II</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-slate-700">UK Data Protection</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Get In Touch</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-construction-orange mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">Email Support</div>
                  <div className="text-slate-600">support@workdoc360.com</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-construction-orange mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">Phone Support</div>
                  <div className="text-slate-600">0800 123 4567</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-construction-orange mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">Head Office</div>
                  <div className="text-slate-600">
                    WorkDoc360 Limited<br />
                    123 Construction House<br />
                    Manchester M1 2AB
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Construction Compliance?
          </h3>
          <p className="text-lg text-slate-600 mb-6">
            Join thousands of UK construction professionals who've automated their safety documentation.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              className="bg-construction-orange hover:bg-orange-600 text-white"
              onClick={() => setLocation("/cscs-verification")}
            >
              Try Demo
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation("/auth")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}