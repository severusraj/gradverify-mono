import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  GraduationCap, 
  FileText, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Define navigation items
  const navigationItems = [
    {
      title: "Admin Navigation",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          allowed: ["faculty", "admin", "superadmin"]
        },
        {
          name: "Verifications",
          href: "/verifications",
          icon: CheckSquare,
          allowed: ["faculty", "admin", "superadmin"]
        },
        {
          name: "Awards",
          href: "/awards",
          icon: Award,
          allowed: ["faculty", "admin", "superadmin"]
        },
        {
          name: "Students",
          href: "/students",
          icon: GraduationCap,
          allowed: ["faculty", "admin", "superadmin"]
        },
        {
          name: "Reports",
          href: "/reports",
          icon: FileText,
          allowed: ["admin", "superadmin"]
        }
      ]
    },
    {
      title: "Settings",
      items: [
        {
          name: "User Management",
          href: "/users",
          icon: Users,
          allowed: ["superadmin"]
        },
        {
          name: "System Settings",
          href: "/settings",
          icon: Settings,
          allowed: ["superadmin"]
        }
      ]
    }
  ];
  
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 flex-shrink-0 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16 transition-transform duration-200 lg:static lg:z-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <ScrollArea className="h-full px-3 py-4">
          <div className="space-y-6">
            {navigationItems.map((section, i) => {
              // Filter items based on user role
              const filteredItems = section.items.filter(item => 
                user && item.allowed.includes(user.role)
              );
              
              // Skip section if no items are allowed for this user
              if (filteredItems.length === 0) return null;
              
              return (
                <div key={i} className="space-y-2">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {filteredItems.map(item => (
                      <Link key={item.href} href={item.href}>
                        <a
                          className={cn(
                            "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                            location === item.href
                              ? "bg-primary/10 dark:bg-primary-900 text-primary dark:text-primary-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          )}
                        >
                          <item.icon className={cn(
                            "mr-3 h-5 w-5", 
                            location === item.href
                              ? "text-primary dark:text-primary-400"
                              : "text-gray-500 dark:text-gray-400"
                          )} />
                          {item.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => logoutMutation.mutate()}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
