import React from "react";
import { cn } from "@/lib/utils";

interface StepsProps {
  active: number;
  children: React.ReactNode;
  className?: string;
}

interface StepProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Steps({ active, children, className }: StepsProps) {
  // Count total steps
  const totalSteps = React.Children.count(children);
  
  // Create a new array of children with props
  const stepsWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        stepNumber: index + 1,
        isActive: index === active,
        isCompleted: index < active,
        isLast: index === totalSteps - 1,
      });
    }
    return child;
  });

  return (
    <div className={cn("flex flex-col md:flex-row", className)}>
      {stepsWithProps}
    </div>
  );
}

export interface ExtendedStepProps extends StepProps {
  stepNumber?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isLast?: boolean;
}

export function Step({ 
  title, 
  description, 
  icon, 
  stepNumber, 
  isActive, 
  isCompleted, 
  isLast 
}: ExtendedStepProps) {
  return (
    <div className={cn(
      "flex flex-1 flex-row md:flex-col items-start md:items-center text-center",
      isLast ? "" : "mb-4 md:mb-0"
    )}>
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 z-10",
          isActive ? "border-primary bg-primary text-primary-foreground" : 
          isCompleted ? "border-primary bg-primary text-primary-foreground" : 
          "border-muted-foreground bg-background text-muted-foreground"
        )}>
          {isCompleted ? (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            icon || <span>{stepNumber}</span>
          )}
        </div>
        {!isLast && (
          <div className={cn(
            "absolute top-0 mt-5 h-0.5 w-full md:left-0 md:mt-0 md:ml-5 md:h-full md:w-0.5",
            isCompleted ? "bg-primary" : "bg-muted-foreground/30"
          )} 
          style={{ 
            left: "50%", 
            width: "calc(100% - 1.25rem)" 
          }}></div>
        )}
      </div>
      <div className="ml-4 mt-1 md:mt-3 md:ml-0 md:w-full">
        <h3 className={cn(
          "text-sm font-medium",
          isActive ? "text-primary" : 
          isCompleted ? "text-primary" : 
          "text-muted-foreground"
        )}>
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
