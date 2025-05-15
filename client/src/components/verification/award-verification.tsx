import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, XCircle, FileText, MessageSquare, AlertCircle } from "lucide-react";

interface AwardData {
  id: number;
  name: string;
  type: string;
  description?: string;
  proofFileName?: string;
  proofFilePath?: string;
  status: string;
  feedback?: string;
}

interface AwardVerificationProps {
  awards: AwardData[];
  isLoading: boolean;
}

export default function AwardVerification({ awards, isLoading }: AwardVerificationProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  
  // Update award status mutation
  const updateAwardMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: number, status: string, feedback?: string }) => {
      const res = await apiRequest("PATCH", `/api/award/${id}`, { status, feedback });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Award status updated",
        description: "The award has been updated successfully"
      });
      
      // Clear feedback field
      setFeedback("");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-submissions"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update award status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Format award type for display
  const formatAwardType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Approve award
  const handleApprove = (id: number) => {
    updateAwardMutation.mutate({
      id,
      status: "approved",
      feedback: feedback.trim() || undefined
    });
  };
  
  // Reject award
  const handleReject = (id: number) => {
    updateAwardMutation.mutate({
      id,
      status: "rejected",
      feedback: feedback.trim() || "Award not validated. Please provide additional proof."
    });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="overflow-hidden border border-muted rounded-lg">
          <div className="h-10 bg-muted"></div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg border border-muted">
          <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="flex justify-end mt-3">
            <div className="h-9 bg-muted rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // No awards found
  if (awards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Awards Found</h3>
        <p className="text-muted-foreground max-w-md">
          The student has not submitted any academic awards or honors for verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Award Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {awards.map((award) => (
              <TableRow key={award.id}>
                <TableCell>
                  <div className="font-medium">{award.name}</div>
                  {award.description && (
                    <div className="text-xs text-muted-foreground">{award.description}</div>
                  )}
                </TableCell>
                <TableCell>{formatAwardType(award.type)}</TableCell>
                <TableCell>
                  {award.proofFileName ? (
                    <Button variant="ghost" size="sm" className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 p-0 h-auto">
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="text-xs">View Proof</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 p-0 h-auto">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Request Proof</span>
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={award.status} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleApprove(award.id)}
                      disabled={updateAwardMutation.isPending}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="sr-only">Approve</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleReject(award.id)}
                      disabled={updateAwardMutation.isPending}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="sr-only">Reject</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-muted/20 p-4 rounded-lg border border-border">
        <h3 className="text-sm font-medium mb-2">Add Comment or Request Additional Proof</h3>
        <div className="mt-1">
          <Textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback or request additional proof for the award..."
            className="resize-none"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button 
            disabled={!feedback.trim() || updateAwardMutation.isPending}
            onClick={() => {
              const pendingAward = awards.find(a => a.status === "pending");
              if (pendingAward) {
                handleReject(pendingAward.id);
              } else {
                toast({
                  title: "No pending awards",
                  description: "There are no pending awards to provide feedback for.",
                  variant: "destructive",
                });
              }
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Request
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">
          Rejected
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
          Pending
        </Badge>
      );
  }
}
