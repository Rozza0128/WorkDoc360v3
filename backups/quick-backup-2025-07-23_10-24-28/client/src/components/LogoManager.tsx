import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Image, Check, X, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LogoManagerProps {
  companyId: number;
  companyName: string;
}

export function LogoManager({ companyId, companyName }: LogoManagerProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["/api/companies", companyId]
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch(`/api/companies/${companyId}/upload-logo`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Logo upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId] });
      toast({
        title: "Logo Updated Successfully!",
        description: "Your company logo will now appear on all documents and the login screen.",
      });
      setLogoFile(null);
      setLogoPreview(null);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, SVG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image under 2MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };

  const clearPreview = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-construction-orange" />
          Company Logo Management
        </CardTitle>
        <CardDescription>
          Upload your company logo to appear on documents, login screen, and throughout the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Logo Display */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Current Logo</Label>
          {(company as any)?.logoUrl ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <img 
                src={(company as any).logoUrl} 
                alt={`${companyName} logo`}
                className="max-h-20 max-w-48 object-contain"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No logo uploaded yet</p>
            </div>
          )}
        </div>

        {/* Logo Upload Section */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Upload New Logo</Label>
          
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="logo-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-construction-orange/30 rounded-lg cursor-pointer bg-construction-orange/5 hover:bg-construction-orange/10 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-construction-orange" />
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF or SVG (MAX. 2MB)</p>
              </div>
              <Input
                id="logo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Preview and Upload Controls */}
          {logoPreview && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Preview</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPreview}
                    className="h-auto p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <img 
                  src={logoPreview} 
                  alt="Logo preview"
                  className="max-h-20 max-w-48 object-contain"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-construction-orange hover:bg-construction-orange/90"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearPreview}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Usage Information */}
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Your logo will appear on:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>All generated documents (headers and watermarks)</li>
                <li>Login screen branding</li>
                <li>Document templates and exports</li>
                <li>Email notifications and communications</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}