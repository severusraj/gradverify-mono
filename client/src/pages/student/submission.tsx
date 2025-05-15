import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Steps, Step } from "@/components/ui/steps";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import UploadForm from "@/components/student/upload-form";

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

export default function StudentSubmission() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch student profile
  const { 
    data: profile, 
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile
  } = useQuery<StudentProfile>({
    queryKey: ["/api/student/profile"],
    enabled: !!user
  });
  
  // Determine active step based on completed profile sections
  const getActiveStep = () => {
    if (!profile) return 0;
    
    if (!profile.studentId || !profile.program || !profile.department) {
      return 0; // Profile incomplete
    }
    
    if (profile.psaStatus !== "approved") {
      return 1; // PSA document pending or rejected
    }
    
    if (profile.photoStatus !== "approved") {
      return 2; // Photo pending or rejected
    }
    
    if (profile.awardsStatus !== "approved") {
      return 3; // Awards pending or rejected
    }
    
    return 4; // All steps completed
  };
  
  // Automatically switch to the right tab based on active step
  useEffect(() => {
    const activeStep = getActiveStep();
    
    if (activeStep === 0) {
      setActiveTab("profile");
    } else if (activeStep === 1) {
      setActiveTab("psa");
    } else if (activeStep === 2) {
      setActiveTab("photo");
    } else if (activeStep === 3) {
      setActiveTab("awards");
    }
  }, [profile]);

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold mb-6">Document Submission</h1>
          
          {/* Progress steps */}
          <div className="mb-8">
            <Steps active={getActiveStep()}>
              <Step title="Profile Info" />
              <Step title="PSA Certificate" />
              <Step title="Graduation Photo" />
              <Step title="Academic Awards" />
            </Steps>
          </div>
          
          {profileLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : profileError ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Profile</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't load your student profile. Please try again later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Documents</CardTitle>
                <CardDescription>
                  Complete each section to verify your graduation information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="psa">PSA Certificate</TabsTrigger>
                    <TabsTrigger value="photo">Photo</TabsTrigger>
                    <TabsTrigger value="awards">Awards</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile">
                    <UploadForm 
                      type="profile"
                      profile={profile}
                      onSuccess={refetchProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="psa">
                    <UploadForm 
                      type="psa"
                      profile={profile}
                      onSuccess={refetchProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="photo">
                    <UploadForm 
                      type="photo"
                      profile={profile}
                      onSuccess={refetchProfile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="awards">
                    <UploadForm 
                      type="awards"
                      profile={profile}
                      onSuccess={refetchProfile}
                    />
                  </TabsContent>
                </Tabs>
                
                {/* Show success message if all steps are complete */}
                {getActiveStep() === 4 && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-green-800 dark:text-green-300">
                          All documents submitted and approved!
                        </h3>
                        <p className="text-green-700 dark:text-green-400 text-sm">
                          Your graduation verification is complete. You'll receive further instructions for the ceremony.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
