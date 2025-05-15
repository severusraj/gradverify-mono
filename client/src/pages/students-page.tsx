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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Filter, Eye, MailPlus } from "lucide-react";
import { useLocation } from "wouter";

// Student profile interface
interface StudentProfile {
  id: number;
  studentId: string;
  program: string;
  department: string;
  psaStatus: string;
  photoStatus: string;
  awardsStatus: string;
  overallStatus: string;
  dateOfBirth: string;
  placeOfBirth: string;
  sex: string;
  contactNumber?: string;
  userId: number;
  user: {
    fullName: string;
    email: string;
  }
}

export default function StudentsPage() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Fetch student profiles
  const { data: studentProfiles, isLoading } = useQuery<StudentProfile[]>({
    queryKey: ["/api/student/profiles", departmentFilter, statusFilter],
  });
  
  // Filter student profiles based on search and filters
  const filteredProfiles = studentProfiles ? studentProfiles.filter(profile => {
    const matchesSearch = 
      profile.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !departmentFilter || profile.department === departmentFilter;
    
    const matchesStatus = !statusFilter || profile.overallStatus === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  }) : [];
  
  // View student verification
  const viewStudent = (studentId: number) => {
    navigate(`/verifications?student=${studentId}`);
  };
  
  // Calculate verification progress
  const getVerificationProgress = (profile: StudentProfile): number => {
    let completedSteps = 0;
    let totalSteps = 3; // PSA, Photo, Awards
    
    if (profile.psaStatus === "approved") completedSteps++;
    if (profile.photoStatus === "approved") completedSteps++;
    if (profile.awardsStatus === "approved") completedSteps++;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold mb-6">Student Management</h1>
          
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter students by department, status, or search by name/ID/email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by name, ID, or email..."
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
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  View and manage student profiles and verification status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found matching your criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Verification Status</TableHead>
                          <TableHead>Progress</TableHead>
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
                              <div className="text-sm">{profile.user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {profile.contactNumber || "No phone provided"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={profile.overallStatus} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${getVerificationProgress(profile)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {getVerificationProgress(profile)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => viewStudent(profile.id)}
                                  title="View verification details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Send email notification"
                                >
                                  <MailPlus className="h-4 w-4" />
                                </Button>
                              </div>
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
