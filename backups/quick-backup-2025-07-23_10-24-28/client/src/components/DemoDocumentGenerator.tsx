import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Mail, 
  Folder,
  Crown,
  AlertTriangle,
  Shield,
  CheckCircle,
  Loader2,
  Lock
} from "lucide-react";

interface DemoDocumentGeneratorProps {
  tradeType: string;
  companyName: string;
}

export function DemoDocumentGenerator({ tradeType, companyName }: DemoDocumentGeneratorProps) {
  const [selectedDocument, setSelectedDocument] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectFolder, setProjectFolder] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [projectDetails, setProjectDetails] = useState({
    siteName: "",
    location: "",
    supervisor: "",
    description: "",
    startDate: "",
    hazards: ""
  });

  const documentTypes = {
    scaffolder: [
      { id: "risk-assessment", name: "Site-Specific Risk Assessment", icon: <Shield className="h-5 w-5" /> },
      { id: "method-statement", name: "Scaffold Method Statement", icon: <FileText className="h-5 w-5" /> },
      { id: "inspection-checklist", name: "CISRS Inspection Checklist", icon: <CheckCircle className="h-5 w-5" /> }
    ],
    plasterer: [
      { id: "risk-assessment", name: "Wet Work Risk Assessment", icon: <Shield className="h-5 w-5" /> },
      { id: "method-statement", name: "Plastering Method Statement", icon: <FileText className="h-5 w-5" /> },
      { id: "msds-review", name: "Material Safety Assessment", icon: <AlertTriangle className="h-5 w-5" /> }
    ],
    electrician: [
      { id: "risk-assessment", name: "Electrical Work Risk Assessment", icon: <Shield className="h-5 w-5" /> },
      { id: "method-statement", name: "Electrical Installation Method Statement", icon: <FileText className="h-5 w-5" /> },
      { id: "test-certificate", name: "Installation Test Certificate", icon: <CheckCircle className="h-5 w-5" /> }
    ]
  };

  const projectFolders = [
    "Manchester Office Block - Phase 2 [DEMO]",
    "Birmingham Retail Development [DEMO]", 
    "Leeds Industrial Estate [DEMO]",
    "Liverpool Residential Complex [DEMO]",
    "Sheffield Community Centre [DEMO]"
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate document generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    
    // Show subscription prompt
    alert("🎯 DEMO MODE: Document generated successfully! This is a watermarked demonstration. Subscribe to download real documents and access full features.");
  };

  const documents = documentTypes[tradeType as keyof typeof documentTypes] || documentTypes.scaffolder;

  return (
    <Card className="border-2 border-dashed border-construction-orange relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-4 right-4 text-construction-orange text-xl font-bold opacity-10 transform rotate-12 select-none">
        DEMO
      </div>
      <div className="absolute bottom-4 left-4 text-construction-orange text-lg font-bold opacity-10 transform -rotate-12 select-none">
        WORKDOC360
      </div>
      
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>AI Document Generator</span>
          <Badge variant="outline" className="bg-orange-50 text-construction-orange border-construction-orange">
            Demo Mode
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">
            <Lock className="h-3 w-3 mr-1" />
            Watermarked
          </Badge>
        </CardTitle>
        <p className="text-steel-gray">Generate site-specific compliance documents with AI assistance</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type Selection */}
        <div className="space-y-3">
          <Label>Document Type *</Label>
          <Select value={selectedDocument} onValueChange={setSelectedDocument}>
            <SelectTrigger className="border-construction-orange border-dashed">
              <SelectValue placeholder="Choose document type..." />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  <div className="flex items-center space-x-2">
                    {doc.icon}
                    <span>{doc.name} [DEMO]</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Folder Selection */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Folder className="h-4 w-4" />
            <span>Save to Project Folder *</span>
            <Badge variant="outline" className="text-xs">Demo Projects</Badge>
          </Label>
          <Select value={projectFolder} onValueChange={setProjectFolder}>
            <SelectTrigger className="border-construction-orange border-dashed">
              <SelectValue placeholder="Select project folder..." />
            </SelectTrigger>
            <SelectContent>
              {projectFolders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Create New Project Folder [DEMO]</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Site Name *</Label>
            <Input 
              placeholder="e.g. Manchester City Centre [DEMO]"
              value={projectDetails.siteName}
              onChange={(e) => setProjectDetails({...projectDetails, siteName: e.target.value})}
              className="border-construction-orange border-dashed"
            />
          </div>
          <div className="space-y-2">
            <Label>Location *</Label>
            <Input 
              placeholder="e.g. 123 High Street, M1 4AE [DEMO]"
              value={projectDetails.location}
              onChange={(e) => setProjectDetails({...projectDetails, location: e.target.value})}
              className="border-construction-orange border-dashed"
            />
          </div>
          <div className="space-y-2">
            <Label>Site Supervisor *</Label>
            <Input 
              placeholder="e.g. John Smith [DEMO]"
              value={projectDetails.supervisor}
              onChange={(e) => setProjectDetails({...projectDetails, supervisor: e.target.value})}
              className="border-construction-orange border-dashed"
            />
          </div>
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Input 
              type="date"
              value={projectDetails.startDate}
              onChange={(e) => setProjectDetails({...projectDetails, startDate: e.target.value})}
              className="border-construction-orange border-dashed"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Work Description *</Label>
          <Textarea 
            placeholder="Describe the work to be carried out, materials used, and any specific requirements... [DEMO DATA]"
            rows={3}
            value={projectDetails.description}
            onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
            className="border-construction-orange border-dashed"
          />
        </div>

        <div className="space-y-2">
          <Label>Known Hazards & Considerations</Label>
          <Textarea 
            placeholder="List any known hazards, site conditions, or special considerations... [DEMO DATA]"
            rows={3}
            value={projectDetails.hazards}
            onChange={(e) => setProjectDetails({...projectDetails, hazards: e.target.value})}
            className="border-construction-orange border-dashed"
          />
        </div>

        {/* Email Options */}
        <div className="space-y-3 border-t pt-4">
          <Label className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Document (Optional)</span>
            <Badge variant="outline" className="text-xs">Demo Feature</Badge>
          </Label>
          <Input 
            type="email"
            placeholder="demo@client.com, supervisor@demo-site.co.uk"
            value={emailRecipient}
            onChange={(e) => setEmailRecipient(e.target.value)}
            className="border-construction-orange border-dashed"
          />
          <p className="text-xs text-steel-gray">
            Demo emails will have watermarks. Document sent with {companyName} branding.
          </p>
        </div>

        {/* Generate Button */}
        <div className="space-y-4">
          <Button 
            className="w-full bg-construction-orange hover:bg-orange-600 border-2 border-construction-orange" 
            onClick={handleGenerate}
            disabled={!selectedDocument || !projectFolder || isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Demo Document...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Generate Demo Document with AI
              </>
            )}
          </Button>

          {/* Demo Warning */}
          <div className="p-4 bg-orange-50 rounded-lg border-2 border-construction-orange border-dashed">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-construction-orange mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-charcoal mb-1">Demo Mode Active</h4>
                <p className="text-sm text-steel-gray mb-3">
                  This generates watermarked demonstration documents. To create professional, 
                  downloadable documents and access full features, subscribe to WorkDoc360.
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-construction-orange hover:bg-orange-600">
                    Subscribe Now - £65/month
                  </Button>
                  <Button size="sm" variant="outline" className="border-construction-orange text-construction-orange">
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        {isGenerating && (
          <div className="space-y-3 animate-pulse border-2 border-dashed border-construction-orange p-4 rounded-lg bg-orange-50">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-construction-orange" />
              <span className="text-sm font-medium text-construction-orange">Generating Watermarked Demo Document...</span>
            </div>
            <div className="h-4 bg-construction-orange bg-opacity-20 rounded w-3/4"></div>
            <div className="h-4 bg-construction-orange bg-opacity-20 rounded w-1/2"></div>
            <div className="h-4 bg-construction-orange bg-opacity-20 rounded w-2/3"></div>
            <div className="flex space-x-2 mt-4">
              <div className="h-8 bg-construction-orange bg-opacity-20 rounded w-20"></div>
              <div className="h-8 bg-construction-orange bg-opacity-20 rounded w-16"></div>
              <div className="h-8 bg-construction-orange bg-opacity-20 rounded w-24"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}