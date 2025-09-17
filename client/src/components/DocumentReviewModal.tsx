import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentReviewSystem } from "./DocumentReviewSystem";
import type { GeneratedDocument } from "@shared/schema";

interface DocumentReviewModalProps {
  document: GeneratedDocument | null;
  companyId: number;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentReviewModal({
  document,
  companyId,
  currentUserId,
  isOpen,
  onClose,
}: DocumentReviewModalProps) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Document Review & Collaboration</span>
          </DialogTitle>
          <DialogDescription>
            Collaborate on {document.documentName} with annotations, reviews, and approvals.
          </DialogDescription>
        </DialogHeader>
        
        <DocumentReviewSystem
          document={document}
          companyId={companyId}
          currentUserId={currentUserId}
        />
      </DialogContent>
    </Dialog>
  );
}