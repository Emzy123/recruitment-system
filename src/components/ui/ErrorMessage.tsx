"use client";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = "" }: ErrorMessageProps) {
  return (
    <div className={`bg-danger-subtle border border-subtle rounded-xl p-4 text-sm text-danger ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="flex-1">
          <p className="font-medium">Error</p>
          <p className="mt-1 text-xs opacity-90">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
