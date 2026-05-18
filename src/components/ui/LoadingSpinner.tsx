"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-full h-full"
      >
        <path
          d="M21 12a9 9 0 11-6.219-8.56"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-25"
        />
        <path
          d="M21 12a9 9 0 01-9 9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-75"
        />
      </svg>
    </div>
  );
}
