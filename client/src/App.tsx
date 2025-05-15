import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="gc-gradverify-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
