export type DashboardRole = "candidate" | "committee" | "assessor" | "admin";

export type NavItem = {
  icon: string;
  label: string;
  href: string;
};

export function normalizeRole(role: unknown): DashboardRole {
  const value = typeof role === "string" ? role.toLowerCase() : "candidate";
  if (value === "admin" || value === "committee" || value === "assessor") return value;
  return "candidate";
}

export function navItemsForRole(role: DashboardRole): NavItem[] {
  switch (role) {
    case "admin":
      return [
        { icon: "📊", label: "Overview", href: "/admin" },
        { icon: "📝", label: "Applications", href: "/admin/applications" },
        { icon: "💻", label: "Assessments", href: "/admin/assessments" },
        { icon: "🏢", label: "Positions", href: "/admin/positions" },
        { icon: "👥", label: "Users", href: "/admin/users" },
        { icon: "🔒", label: "Audit Logs", href: "/admin/audit-logs" },
        { icon: "📈", label: "Analytics", href: "/admin/analytics" },
        { icon: "⚙️", label: "Settings", href: "/admin/settings" },
      ];
    case "committee":
      return [
        { icon: "📊", label: "Overview", href: "/committee" },
        { icon: "📝", label: "Applications", href: "/committee/applications" },
        { icon: "🔎", label: "Reviews", href: "/committee/reviews" },
        { icon: "📈", label: "Analytics", href: "/committee/analytics" },
        { icon: "🫂", label: "Team", href: "/committee/team" },
      ];
    case "assessor":
      return [
        { icon: "📊", label: "Overview", href: "/assessor" },
        { icon: "⌛", label: "Pending Reviews", href: "/assessor/pending" },
        { icon: "💻", label: "Assessments", href: "/assessor/assessments" },
        { icon: "❓", label: "Questions", href: "/assessor/questions" },
        { icon: "📈", label: "Analytics", href: "/assessor/analytics" },
        { icon: "⚙️", label: "Settings", href: "/assessor/settings" },
      ];
    default:
      return [
        { icon: "📊", label: "Overview", href: "/candidate" },
        { icon: "📝", label: "My Applications", href: "/candidate/applications" },
        { icon: "💻", label: "Assessments", href: "/candidate/assessments" },
        { icon: "👤", label: "Profile", href: "/candidate/profile" },
        { icon: "⚙️", label: "Settings", href: "/candidate/settings" },
      ];
  }
}

/** Dashboard home paths — active only on exact match (not nested). */
const DASHBOARD_ROOTS = [
  "/candidate",
  "/committee",
  "/assessor",
  "/admin",
] as const;

export function isNavItemActive(pathname: string, href: string): boolean {
  const path = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  if ((DASHBOARD_ROOTS as readonly string[]).includes(href)) {
    return path === href;
  }
  return path === href || path.startsWith(`${href}/`);
}
