import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

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

interface StudentPanelProps {
  profile: StudentProfileData | null;
  isLoading: boolean;
}

export default function StudentPanel({ profile, isLoading }: StudentPanelProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 animate-pulse">
          <div className="flex items-center justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-muted"></div>
          </div>
          <div className="h-6 w-40 bg-muted mx-auto rounded mb-1"></div>
          <div className="h-4 w-24 bg-muted mx-auto rounded mb-6"></div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-4 w-16 bg-muted rounded"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-28 bg-muted rounded"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-4 w-28 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No student profile selected</p>
        </CardContent>
      </Card>
    );
  }

  function getStatusPercentage(status: string): number {
    switch (status) {
      case "approved": return 100;
      case "pending": return 50;
      case "rejected": return 25;
      default: return 0;
    }
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case "approved": return "text-green-600 dark:text-green-400";
      case "pending": return "text-yellow-600 dark:text-yellow-400";
      case "rejected": return "text-red-600 dark:text-red-400";
      default: return "text-muted-foreground";
    }
  }
  
  function getProgressColor(status: string): string {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      default: return "";
    }
  }

  // Create department acronym
  const departmentAcronym = profile.department
    .split(' ')
    .map(word => word[0])
    .join('');

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.user.fullName}`} 
              alt={profile.user.fullName} 
            />
            <AvatarFallback className="text-2xl">
              {profile.user.fullName.split(' ').map(name => name[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="text-lg font-medium text-center">{profile.user.fullName}</h3>
        <p className="text-sm text-center text-muted-foreground">ID: {profile.studentId}</p>
        
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Program</dt>
              <dd className="text-sm">{profile.program}</dd>
            </div>
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Department</dt>
              <dd className="text-sm">{departmentAcronym}</dd>
            </div>
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm">{profile.user.email}</dd>
            </div>
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="text-sm">{profile.contactNumber || "Not provided"}</dd>
            </div>
          </dl>
        </div>
        
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium mb-2">Verification Progress</h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">PSA Certificate</span>
                <span className={getStatusColor(profile.psaStatus)}>
                  {profile.psaStatus.charAt(0).toUpperCase() + profile.psaStatus.slice(1)}
                </span>
              </div>
              <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getProgressColor(profile.psaStatus)}`} 
                  style={{ width: `${getStatusPercentage(profile.psaStatus)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Photo</span>
                <span className={getStatusColor(profile.photoStatus)}>
                  {profile.photoStatus.charAt(0).toUpperCase() + profile.photoStatus.slice(1)}
                </span>
              </div>
              <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getProgressColor(profile.photoStatus)}`} 
                  style={{ width: `${getStatusPercentage(profile.photoStatus)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Awards</span>
                <span className={getStatusColor(profile.awardsStatus)}>
                  {profile.awardsStatus.charAt(0).toUpperCase() + profile.awardsStatus.slice(1)}
                </span>
              </div>
              <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getProgressColor(profile.awardsStatus)}`} 
                  style={{ width: `${getStatusPercentage(profile.awardsStatus)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
