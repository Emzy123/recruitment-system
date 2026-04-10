"use client";

import type { NavItem } from "@/lib/nav/dashboard-nav";
import type { SidebarUser } from "./Sidebar/Sidebar";
import { Sidebar } from "./Sidebar/Sidebar";

type Props = {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  user: SidebarUser;
  onToggleCollapse: () => void;
};

export function MobileDrawer({ open, onClose, navItems, user, onToggleCollapse }: Props) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 z-50 h-full shadow-2xl md:hidden">
        <Sidebar
          variant="drawer"
          collapsed={false}
          onToggleCollapse={onToggleCollapse}
          navItems={navItems}
          user={user}
          onCloseDrawer={onClose}
          onNavigateDrawer={onClose}
        />
      </div>
    </>
  );
}
