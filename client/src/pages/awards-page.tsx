import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Search, Filter, Check, X, MessageSquare } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Award interface
interface Award {
  id: number;
  name: string;
  type: string;
  description?: string;
  proofFileName?: string;
  proofFilePath?: string;
  status: string;
  feedback?: string;
  studentId: number;
  student: {
    id: number;
    studentId: string;
    program: string;
    department: string;
    user: {
      fullName: string;
    }
  }
}

export default function AwardsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  // Fetch awards
  const { data: awards, isLoading } = useQuery<Award[]>({
    queryKey: ["/api/awards", typeFilter, statusFilter],
  });
  
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
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/awards"] });
      setIsReviewOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update award",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Filter awards based on search query and filters
  const filteredAwards = awards ? awards.filter(award => {
    const matchesSearch = 
      award.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.student?.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.student?.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || award.type === typeFilter;
    const matchesStatus = !statusFilter || award.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }) : [];
  
  // Handle award review
  const openReview = (award: Award) => {
    setSelectedAward(award);
    setFeedbackText(award.feedback || "");
    setIsReviewOpen(true);
  };
  
  // Handle approve award
  const handleApprove = () => {
    if (selectedAward) {
      updateAwardMutation.mutate({
        id: selectedAward.id,
        status: "approved",
        feedback: feedbackText
      });
    }
  };
  
  // Handle reject award
  const handleReject = () => {
    if (selectedAward) {
      updateAwardMutation.mutate({
        id: selectedAward.id,
        status: "rejected",
        feedback: feedbackText
      });
    }
  };
  
  // Format award type for display
  const formatAwardType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold mb-6">Award Verification</h1>
          
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter awards by type, status, or search by name/student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by award name or student..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 max-w-[200px]">
                    <Select
                      value={typeFilter}
                      onValueChange={setTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Award Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="latin_honor">Latin Honor</SelectItem>
                        <SelectItem value="academic_achievement">Academic Achievement</SelectItem>
                        <SelectItem value="department_award">Department Award</SelectItem>
                        <SelectItem value="special_recognition">Special Recognition</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 max-w-[200px]">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Awards list */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Award Submissions</CardTitle>
                <CardDescription>
                  Review and verify student award claims
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredAwards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No award submissions found matching your criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Award Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Proof</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAwards.map((award) => (
                          <TableRow key={award.id}>
                            <TableCell>
                              <div className="font-medium">{award.name}</div>
                              {award.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {award.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{formatAwardType(award.type)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{award.student?.user.fullName}</div>
                              <div className="text-sm text-muted-foreground">{award.student?.studentId}</div>
                            </TableCell>
                            <TableCell>
                              <div>{award.student?.program}</div>
                              <div className="text-sm text-muted-foreground">{award.student?.department}</div>
                            </TableCell>
                            <TableCell>
                              {award.proofFileName ? (
                                <a href="#" className="flex items-center text-primary hover:underline">
                                  <FileText className="mr-1 h-4 w-4" />
                                  <span className="text-sm">View Proof</span>
                                </a>
                              ) : (
                                <span className="text-sm text-muted-foreground">No proof uploaded</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={award.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReview(award)}
                              >
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Award review dialog */}
          {selectedAward && (
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Review Award</DialogTitle>
                  <DialogDescription>
                    Verify the award details and update its status
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium">Award Name:</div>
                    <div className="col-span-3">{selectedAward.name}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium">Type:</div>
                    <div className="col-span-3">{formatAwardType(selectedAward.type)}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium">Student:</div>
                    <div className="col-span-3">{selectedAward.student?.user.fullName}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium">Student ID:</div>
                    <div className="col-span-3">{selectedAward.student?.studentId}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-sm font-medium">Program:</div>
                    <div className="col-span-3">{selectedAward.student?.program} ({selectedAward.student?.department})</div>
                  </div>
                  
                  {selectedAward.description && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-sm font-medium">Description:</div>
                      <div className="col-span-3">{selectedAward.description}</div>
                    </div>
                  )}
                  
                  {selectedAward.proofFileName && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-sm font-medium">Proof:</div>
                      <div className="col-span-3">
                        <a href="#" className="flex items-center text-primary hover:underline">
                          <FileText className="mr-1 h-4 w-4" />
                          <span>View {selectedAward.proofFileName}</span>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label htmlFor="feedback" className="text-sm font-medium">
                      Feedback / Comments
                    </label>
                    <Textarea
                      id="feedback"
                      placeholder="Enter feedback or comments about this award"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter className="flex justify-between">
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={updateAwardMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    disabled={updateAwardMutation.isPending}
                  >
                    {updateAwardMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Layout>
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
