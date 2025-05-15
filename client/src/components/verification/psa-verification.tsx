import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, Check, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentData {
  id: number;
  documentType: string;
  fileName: string;
  filePath: string;
  status: string;
  feedback?: string;
}

interface StudentProfileData {
  id: number;
  studentId: string;
  program: string;
  department: string;
  dateOfBirth: string;
  placeOfBirth: string;
  sex: string;
  psaStatus: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface PsaVerificationProps {
  document?: DocumentData;
  studentProfile?: StudentProfileData;
  isLoading: boolean;
}

export default function PsaVerification({ 
  document, 
  studentProfile,
  isLoading 
}: PsaVerificationProps) {
  const { toast } = useToast();
  
  const updateDocumentStatusMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: number, status: string, feedback?: string }) => {
      const res = await apiRequest("PATCH", `/api/document/${id}`, { status, feedback });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document status updated",
        description: "The PSA document status has been updated successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/student/profile/${studentProfile?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/student/documents/${studentProfile?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update document status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="h-5 w-40 bg-muted rounded mb-3"></div>
            <div className="border border-muted rounded-lg p-4 bg-muted/50 space-y-4">
              <div className="mb-4 h-36 bg-muted border border-muted rounded flex items-center justify-center">
                <div className="h-10 w-10 bg-muted-foreground/20 rounded"></div>
              </div>
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
                  <div className="h-4 w-32 bg-muted-foreground/20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="h-5 w-48 bg-muted rounded mb-3"></div>
            <div className="border border-muted rounded-lg p-4 bg-muted/50 space-y-4">
              {Array(7).fill(null).map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
                  <div className="h-4 w-32 bg-muted-foreground/20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <div className="h-10 w-24 bg-muted rounded"></div>
          <div className="h-10 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!document || !studentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No PSA Document Found</h3>
        <p className="text-muted-foreground max-w-md">
          The student has not uploaded a PSA certificate yet. Please ask them to upload the required document.
        </p>
      </div>
    );
  }
  
  const handleApprove = () => {
    updateDocumentStatusMutation.mutate({
      id: document.id,
      status: "approved"
    });
  };
  
  const handleReject = () => {
    updateDocumentStatusMutation.mutate({
      id: document.id,
      status: "rejected",
      feedback: "Details don't match. Please upload a valid PSA certificate."
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-3">PSA Certificate Details</h3>
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            {/* PSA Document Preview */}
            <div className="mb-4 h-36 bg-background border border-border rounded flex items-center justify-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <dl className="divide-y divide-border text-sm">
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Full Name</dt>
                <dd>{studentProfile.user.fullName}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Date of Birth</dt>
                <dd>{studentProfile.dateOfBirth}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Place of Birth</dt>
                <dd>{studentProfile.placeOfBirth}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Sex</dt>
                <dd>{studentProfile.sex}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">File Name</dt>
                <dd className="truncate max-w-[180px]">{document.fileName}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-3">Student Submitted Details</h3>
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            <dl className="divide-y divide-border text-sm">
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Full Name</dt>
                <dd>{studentProfile.user.fullName}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Date of Birth</dt>
                <dd>{studentProfile.dateOfBirth}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Place of Birth</dt>
                <dd>{studentProfile.placeOfBirth}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Sex</dt>
                <dd>{studentProfile.sex}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Student ID</dt>
                <dd>{studentProfile.studentId}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Program</dt>
                <dd>{studentProfile.program}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="font-medium text-muted-foreground">Department</dt>
                <dd>{studentProfile.department}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={handleReject}
          disabled={updateDocumentStatusMutation.isPending}
        >
          <X className="mr-2 h-4 w-4 text-red-500" />
          Reject
        </Button>
        <Button 
          onClick={handleApprove}
          disabled={updateDocumentStatusMutation.isPending}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
    </div>
  );
}
