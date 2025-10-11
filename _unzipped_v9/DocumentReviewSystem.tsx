import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  User,
  FileText,
  Plus,
  Eye,
  Edit3
} from "lucide-react";
import type { DocumentAnnotation, DocumentReview, GeneratedDocument } from "@shared/schema";

interface DocumentReviewSystemProps {
  document: GeneratedDocument;
  companyId: number;
  currentUserId: string;
}

export function DocumentReviewSystem({ document, companyId, currentUserId }: DocumentReviewSystemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAnnotation, setNewAnnotation] = useState("");
  const [annotationType, setAnnotationType] = useState<string>("comment");
  const [sectionReference, setSectionReference] = useState("");
  const [priority, setPriority] = useState<string>("normal");

  // Fetch annotations for this document
  const { data: annotations = [] } = useQuery<(DocumentAnnotation & { user: any })[]>({
    queryKey: ["/api/documents", document.id, "annotations"],
  });

  // Fetch reviews for this document
  const { data: reviews = [] } = useQuery<(DocumentReview & { reviewer: any })[]>({
    queryKey: ["/api/documents", document.id, "reviews"],
  });

  // Create annotation mutation
  const createAnnotationMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      annotationType: string;
      sectionReference?: string;
      priority: string;
    }) => {
      await apiRequest("POST", `/api/documents/${document.id}/annotations`, {
        ...data,
        documentId: document.id,
        userId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/documents", document.id, "annotations"],
      });
      setNewAnnotation("");
      setSectionReference("");
      toast({
        title: "Annotation Added",
        description: "Your comment has been added to the document.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Annotation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: {
      reviewType: string;
      status: string;
      comments: string;
    }) => {
      await apiRequest("POST", `/api/documents/${document.id}/reviews`, {
        ...data,
        documentId: document.id,
        reviewerId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/documents", document.id, "reviews"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/companies", companyId, "documents"],
      });
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Submit Review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim()) return;
    
    createAnnotationMutation.mutate({
      content: newAnnotation,
      annotationType,
      sectionReference: sectionReference || undefined,
      priority,
    });
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case "approval": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejection": return <XCircle className="h-4 w-4 text-red-600" />;
      case "suggestion": return <Edit3 className="h-4 w-4 text-blue-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "changes_requested": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-construction-orange" />
              <div>
                <CardTitle className="text-lg">{document.documentName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review Status: <Badge className={getReviewStatusColor(document.reviewStatus || "pending")}>
                    {document.reviewStatus || "pending"}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="annotations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="annotations">Annotations ({annotations.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="annotations" className="space-y-4">
          {/* Add New Annotation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Annotation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={annotationType} onValueChange={setAnnotationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Annotation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="approval">Approval</SelectItem>
                    <SelectItem value="rejection">Rejection</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="normal">Normal Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <input
                  type="text"
                  placeholder="Section reference (optional)"
                  value={sectionReference}
                  onChange={(e) => setSectionReference(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-construction-orange"
                />
              </div>

              <Textarea
                placeholder="Add your annotation, suggestion, or feedback..."
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                className="min-h-[100px]"
              />

              <Button 
                onClick={handleAddAnnotation}
                disabled={!newAnnotation.trim() || createAnnotationMutation.isPending}
                className="w-full"
              >
                {createAnnotationMutation.isPending ? "Adding..." : "Add Annotation"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Annotations */}
          <div className="space-y-3">
            {annotations.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-muted-foreground">No annotations yet. Be the first to add feedback!</p>
              </Card>
            ) : (
              annotations.map((annotation) => (
                <Card key={annotation.id} className="border-l-4 border-l-construction-orange">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getAnnotationIcon(annotation.annotationType)}
                        <span className="font-medium text-sm">
                          {annotation.user?.firstName} {annotation.user?.lastName}
                        </span>
                        <Badge className={getPriorityColor(annotation.priority || "normal")}>
                          {annotation.priority}
                        </Badge>
                        {annotation.sectionReference && (
                          <Badge variant="outline">{annotation.sectionReference}</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(annotation.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {annotation.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {/* Submit Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Submit Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm 
                documentId={document.id}
                onSubmit={(data) => submitReviewMutation.mutate(data)}
                isLoading={submitReviewMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Existing Reviews */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <Card className="p-8 text-center">
                <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-muted-foreground">No reviews submitted yet.</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {review.reviewer?.firstName} {review.reviewer?.lastName}
                        </span>
                        <Badge className={getReviewStatusColor(review.status)}>
                          {review.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{review.reviewType}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {review.completedAt ? new Date(review.completedAt).toLocaleDateString('en-GB') : 'In Progress'}
                      </span>
                    </div>
                    {review.comments && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {review.comments}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewForm({ 
  documentId, 
  onSubmit, 
  isLoading 
}: { 
  documentId: number; 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [reviewType, setReviewType] = useState("technical");
  const [status, setStatus] = useState("approved");
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    onSubmit({
      reviewType,
      status,
      comments: comments.trim() || undefined,
    });
    setComments("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={reviewType} onValueChange={setReviewType}>
          <SelectTrigger>
            <SelectValue placeholder="Review type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical Review</SelectItem>
            <SelectItem value="compliance">Compliance Review</SelectItem>
            <SelectItem value="quality">Quality Review</SelectItem>
            <SelectItem value="final">Final Approval</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Review status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="changes_requested">Changes Requested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        placeholder="Add review comments (optional)..."
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="min-h-[80px]"
      />

      <Button 
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}