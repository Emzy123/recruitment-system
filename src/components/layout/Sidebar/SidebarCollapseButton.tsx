"use client";

type Props = {
  collapsed: boolean;
  onClick: () => void;
  className?: string;
  "aria-label"?: string;
};

export function SidebarCollapseButton({
  collapsed,
  onClick,
  className = "",
  "aria-label": ariaLabel = "Toggle sidebar",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-subtle bg-[var(--surface-subtle)] text-strong transition-colors hover:bg-[var(--surface)] ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {collapsed ? (
          <path d="M9 18l6-6-6-6" />
        ) : (
          <path d="M15 18l-6-6 6-6" />
        )}
      </svg>
    </button>
  );
}
