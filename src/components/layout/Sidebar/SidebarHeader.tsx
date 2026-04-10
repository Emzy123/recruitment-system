"use client";

import Link from "next/link";
import { SidebarCollapseButton } from "./SidebarCollapseButton";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  showCollapse: boolean;
  onCloseDrawer?: () => void;
  showCloseDrawer?: boolean;
};

export function SidebarHeader({
  collapsed,
  onToggleCollapse,
  showCollapse,
  onCloseDrawer,
  showCloseDrawer,
}: Props) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-subtle px-2 py-3">
      {showCloseDrawer ? (
        <div className="flex items-center justify-between gap-2 px-1">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg outline-none ring-indigo-500/30 focus-visible:ring-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              FR
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-strong">Faculty Recruitment</div>
              <div className="truncate text-xs text-muted">Portal</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-subtle text-strong hover:bg-[var(--surface-subtle)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : collapsed ? (
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white outline-none ring-indigo-500/30 focus-visible:ring-4"
            aria-label="Home"
          >
            FR
          </Link>
          {showCollapse ? (
            <SidebarCollapseButton collapsed={collapsed} onClick={onToggleCollapse} aria-label="Expand sidebar" />
          ) : null}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-1">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg outline-none ring-indigo-500/30 focus-visible:ring-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              FR
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-strong">Faculty Recruitment</div>
              <div className="truncate text-xs text-muted">Portal</div>
            </div>
          </Link>
          {showCollapse ? (
            <SidebarCollapseButton collapsed={collapsed} onClick={onToggleCollapse} aria-label="Collapse sidebar" />
          ) : null}
        </div>
      )}
    </div>
  );
}
