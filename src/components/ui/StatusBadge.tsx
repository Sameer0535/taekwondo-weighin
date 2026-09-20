import React from "react";
import { CheckCircle2, Clock, XCircle, Hourglass } from "lucide-react";
import { Status } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: Status | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
  className,
}) => {
  const normalized = (status || "PENDING").toUpperCase() as Status;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-bold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-black gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  switch (normalized) {
    case "PASSED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600" />}
          <span>PASSED</span>
        </span>
      );

    case "HOLD":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <Clock size={iconSizes[size]} className="text-amber-600" />}
          <span>HOLD</span>
        </span>
      );

    case "REJECTED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-300 font-bold shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <XCircle size={iconSizes[size]} className="text-rose-600" />}
          <span>REJECTED</span>
        </span>
      );

    case "PENDING":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <Hourglass size={iconSizes[size]} className="text-slate-500" />}
          <span>PENDING</span>
        </span>
      );
  }
};
