"use client";

type Status = "active" | "inactive" | "pending" | "completed" | "error" | "warning";

interface StatusBadgeProps {
  status: Status;
  children: React.ReactNode;
  className?: string;
}

const statusConfig = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200"
  },
  inactive: {
    bg: "bg-gray-50", 
    text: "text-gray-800",
    border: "border-gray-200"
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-800", 
    border: "border-amber-200"
  },
  completed: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200"
  },
  error: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200"
  },
  warning: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200"
  }
};

export function StatusBadge({ status, children, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`badge ${config.bg} ${config.text} ${config.border} ${className}`}>
      {children}
    </span>
  );
}
