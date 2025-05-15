import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DepartmentProgressItem {
  department: string;
  percentComplete: number;
  total: number;
  approved: number;
}

interface DepartmentProgressProps {
  data: DepartmentProgressItem[];
  isLoading?: boolean;
}

// A function to convert department code to a more readable name
function getDepartmentName(code: string): string {
  const departments: Record<string, string> = {
    "CCS": "College of Computer Studies",
    "CBA": "College of Business Administration",
    "COE": "College of Engineering",
    "CAS": "College of Arts and Sciences"
  };
  
  return departments[code] || code;
}

export default function DepartmentProgress({ 
  data = [], 
  isLoading = false 
}: DepartmentProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Verification Progress by Department
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isLoading ? (
            // Skeleton loading state
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-48 bg-muted rounded-full animate-pulse"></div>
                    <div className="h-4 w-16 bg-muted rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full"></div>
                </div>
              ))}
            </>
          ) : data.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No department data available
            </div>
          ) : (
            // Actual data
            data.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {getDepartmentName(item.department)}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {item.percentComplete}% Complete
                  </span>
                </div>
                <div className="mt-2">
                  <Progress value={item.percentComplete} className="h-2.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
