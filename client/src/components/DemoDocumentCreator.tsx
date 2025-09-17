import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  HardHat, 
  PaintRoller, 
  Zap, 
  Wrench, 
  Building, 
  FileText,
  Download,
  Mail,
  Building2,
  CheckCircle2,
  Sparkles,
  Bot,
  ArrowRight,
  AlertTriangle,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TradeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface QuestionConfig {
  id: string;
  question: string;
  type: 'text' | 'select' | 'textarea';
  options?: string[];
  required: boolean;
}

const TRADE_CATEGORIES: TradeCategory[] = [
  { id: 'scaffolding', name: 'Scaffolding', icon: <Building className="h-5 w-5" />, description: 'Access platforms and support structures' },
  { id: 'plastering', name: 'Plastering & Rendering', icon: <PaintRoller className="h-5 w-5" />, description: 'Wall finishing and decorative work' },
  { id: 'electrical', name: 'Electrical', icon: <Zap className="h-5 w-5" />, description: 'Electrical installations and maintenance' },
  { id: 'plumbing', name: 'Plumbing', icon: <Wrench className="h-5 w-5" />, description: 'Water systems and heating' },
  { id: 'building', name: 'General Building', icon: <HardHat className="h-5 w-5" />, description: 'Construction and renovation' },
  { id: 'roofing', name: 'Roofing', icon: <Building2 className="h-5 w-5" />, description: 'Roof installation and repair' }
];

const DOCUMENT_TYPES: DocumentType[] = [
  { 
    id: 'risk-assessment', 
    name: 'Risk Assessment', 
    description: 'Identify hazards and control measures',
    icon: <AlertTriangle className="h-5 w-5" />
  },
  { 
    id: 'method-statement', 
    name: 'Method Statement', 
    description: 'Step-by-step work procedures',
    icon: <FileText className="h-5 w-5" />
  },
  { 
    id: 'toolbox-talk', 
    name: 'Toolbox Talk', 
    description: 'Safety briefing for workers',
    icon: <HardHat className="h-5 w-5" />
  }
];

const getQuestionsForDocument = (tradeId: string, documentType: string): QuestionConfig[] => {
  const baseQuestions = [
    {
      id: 'site-location',
      question: 'What type of site are you working on?',
      type: 'select' as const,
      options: ['Residential', 'Commercial', 'Industrial', 'Roadside/Highway', 'Educational', 'Healthcare', 'Retail', 'Office Building'],
      required: true
    },
    {
      id: 'project-description',
      question: 'Briefly describe the specific work being undertaken',
      type: 'textarea' as const,
      required: true
    },
    {
      id: 'site-address',
      question: 'Site location (postcode or area)',
      type: 'text' as const,
      required: true
    }
  ];

  if (documentType === 'risk-assessment') {
    return [
      ...baseQuestions,
      {
        id: 'main-hazards',
        question: 'What are the main hazards you expect to encounter?',
        type: 'textarea' as const,
        required: true
      },
      {
        id: 'weather-dependency',
        question: 'Is this work weather dependent?',
        type: 'select' as const,
        options: ['Yes - Weather critical', 'Some weather dependency', 'No - Indoor/covered work'],
        required: true
      },
      {
        id: 'personnel-count',
        question: 'How many people will be involved in this work?',
        type: 'select' as const,
        options: ['1-2 people', '3-5 people', '6-10 people', 'More than 10 people'],
        required: true
      },
      {
        id: 'duration',
        question: 'Expected duration of work?',
        type: 'select' as const,
        options: ['Half day', '1 day', '2-5 days', '1-2 weeks', 'More than 2 weeks'],
        required: true
      }
    ];
  }

  if (documentType === 'method-statement') {
    return [
      ...baseQuestions,
      {
        id: 'equipment-required',
        question: 'What equipment and tools will be required?',
        type: 'textarea' as const,
        required: true
      },
      {
        id: 'team-size',
        question: 'How many workers will be involved?',
        type: 'select' as const,
        options: ['1-2 workers', '3-5 workers', '6-10 workers', 'More than 10 workers'],
        required: true
      },
      {
        id: 'sequence-of-work',
        question: 'Briefly outline the sequence of work activities',
        type: 'textarea' as const,
        required: true
      },
      {
        id: 'emergency-procedures',
        question: 'Are there any specific emergency procedures for this work?',
        type: 'textarea' as const,
        required: false
      }
    ];
  }

  if (documentType === 'toolbox-talk') {
    return [
      ...baseQuestions,
      {
        id: 'specific-risks',
        question: 'What specific risks need highlighting to the team?',
        type: 'textarea' as const,
        required: true
      },
      {
        id: 'recent-incidents',
        question: 'Any recent incidents or near-misses to discuss?',
        type: 'textarea' as const,
        required: false
      },
      {
        id: 'key-safety-points',
        question: 'What are the key safety points for this work?',
        type: 'textarea' as const,
        required: true
      },
      {
        id: 'ppe-requirements',
        question: 'What PPE is required for this work?',
        type: 'select' as const,
        options: ['Basic PPE (hard hat, hi-vis, boots)', 'Enhanced PPE (inc. harness, gloves)', 'Specialist PPE (respiratory, eye protection)', 'Full face mask/breathing apparatus'],
        required: true
      }
    ];
  }

  return baseQuestions;
};

