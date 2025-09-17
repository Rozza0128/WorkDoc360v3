import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InteractivePricing } from "@/components/InteractivePricing";
import { 
  HardHat, 
  Building, 
  PaintRoller, 
  Hammer, 
  CheckCircle, 
  Shield, 
  FileText, 
  Users,
  Zap,
  Sparkles,
  Bot,
  Star,
  ArrowRight,
  Play,
  Rocket,
  Calendar,
  Brain,
  Cpu,
  Database,
  Globe,
  Clock,
  TrendingUp,
  User,
  Wrench,
  Zap as ElectricalIcon,
  Droplets,
  Home,
  TreePine,
  Truck,
  Mountain,
  Flame,
  Drill,
  Palette,
  Settings
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden floating-particles">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center">
                    <HardHat className="text-white text-lg" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                    WorkDoc360
                  </span>
                  <Badge className="ai-gradient text-white border-0 text-xs whitespace-nowrap px-2 py-1 self-start sm:self-auto">AI-Powered</Badge>
                </div>
              </div>
            </div>
            
            {/* Mobile Login Menu */}
            <div className="md:hidden flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:text-blue-600" 
                onClick={() => setLocation("/auth")}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-amber-600 hover:text-amber-700" 
                onClick={() => {
                  alert('Site Manager app coming soon!');
                }}
              >
                <HardHat className="h-4 w-4" />
              </Button>
              <Button 
                size="sm"
                className="ai-gradient text-white border-0" 
                onClick={() => setLocation("/auth")}
              >
                Login
              </Button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">AI Features</a>
              <a href="#compliance" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Compliance</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              
              {/* Enhanced Login Area */}
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium" 
                    onClick={() => setLocation("/auth")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Customer Login
                  </Button>
                  <div className="h-6 w-px bg-slate-300"></div>
                  <Button 
                    variant="ghost" 
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-medium" 
                    onClick={() => {
                      // TODO: Replace with actual site manager app URL when ready
                      alert('Site Manager application coming soon! This will link to your dedicated site manager platform.');
                    }}
                  >
                    <HardHat className="mr-2 h-4 w-4" />
                    Site Manager
                  </Button>
                </div>
                <Button 
                  className="btn-ai text-white shadow-lg px-6" 
                  onClick={() => setLocation("/auth")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Subscribe Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Flash Design */}
      <section className="relative overflow-hidden py-20 lg:py-32 floating-particles">
        {/* Modern Flash Background */}
        <div className="absolute inset-0 modern-flash-bg"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5"></div>
        
        {/* Enhanced Laser Beam Effects */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-500/30 rounded-full blur-xl animate-pulse laser-beam-primary"></div>
        <div className="absolute top-40 right-20 w-36 h-36 bg-purple-500/30 rounded-full blur-xl animate-pulse delay-1000 laser-beam-secondary"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-orange-500/30 rounded-full blur-xl animate-pulse delay-2000 laser-beam-tertiary"></div>
        
        {/* Additional laser flash elements */}
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-r from-slate-500/25 to-blue-500/25 rounded-full blur-lg animate-bounce delay-500 laser-beam-accent"></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-gradient-to-r from-blue-600/25 to-slate-600/25 rounded-full blur-lg animate-bounce delay-1500 laser-beam-accent"></div>
        
        {/* Construction-inspired geometric elements */}
        <div className="absolute top-10 right-1/4 w-3 h-40 bg-gradient-to-b from-blue-400/40 to-transparent rotate-12 construction-beam shadow-lg"></div>
        <div className="absolute bottom-10 left-1/2 w-3 h-32 bg-gradient-to-t from-purple-400/40 to-transparent -rotate-12 construction-beam delay-1000 shadow-lg"></div>
        <div className="absolute top-1/2 left-10 w-56 h-2 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent construction-beam delay-2000 shadow-lg"></div>
        
        {/* Additional construction laser scanning lines */}
        <div className="absolute top-1/4 right-10 w-1 h-24 bg-gradient-to-b from-emerald-500/50 to-transparent construction-beam delay-3000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-32 h-1 bg-gradient-to-r from-transparent via-slate-400/50 to-transparent construction-beam delay-4000"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-1 lg:order-1">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <Badge className="ai-gradient text-white border-0 px-4 py-1 whitespace-nowrap">
                  <Brain className="mr-2 h-4 w-4" />
                  AI-Powered Documentation
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Smart Construction 
                <span className="shimmer-text block pulsating-text">
                  Compliance Made Simple
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                <span className="font-bold text-slate-800">Stop spending 3.5 hours writing each risk assessment.</span> Our AI creates HSE-compliant documents in 28 seconds.
                <span className="block mt-2 font-semibold text-construction-orange">
                  💸 Save £212 in labour costs per document. ⏱️ 99% faster than manual writing.
                </span>
              </p>
              
              {/* Instant Value Proof Box */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">See AI in Action - No Signup Required</span>
                </div>
                <p className="text-green-700 text-sm mb-4">
                  "Here's a scaffold RAMS document created in 27 seconds by our AI."
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                  onClick={() => setLocation("/demo")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Sample Document Now
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 h-auto shadow-lg"
                  onClick={() => setLocation("/demo")}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Quick Demo - No Signup
                </Button>

                <Button 
                  size="lg" 
                  className="btn-ai text-white text-lg px-8 py-4 h-auto"
                  onClick={() => setLocation("/auth")}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Subscribe - £65/month
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto">
                      <Bot className="mr-2 h-5 w-5" />
                      Watch AI Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold flex items-center">
                        <Bot className="mr-3 h-6 w-6 text-blue-600" />
                        AI-Powered Document Generation Demo
                      </DialogTitle>
                      <DialogDescription className="text-lg">
                        See how WorkDoc360's AI instantly generates UK-compliant construction documents
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Demo Video Placeholder */}
                      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Bot className="mx-auto h-16 w-16 mb-4 text-blue-400" />
                            <h3 className="text-xl font-semibold mb-2">Interactive AI Demo</h3>
                            <p className="text-slate-300 mb-4">Watch our AI generate a complete risk assessment in under 30 seconds</p>
                            <Button 
                              className="bg-construction-orange hover:bg-orange-600"
                              onClick={() => setLocation("/demo")}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Demo Platform
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Demo Features */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <FileText className="h-8 w-8 text-blue-600 mb-2" />
                          <h4 className="font-semibold mb-1">Risk Assessments</h4>
                          <p className="text-sm text-slate-600">AI generates comprehensive RAMS in minutes</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <Shield className="h-8 w-8 text-green-600 mb-2" />
                          <h4 className="font-semibold mb-1">Method Statements</h4>
                          <p className="text-sm text-slate-600">Trade-specific safety procedures</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <CheckCircle className="h-8 w-8 text-orange-600 mb-2" />
                          <h4 className="font-semibold mb-1">Compliance Tracking</h4>
                          <p className="text-sm text-slate-600">Automated CSCS and certification monitoring</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>12-month commitment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>UK compliance guaranteed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>AI-generated documents</span>
                </div>
              </div>
            </div>
            
            <div className="relative order-2 lg:order-2">
              <div className="relative luxury-card rounded-3xl p-6 lg:p-8 floating-animation morphing-blob">
                <div className="ai-gradient rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-6 w-6" />
                      <span className="font-semibold">AI Assistant</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm">"Generate a risk assessment for scaffolding work at Manchester site"</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <p className="text-sm">AI generating comprehensive document... ✓</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">CDM 2015 Compliant</span>
                    </div>
                    <p className="text-xs text-green-600">Auto-validated</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">2.3 seconds</span>
                    </div>
                    <p className="text-xs text-blue-600">Generation time</p>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 ai-gradient rounded-full flex items-center justify-center opacity-80 floating-animation">
                <Zap className="text-white h-8 w-8" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center opacity-80 floating-animation" style={{animationDelay: '2s'}}>
                <Shield className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics Section */}
      <section className="py-16 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-green-600 text-white border-0 px-4 py-1 mb-4">
              <TrendingUp className="mr-2 h-4 w-4" />
              Proven Results
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Time and Money Saved by Real UK Construction Companies
            </h2>
          </div>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">28 sec</div>
              <div className="text-sm text-slate-600">Average document generation time</div>
              <div className="text-xs text-green-600 mt-1">vs. 3.5 hours manually</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">£212</div>
              <div className="text-sm text-slate-600">Labour cost saved per document</div>
              <div className="text-xs text-green-600 mt-1">Based on £60/hour PM rate</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">99%</div>
              <div className="text-sm text-slate-600">Faster than manual writing</div>
              <div className="text-xs text-green-600 mt-1">HSE compliant every time</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-sm text-slate-600">CDM 2015 compliance rate</div>
              <div className="text-xs text-green-600 mt-1">Auto-validated content</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <blockquote className="text-lg text-slate-700 italic mb-4">
                  "I used to spend 3 hours writing each risk assessment. Now it takes 3 minutes. 
                  The HSE inspector passed our documents first time with no issues. Absolute game-changer for our business."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">James Mitchell</div>
                    <div className="text-sm text-slate-600">Site Manager, Pinnacle Scaffolding, Leicester</div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="ai-gradient text-white border-0 px-4 py-1 mb-4">
              <Cpu className="mr-2 h-4 w-4" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Revolutionary AI Technology for 
              <span className="ai-gradient-text"> Construction</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our cutting-edge AI understands UK construction regulations and generates 
              perfect compliance documents in seconds, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* AI Document Generation */}
            <Card className="luxury-card border-0 stagger-animation">
              <CardContent className="p-8">
                <div className="w-14 h-14 ai-gradient rounded-xl flex items-center justify-center mb-6">
                  <Brain className="text-white h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Document Generation</h3>
                <p className="text-slate-600 mb-6">
                  Advanced neural networks trained on UK construction law automatically 
                  create risk assessments, method statements, and compliance docs.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-slate-600">CDM 2015 & HSE compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-slate-600">Site-specific customization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-slate-600">Real-time regulation updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Compliance Tracking */}
            <Card className="luxury-card border-0 stagger-animation">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="text-white h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Compliance Tracking</h3>
                <p className="text-slate-600 mb-6">
                  AI monitors certification expiry dates, automatically sends reminders, 
                  and predicts compliance issues before they become problems.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-slate-600">CSCS card tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-slate-600">Predictive alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-slate-600">Auto compliance scoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intelligent Trade Specialization */}
            <Card className="luxury-card border-0 stagger-animation">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-6">
                  <Database className="text-white h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Complete UK Trade Coverage</h3>
                <p className="text-slate-600 mb-6">
                  AI adapts to every UK construction trade - from electricians and plumbers to scaffolders and renewable energy installers - with comprehensive industry-specific compliance.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-slate-600">18th Edition BS 7671 for electricians</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-slate-600">Gas Safe & water regs for plumbers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-slate-600">All core building & specialized trades</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Stats */}
          <div className="luxury-card rounded-3xl p-12 morphing-blob">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold shimmer-text mb-2">2.3s</div>
                <p className="text-slate-600">Average AI generation time</p>
              </div>
              <div>
                <div className="text-4xl font-bold shimmer-text mb-2">99.8%</div>
                <p className="text-slate-600">Compliance accuracy rate</p>
              </div>
              <div>
                <div className="text-4xl font-bold shimmer-text mb-2">80%</div>
                <p className="text-slate-600">Time saved on documentation</p>
              </div>
              <div>
                <div className="text-4xl font-bold shimmer-text mb-2">24/7</div>
                <p className="text-slate-600">AI availability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Selection - Luxury */}
      <section className="py-20 mesh-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Complete UK Construction Industry Coverage</h2>
            <p className="text-xl text-slate-600 mb-8">AI-powered compliance for every UK construction trade - from core building to emerging specialties</p>
            
            {/* Color Theme Selector */}
            <div className="flex justify-center space-x-4 mb-8">
              <button className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg hover:scale-110 transition-transform" onClick={() => document.body.className = ''} title="Industrial Blue"></button>
              <button className="w-8 h-8 rounded-full bg-slate-600 border-2 border-white shadow-lg hover:scale-110 transition-transform" onClick={() => document.body.className = 'theme-steel'} title="Steel Grey"></button>
              <button className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg hover:scale-110 transition-transform" onClick={() => document.body.className = 'theme-safety'} title="Safety Green"></button>
              <button className="w-8 h-8 rounded-full bg-orange-600 border-2 border-white shadow-lg hover:scale-110 transition-transform" onClick={() => document.body.className = 'theme-construction'} title="Construction Orange"></button>
              <button className="w-8 h-8 rounded-full bg-yellow-600 border-2 border-white shadow-lg hover:scale-110 transition-transform" onClick={() => document.body.className = 'theme-caution'} title="Caution Yellow"></button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Scaffolders */}
            <Card className="luxury-card border-0 cursor-pointer group stagger-animation">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 ai-gradient rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Building className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Scaffolders</h3>
                  <p className="text-slate-600 mb-6">AI generates CISRS-compliant documentation with TG20/TG30:24 standards</p>
                  
                  <div className="space-y-3 text-left mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">CISRS certification tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">TG20/TG30:24 compliance docs</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">AI inspection reports</span>
                    </div>
                  </div>
                  <Badge className="ai-gradient text-white border-0">AI-Optimized</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Plasterers */}
            <Card className="luxury-card border-0 cursor-pointer group stagger-animation">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Palette className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Plasterers</h3>
                  <p className="text-slate-600 mb-6">Smart CSCS 2025 compliance with AI-generated material certificates</p>
                  
                  <div className="space-y-3 text-left mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">CSCS 2025 deadline tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">AI material certificates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">Fire-resistant documentation</span>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">AI-Enhanced</Badge>
                </div>
              </CardContent>
            </Card>

            {/* General Builders */}
            <Card className="luxury-card border-0 cursor-pointer group stagger-animation">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Hammer className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">General Builders</h3>
                  <p className="text-slate-600 mb-6">Comprehensive AI-powered safety and compliance management</p>
                  
                  <div className="space-y-3 text-left mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">Universal compliance docs</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">AI risk assessments</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600 h-4 w-4" />
                      </div>
                      <span className="text-slate-700">Smart project management</span>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">AI-Complete</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Trades Covered */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Every UK Construction Trade Supported</h3>
              <p className="text-lg text-slate-600">From sole traders to large contractors - comprehensive coverage across all construction disciplines</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Electricians */}
              <Card className="luxury-card border-0 group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <ElectricalIcon className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Electricians</h4>
                      <p className="text-sm text-slate-600">ECS/JIB compliance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Plumbers */}
              <Card className="luxury-card border-0 group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Droplets className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Plumbers</h4>
                      <p className="text-sm text-slate-600">Gas Safe & water regs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Roofers */}
              <Card className="luxury-card border-0 group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
                      <Home className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Roofers</h4>
                      <p className="text-sm text-slate-600">Working at height</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Carpenters */}
              <Card className="luxury-card border-0 group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-700 to-orange-800 rounded-lg flex items-center justify-center">
                      <TreePine className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Carpenters</h4>
                      <p className="text-sm text-slate-600">Woodworking safety</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Bricklayers */}
              <Card className="luxury-card border-0 group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                      <Building className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Bricklayers</h4>
                      <p className="text-sm text-slate-600">Masonry standards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Demolition */}
              <Card className="luxury-card border-0 group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                      <Drill className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Demolition</h4>
                      <p className="text-sm text-slate-600">Controlled demolition</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Plant Operators */}
              <Card className="luxury-card border-0 group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center">
                      <Truck className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Plant Operators</h4>
                      <p className="text-sm text-slate-600">CPCS certification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Custom Trades */}
              <Card className="luxury-card border-0 group border-dashed border-2 border-slate-300">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                      <Settings className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Your Trade</h4>
                      <p className="text-sm text-slate-600">Custom documentation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-slate-600 mb-4">
                <span className="font-semibold">25+ Construction Trades</span> supported with AI-generated, UK-compliant documentation
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500">
                <span>• Groundworkers</span>
                <span>• Steel Erectors</span>
                <span>• Concreters</span>
                <span>• Glaziers</span>
                <span>• Insulation Specialists</span>
                <span>• Drainage Engineers</span>
                <span>• and many more...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Section */}
      <InteractivePricing />

      {/* CTA Section */}
      <section className="py-20 ai-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="luxury-card rounded-3xl p-6 sm:p-8 lg:p-12 backdrop-blur-lg bg-white/10 border border-white/20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your
              <br />
              <span className="shimmer-text">Construction Compliance?</span>
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of UK construction professionals who've automated their safety documentation with AI. 
              <span className="font-semibold">Start saving 80% of your compliance time today.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-slate-50 font-semibold px-10 py-4 text-lg rounded-xl shadow-2xl hover:scale-105 transition-all duration-300"
                onClick={() => setLocation("/auth")}
              >
                <Rocket className="mr-3 h-6 w-6" />
                Start Your Free Trial Today
              </Button>
              <p className="text-white/80 text-sm">
                No credit card required • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center">
                  <HardHat className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold">WorkDoc360</span>
                <Badge className="ai-gradient text-white border-0 text-xs">AI</Badge>
              </div>
              <p className="text-slate-400 mb-4 text-sm">
                The UK's most advanced AI-powered construction compliance platform
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm lg:text-base">AI Features</h4>
              <ul className="space-y-2 text-xs lg:text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Smart Document Generation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance Predictions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Risk Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile AI Assistant</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm lg:text-base">Support</h4>
              <ul className="space-y-2 text-xs lg:text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Help Centre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training Videos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm lg:text-base">Legal</h4>
              <ul className="space-y-2 text-xs lg:text-sm text-slate-400">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">End User Licence Agreement</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liability Disclaimers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              &copy; 2025 WorkDoc360. All rights reserved. Powered by Advanced AI Technology.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              By using this service, you agree to our <a href="/terms" className="underline hover:text-white">Terms & Conditions</a> and <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>.
              <br />
              Important: WorkDoc360 assumes no liability for construction site safety or regulatory compliance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}