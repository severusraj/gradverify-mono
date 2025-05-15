import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import StatsCard from "@/components/dashboard/stats-card";
import DepartmentProgress from "@/components/dashboard/department-progress";
import RecentSubmissions from "@/components/dashboard/recent-submissions";
import { LayoutDashboard, Clock, CheckCircle, XCircle, GraduationCap } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  pendingVerifications: number;
  approvedRecords: number;
  rejectedRecords: number;
}

interface DepartmentProgressItem {
  department: string;
  percentComplete: number;
  total: number;
  approved: number;
}

interface StudentSubmission {
  id: number;
  studentId: string;
  program: string;
  department: string;
  psaStatus: string;
  photoStatus: string;
  awardsStatus: string;
  updatedAt: string;
  userId: number;
  fullName: string;
}

export default function DashboardPage() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
  
  // Fetch department progress
  const { data: departmentProgress, isLoading: progressLoading } = useQuery<DepartmentProgressItem[]>({
    queryKey: ["/api/dashboard/department-progress"],
  });
  
  // Fetch recent submissions
  const { data: recentSubmissions, isLoading: submissionsLoading } = useQuery<StudentSubmission[]>({
    queryKey: ["/api/dashboard/recent-submissions"],
  });

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Students"
              value={statsLoading ? "Loading..." : stats?.totalStudents.toString() || "0"}
              icon={<GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
              iconBgColor="bg-primary-100 dark:bg-primary-900"
              iconColor="text-primary-600 dark:text-primary-400"
              viewAllLink="/students"
            />
            
            <StatsCard
              title="Pending Verifications"
              value={statsLoading ? "Loading..." : stats?.pendingVerifications.toString() || "0"}
              icon={<Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
              iconBgColor="bg-yellow-100 dark:bg-yellow-900"
              iconColor="text-yellow-600 dark:text-yellow-400"
              viewAllLink="/verifications?status=pending"
            />
            
            <StatsCard
              title="Approved Records"
              value={statsLoading ? "Loading..." : stats?.approvedRecords.toString() || "0"}
              icon={<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
              iconBgColor="bg-green-100 dark:bg-green-900"
              iconColor="text-green-600 dark:text-green-400"
              viewAllLink="/verifications?status=approved"
            />
            
            <StatsCard
              title="Rejected Records"
              value={statsLoading ? "Loading..." : stats?.rejectedRecords.toString() || "0"}
              icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
              iconBgColor="bg-red-100 dark:bg-red-900"
              iconColor="text-red-600 dark:text-red-400"
              viewAllLink="/verifications?status=rejected"
            />
          </div>
          
          {/* Progress by Department */}
          <div className="mb-8">
            <DepartmentProgress 
              data={departmentProgress || []} 
              isLoading={progressLoading} 
            />
          </div>
          
          {/* Recent Submissions */}
          <div>
            <RecentSubmissions 
              submissions={recentSubmissions || []} 
              isLoading={submissionsLoading} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
