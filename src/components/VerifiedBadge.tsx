
import { UserCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const VerifiedBadge = ({
  size = "md",
  showTooltip = true,
  className = "",
}: VerifiedBadgeProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const badge = (
    <div className={`text-green-600 flex items-center ${className}`}>
      <UserCheck className={`${sizeClasses[size]} fill-green-100`} />
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">Verified User</p>
          <p className="text-xs text-gray-500">This user has been verified</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
