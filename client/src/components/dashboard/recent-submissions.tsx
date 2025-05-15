import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface RecentSubmissionsProps {
  submissions: StudentSubmission[];
  isLoading: boolean;
}

export default function RecentSubmissions({ 
  submissions = [],
  isLoading = false 
}: RecentSubmissionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Recent Submissions</CardTitle>
        <Link href="/verifications">
          <Button variant="link" className="text-sm text-primary dark:text-primary-400">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>PSA Status</TableHead>
                <TableHead>Photo Status</TableHead>
                <TableHead>Awards</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                Array(3).fill(null).map((_, index) => (
                  <TableRow key={index}>
                    {Array(7).fill(null).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-5 bg-muted rounded animate-pulse w-20"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No recent submissions found
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${submission.fullName}`} 
                            alt={submission.fullName} 
                          />
                          <AvatarFallback>
                            {submission.fullName.split(' ').map(name => name[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{submission.fullName}</div>
                          <div className="text-xs text-muted-foreground">ID: {submission.studentId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{submission.program}</div>
                      <div className="text-xs text-muted-foreground">{submission.department}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={submission.psaStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={submission.photoStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={submission.awardsStatus} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(submission.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/verifications?student=${submission.id}`}>
                        <Button variant="link" size="sm" className="text-primary dark:text-primary-400">
                          Review
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
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
