import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PsaVerification from "./psa-verification";
import PhotoVerification from "./photo-verification";
import AwardVerification from "./award-verification";
import StudentPanel from "./student-panel";
import { useQuery } from "@tanstack/react-query";

// Mock data structure for documents
interface DocumentData {
  id: number;
  documentType: string;
  fileName: string;
  filePath: string;
  status: string;
  feedback?: string;
}

// Mock data structure for awards
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

// Mock data structure for student profile
interface StudentProfileData {
  id: number;
  studentId: string;
  program: string;
  department: string;
  psaStatus: string;
  photoStatus: string;
  awardsStatus: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  contactNumber?: string;
}

interface DocumentVerificationProps {
  studentId: number;
}

export default function DocumentVerification({ studentId }: DocumentVerificationProps) {
  const [activeTab, setActiveTab] = useState("psa");
  
  // Fetch student profile data
  const { 
    data: studentProfile,
    isLoading: profileLoading
  } = useQuery<StudentProfileData>({
    queryKey: [`/api/student/profile/${studentId}`],
    enabled: !!studentId
  });
  
  // Fetch documents data
  const {
    data: documents,
    isLoading: documentsLoading
  } = useQuery<DocumentData[]>({
    queryKey: [`/api/student/documents/${studentId}`],
    enabled: !!studentId
  });
  
  // Fetch awards data
  const {
    data: awards,
    isLoading: awardsLoading
  } = useQuery<AwardData[]>({
    queryKey: [`/api/student/awards/${studentId}`],
    enabled: !!studentId
  });
  
  // Filter documents by type
  const psaDocument = documents?.find(doc => doc.documentType === "psa");
  const photoDocument = documents?.find(doc => doc.documentType === "photo");
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student Info Panel */}
      <div className="lg:col-span-1">
        <StudentPanel 
          profile={studentProfile || null} 
          isLoading={profileLoading} 
        />
      </div>
      
      {/* Document Verification Tabs */}
      <div className="lg:col-span-2">
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-muted p-0 border-b rounded-none border-b-border">
              <TabsTrigger 
                value="psa" 
                className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                PSA vs Student Details
              </TabsTrigger>
              <TabsTrigger 
                value="photo" 
                className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Photo Review
              </TabsTrigger>
              <TabsTrigger 
                value="awards" 
                className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Award Validation
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="p-6">
              <TabsContent value="psa" className="m-0">
                <PsaVerification 
                  document={psaDocument}
                  studentProfile={studentProfile} 
                  isLoading={documentsLoading || profileLoading}
                />
              </TabsContent>
              
              <TabsContent value="photo" className="m-0">
                <PhotoVerification 
                  document={photoDocument}
                  isLoading={documentsLoading}
                />
              </TabsContent>
              
              <TabsContent value="awards" className="m-0">
                <AwardVerification 
                  awards={awards || []}
                  isLoading={awardsLoading}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
