import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import Layout from "@/components/layout/layout";
import DocumentVerification from "@/components/verification/document-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Filter } from "lucide-react";

// Mock interface for student profiles
interface StudentProfile {
  id: number;
  studentId: string;
  program: string;
  department: string;
  psaStatus: string;
  photoStatus: string;
  awardsStatus: string;
  updatedAt: string;
  userId: number;
  user: {
    fullName: string;
  }
}

export default function VerificationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  
  // Parse search params
  const search = useSearch();
  const params = new URLSearchParams(search);
  const studentParam = params.get("student");
  const statusParam = params.get("status");
  
  // Set initial filters from URL params
  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam);
    }
    if (studentParam) {
      const studentId = parseInt(studentParam);
      if (!isNaN(studentId)) {
        setSelectedStudentId(studentId);
      }
    }
  }, [statusParam, studentParam]);
  
  // Fetch student profiles
  const { data: studentProfiles, isLoading } = useQuery<StudentProfile[]>({
    queryKey: ["/api/student/profiles", departmentFilter, statusFilter],
  });
  
  // Filter student profiles based on search query and filters
  const filteredProfiles = studentProfiles ? studentProfiles.filter(profile => {
    const matchesSearch = 
      profile.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.program.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !departmentFilter || profile.department === departmentFilter;
    
    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter === "pending") {
        matchesStatus = profile.psaStatus === "pending" || 
                        profile.photoStatus === "pending" || 
                        profile.awardsStatus === "pending";
      } else if (statusFilter === "approved") {
        matchesStatus = profile.psaStatus === "approved" && 
                        profile.photoStatus === "approved" && 
                        profile.awardsStatus === "approved";
      } else if (statusFilter === "rejected") {
        matchesStatus = profile.psaStatus === "rejected" || 
                        profile.photoStatus === "rejected" || 
                        profile.awardsStatus === "rejected";
      }
    }
    
    return matchesSearch && matchesDepartment && matchesStatus;
  }) : [];

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Document Verification</h1>
            <Button variant="outline" onClick={() => setSelectedStudentId(null)}>
              {selectedStudentId ? "Back to List" : "Refresh"}
            </Button>
          </div>
          
          {selectedStudentId ? (
            // Show document verification interface for selected student
            <DocumentVerification studentId={selectedStudentId} />
          ) : (
            // Show student list
            <div className="space-y-6">
              {/* Filters and search */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>
                    Filter students by department, status, or search by name/ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search by name or student ID..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex-1 max-w-[200px]">
                      <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Departments</SelectItem>
                          <SelectItem value="CCS">CCS</SelectItem>
                          <SelectItem value="CBA">CBA</SelectItem>
                          <SelectItem value="COE">COE</SelectItem>
                          <SelectItem value="CAS">CAS</SelectItem>
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
              
              {/* Students list */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Student Submissions</CardTitle>
                  <CardDescription>
                    Review and verify student documents and awards
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredProfiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No student submissions found matching your criteria.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>PSA Status</TableHead>
                            <TableHead>Photo Status</TableHead>
                            <TableHead>Awards Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProfiles.map((profile) => (
                            <TableRow key={profile.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage 
                                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.user.fullName}`} 
                                      alt={profile.user.fullName} 
                                    />
                                    <AvatarFallback>
                                      {profile.user.fullName.split(' ').map(name => name[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{profile.user.fullName}</div>
                                    <div className="text-sm text-muted-foreground">{profile.studentId}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>{profile.program}</div>
                                <div className="text-sm text-muted-foreground">{profile.department}</div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={profile.psaStatus} />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={profile.photoStatus} />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={profile.awardsStatus} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedStudentId(profile.id)}
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
