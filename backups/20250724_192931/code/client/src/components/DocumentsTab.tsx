import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Building,
  Wand2,
  Eye,
  Share2
} from "lucide-react";
import { DocumentSetupWizard } from "./DocumentSetupWizard";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import type { GeneratedDocument } from "@shared/schema";

interface DocumentsTabProps {
  companyId: number;
  companyName: string;
  tradeType: string;
  userRole: string;
}

export function DocumentsTab({ companyId, companyName, tradeType, userRole }: DocumentsTabProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [previewDocument, setPreviewDocument] = useState<GeneratedDocument | null>(null);
  const { toast } = useToast();

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: [`/api/companies/${companyId}/documents`],
    enabled: !showWizard
  });

  const filteredDocuments = documents.filter((doc: GeneratedDocument) => {
    const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      generated: "default",
      draft: "secondary",
      pending: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const canCreateDocuments = ["admin", "manager", "team_leader"].includes(userRole);

  if (showWizard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">Document Generation Wizard</h2>
            <p className="text-steel-gray">Create new compliance documents for your project</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowWizard(false)}
            className="touch-manipulation"
          >
            Back to Documents
          </Button>
        </div>
        
        <DocumentSetupWizard
          companyId={companyId}
          companyName={companyName}
          tradeType={tradeType}
          onComplete={() => {
            setShowWizard(false);
            refetch();
            toast({
              title: "Documents Generated",
              description: "Your compliance documents have been created successfully",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Documents</h2>
          <p className="text-steel-gray">Manage your compliance documentation</p>
        </div>
        
        {canCreateDocuments && (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-construction-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Documents
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <Card className="mobile-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 touch-manipulation"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-construction-orange focus:border-construction-orange touch-manipulation"
              >
                <option value="all">All Status</option>
                <option value="generated">Generated</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="mobile-card animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="mobile-card">
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              {searchTerm || statusFilter !== "all" ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-steel-gray mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by generating your first compliance documents"}
            </p>
            {canCreateDocuments && !searchTerm && statusFilter === "all" && (
              <Button 
                onClick={() => setShowWizard(true)}
                className="bg-gradient-to-r from-construction-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white touch-manipulation"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document: GeneratedDocument) => (
            <Card key={document.id} className="mobile-card hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-construction-orange transition-colors">
                      {document.documentName}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusIcon(document.status || "generated")}
                      {getStatusBadge(document.status || "generated")}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-steel-gray">
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{document.siteName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-steel-gray">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{document.projectManager}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-steel-gray">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{new Date(document.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 touch-manipulation"
                      onClick={() => setPreviewDocument(document)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                    <Button 
                      size="sm"
                      className="flex-1 bg-construction-orange hover:bg-orange-600 touch-manipulation"
                      onClick={() => {
                        // In production, this would download the actual document
                        const link = document.createElement('a');
                        link.href = `/api/documents/${document.id}/download`;
                        link.download = `${document.documentName}.pdf`;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics Footer */}
      {filteredDocuments.length > 0 && (
        <Card className="mobile-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-steel-gray">
              <div className="flex items-center space-x-6">
                <span>Total: {filteredDocuments.length}</span>
                <span>Generated: {filteredDocuments.filter(d => d.status === "generated").length}</span>
                <span>Drafts: {filteredDocuments.filter(d => d.status === "draft").length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        onUpdate={(documentId, updates) => {
          // Handle document updates
          refetch();
          setPreviewDocument(null);
        }}
        userRole={userRole}
      />
    </div>
  );
}