export function DemoDocumentCreator() {
  const [step, setStep] = useState(1);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [contactDetails, setContactDetails] = useState({ email: '', companyName: '' });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<{ url: string; filename: string } | null>(null);
  const { toast } = useToast();

  const selectedTradeInfo = TRADE_CATEGORIES.find(t => t.id === selectedTrade);
  const selectedDocInfo = DOCUMENT_TYPES.find(d => d.id === selectedDocumentType);
  const questions = selectedTrade && selectedDocumentType ? getQuestionsForDocument(selectedTrade, selectedDocumentType) : [];

  const handleTradeSelect = (tradeId: string) => {
    setSelectedTrade(tradeId);
    setSelectedDocumentType('');
    setStep(2);
  };

  const handleDocumentTypeSelect = (docType: string) => {
    setSelectedDocumentType(docType);
    setStep(3);
  };

  const handleContactSubmit = () => {
    if (!contactDetails.email || !contactDetails.companyName) {
      toast({
        title: "Details Required",
        description: "Please provide your email and company name to continue.",
        variant: "destructive"
      });
      return;
    }
    setStep(4);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleGenerateDemo = async () => {
    // Validate required questions
    const requiredQuestions = questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id]?.trim());
    
    if (missingAnswers.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please answer all required questions before generating the document.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/demo/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade: selectedTrade,
          documentType: selectedDocumentType,
          contactDetails,
          answers
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const result = await response.json();
      setGeneratedDocument(result.document);
      setStep(5);

      toast({
        title: "Demo Document Generated!",
        description: "Your demo document is ready for download. Upgrade to remove the watermark and access unlimited documents.",
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Sorry, there was an error generating your demo document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDemo = () => {
    setStep(1);
    setSelectedTrade('');
    setSelectedDocumentType('');
    setContactDetails({ email: '', companyName: '' });
    setAnswers({});
    setGeneratedDocument(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-blue-600" />
          Create Your First Demo Document
          <Bot className="h-6 w-6 text-purple-600" />
        </CardTitle>
        <CardDescription>
          Experience our AI-powered compliance documentation - quality and accuracy prioritised
        </CardDescription>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">No Payment Required</Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Professional Quality</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Trade Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">What's your trade?</h3>
              <p className="text-muted-foreground">Select your construction trade to get started</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADE_CATEGORIES.map((trade) => (
                <Card 
                  key={trade.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleTradeSelect(trade.id)}
                  data-testid={`trade-${trade.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2 text-blue-600">
                      {trade.icon}
                    </div>
                    <h4 className="font-medium mb-1">{trade.name}</h4>
                    <p className="text-xs text-muted-foreground">{trade.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Document Type Selection */}
        {step === 2 && selectedTradeInfo && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {selectedTradeInfo.icon}
                <h3 className="text-lg font-semibold">{selectedTradeInfo.name}</h3>
              </div>
              <p className="text-muted-foreground">What type of document do you need?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DOCUMENT_TYPES.map((docType) => (
                <Card 
                  key={docType.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-300"
                  onClick={() => handleDocumentTypeSelect(docType.id)}
                  data-testid={`document-type-${docType.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2 text-purple-600">
                      {docType.icon}
                    </div>
                    <h4 className="font-medium mb-1">{docType.name}</h4>
                    <p className="text-xs text-muted-foreground">{docType.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" onClick={() => setStep(1)} className="w-full">
              Back to Trade Selection
            </Button>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && selectedTradeInfo && selectedDocInfo && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Contact Details</h3>
              </div>
              <p className="text-muted-foreground">We'll email you the completed demo document</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={contactDetails.email}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="demo-email-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  placeholder="Your Company Ltd"
                  value={contactDetails.companyName}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, companyName: e.target.value }))}
                  data-testid="demo-company-input"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleContactSubmit} className="flex-1" data-testid="start-creating-document-btn">
                  Continue to Questions <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Document Questions */}
        {step === 4 && questions.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Document Details</h3>
              <p className="text-muted-foreground">
                Creating a {selectedDocInfo?.name} for {selectedTradeInfo?.name} work
              </p>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={question.id}>
                    {question.question} {question.required && <span className="text-red-500">*</span>}
                  </Label>
                  {question.type === 'select' && question.options ? (
                    <Select 
                      value={answers[question.id] || ''} 
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      data-testid={`question-${question.id}`}
                    >
                      <SelectTrigger data-testid={`question-${question.id}-trigger`}>
                        <SelectValue placeholder="Please select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option) => (
                          <SelectItem 
                            key={option} 
                            value={option}
                            data-testid={`question-${question.id}-option-${option.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : question.type === 'textarea' ? (
                    <Textarea
                      id={question.id}
                      placeholder="Please provide details..."
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      rows={3}
                      data-testid={`question-${question.id}`}
                    />
                  ) : (
                    <Input
                      id={question.id}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      data-testid={`question-${question.id}`}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleGenerateDemo} 
                  disabled={isGenerating}
                  className="flex-1"
                  data-testid="generate-document-btn"
                >
                  {isGenerating ? (
                    <>Generating Demo... <Sparkles className="h-4 w-4 ml-2 animate-spin" /></>
                  ) : (
                    <>Generate Demo Document <Rocket className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Generated Document */}
        {step === 5 && generatedDocument && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Demo Document Generated!</h3>
              <p className="text-muted-foreground">
                Your demo {selectedDocInfo?.name} is ready for download
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">{generatedDocument.filename}</p>
                  <Badge variant="secondary" className="mt-2">DEMO VERSION</Badge>
                </CardContent>
              </Card>
              <Button asChild className="w-full" data-testid="download-demo-pdf-btn">
                <a href={generatedDocument.url} download target="_blank" rel="noopener noreferrer">
                  Download Demo PDF <Download className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Want to remove the watermark and access unlimited documents?
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/select-plan'}>
                  Upgrade to Full Version
                </Button>
              </div>
              <Button variant="ghost" onClick={resetDemo} className="w-full">
                Create Another Demo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}