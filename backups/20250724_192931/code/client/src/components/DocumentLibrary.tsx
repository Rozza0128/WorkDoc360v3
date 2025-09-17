import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download, Eye, Shield, Building2, CheckCircle2, MessageSquare, Users } from "lucide-react";
import { DocumentReviewModal } from "./DocumentReviewModal";
import { useAuth } from "@/hooks/useAuth";
import type { GeneratedDocument } from "@shared/schema";

interface DocumentLibraryProps {
  companyId: number;
}

export function DocumentLibrary({ companyId }: DocumentLibraryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const { data: documents, isLoading } = useQuery<GeneratedDocument[]>({
    queryKey: ["/api/companies", companyId, "document-library"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/companies/${companyId}/upgrade-plan`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/companies", companyId, "document-library"],
      });
      toast({
        title: "Plan Upgraded Successfully!",
        description: "ISO 9001 documents have been added to your library.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-orange mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading document library...</p>
        </div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-construction-orange/10 flex items-center justify-center">
          <FileText className="h-6 w-6 text-construction-orange" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Document Library Empty</h3>
        <p className="text-muted-foreground mb-4">
          No documents have been generated for this company yet.
        </p>
      </Card>
    );
  }

  // Group documents by category
  const iso9001Docs = documents.filter(doc => 
    doc.templateType === "quality_manual" || 
    doc.templateType === "procedure" ||
    doc.documentName?.toLowerCase().includes("iso")
  );
  
  const healthSafetyDocs = documents.filter(doc => 
    doc.templateType === "policy" || 
    doc.documentName?.toLowerCase().includes("safety") ||
    doc.documentName?.toLowerCase().includes("health")
  );
  
  const otherDocs = documents.filter(doc => 
    !iso9001Docs.includes(doc) && !healthSafetyDocs.includes(doc)
  );

  const handleOpenReview = (document: GeneratedDocument) => {
    setSelectedDocument(document);
    setIsReviewModalOpen(true);
  };

  const DocumentCard = ({ document }: { document: GeneratedDocument }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-construction-orange/10">
              {document.templateType === "quality_manual" && <Building2 className="h-4 w-4 text-construction-orange" />}
              {document.templateType === "procedure" && <CheckCircle2 className="h-4 w-4 text-construction-orange" />}
              {document.templateType === "policy" && <Shield className="h-4 w-4 text-construction-orange" />}
              {!["quality_manual", "procedure", "policy"].includes(document.templateType) && <FileText className="h-4 w-4 text-construction-orange" />}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{document.documentName}</CardTitle>
              <CardDescription className="text-xs">
                Created {new Date(document.createdAt!).toLocaleDateString('en-GB')}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge variant="outline" className="text-xs">
              {document.templateType.replace(/_/g, " ").toUpperCase()}
            </Badge>
            {document.reviewStatus && (
              <Badge 
                variant={document.reviewStatus === "approved" ? "default" : "secondary"}
                className="text-xs"
              >
                {document.reviewStatus}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleOpenReview(document)}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Review
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Document Library
        </h2>
        <p className="text-muted-foreground">
          ISO 9001:2015 quality management documents and compliance templates
        </p>
      </div>

      <Tabs defaultValue="iso9001" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="iso9001" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>ISO 9001 ({iso9001Docs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="health-safety" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Health & Safety ({healthSafetyDocs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Other ({otherDocs.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iso9001" className="space-y-4 mt-6">
          {iso9001Docs.length > 0 ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">ISO 9001:2015 Quality Management System</h3>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Complete set of quality management documents designed specifically for UK construction companies. 
                  These templates comply with ISO 9001:2015 requirements and industry best practices.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {iso9001Docs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Upgrade to Professional Plan
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4 max-w-md mx-auto">
                Get access to comprehensive ISO 9001:2015 quality management documentation including Quality Manual, procedures, and compliance templates.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-blue-700 dark:text-blue-300 mb-4">
                <span>✓ Quality Manual</span>
                <span>✓ Management Procedures</span>
                <span>✓ Audit Templates</span>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => upgradeMutation.mutate()}
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Professional - £129/month"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="health-safety" className="space-y-4 mt-6">
          {healthSafetyDocs.length > 0 ? (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Health & Safety Documentation</h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Essential health and safety policies and procedures compliant with HSE regulations and CDM 2015 requirements.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {healthSafetyDocs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No health & safety documents available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-4 mt-6">
          {otherDocs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No other documents available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DocumentReviewModal
        document={selectedDocument}
        companyId={companyId}
        currentUserId={user?.id || ""}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedDocument(null);
        }}
      />
    </div>
  );
}