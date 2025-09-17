import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye,
  FileCheck,
  FolderOpen,
  Clock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentUploadAreaProps {
  companyId: number;
  companyName: string;
  tradeType: string;
}

export function DocumentUploadArea({ companyId, companyName, tradeType }: DocumentUploadAreaProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [documentDescription, setDocumentDescription] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const documentTypes = [
    { value: "risk-assessment", label: "Risk Assessment" },
    { value: "method-statement", label: "Method Statement" },
    { value: "toolbox-talk", label: "Toolbox Talk" },
    { value: "inspection-checklist", label: "Inspection Checklist" },
    { value: "safety-policy", label: "Safety Policy" },
    { value: "training-record", label: "Training Record" },
    { value: "incident-report", label: "Incident Report" },
    { value: "quality-manual", label: "Quality Manual" },
    { value: "procedure", label: "Standard Operating Procedure" },
    { value: "work-instruction", label: "Work Instruction" },
    { value: "other", label: "Other Document" }
  ];

  const uploadDocumentsMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const formData = new FormData();
      
      // Add files to form data
      uploadedFiles.forEach((file, index) => {
        formData.append(`documents`, file);
      });
      
      // Add metadata
      formData.append('documentType', documentType);
      formData.append('title', documentTitle);
      formData.append('description', documentDescription);
      formData.append('companyId', companyId.toString());
      
      const response = await fetch(`/api/companies/${companyId}/upload-documents`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Document upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "documents"] });
      toast({
        title: "Documents Uploaded Successfully!",
        description: `${data.documentsProcessed} documents have been added to your library.`,
      });
      
      // Reset form
      setUploadedFiles([]);
      setDocumentType("");
      setDocumentTitle("");
      setDocumentDescription("");
      setUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types (documents only)
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid File Types",
        description: "Please select document files only (PDF, Word, Excel, Text)",
        variant: "destructive",
      });
    }

    // Check file sizes (max 10MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files Too Large",
        description: "Please select files under 10MB each",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one document to upload",
        variant: "destructive",
      });
      return;
    }

    if (!documentType || !documentTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in document type and title",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentsMutation.mutate();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-construction-orange" />
          Upload Existing Documents
        </CardTitle>
        <CardDescription>
          Upload your existing {companyName} documents to add them to your digital library and enable AI-powered compliance assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Upload Area */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Select Documents</Label>
          
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="document-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-construction-orange/30 rounded-lg cursor-pointer bg-construction-orange/5 hover:bg-construction-orange/10 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-construction-orange" />
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, Word, Excel, or Text files (MAX. 10MB each)</p>
              </div>
              <Input
                id="document-upload"
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Selected Files ({uploadedFiles.length})
              </Label>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-construction-orange" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-auto p-1 hover:bg-red-100"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Document Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-type" className="text-sm font-medium">
              Document Type *
            </Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-title" className="text-sm font-medium">
              Document Title *
            </Label>
            <Input
              id="document-title"
              placeholder="e.g. Site Safety Risk Assessment 2024"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-description" className="text-sm font-medium">
            Description (Optional)
          </Label>
          <Textarea
            id="document-description"
            placeholder="Brief description of the document contents and purpose..."
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Upload Button */}
        <div className="flex gap-3">
          <Button 
            onClick={handleUpload}
            disabled={uploading || uploadedFiles.length === 0}
            className="bg-construction-orange hover:bg-construction-orange/90"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Upload Documents ({uploadedFiles.length})
              </>
            )}
          </Button>
          
          {uploadedFiles.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setUploadedFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Benefits Information */}
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            <strong>What happens after upload:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>AI-powered compliance assessment and gap analysis</li>
              <li>Documents integrated into your searchable library</li>
              <li>Automatic categorization and tagging</li>
              <li>Expiry date tracking and renewal reminders</li>
              <li>Risk level evaluation and improvement suggestions</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">
            Tips for Better AI Assessment:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Use clear, descriptive file names</li>
            <li>• Ensure text is readable (not scanned images)</li>
            <li>• Include version numbers and dates in titles</li>
            <li>• Group related documents together</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}