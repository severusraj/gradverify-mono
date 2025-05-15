import { useState } from "react";
import Layout from "@/components/layout/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileText, Download, Printer, BarChart } from "lucide-react";
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DepartmentStats {
  department: string;
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("verification");
  const [department, setDepartment] = useState("all");
  const [timeRange, setTimeRange] = useState("current");
  
  // Fetch department stats
  const { data: departmentStats, isLoading } = useQuery<DepartmentStats[]>({
    queryKey: ["/api/reports/department-stats", department, timeRange],
  });
  
  // Generate PDF report (dummy function)
  const generatePDF = () => {
    alert("Generating PDF report... This would download a PDF in the real implementation");
  };
  
  // Export to CSV (dummy function)
  const exportCSV = () => {
    alert("Exporting to CSV... This would download a CSV file in the real implementation");
  };
  
  // Print report (dummy function)
  const printReport = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={printReport}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={generatePDF}>
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Report filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Report Filters</CardTitle>
                <CardDescription>
                  Customize the report by selecting filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Select
                      value={reportType}
                      onValueChange={setReportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verification">Verification Status</SelectItem>
                        <SelectItem value="awards">Awards Summary</SelectItem>
                        <SelectItem value="department">Department Statistics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={department}
                      onValueChange={setDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="CCS">College of Computer Studies</SelectItem>
                        <SelectItem value="CBA">College of Business Administration</SelectItem>
                        <SelectItem value="COE">College of Engineering</SelectItem>
                        <SelectItem value="CAS">College of Arts and Sciences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={timeRange}
                      onValueChange={setTimeRange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Time Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Academic Year</SelectItem>
                        <SelectItem value="previous">Previous Academic Year</SelectItem>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                        <SelectItem value="last90">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Report content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {reportType === "verification" && "Verification Status Report"}
                  {reportType === "awards" && "Awards Summary Report"}
                  {reportType === "department" && "Department Statistics Report"}
                </CardTitle>
                <CardDescription>
                  {department === "all" ? "All departments" : department} • 
                  {timeRange === "current" && " Current Academic Year"}
                  {timeRange === "previous" && " Previous Academic Year"}
                  {timeRange === "last30" && " Last 30 Days"}
                  {timeRange === "last90" && " Last 90 Days"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="chart">
                  <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6">
                    <TabsTrigger value="chart">
                      <BarChart className="h-4 w-4 mr-2" />
                      Chart
                    </TabsTrigger>
                    <TabsTrigger value="table">
                      <FileText className="h-4 w-4 mr-2" />
                      Table
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Chart View */}
                  <TabsContent value="chart">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : departmentStats && departmentStats.length > 0 ? (
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart
                            data={departmentStats}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="approved" fill="#10b981" name="Approved" />
                            <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                          </ReBarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No data available for the selected filters.
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Table View */}
                  <TabsContent value="table">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : departmentStats && departmentStats.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">Department</th>
                              <th className="text-right p-3">Total</th>
                              <th className="text-right p-3">Approved</th>
                              <th className="text-right p-3">Pending</th>
                              <th className="text-right p-3">Rejected</th>
                              <th className="text-right p-3">Completion %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {departmentStats.map((stat, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-3">{stat.department}</td>
                                <td className="text-right p-3">{stat.total}</td>
                                <td className="text-right p-3">{stat.approved}</td>
                                <td className="text-right p-3">{stat.pending}</td>
                                <td className="text-right p-3">{stat.rejected}</td>
                                <td className="text-right p-3">
                                  {Math.round((stat.approved / stat.total) * 100)}%
                                </td>
                              </tr>
                            ))}
                            <tr className="font-semibold bg-muted/50">
                              <td className="p-3">Total</td>
                              <td className="text-right p-3">
                                {departmentStats.reduce((sum, stat) => sum + stat.total, 0)}
                              </td>
                              <td className="text-right p-3">
                                {departmentStats.reduce((sum, stat) => sum + stat.approved, 0)}
                              </td>
                              <td className="text-right p-3">
                                {departmentStats.reduce((sum, stat) => sum + stat.pending, 0)}
                              </td>
                              <td className="text-right p-3">
                                {departmentStats.reduce((sum, stat) => sum + stat.rejected, 0)}
                              </td>
                              <td className="text-right p-3">
                                {Math.round(
                                  (departmentStats.reduce((sum, stat) => sum + stat.approved, 0) / 
                                   departmentStats.reduce((sum, stat) => sum + stat.total, 0)) * 100
                                )}%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No data available for the selected filters.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Report summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    This report provides an overview of the graduation verification process status
                    {department !== "all" ? ` for ${department}` : " across all departments"}
                    {timeRange === "current" && " during the current academic year"}.
                    {timeRange === "previous" && " during the previous academic year"}.
                    {timeRange === "last30" && " over the last 30 days"}.
                    {timeRange === "last90" && " over the last 90 days"}.
                  </p>
                  
                  {departmentStats && departmentStats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-muted-foreground text-sm">Total Students</p>
                            <p className="text-3xl font-bold">
                              {departmentStats.reduce((sum, stat) => sum + stat.total, 0)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-muted-foreground text-sm">Completion Rate</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {Math.round(
                                (departmentStats.reduce((sum, stat) => sum + stat.approved, 0) / 
                                 departmentStats.reduce((sum, stat) => sum + stat.total, 0)) * 100
                              )}%
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-muted-foreground text-sm">Pending Review</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                              {departmentStats.reduce((sum, stat) => sum + stat.pending, 0)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
