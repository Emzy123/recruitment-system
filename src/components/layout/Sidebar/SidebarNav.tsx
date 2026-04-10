"use client";

import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav/dashboard-nav";
import { isNavItemActive } from "@/lib/nav/dashboard-nav";
import { SidebarNavItem } from "./SidebarNavItem";

type Props = {
  items: NavItem[];
  isCollapsed: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ items, isCollapsed, onNavigate }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-3" aria-label="Dashboard">
      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={isNavItemActive(pathname, item.href)}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
