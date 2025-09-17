import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  HardHat,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Minimize2,
  Maximize2
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  userType?: 'guest' | 'customer';
  userName?: string;
}

export function SupportChatbot({ isOpen, onToggle, userType = 'guest', userName }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: userType === 'customer' && userName 
          ? `Hello ${userName}! I'm your WorkDoc360 AI assistant. I can help you with compliance questions, document generation, CSCS tracking, and platform support. How can I assist you today?`
          : `Welcome to WorkDoc360! I'm your AI assistant covering all UK construction trades - from electricians and plumbers to scaffolders and renewable energy installers. I can help with platform features, compliance requirements, or document generation. How can I help you today?`,
        timestamp: new Date(),
        suggestions: userType === 'customer' 
          ? ["Generate a risk assessment", "CSCS card help", "Document templates", "Compliance deadlines"]
          : ["View all trades", "Free trial", "Document examples", "Platform pricing"]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userType, userName, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();
    
    // Construction compliance expertise responses
    if (lowerMessage.includes('cscs') || lowerMessage.includes('card')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `For CSCS cards, here's what you need to know:

**Current Requirements:**
• All site workers need valid CSCS cards by 2025 deadline
• Cards must match your trade qualification level
• Blue Skilled Worker cards for qualified tradespeople
• Green Labourer cards for general construction work

**WorkDoc360 CSCS Tracking:**
• Automatic expiry date monitoring
• Email alerts 30 days before expiration
• Renewal reminders and guidance
• Digital card storage and verification

Would you like me to help you set up CSCS tracking for your team?`,
        timestamp: new Date(),
        suggestions: ["Set up CSCS tracking", "Card renewal process", "What cards do I need?", "Upload existing cards"]
      };
    }

    if (lowerMessage.includes('risk assessment') || lowerMessage.includes('rams') || lowerMessage.includes('method statement')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `Our AI generates professional risk assessments in under 30 seconds:

**What We Create:**
• CDM 2015 compliant risk assessments
• Trade-specific method statements
• Site-specific safety procedures
• Emergency response protocols

**Trades Covered:**
• General Contractors & Main Contractors
• Electricians (18th Edition, Part P compliance)
• Plumbers (Gas Safe, water regulations)
• Bricklayers, Carpenters & Joiners
• Roofers, Heating Engineers
• Scaffolders (CISRS compliant)
• Plasterers (CSCS 2025 ready)
• Steel Erectors, Groundworkers
• Renewable Energy Installers
• All UK construction trades supported

**Quality Standard:**
• Professional consultant quality
• HSE guideline compliance
• Ready for Building Control inspection
• Legally compliant documentation

Want to see a sample document or start generating one now?`,
        timestamp: new Date(),
        suggestions: ["See sample document", "Generate risk assessment", "Method statement help", "CDM 2015 guidance"]
      };
    }

    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('subscription')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `WorkDoc360 Pricing Plans:

**Essential Plan - £65/month**
• 3 users included
• Basic compliance tracking
• Standard document templates
• Email support

**Professional Plan - £129/month**
• 10 users included
• AI document generation
• ISO 9001 premium templates
• Priority support
• Advanced compliance analytics

**Enterprise Plan - £299/month**
• 50 users included
• Custom document templates
• Dedicated account manager
• API access for mobile apps
• White-label options

**Additional Users:** £15/£12/£8 per month (depending on plan)
**Custom Work:** £150/hour for bespoke requirements

Ready to start your 14-day free trial?`,
        timestamp: new Date(),
        suggestions: ["Start free trial", "Compare plans", "Custom requirements", "Enterprise demo"]
      };
    }

    if (lowerMessage.includes('iso 9001') || lowerMessage.includes('quality') || lowerMessage.includes('iso9001')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `ISO 9001:2015 Quality Management Documentation:

**Premium Templates Include:**
• Quality Manual (company-specific)
• Process procedures and work instructions
• Quality policy and objectives
• Management review procedures
• Internal audit programmes
• Corrective action processes

**Construction Industry Focus:**
• UK Building Regulations compliance
• CDM 2015 integration
• Trade-specific quality controls
• Supplier management procedures

**Benefits:**
• Ready for certification audit
• Professional consultant quality
• Saves months of development time
• Ongoing compliance maintenance

ISO 9001 templates are available with Professional and Enterprise plans. Would you like to see a sample quality manual?`,
        timestamp: new Date(),
        suggestions: ["Sample quality manual", "Certification guidance", "Professional plan details", "Implementation support"]
      };
    }

    if (lowerMessage.includes('free trial') || lowerMessage.includes('trial') || lowerMessage.includes('demo')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `Start Your Free 14-Day Trial:

**What's Included:**
• Full access to AI document generation
• Complete compliance tracking system
• All document templates
• Mobile app access
• Priority email support

**No Commitment:**
• Cancel anytime during trial
• No credit card required upfront
• Full platform access
• Personal onboarding session

**Getting Started (All UK Business Types Welcome):**
1. Create your account at workdoc360.com
2. Set up your business profile:
   • Limited Companies (Companies House registration)
   • Sole Traders (UTR number support)
   • Partnerships and LLPs
   • Charities and non-profits
3. Choose your trade specialisation
4. Generate your first documents
5. Invite team members

Ready to transform your construction compliance? I can help you get started right now!`,
        timestamp: new Date(),
        suggestions: ["Create account now", "Book demo call", "Platform overview", "Implementation help"]
      };
    }

    if (lowerMessage.includes('cdm') || lowerMessage.includes('regulations') || lowerMessage.includes('compliance')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `UK Construction Compliance Made Simple:

**CDM 2015 Requirements:**
• Risk assessments for all construction work
• Method statements for high-risk activities
• Competence management (CSCS cards)
• Health and safety planning
• Principal contractor duties

**WorkDoc360 Compliance:**
• Automatic CDM 2015 compliant documents
• Built-in HSE guideline references
• UK Building Regulations integration
• Trade-specific safety requirements
• Real-time compliance monitoring

**Other Regulations Covered:**
• Working at Height Regulations 2005
• Manual Handling Operations Regulations
• COSHH (Control of Substances Hazardous to Health)
• Construction skills certification requirements

Need help with specific compliance requirements for your project?`,
        timestamp: new Date(),
        suggestions: ["CDM 2015 guidance", "Building regulations", "COSHH assessment", "Compliance checklist"]
      };
    }

    if (lowerMessage.includes('mobile') || lowerMessage.includes('app') || lowerMessage.includes('phone')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `WorkDoc360 Mobile App Coming Soon:

**Mobile Features:**
• CSCS card scanning and tracking
• Document access on-site
• Compliance alerts and reminders
• Photo upload for site reports
• Offline document access
• GPS location for site-specific docs

**Platforms:**
• iOS App Store
• Google Play Store
• Progressive Web App (PWA) option

**Integration:**
• Same login as web platform
• Real-time sync with main system
• All existing documents available
• Team collaboration features

**Timeline:**
• Beta version: Q4 2025
• Full release: Q1 2026

Would you like to join our mobile app beta testing programme?`,
        timestamp: new Date(),
        suggestions: ["Join beta programme", "Mobile features", "Release timeline", "PWA access"]
      };
    }

    if (lowerMessage.includes('all trades') || lowerMessage.includes('view all trades') || lowerMessage.includes('what trades') || lowerMessage.includes('which trades') || lowerMessage.includes('trade coverage') || lowerMessage.includes('supported trades')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `WorkDoc360 supports every UK construction trade with comprehensive coverage:

**Core Building Trades:**
• General Contractors & Main Contractors
• Bricklayers & Stonemasons
• Carpenters & Joiners
• Roofers & Roofing Specialists
• Concrete Specialists

**Building Services & MEP:**
• Electricians (18th Edition, Part P)
• Plumbers (Gas Safe, Water Regs)
• Heating Engineers (Heat Pumps, Boilers)
• Air Conditioning Specialists
• Building Services Engineers

**Finishing Trades:**
• Plasterers & Dry Liners
• Painters & Decorators
• Flooring Specialists
• Glaziers & Window Fitters
• Ceiling Fixers

**Specialized & Infrastructure:**
• Scaffolders (CISRS)
• Steel Erectors & Fixers
• Groundworkers & Excavation
• Drainage Specialists
• Insulation Specialists
• Demolition Contractors

**Emerging Specialties:**
• Renewable Energy Installers
• Solar PV & Heat Pump Specialists
• EV Charging Point Installers
• Historic Building Restoration
• Sustainability Consultants

Plus support for any other UK construction trade!`,
        timestamp: new Date(),
        suggestions: ["Start free trial", "Trade-specific features", "Document examples", "Compliance guidance"]
      };
    }

    if (lowerMessage.includes('business type') || lowerMessage.includes('sole trader') || lowerMessage.includes('limited company') || lowerMessage.includes('partnership') || lowerMessage.includes('llp') || lowerMessage.includes('company registration') || lowerMessage.includes('registration number')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `WorkDoc360 supports all UK business structures! Our platform adapts to your specific business type:

**Supported Business Types:**
• **Limited Companies** - Full Companies House integration, registration number required
• **Sole Traders** - UTR number support for HMRC compliance (optional)
• **Partnerships** - Traditional business partnerships with flexible registration
• **Limited Liability Partnerships (LLPs)** - Professional service firms with LLP numbers
• **Charities & Non-profits** - Charity registration number support
• **Other Business Structures** - Flexible setup for unique arrangements

**Smart Registration Process:**
• Form fields adapt based on your business type selection
• Context-aware guidance for each structure
• Appropriate help text and validation
• Companies House or HMRC number fields as needed

**Professional Setup Experience:**
Whether you're a one-person sole trader working on domestic projects or a large limited company with multiple sites, our onboarding process provides the right experience for your business structure.

The setup takes just 2 minutes and guides you through everything you need!`,
        timestamp: new Date(),
        suggestions: ["Start registration", "Sole trader guidance", "Limited company setup", "Business type help"]
      };
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `I'm here to help! Here are the ways I can assist you:

**Technical Support:**
• Platform navigation and features
• Document generation guidance
• Account setup and configuration
• Mobile app integration
• Billing and subscription queries

**Compliance Expertise:**
• UK construction regulations (CDM 2015)
• CSCS card requirements
• ISO 9001 quality management
• Health and safety compliance
• Trade-specific requirements

**Business Support:**
• Pricing and plan selection
• Custom requirements assessment
• Implementation planning
• Training and onboarding

**Contact Options:**
• Live chat (you're using it now!)
• Email: support@workdoc360.com
• Phone: 0800 123 4567 (UK only)
• Video call support (Professional+ plans)

What specific area would you like help with?`,
        timestamp: new Date(),
        suggestions: ["Technical issue", "Compliance question", "Billing query", "Feature request"]
      };
    }

    // Default response for unrecognized queries
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `I understand you're asking about "${userMessage}". While I specialise in UK construction compliance and WorkDoc360 features, I want to make sure I give you the most accurate information.

**I can definitely help with:**
• Construction compliance (CDM 2015, Building Regs)
• CSCS card requirements and tracking
• Risk assessments and method statements
• ISO 9001 quality management
• WorkDoc360 platform features and pricing

**For complex technical queries:**
• Email our expert team: support@workdoc360.com
• Book a consultation call
• Access our knowledge base

Could you rephrase your question or let me know which of these areas you'd like help with?`,
      timestamp: new Date(),
      suggestions: ["Compliance help", "Platform features", "Pricing info", "Contact expert team"]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(userMessage.content);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "I apologise, but I'm experiencing a temporary issue. Please try again or contact our support team at support@workdoc360.com for immediate assistance.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 rounded-full w-12 h-12 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        size="lg"
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-96 h-[calc(100vh-8rem)] max-h-[500px] md:w-96 md:h-[500px] shadow-2xl border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 md:p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg font-semibold truncate">WorkDoc360 Support</CardTitle>
              <div className="flex items-center space-x-1 text-xs md:text-sm text-blue-100">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1 hidden md:flex"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)] md:h-[432px]">
          <ScrollArea className="flex-1 p-3 md:p-4">
            <div className="space-y-3 md:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 md:p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start space-x-1 md:space-x-2">
                      {message.type === 'bot' && (
                        <HardHat className="h-3 w-3 md:h-4 md:w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed break-words">
                          {message.content}
                        </div>
                        {message.suggestions && (
                          <div className="mt-2 md:mt-3 flex flex-wrap gap-1 md:gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-50 text-[10px] md:text-xs px-2 py-1"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] md:text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-lg p-2 md:p-3 max-w-[85%] md:max-w-[80%]">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Bot className="h-3 w-3 md:h-4 md:w-4 text-blue-600 animate-pulse" />
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="border-t p-3 md:p-4">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about compliance, documents..."
                className="flex-1 text-sm md:text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-3 md:px-4"
                size="sm"
              >
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <div className="text-[10px] md:text-xs text-slate-500 mt-2 text-center leading-tight">
              Powered by WorkDoc360 AI • Construction compliance specialist
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}