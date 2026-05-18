"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";

type Props = {
  displayName: string;
  email?: string;
  roleLabel: string;
  isCollapsed: boolean;
  profileImageUrl?: string | null;
};

function initials(name: string, email?: string) {
  const n = name.trim();
  if (n.length >= 2) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = email?.trim();
  if (e && e.length >= 2) return e.slice(0, 2).toUpperCase();
  return "?";
}

export function SidebarFooter({
  displayName,
  email,
  roleLabel,
  isCollapsed,
  profileImageUrl,
}: Props) {
  const letter = initials(displayName, email);

  return (
    <div className="mt-auto shrink-0 border-t border-subtle px-2 py-3">
      <div
        className={`flex items-center gap-3 ${isCollapsed ? "flex-col justify-center" : ""}`}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--brand)_18%,transparent)] text-sm font-semibold text-strong"
          aria-hidden={profileImageUrl ? undefined : true}
        >
          {profileImageUrl ? (
            <Image src={profileImageUrl} alt="" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            letter
          )}
        </div>
        {!isCollapsed ? (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-strong">{displayName}</div>
            <div className="truncate text-xs capitalize text-muted">{roleLabel}</div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-subtle px-3 py-2 text-sm font-medium text-strong transition-colors hover:bg-[var(--surface-subtle)] ${
          isCollapsed ? "px-2" : ""
        }`}
        title={isCollapsed ? "Log out" : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>
        {!isCollapsed ? <span>Log out</span> : null}
      </button>
    </div>
  );
}
