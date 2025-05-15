import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Alert,
  AlertDescription,
  AlertTitle 
} from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle, FileText, AlertTriangle, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import StatusTracker from "@/components/student/status-tracker";
import { useAuth } from "@/hooks/use-auth";

interface StudentProfile {
  id: number;
  userId: number;
  studentId: string;
  program: string;
  department: string;
  psaStatus: string;
  photoStatus: string;
  awardsStatus: string;
  overallStatus: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  sex?: string;
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

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function StudentStatus() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  // Fetch student profile
  const { 
    data: profile, 
    isLoading: profileLoading,
    isError: profileError
  } = useQuery<StudentProfile>({
    queryKey: ["/api/student/profile"],
    enabled: !!user
  });
  
  // Fetch documents
  const {
    data: documents,
    isLoading: documentsLoading
  } = useQuery<Document[]>({
    queryKey: ["/api/student/documents"],
    enabled: !!profile
  });
  
  // Fetch awards
  const {
    data: awards,
    isLoading: awardsLoading
  } = useQuery<Award[]>({
    queryKey: ["/api/student/awards"],
    enabled: !!profile
  });
  
  // Fetch notifications
  const {
    data: notifications,
    isLoading: notificationsLoading
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });
  
  // Format award type for display
  const formatAwardType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const isLoading = profileLoading || documentsLoading || awardsLoading || notificationsLoading;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (profileError || !profile) {
    return (
      <Layout>
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>
                We couldn't load your student profile. Please try again later or contact support.
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => navigate("/student/submission")}>
              Complete Your Profile
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold mb-6">Verification Status</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Student Profile Summary */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Student Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`} 
                      alt={user?.fullName} 
                    />
                    <AvatarFallback className="text-xl">
                      {user?.fullName.split(' ').map(name => name[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">{user?.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{profile.studentId}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span className="font-medium">{profile.program}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{profile.department}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate("/student/submission")}
                >
                  Update Information
                </Button>
              </CardFooter>
            </Card>
            
            {/* Status Tracker */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Verification Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTracker 
                  profile={profile} 
                  documents={documents || []} 
                  awards={awards || []} 
                />
                
                {/* Overall status */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h3 className="font-medium">Overall Status</h3>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        profile.overallStatus === "approved"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
                          : profile.overallStatus === "rejected"
                          ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                      }
                    >
                      {profile.overallStatus.charAt(0).toUpperCase() + profile.overallStatus.slice(1)}
                    </Badge>
                  </div>
                  
                  {profile.overallStatus === "approved" ? (
                    <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800 flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-green-800 dark:text-green-300">
                          Congratulations! Your graduation verification is complete.
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          You will receive further instructions about the graduation ceremony soon.
                        </p>
                      </div>
                    </div>
                  ) : profile.overallStatus === "rejected" ? (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-red-800 dark:text-red-300">
                          Some of your documents or awards have been rejected.
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                          Please check the feedback below and resubmit the required items.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800 flex items-start">
                      <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          Your verification is in progress.
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          Check back regularly for updates on your verification status.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Documents and Awards Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Documents Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Document Status</CardTitle>
              </CardHeader>
              <CardContent>
                {documents && documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {doc.documentType === "psa" ? "PSA Certificate" : "Graduation Photo"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {doc.fileName}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={doc.status} />
                        </div>
                        
                        {doc.feedback && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded">
                            <p className="font-medium">Feedback:</p>
                            <p className="text-muted-foreground">{doc.feedback}</p>
                          </div>
                        )}
                        
                        {doc.status === "rejected" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2 w-full"
                            onClick={() => navigate("/student/submission")}
                          >
                            Resubmit Document
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No documents submitted yet.</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/student/submission")}
                    >
                      Submit Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Awards Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Awards Status</CardTitle>
              </CardHeader>
              <CardContent>
                {awards && awards.length > 0 ? (
                  <div className="space-y-4">
                    {awards.map((award) => (
                      <div key={award.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{award.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatAwardType(award.type)}
                            </p>
                          </div>
                          <StatusBadge status={award.status} />
                        </div>
                        
                        {award.feedback && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded">
                            <p className="font-medium">Feedback:</p>
                            <p className="text-muted-foreground">{award.feedback}</p>
                          </div>
                        )}
                        
                        {award.status === "rejected" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2 w-full"
                            onClick={() => navigate("/student/submission")}
                          >
                            Resubmit Award
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No awards submitted yet.</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/student/submission")}
                    >
                      Add Awards
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 border rounded-md ${notification.isRead ? '' : 'bg-muted/50'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No notifications yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
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
