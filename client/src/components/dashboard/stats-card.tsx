import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  viewAllLink?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  viewAllLink = "#",
  className
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-semibold">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {viewAllLink && (
        <CardFooter className="bg-muted p-3">
          <div className="text-sm w-full">
            <Link href={viewAllLink}>
              <a className="font-medium text-primary dark:text-primary-400 hover:text-primary/80 dark:hover:text-primary-400/80">
                View all
              </a>
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
