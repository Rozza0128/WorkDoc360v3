import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Clock,
  User,
  Mail,
  CheckCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  Send
} from "lucide-react";

interface DocumentProgressProps {
  companyId: number;
  userRole: string;
}

export function DocumentProgress({ companyId, userRole }: DocumentProgressProps) {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "document-progress"],
  });

  const { data: workflowDetails } = useQuery({
    queryKey: ["/api/companies", companyId, "workflow", selectedDocument],
    enabled: !!selectedDocument,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ documentId, progress, notes }: { 
      documentId: number; 
      progress: number; 
      notes?: string; 
    }) => {
      const res = await apiRequest("PATCH", `/api/companies/${companyId}/documents/${documentId}/progress`, {
        completionPercentage: progress,
        workflowNotes: notes,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "document-progress"] });
      toast({
        title: "Progress Updated",
        description: "Document progress has been successfully updated.",
      });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ documentId, type }: { documentId: number; type: string }) => {
      const res = await apiRequest("POST", `/api/companies/${companyId}/documents/${documentId}/notify`, {
        notificationType: type,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "Email notification has been sent successfully.",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (stage: string) => {
    switch (stage) {
      case "created": return "text-blue-600 bg-blue-50";
      case "in_review": return "text-yellow-600 bg-yellow-50";
      case "approved": return "text-green-600 bg-green-50";
      case "published": return "text-purple-600 bg-purple-50";
      case "archived": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const canManageDocument = (doc: any) => {
    return userRole === "admin" || userRole === "manager" || doc.assignedTo === doc.currentUserId;
  };

  const canSendNotifications = () => {
    return userRole === "admin" || userRole === "manager";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents in progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-construction-orange" />
            <span>Document Progress Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {documents.map((doc: any) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-charcoal">{doc.documentName}</h3>
                      <Badge className={`${getStatusColor(doc.workflowStage)} text-xs`}>
                        {doc.workflowStage?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(doc.priority)}`}></div>
                    </div>
                    <p className="text-sm text-steel-gray mb-3">{doc.siteName} • {doc.templateType}</p>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-steel-gray">Progress</span>
                        <span className="font-medium">{doc.completionPercentage || 0}%</span>
                      </div>
                      <Progress value={doc.completionPercentage || 0} className="h-2" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {canSendNotifications() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendNotificationMutation.mutate({ 
                          documentId: doc.id, 
                          type: "reminder" 
                        })}
                        disabled={sendNotificationMutation.isPending}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Notify
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDocument(selectedDocument === doc.id ? null : doc.id)}
                    >
                      {selectedDocument === doc.id ? "Hide" : "Details"}
                    </Button>
                  </div>
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-steel-gray" />
                    <span className="text-steel-gray">Assigned:</span>
                    <span className="font-medium">{doc.assignedToName || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-steel-gray" />
                    <span className="text-steel-gray">Due:</span>
                    <span className={`font-medium ${doc.isOverdue ? 'text-red-600' : ''}`}>
                      {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-steel-gray" />
                    <span className="text-steel-gray">Est. Time:</span>
                    <span className="font-medium">{doc.estimatedCompletionTime || "TBD"}h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-steel-gray" />
                    <span className="text-steel-gray">Notifications:</span>
                    <span className="font-medium">{doc.emailNotificationsSent || 0}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDocument === doc.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Timeline */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-charcoal">Recent Activity</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {workflowDetails?.timeline?.map((event: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className="w-2 h-2 bg-construction-orange rounded-full"></div>
                            <span className="text-steel-gray">{new Date(event.createdAt).toLocaleString()}</span>
                            <span className="text-charcoal">{event.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress Update (if user can manage) */}
                    {canManageDocument(doc) && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-charcoal">Update Progress</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-steel-gray mb-2">
                              Completion Percentage
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              defaultValue={doc.completionPercentage || 0}
                              className="w-full"
                              onChange={(e) => {
                                const progress = parseInt(e.target.value);
                                updateProgressMutation.mutate({
                                  documentId: doc.id,
                                  progress,
                                  notes,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-steel-gray mb-2">
                              Progress Notes
                            </label>
                            <div className="flex space-x-2">
                              <Textarea
                                placeholder="Add progress notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="flex-1"
                                rows={1}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  updateProgressMutation.mutate({
                                    documentId: doc.id,
                                    progress: doc.completionPercentage || 0,
                                    notes,
                                  });
                                  setNotes("");
                                }}
                                disabled={updateProgressMutation.isPending}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Current Notes */}
                    {doc.workflowNotes && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-charcoal">Current Notes</h4>
                        <div className="bg-gray-50 rounded p-3 text-sm text-charcoal">
                          {doc.workflowNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}