import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestLogin } from "@/components/TestLogin";
import { 
  HardHat, 
  Building, 
  PaintRoller, 
  Hammer, 
  CheckCircle, 
  Shield, 
  FileText, 
  Users,
  QrCode,
  Mic,
  Star,
  ArrowRight,
  Play,
  Rocket,
  Calendar
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <HardHat className="text-construction-orange text-2xl" />
                <span className="text-xl font-bold text-charcoal">WorkDoc360</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-steel-gray hover:text-charcoal transition-colors">Features</a>
              <a href="#compliance" className="text-steel-gray hover:text-charcoal transition-colors">Compliance</a>
              <a href="#pricing" className="text-steel-gray hover:text-charcoal transition-colors">Pricing</a>
              <Button variant="outline" onClick={() => window.location.href = "/api/login"}>
                Sign In
              </Button>
              <Button className="bg-construction-orange hover:bg-orange-600" onClick={() => window.location.href = "/api/login"}>
                Start Free Trial
              </Button>
            </div>
            <Button variant="ghost" className="md:hidden">
              <span className="sr-only">Menu</span>
              ☰
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-construction-blue to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-700 bg-opacity-50 rounded-full px-4 py-2 mb-6">
                <Shield className="text-warning-amber mr-2 h-4 w-4" />
                <span className="text-sm font-medium">ISO 45001:2018 & CDM 2015 Compliant</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                UK Construction Compliance Made Simple
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Right then, let's get your paperwork sorted! Generate proper ISO-standard documents, H&S compliance, and trade-specific documentation for Scaffolders, Plasterers, and General Builders. CSCS 2025 ready, innit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-construction-orange hover:bg-orange-600"
                  onClick={() => window.location.href = "/api/login"}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-construction-blue">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Modern construction site with workers in safety gear" 
                className="rounded-xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-compliant-green rounded-full animate-pulse"></div>
                  <span className="text-charcoal font-medium">Compliance Status: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Selection */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">Choose Your Trade Specialisation</h2>
            <p className="text-xl text-steel-gray">Get industry-specific templates and compliance documentation automatically generated</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Scaffolders */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-construction-orange">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-construction-orange bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Building className="text-construction-orange text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">Scaffolders</h3>
                  <p className="text-steel-gray mb-6">CISRS certification tracking, TG20/TG30:24 compliance, scaffold design calculations</p>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">CISRS Certification tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">TG20/TG30:24 Compliance docs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">Local authority permits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">Daily inspection records</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plasterers */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-construction-orange">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-construction-orange bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <PaintRoller className="text-construction-orange text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">Plasterers</h3>
                  <p className="text-steel-gray mb-6">CSCS 2025 compliance, material certificates, fire-resistant documentation</p>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">CSCS card renewal tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">Material compliance certificates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">Fire-resistant material docs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">Skills certification records</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Builders */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-construction-orange">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-construction-orange bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Hammer className="text-construction-orange text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">General Builders</h3>
                  <p className="text-steel-gray mb-6">Building Control approvals, CDM 2015 compliance, ISO 45001:2018 templates</p>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">Building Control Approval docs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">CDM 2015 compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">ISO 45001:2018 templates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-compliant-green text-sm h-4 w-4" />
                      <span className="text-sm text-charcoal">RAMS documentation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Document Generation Features */}
      <section id="compliance" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">Automated Document Generation</h2>
            <p className="text-xl text-steel-gray">Create professional, compliant documents in minutes with our smart template system</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Construction workers reviewing safety documents on tablet" 
                className="rounded-xl shadow-lg w-full"
              />
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="text-construction-orange h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal mb-2">Smart Template Engine</h3>
                  <p className="text-steel-gray">Auto-populate documents with your company details, site information, and regulatory requirements specific to your trade.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="text-construction-orange h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal mb-2">Digital Signatures</h3>
                  <p className="text-steel-gray">Legally binding digital signatures for method statements, risk assessments, and compliance certificates.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <QrCode className="text-construction-orange h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal mb-2">QR Code Integration</h3>
                  <p className="text-steel-gray">Generate QR codes for equipment tracking, site access, and CSCS card verification with mobile scanning.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-construction-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mic className="text-construction-orange h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal mb-2">Voice-to-Text Reporting</h3>
                  <p className="text-steel-gray">Hands-free incident reporting and site observations using voice recognition technology for field workers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">Choose Your Plan</h2>
            <p className="text-xl text-steel-gray">Scale with your business needs - from solo traders to large construction companies</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Essential Plan */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-charcoal mb-2">Essential</h3>
                  <p className="text-steel-gray mb-4">Perfect for sole traders and small construction firms</p>
                  <div className="text-3xl font-bold text-charcoal">£65<span className="text-lg font-normal text-steel-gray">/month</span></div>
                  <p className="text-sm text-steel-gray mt-2">Includes 3 users</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">3 user accounts included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Trade-specific templates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">CSCS card tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Email notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Standard support</span>
                  </div>
                  <div className="text-xs text-steel-gray mt-4">
                    + £15/month per additional user
                  </div>
                </div>
                
                <Button className="w-full" variant="outline" onClick={() => window.location.href = "/api/login"}>
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-construction-orange relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-construction-orange text-white">Most Popular</Badge>
              </div>
              
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-charcoal mb-2">Professional</h3>
                  <p className="text-steel-gray mb-4">For growing construction businesses</p>
                  <div className="text-3xl font-bold text-charcoal">£129<span className="text-lg font-normal text-steel-gray">/month</span></div>
                  <p className="text-sm text-steel-gray mt-2">Includes 10 users</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">10 user accounts included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">All document templates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Digital signatures</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">QR code generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Custom branding</span>
                  </div>
                  <div className="text-xs text-steel-gray mt-4">
                    + £12/month per additional user
                  </div>
                </div>
                
                <Button className="w-full bg-construction-orange hover:bg-orange-600" onClick={() => window.location.href = "/api/login"}>
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-charcoal mb-2">Enterprise</h3>
                  <p className="text-steel-gray mb-4">For large construction companies and contractors</p>
                  <div className="text-3xl font-bold text-charcoal">£299<span className="text-lg font-normal text-steel-gray">/month</span></div>
                  <p className="text-sm text-steel-gray mt-2">Includes 50 users</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">50 user accounts included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Custom templates & branding</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">API integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Dedicated support manager</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-compliant-green h-4 w-4" />
                    <span className="text-charcoal">Custom document generation</span>
                  </div>
                  <div className="text-xs text-steel-gray mt-4">
                    + £8/month per additional user<br/>
                    Custom requests: £150/hour
                  </div>
                </div>
                
                <Button className="w-full bg-construction-blue hover:bg-blue-700">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Pricing Information */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-charcoal mb-4">Add-On Services</h3>
              <p className="text-steel-gray">Flexible pricing to meet your specific requirements</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-construction-orange mb-2">£15</div>
                <div className="text-sm text-steel-gray mb-2">per additional user/month</div>
                <div className="text-xs text-charcoal">Essential Plan</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-construction-orange mb-2">£12</div>
                <div className="text-sm text-steel-gray mb-2">per additional user/month</div>
                <div className="text-xs text-charcoal">Professional Plan</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-construction-orange mb-2">£8</div>
                <div className="text-sm text-steel-gray mb-2">per additional user/month</div>
                <div className="text-xs text-charcoal">Enterprise Plan</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-construction-orange mb-2">£150</div>
                <div className="text-sm text-steel-gray mb-2">per hour</div>
                <div className="text-xs text-charcoal">Custom Requests</div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-steel-gray mb-4">
                All plans include 14-day free trial • No setup fees • Cancel anytime
              </p>
              <p className="text-xs text-steel-gray">
                Prices shown are exclusive of VAT. Custom requests include bespoke template creation, 
                specialised compliance requirements, and on-site training sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-construction-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Streamline Your Construction Compliance?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of UK construction professionals who trust WorkDoc360 for their documentation needs</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-construction-orange hover:bg-orange-600"
              onClick={() => window.location.href = "/api/login"}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Start 14-Day Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-construction-blue">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Demo
            </Button>
          </div>
          
          <p className="text-blue-200 text-sm mt-6">No credit card required • Full access to all features • Cancel anytime</p>
        </div>
      </section>

      {/* Development Test Login Section */}
      {process.env.NODE_ENV === "development" && (
        <section className="py-16 bg-blue-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-charcoal mb-4">Development Testing</h2>
              <p className="text-steel-gray">Quick access for testing WorkDoc360 features</p>
            </div>
            <TestLogin />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <HardHat className="text-construction-orange text-xl" />
                <span className="text-lg font-bold">WorkDoc360</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">The UK's leading construction compliance and documentation platform for professionals.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">&copy; 2025 WorkDoc360. All rights reserved. UK Company Registration: 12345678</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
