"use client";

import { useCallback, useEffect, useState } from "react";
import type { NavItem } from "@/lib/nav/dashboard-nav";
import type { SidebarUser } from "./Sidebar/Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { Sidebar } from "./Sidebar/Sidebar";

const STORAGE_KEY = "recruitment-dashboard-sidebar-collapsed";

function useMediaQueryMdUp() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const fn = () => setMatches(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return matches;
}

type Props = {
  children: React.ReactNode;
  navItems: NavItem[];
  user: SidebarUser;
};

export function DashboardShell({ children, navItems, user }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQueryMdUp();

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "true") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const sidebarPx = collapsed ? 64 : 260;
  const mainPaddingLeft = isDesktop ? sidebarPx : 0;

  return (
    <div className="min-h-screen surface-page">
      <div
        className="fixed left-0 top-0 z-40 hidden h-screen border-r border-subtle md:block"
        style={{ width: sidebarPx }}
      >
        <Sidebar
          variant="desktop"
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          navItems={navItems}
          user={user}
        />
      </div>

      <MobileDrawer
        open={mobileOpen}
        onClose={closeMobile}
        navItems={navItems}
        user={user}
        onToggleCollapse={toggleCollapsed}
      />

      <div
        className="min-h-screen transition-[padding-left] duration-300 ease-out"
        style={{ paddingLeft: mainPaddingLeft }}
      >
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-subtle bg-[var(--surface-glass)] px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-subtle bg-[var(--surface)] text-strong"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-strong">Menu</span>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
