"use client";

import Link from "next/link";

type Props = {
  icon: string;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
};

export function SidebarNavItem({ icon, label, href, isActive, isCollapsed, onNavigate }: Props) {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      onClick={() => onNavigate?.()}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] font-semibold text-strong"
          : "font-medium text-muted hover:bg-[var(--surface-subtle)] hover:text-strong"
      } ${isCollapsed ? "justify-center" : ""}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-base" aria-hidden>
        {icon}
      </span>
      {!isCollapsed ? <span className="truncate">{label}</span> : null}
      {isCollapsed ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-[60] ml-2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            background: "var(--foreground)",
            color: "var(--background)",
          }}
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}
