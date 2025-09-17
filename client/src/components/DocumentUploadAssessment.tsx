import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  TrendingUp,
  Clock,
  Target,
  Users,
  Download,
  Mail,
  Eye,
  Loader2,
  Plus
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadAssessmentProps {
  companyId: number;
  companyName: string;
  tradeType: string;
}

interface AssessmentResult {
  id: number;
  originalFileName: string;
  documentType: string;
  overallScore: number;
  assessmentStatus: 'pending' | 'completed' | 'failed';
  complianceGaps: ComplianceGap[];
  recommendations: Recommendation[];
  strengths: string[];
  criticalIssues: CriticalIssue[];
  improvementPlan: ImprovementStep[];
  createdAt: string;
}

interface ComplianceGap {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  regulation: string;
  requiredAction: string;
}

interface Recommendation {
  title: string;
  description: string;
  priority: number;
  estimatedHours: number;
  costImplication: 'none' | 'low' | 'medium' | 'high';
}

interface CriticalIssue {
  title: string;
  description: string;
  immediateAction: string;
  legalImplication: string;
}

interface ImprovementStep {
  step: number;
  action: string;
  timeline: string;
  responsible: string;
  deliverable: string;
}

export function DocumentUploadAssessment({ companyId, companyName, tradeType }: DocumentUploadAssessmentProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/companies', companyId, 'assessments'],
  });

  // Upload and assess documents
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('documents', file);
      });
      formData.append('companyId', companyId.toString());
      formData.append('tradeType', tradeType);

      return apiRequest('POST', `/api/companies/${companyId}/assess-documents`, formData);
    },
    onSuccess: () => {
      toast({
        title: "Documents uploaded successfully",
        description: "AI assessment is in progress. Results will appear below.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId, 'assessments'] });
      setSelectedFiles(null);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload documents",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles) {
      uploadMutation.mutate(selectedFiles);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-l-4 border-l-construction-orange">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-construction-orange" />
            <span>Document Upload & AI Assessment</span>
          </CardTitle>
          <CardDescription>
            Upload your existing {tradeType} documents for comprehensive AI-powered compliance assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-construction-orange transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload Documents for Assessment</p>
                <p className="text-sm text-gray-600">
                  Supported formats: PDF, Word (.docx), Images (JPG, PNG)
                </p>
                <p className="text-xs text-gray-500">
                  Multiple files supported • Maximum 10MB per file
                </p>
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="mt-4"
                id="document-upload"
              />
            </div>

            {selectedFiles && (
              <div className="space-y-2">
                <p className="font-medium">Selected Files:</p>
                <div className="grid gap-2">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading and analyzing documents...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFiles || uploadMutation.isPending}
                className="bg-construction-orange hover:bg-orange-600"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Assess Documents
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Assessment Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assessmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading assessments...</span>
            </div>
          ) : assessments && assessments.length > 0 ? (
            <div className="space-y-4">
              {/* Assessment Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assessments.slice(0, 6).map((assessment: AssessmentResult) => (
                  <Card
                    key={assessment.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <Badge variant={getScoreBadgeVariant(assessment.overallScore)}>
                          {assessment.overallScore}%
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {assessment.originalFileName}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {assessment.documentType} • {new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                      {assessment.criticalIssues.length > 0 && (
                        <div className="flex items-center mt-2">
                          <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                          <span className="text-xs text-red-600">
                            {assessment.criticalIssues.length} critical issue(s)
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detailed Assessment View */}
              {selectedAssessment && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedAssessment.originalFileName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getScoreBadgeVariant(selectedAssessment.overallScore)} className="text-lg px-3 py-1">
                          {selectedAssessment.overallScore}% Compliance
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {selectedAssessment.documentType} • Assessed on {new Date(selectedAssessment.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="gaps">Gaps</TabsTrigger>
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                        <TabsTrigger value="critical">Critical</TabsTrigger>
                        <TabsTrigger value="plan">Action Plan</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-4">
                              <div className="flex items-center space-x-2">
                                <Target className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium">Overall Score</span>
                              </div>
                              <p className={`text-2xl font-bold ${getScoreColor(selectedAssessment.overallScore)}`}>
                                {selectedAssessment.overallScore}%
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium">Compliance Gaps</span>
                              </div>
                              <p className="text-2xl font-bold text-orange-600">
                                {selectedAssessment.complianceGaps.length}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium">Strengths</span>
                              </div>
                              <p className="text-2xl font-bold text-green-600">
                                {selectedAssessment.strengths.length}
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Document Strengths</h4>
                          <div className="space-y-1">
                            {selectedAssessment.strengths.map((strength, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span className="text-sm">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="gaps" className="space-y-4">
                        {selectedAssessment.complianceGaps.map((gap, index) => (
                          <Alert key={index} className="border-l-4 border-l-orange-500">
                            <div className="flex items-start space-x-2">
                              {getSeverityIcon(gap.severity)}
                              <div className="space-y-1">
                                <AlertTitle className="capitalize">{gap.category}</AlertTitle>
                                <AlertDescription>{gap.description}</AlertDescription>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <p><strong>Regulation:</strong> {gap.regulation}</p>
                                  <p><strong>Required Action:</strong> {gap.requiredAction}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-auto">
                                {gap.severity}
                              </Badge>
                            </div>
                          </Alert>
                        ))}
                      </TabsContent>

                      <TabsContent value="recommendations" className="space-y-4">
                        {selectedAssessment.recommendations.map((rec, index) => (
                          <Card key={index}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <h4 className="font-medium">{rec.title}</h4>
                                  <p className="text-sm text-gray-600">{rec.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>Priority: {rec.priority}/10</span>
                                    <span>Est. Time: {rec.estimatedHours}h</span>
                                    <span>Cost Impact: {rec.costImplication}</span>
                                  </div>
                                </div>
                                <Badge variant="outline">Priority {rec.priority}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>

                      <TabsContent value="critical" className="space-y-4">
                        {selectedAssessment.criticalIssues.length > 0 ? (
                          selectedAssessment.criticalIssues.map((issue, index) => (
                            <Alert key={index} variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>{issue.title}</AlertTitle>
                              <AlertDescription className="space-y-2">
                                <p>{issue.description}</p>
                                <div className="bg-red-50 p-3 rounded border">
                                  <p className="text-sm"><strong>Immediate Action Required:</strong> {issue.immediateAction}</p>
                                  <p className="text-sm"><strong>Legal Implication:</strong> {issue.legalImplication}</p>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <p className="text-lg font-medium text-green-600">No Critical Issues Found</p>
                            <p className="text-sm text-gray-600">This document meets critical compliance requirements</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="plan" className="space-y-4">
                        <div className="space-y-3">
                          {selectedAssessment.improvementPlan.map((step, index) => (
                            <Card key={index}>
                              <CardContent className="pt-4">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0 w-8 h-8 bg-construction-orange text-white rounded-full flex items-center justify-center text-sm font-medium">
                                    {step.step}
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="font-medium">{step.action}</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><strong>Timeline:</strong> {step.timeline}</p>
                                      <p><strong>Responsible:</strong> {step.responsible}</p>
                                      <p><strong>Deliverable:</strong> {step.deliverable}</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Separator className="my-4" />
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">No documents assessed yet</p>
              <p className="text-sm text-gray-500">Upload your first document above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}