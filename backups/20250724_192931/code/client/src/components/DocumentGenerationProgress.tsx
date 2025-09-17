import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wand2, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Loader2,
  Brain,
  Shield,
  Building
} from "lucide-react";

interface DocumentGenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  currentDocument?: string;
  totalDocuments: number;
  completedDocuments: string[];
  onViewDocument?: (documentName: string) => void;
  onDownloadAll?: () => void;
  estimatedTimeRemaining?: number;
}

export function DocumentGenerationProgress({
  isGenerating,
  progress,
  currentDocument,
  totalDocuments,
  completedDocuments,
  onViewDocument,
  onDownloadAll,
  estimatedTimeRemaining
}: DocumentGenerationProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedProgress(prev => {
        if (prev < progress) {
          return Math.min(prev + 2, progress);
        }
        return progress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [progress]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = (documentName: string) => {
    if (completedDocuments.includes(documentName)) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (currentDocument === documentName) {
      return <Loader2 className="h-4 w-4 animate-spin text-construction-orange" />;
    }
    return <Clock className="h-4 w-4 text-steel-gray" />;
  };

  const getStatusText = (documentName: string) => {
    if (completedDocuments.includes(documentName)) return "Completed";
    if (currentDocument === documentName) return "Generating...";
    return "Pending";
  };

  const documentQueue = [
    "Risk Assessment",
    "Method Statement", 
    "Site Setup Checklist",
    "PPE Requirements",
    "Emergency Procedures"
  ].slice(0, totalDocuments);

  if (!isGenerating && completedDocuments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card className="border-2 border-construction-orange/20 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-construction-orange rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal">AI Document Generation</h3>
                <p className="text-sm text-steel-gray">
                  {isGenerating ? "Creating compliance documents..." : "Generation Complete"}
                </p>
              </div>
            </div>
            <Badge variant={isGenerating ? "default" : "secondary"} className="ml-2">
              {completedDocuments.length}/{totalDocuments}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Generation Progress</span>
              <div className="flex items-center space-x-2">
                <span>{Math.round(animatedProgress)}%</span>
                {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
                  <span className="text-steel-gray">
                    · {formatTime(estimatedTimeRemaining)} remaining
                  </span>
                )}
              </div>
            </div>
            
            <Progress 
              value={animatedProgress} 
              className="h-3 bg-orange-100" 
            />
            
            {currentDocument && isGenerating && (
              <div className="flex items-center space-x-2 text-sm text-construction-orange">
                <Wand2 className="h-4 w-4" />
                <span>Currently generating: {currentDocument}</span>
              </div>
            )}
          </div>

          {/* Document Status List */}
          <div className="space-y-3">
            <h4 className="font-medium text-charcoal flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Document Status</span>
            </h4>
            
            <div className="space-y-2">
              {documentQueue.map((docName, index) => (
                <div 
                  key={docName}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    completedDocuments.includes(docName) 
                      ? "bg-green-50 border-green-200" 
                      : currentDocument === docName
                      ? "bg-orange-50 border-construction-orange/30 shadow-sm"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(docName)}
                    <div>
                      <span className="font-medium text-charcoal">{docName}</span>
                      <div className="text-xs text-steel-gray">
                        {getStatusText(docName)}
                      </div>
                    </div>
                  </div>
                  
                  {completedDocuments.includes(docName) && onViewDocument && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDocument(docName)}
                      className="h-8 px-3 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  AI-Powered Compliance
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Building className="h-3 w-3" />
                    <span>UK Construction Regulations (CDM 2015, HSE)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3" />
                    <span>Trade-specific risk assessments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-3 w-3" />
                    <span>Site-specific customization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isGenerating && completedDocuments.length > 0 && (
            <div className="flex items-center space-x-3 pt-2">
              {onDownloadAll && (
                <Button 
                  onClick={onDownloadAll}
                  className="bg-construction-orange hover:bg-orange-600 flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Documents
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      {!isGenerating && completedDocuments.length === totalDocuments && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">
                  Document Generation Complete!
                </h4>
                <p className="text-sm text-green-700">
                  All {totalDocuments} compliance documents have been successfully generated.
                  Review each document and make any necessary site-specific adjustments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}