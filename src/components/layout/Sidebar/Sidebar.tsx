"use client";

import type { NavItem } from "@/lib/nav/dashboard-nav";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";

export type SidebarUser = {
  displayName: string;
  email?: string;
  roleLabel: string;
  profileImageUrl?: string | null;
};

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  navItems: NavItem[];
  user: SidebarUser;
  variant: "desktop" | "drawer";
  onCloseDrawer?: () => void;
  onNavigateDrawer?: () => void;
};

export function Sidebar({
  collapsed,
  onToggleCollapse,
  navItems,
  user,
  variant,
  onCloseDrawer,
  onNavigateDrawer,
}: Props) {
  const isDrawer = variant === "drawer";
  const showCollapse = !isDrawer;
  const effectiveCollapsed = isDrawer ? false : collapsed;

  const widthClass = isDrawer ? "w-[min(80vw,280px)]" : effectiveCollapsed ? "w-16" : "w-[260px]";

  return (
    <aside
      className={`flex h-full flex-col bg-[var(--surface)] transition-[width] duration-300 ease-out ${widthClass}`}
    >
      <SidebarHeader
        collapsed={effectiveCollapsed}
        onToggleCollapse={onToggleCollapse}
        showCollapse={showCollapse}
        showCloseDrawer={isDrawer}
        onCloseDrawer={onCloseDrawer}
      />
      <SidebarNav
        items={navItems}
        isCollapsed={effectiveCollapsed}
        onNavigate={isDrawer ? onNavigateDrawer : undefined}
      />
      <SidebarFooter
        displayName={user.displayName}
        email={user.email}
        roleLabel={user.roleLabel}
        isCollapsed={effectiveCollapsed}
        profileImageUrl={user.profileImageUrl}
      />
    </aside>
  );
}
