import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Redirect based on user role
    if (user) {
      if (user.role === "student") {
        navigate("/student/submission");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to GC GradVerify
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A modern platform for graduation verification, award tracking, and document validation
            </p>
            
            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user && user.role === "student" ? (
                <>
                  <Button size="lg" onClick={() => navigate("/student/submission")}>
                    Submit Documents
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/student/status")}>
                    Check Status
                  </Button>
                </>
              ) : user && (user.role === "faculty" || user.role === "admin" || user.role === "superadmin") ? (
                <>
                  <Button size="lg" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/verifications")}>
                    Review Submissions
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/auth")}>
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900 w-12 h-12 flex items-center justify-center mb-4">
                <i className="fas fa-file-alt text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Verification</h3>
              <p className="text-muted-foreground">
                Secure verification of PSA certificates and graduation photos with side-by-side comparison views.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900 w-12 h-12 flex items-center justify-center mb-4">
                <i className="fas fa-award text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Award Tracking</h3>
              <p className="text-muted-foreground">
                Comprehensive system for managing and validating student awards, honors, and recognitions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900 w-12 h-12 flex items-center justify-center mb-4">
                <i className="fas fa-chart-line text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Detailed dashboards with department-wise progress charts and verification statistics.
              </p>
            </div>
          </div>
          
          {/* Graduation showcase */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 flex items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Celebrate Academic Achievement</h2>
                  <p className="text-muted-foreground mb-6">
                    Our platform helps educational institutions streamline the graduation verification process,
                    ensuring that every student's accomplishments are properly recognized and validated.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>Organized workflow for faculty and administrators</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>Seamless student experience for document submission</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>Secure storage and validation of important credentials</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 h-96 flex items-center justify-center">
                <div className="text-center p-6">
                  <i className="fas fa-user-graduate text-6xl mb-4 text-primary-600 dark:text-primary-400"></i>
                  <p className="text-muted-foreground">
                    Graduation ceremony image would appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
