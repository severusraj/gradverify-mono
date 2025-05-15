import { Check, Clock, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StudentProfile {
  id: number;
  studentId: string;
  program: string;
  department: string;
  psaStatus: string;
  photoStatus: string;
  awardsStatus: string;
  overallStatus: string;
}

interface Document {
  id: number;
  documentType: string;
  fileName: string;
  status: string;
  feedback?: string;
  updatedAt: string;
}

interface Award {
  id: number;
  name: string;
  type: string;
  status: string;
  feedback?: string;
  updatedAt: string;
}

interface StatusTrackerProps {
  profile: StudentProfile;
  documents: Document[];
  awards: Award[];
}

export default function StatusTracker({ profile, documents, awards }: StatusTrackerProps) {
  // Calculate overall completion percentage
  const calculateProgress = (): number => {
    let totalSteps = 3; // Profile, PSA, Photo
    let completedSteps = 0;
    
    // Check if profile is complete
    if (profile.studentId && profile.program && profile.department) {
      completedSteps++;
    }
    
    // Check PSA status
    if (profile.psaStatus === "approved") {
      completedSteps++;
    }
    
    // Check photo status
    if (profile.photoStatus === "approved") {
      completedSteps++;
    }
    
    // If awards are submitted, add as an additional step
    if (awards.length > 0) {
      totalSteps++;
      
      // Check if all awards are approved
      const allAwardsApproved = awards.every(award => award.status === "approved");
      if (allAwardsApproved) {
        completedSteps++;
      }
    }
    
    return Math.round((completedSteps / totalSteps) * 100);
  };
  
  // Get PSA document
  const psaDocument = documents.find(doc => doc.documentType === "psa");
  
  // Get photo document
  const photoDocument = documents.find(doc => doc.documentType === "photo");
  
  // Format custom status label
  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Under Review";
      default:
        return "Not Submitted";
    }
  };
  
  // Get status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "approved":
        return <Check className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  // Get status badge
  const StatusBadge = ({ status }: { status: string }) => {
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
        return (
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
            Under Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Not Submitted
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span>{calculateProgress()}% Complete</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>
      
      {/* Status steps */}
      <div className="space-y-4">
        {/* Profile status */}
        <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border">
          <div className="flex items-center">
            <div className="mr-3">
              <StatusIcon status={profile.studentId && profile.program && profile.department ? "approved" : "pending"} />
            </div>
            <div>
              <h3 className="font-medium text-sm">Profile Information</h3>
              <p className="text-xs text-muted-foreground">
                Student details and academic information
              </p>
            </div>
          </div>
          <StatusBadge status={profile.studentId && profile.program && profile.department ? "approved" : "pending"} />
        </div>
        
        {/* PSA certificate status */}
        <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border">
          <div className="flex items-center">
            <div className="mr-3">
              <StatusIcon status={psaDocument?.status || "pending"} />
            </div>
            <div>
              <h3 className="font-medium text-sm">PSA Certificate</h3>
              <p className="text-xs text-muted-foreground">
                Birth certificate verification
              </p>
            </div>
          </div>
          <StatusBadge status={psaDocument?.status || "pending"} />
        </div>
        
        {/* Photo status */}
        <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border">
          <div className="flex items-center">
            <div className="mr-3">
              <StatusIcon status={photoDocument?.status || "pending"} />
            </div>
            <div>
              <h3 className="font-medium text-sm">Graduation Photo</h3>
              <p className="text-xs text-muted-foreground">
                Formal graduation portrait
              </p>
            </div>
          </div>
          <StatusBadge status={photoDocument?.status || "pending"} />
        </div>
        
        {/* Awards status (if any) */}
        {awards.length > 0 && (
          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border">
            <div className="flex items-center">
              <div className="mr-3">
                <StatusIcon status={profile.awardsStatus} />
              </div>
              <div>
                <h3 className="font-medium text-sm">Academic Awards</h3>
                <p className="text-xs text-muted-foreground">
                  {awards.length} award{awards.length !== 1 ? 's' : ''} submitted
                </p>
              </div>
            </div>
            <StatusBadge status={profile.awardsStatus} />
          </div>
        )}
      </div>
      
      {/* Feedback summary (if any rejected items) */}
      {(psaDocument?.status === "rejected" || photoDocument?.status === "rejected" || awards.some(award => award.status === "rejected")) && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="font-medium text-red-800 dark:text-red-300 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Action Required
          </h3>
          <div className="mt-2 space-y-2">
            {psaDocument?.status === "rejected" && (
              <p className="text-xs text-red-700 dark:text-red-400">
                <span className="font-medium">PSA Certificate:</span> {psaDocument.feedback || "Please resubmit your PSA certificate"}
              </p>
            )}
            
            {photoDocument?.status === "rejected" && (
              <p className="text-xs text-red-700 dark:text-red-400">
                <span className="font-medium">Graduation Photo:</span> {photoDocument.feedback || "Please resubmit your graduation photo"}
              </p>
            )}
            
            {awards.filter(award => award.status === "rejected").map((award, index) => (
              <p key={index} className="text-xs text-red-700 dark:text-red-400">
                <span className="font-medium">Award - {award.name}:</span> {award.feedback || "Please provide additional proof for this award"}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
