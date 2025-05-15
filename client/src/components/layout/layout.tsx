import { useState, useEffect } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Don't show navbar and sidebar on auth page
  if (location === "/auth") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-1">
        {/* Sidebar for all users except students */}
        {user && user.role !== "student" && (
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        )}
        
        {/* Mobile Nav for students (instead of sidebar) */}
        {user && user.role === "student" && (
          <div className="lg:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
            <div className="grid grid-cols-2 h-16">
              <a
                href="/student/submission"
                className={`flex flex-col items-center justify-center ${
                  location === "/student/submission"
                    ? "text-primary dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <i className="fas fa-upload text-lg"></i>
                <span className="text-xs mt-1">Submit Documents</span>
              </a>
              <a
                href="/student/status"
                className={`flex flex-col items-center justify-center ${
                  location === "/student/status"
                    ? "text-primary dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <i className="fas fa-clipboard-check text-lg"></i>
                <span className="text-xs mt-1">Verification Status</span>
              </a>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className={`flex-1 pt-16 ${user && user.role !== "student" ? "lg:pl-64" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
