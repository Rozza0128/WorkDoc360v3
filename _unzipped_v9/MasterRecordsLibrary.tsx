import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  HardHat, 
  FileText,
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react";

interface MasterRecordsLibraryProps {
  companyId: number;
  companyName: string;
  tradeType: string;
}

export function MasterRecordsLibrary({ companyId, companyName, tradeType }: MasterRecordsLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("risk-safety");

  // Mock data for demonstration - in real app, this would come from API
  const masterRecords = {
    riskSafety: [
      {
        id: 1,
        type: "Risk Assessment",
        title: "Working at Height - Scaffolding Operations",
        status: "current",
        lastUpdated: "2024-07-15",
        nextReview: "2024-10-15",
        createdBy: "John Smith",
        version: "v2.1"
      },
      {
        id: 2,
        type: "Method Statement",
        title: "Scaffold Erection Procedure",
        status: "current",
        lastUpdated: "2024-07-10",
        nextReview: "2024-12-10",
        createdBy: "Sarah Jones",
        version: "v1.3"
      },
      {
        id: 3,
        type: "Toolbox Talk",
        title: "Personal Protective Equipment",
        status: "due_review",
        lastUpdated: "2024-06-01",
        nextReview: "2024-07-01",
        createdBy: "Mike Wilson",
        version: "v1.0"
      }
    ],
    personnel: [
      {
        id: 4,
        type: "CSCS Card",
        title: "John Smith - Advanced Scaffolder",
        status: "expiring_soon",
        expiryDate: "2024-08-15",
        cardNumber: "CS1234567",
        grade: "Advanced Scaffolder"
      },
      {
        id: 5,
        type: "Qualification",
        title: "CISRS Advanced Scaffolder",
        status: "current",
        expiryDate: "2025-03-20",
        holderId: "Sarah Jones",
        certificateNumber: "CISRS-ADV-2023-001"
      },
      {
        id: 6,
        type: "Training Record",
        title: "Working at Height Training",
        status: "current",
        completedDate: "2024-06-15",
        validUntil: "2025-06-15",
        trainee: "Mike Wilson"
      }
    ],
    equipment: [
      {
        id: 7,
        type: "Equipment Certificate",
        title: "Mobile Scaffold Tower - Unit MST-001",
        status: "current",
        lastInspection: "2024-07-01",
        nextInspection: "2024-10-01",
        serialNumber: "MST-001-2023"
      },
      {
        id: 8,
        type: "PAT Testing",
        title: "Portable Power Tools",
        status: "due_review",
        lastTest: "2024-04-15",
        nextTest: "2024-07-15",
        testerId: "Certified PAT Tester Ltd"
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "current":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Current</Badge>;
      case "due_review":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Due Review</Badge>;
      case "expiring_soon":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Expiring Soon</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "current":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "due_review":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "expiring_soon":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderRecordCard = (record: any) => (
    <Card key={record.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(record.status)}
              <h4 className="font-semibold text-charcoal">{record.title}</h4>
              {getStatusBadge(record.status)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-steel-gray">
              <div>
                <span className="font-medium">Type:</span> {record.type}
              </div>
              {record.lastUpdated && (
                <div>
                  <span className="font-medium">Updated:</span> {record.lastUpdated}
                </div>
              )}
              {record.nextReview && (
                <div>
                  <span className="font-medium">Next Review:</span> {record.nextReview}
                </div>
              )}
              {record.expiryDate && (
                <div>
                  <span className="font-medium">Expires:</span> {record.expiryDate}
                </div>
              )}
              {record.version && (
                <div>
                  <span className="font-medium">Version:</span> {record.version}
                </div>
              )}
              {record.createdBy && (
                <div>
                  <span className="font-medium">Created By:</span> {record.createdBy}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Master Records Library</h2>
          <p className="text-steel-gray">Centralised document management for {companyName}</p>
        </div>
        <Button className="bg-construction-orange hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Add New Record
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray h-4 w-4" />
              <Input
                placeholder="Search records, documents, certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">{masterRecords.riskSafety.length}</div>
            <div className="text-sm text-steel-gray">Risk & Safety</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">{masterRecords.personnel.length}</div>
            <div className="text-sm text-steel-gray">Personnel Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-charcoal">{masterRecords.equipment.length}</div>
            <div className="text-sm text-steel-gray">Equipment Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">2</div>
            <div className="text-sm text-steel-gray">Expiring Soon</div>
          </CardContent>
        </Card>
      </div>

      {/* Records Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="risk-safety" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Risk & Safety
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Personnel
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center">
            <HardHat className="mr-2 h-4 w-4" />
            Equipment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risk-safety" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-red-600" />
                Risk & Safety Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {masterRecords.riskSafety.map(renderRecordCard)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Personnel Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {masterRecords.personnel.map(renderRecordCard)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardHat className="mr-2 h-5 w-5 text-amber-600" />
                Equipment Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {masterRecords.equipment.map(renderRecordCard)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-sm">New Risk Assessment</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Upload Certificate</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="h-6 w-6 text-green-600" />
              <span className="text-sm">Add Personnel Record</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <span className="text-sm">View Expiring Items</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}