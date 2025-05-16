import React from 'react';
import { Route, Switch } from 'wouter';
import { SubmissionForm } from './components/SubmissionForm';
import { AdminDashboard } from './components/AdminDashboard';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/layout/theme-provider";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import VerificationPage from "@/pages/verification-page";
import AwardsPage from "@/pages/awards-page";
import StudentsPage from "@/pages/students-page";
import ReportsPage from "@/pages/reports-page";
import StudentSubmission from "@/pages/student/submission";
import StudentStatus from "@/pages/student/status";

const App: React.FC = () => {
  const handleSubmission = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('psa', data.psa[0]);
      formData.append('photo', data.photo[0]);
      formData.append('awards', JSON.stringify(data.awards));

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      alert('Submission successful!');
    } catch (error) {
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="gc-gradverify-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen bg-gray-50">
              <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center">
                        <h1 className="text-xl font-bold">GC GradVerify</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>

              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Switch>
                  <Route path="/">
                    <SubmissionForm onSubmit={handleSubmission} />
                  </Route>
                  <Route path="/admin">
                    <AdminDashboard />
                  </Route>
                  <Route path="/auth" component={AuthPage} />
                  <ProtectedRoute path="/" component={HomePage} />
                  <ProtectedRoute 
                    path="/dashboard" 
                    component={DashboardPage}
                    roles={["faculty", "admin", "superadmin"]} 
                  />
                  <ProtectedRoute 
                    path="/verifications" 
                    component={VerificationPage}
                    roles={["faculty", "admin", "superadmin"]} 
                  />
                  <ProtectedRoute 
                    path="/awards" 
                    component={AwardsPage}
                    roles={["faculty", "admin", "superadmin"]} 
                  />
                  <ProtectedRoute 
                    path="/students" 
                    component={StudentsPage}
                    roles={["faculty", "admin", "superadmin"]} 
                  />
                  <ProtectedRoute 
                    path="/reports" 
                    component={ReportsPage}
                    roles={["faculty", "admin", "superadmin"]} 
                  />
                  <ProtectedRoute 
                    path="/student/submission" 
                    component={StudentSubmission}
                    roles={["student"]} 
                  />
                  <ProtectedRoute 
                    path="/student/status" 
                    component={StudentStatus}
                    roles={["student"]} 
                  />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
