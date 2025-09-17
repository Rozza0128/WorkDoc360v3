import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Edit, 
  Save, 
  X, 
  FileText, 
  Calendar, 
  User, 
  Building,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import type { GeneratedDocument } from "@shared/schema";

interface DocumentPreviewModalProps {
  document: GeneratedDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (documentId: number, updates: Partial<GeneratedDocument>) => void;
  userRole: string;
}

export function DocumentPreviewModal({ 
  document, 
  isOpen, 
  onClose, 
  onUpdate,
  userRole 
}: DocumentPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showFullContent, setShowFullContent] = useState(false);
  const [documentContent, setDocumentContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const { toast } = useToast();

  // Fetch formatted document content when modal opens
  useEffect(() => {
    if (document && isOpen) {
      setIsLoadingContent(true);
      fetch(`/api/documents/${document.id}/preview`, {
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        setDocumentContent(data.content || 'No content available');
        setIsLoadingContent(false);
      })
      .catch(error => {
        console.error('Failed to load document content:', error);
        setDocumentContent('Failed to load document content');
        setIsLoadingContent(false);
      });
    }
  }, [document, isOpen]);

  if (!document) return null;

  const canEdit = ["admin", "manager"].includes(userRole);

  const handleEditStart = () => {
    setEditedContent(document.controlMeasures || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(document.id, { controlMeasures: editedContent });
      toast({
        title: "Document Updated",
        description: "Your changes have been saved successfully",
      });
    }
    setIsEditing(false);
  };



  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      generated: "default",
      draft: "secondary", 
      pending: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-charcoal line-clamp-2">
                {document.documentName}
              </DialogTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-steel-gray">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(document.createdAt || '').toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{document.projectManager}</span>
                </div>
                {getStatusBadge(document.status || "generated")}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-construction-orange" />
                    <span className="font-medium">Site:</span>
                    <span>{document.siteName}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm">
                    <Building className="h-4 w-4 text-construction-orange mt-0.5" />
                    <span className="font-medium">Address:</span>
                    <span className="text-steel-gray">{document.siteAddress}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4 text-construction-orange" />
                    <span className="font-medium">Template:</span>
                    <span>{document.templateType}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-construction-orange" />
                    <span className="font-medium">Generated by:</span>
                    <span>User #{document.generatedBy}</span>
                  </div>
                </div>
              </div>

              {/* Hazards Section */}
              {document.hazards && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-charcoal">Identified Hazards</h3>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-900 whitespace-pre-wrap">{document.hazards}</p>
                  </div>
                </div>
              )}

              {/* Control Measures Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-charcoal">Control Measures</h3>
                  </div>
                  {canEdit && !isEditing && (
                    <Button variant="outline" size="sm" onClick={handleEditStart}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-32 border-2 border-construction-orange focus:border-orange-600"
                      placeholder="Enter control measures..."
                    />
                    <div className="flex items-center space-x-2">
                      <Button onClick={handleSave} className="bg-construction-orange hover:bg-orange-600">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    {isLoadingContent ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-construction-orange mr-2" />
                        <span className="text-steel-gray">Loading document content...</span>
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-charcoal">
                            {showFullContent 
                              ? documentContent
                              : documentContent.substring(0, 800) + (documentContent.length > 800 ? "..." : "")
                            }
                          </pre>
                        </div>
                        {documentContent.length > 800 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowFullContent(!showFullContent)}
                            className="mt-4"
                          >
                            {showFullContent ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Full Document
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Special Requirements Section */}
              {document.specialRequirements && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-charcoal">Special Requirements</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 whitespace-pre-wrap">{document.specialRequirements}</p>
                  </div>
                </div>
              )}

              {/* Footer Info */}
              <div className="border-t pt-4 text-xs text-steel-gray">
                <p>Document ID: {document.id}</p>
                <p>Last updated: {new Date(document.updatedAt || document.createdAt || '').toLocaleString()}</p>
                <p>This document was generated using AI technology and should be reviewed by qualified personnel.</p>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-steel-gray">
              Generated with WorkDoc360 AI
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/documents/${document.id}/download/pdf`, {
                      method: 'GET',
                      credentials: 'include'
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to download document');
                    }
                    
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = globalThis.document.createElement('a');
                    link.href = url;
                    link.download = `${document.documentName}.pdf`;
                    link.click();
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "PDF Downloaded",
                      description: "Document has been downloaded as PDF successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Download Failed",
                      description: "Unable to download PDF. Please try again.",
                      variant: "destructive"
                    });
                  }
                }} 
                className="bg-construction-orange hover:bg-orange-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/documents/${document.id}/download/word`, {
                      method: 'GET',
                      credentials: 'include'
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to download document');
                    }
                    
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = globalThis.document.createElement('a');
                    link.href = url;
                    link.download = `${document.documentName}.docx`;
                    link.click();
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Word Downloaded",
                      description: "Document has been downloaded as Word successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Download Failed",
                      description: "Unable to download Word document. Please try again.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Word
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}