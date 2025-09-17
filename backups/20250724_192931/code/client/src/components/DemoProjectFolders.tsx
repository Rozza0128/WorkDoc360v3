import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, 
  FileText, 
  Download, 
  Mail,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  Lock,
  Crown
} from "lucide-react";

interface DemoProjectFoldersProps {
  companyName: string;
  tradeType: string;
}

export function DemoProjectFolders({ companyName, tradeType }: DemoProjectFoldersProps) {
  const projects = [
    {
      id: 1,
      name: "Manchester Office Block - Phase 2 [DEMO]",
      location: "Manchester City Centre, M1 4AE",
      status: "Active",
      startDate: "2025-01-15",
      documents: 12,
      lastActivity: "2 hours ago",
      supervisor: "John Smith [Demo]",
      progress: 65
    },
    {
      id: 2,
      name: "Birmingham Retail Development [DEMO]",
      location: "Birmingham Central, B1 2AA",
      status: "Planning",
      startDate: "2025-02-01",
      documents: 8,
      lastActivity: "1 day ago",
      supervisor: "Sarah Jones [Demo]",
      progress: 25
    },
    {
      id: 3,
      name: "Leeds Industrial Estate [DEMO]",
      location: "Leeds West, LS12 3QR",
      status: "Completed",
      startDate: "2024-11-20",
      documents: 24,
      lastActivity: "1 week ago",
      supervisor: "Mike Wilson [Demo]",
      progress: 100
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-compliant-green text-white";
      case "Planning":
        return "bg-blue-500 text-white";
      case "Completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getDocumentTypes = () => {
    switch (tradeType) {
      case "scaffolder":
        return [
          "CISRS Inspection Checklists [DEMO]",
          "Scaffold Design Calculations [DEMO]", 
          "Risk Assessments [DEMO]",
          "Method Statements [DEMO]",
          "Handover Certificates [DEMO]"
        ];
      case "plasterer":
        return [
          "Material Safety Data Sheets [DEMO]",
          "Wet Work Assessments [DEMO]",
          "Risk Assessments [DEMO]", 
          "Method Statements [DEMO]",
          "Quality Control Records [DEMO]"
        ];
      case "electrician":
        return [
          "Electrical Test Certificates [DEMO]",
          "Installation Certificates [DEMO]",
          "Risk Assessments [DEMO]",
          "Method Statements [DEMO]", 
          "Circuit Schedules [DEMO]"
        ];
      default:
        return [
          "Risk Assessments [DEMO]",
          "Method Statements [DEMO]",
          "Safety Records [DEMO]",
          "Compliance Documents [DEMO]"
        ];
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-construction-orange relative overflow-hidden">
        {/* Watermarks */}
        <div className="absolute top-4 right-4 text-construction-orange text-lg font-bold opacity-10 transform rotate-12 select-none">
          DEMO
        </div>
        <div className="absolute bottom-4 left-4 text-construction-orange text-sm font-bold opacity-10 transform -rotate-12 select-none">
          WORKDOC360
        </div>
        
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Project Folders</span>
            <Badge variant="outline" className="bg-orange-50 text-construction-orange border-construction-orange">
              {projects.length} Demo Projects
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">
              <Lock className="h-3 w-3 mr-1" />
              Watermarked
            </Badge>
          </CardTitle>
          <p className="text-steel-gray">Organise documents by project with automatic folder structure (Demo Mode)</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-construction-orange relative overflow-hidden">
                {/* Project watermark */}
                <div className="absolute top-2 right-2 text-construction-orange text-xs font-bold opacity-20 transform rotate-12 select-none">
                  DEMO
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-charcoal mb-1">{project.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-steel-gray">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{project.supervisor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline" className="text-construction-orange border-construction-orange text-xs">
                        DEMO
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-charcoal">{project.documents}</div>
                      <div className="text-xs text-steel-gray">Demo Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-charcoal">{project.progress}%</div>
                      <div className="text-xs text-steel-gray">Demo Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-charcoal">{project.lastActivity}</div>
                      <div className="text-xs text-steel-gray">Last Activity</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" disabled className="border-construction-orange border-dashed">
                      <FileText className="mr-1 h-3 w-3" />
                      View Demo Docs
                    </Button>
                    <Button size="sm" variant="outline" disabled className="border-construction-orange border-dashed">
                      <Download className="mr-1 h-3 w-3" />
                      Download Demo
                    </Button>
                    <Button size="sm" variant="outline" disabled className="border-construction-orange border-dashed">
                      <Mail className="mr-1 h-3 w-3" />
                      Email Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Types by Trade */}
      <Card className="border-2 border-dashed border-construction-orange relative overflow-hidden">
        {/* Watermarks */}
        <div className="absolute top-4 right-4 text-construction-orange text-lg font-bold opacity-10 transform rotate-12 select-none">
          DEMO
        </div>
        
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Auto-Generated Document Types</span>
            <Badge variant="outline" className="bg-orange-50 text-construction-orange border-construction-orange">
              Demo Content
            </Badge>
          </CardTitle>
          <p className="text-steel-gray">
            Documents automatically organised in project folders based on your trade specialisation (Demo Mode)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {getDocumentTypes().map((docType, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-dashed border-construction-orange rounded-lg bg-orange-50 bg-opacity-30">
                <FileText className="h-4 w-4 text-construction-orange" />
                <span className="text-sm font-medium">{docType}</span>
                <Badge variant="outline" className="ml-auto text-xs text-construction-orange border-construction-orange">
                  Demo
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border-2 border-construction-orange border-dashed">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-construction-orange mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-charcoal mb-1">Smart Organisation (Demo Mode)</h4>
<p className="text-sm text-steel-gray mb-3">
                  AI automatically categorises and files documents into the correct project folders. 
                  Email notifications sent to project stakeholders when new documents are added.
                  <strong> Subscribe to access real project management features.</strong>
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
        </CardContent>
      </Card>
    </div>
  );
}