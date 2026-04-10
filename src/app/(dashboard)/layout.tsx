import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { navItemsForRole, normalizeRole } from "@/lib/nav/dashboard-nav";

function displayNameFromToken(token: {
  firstName?: string;
  lastName?: string;
  email?: string;
} | null) {
  if (!token) return "User";
  const fn = token.firstName?.trim();
  const ln = token.lastName?.trim();
  if (fn || ln) return [fn, ln].filter(Boolean).join(" ");
  if (token.email) return token.email;
  return "User";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const token = session?.user as any;

  const role = normalizeRole(token?.role);
  const navItems = navItemsForRole(role);

  const user = {
    displayName: displayNameFromToken(token),
    email: typeof token?.email === "string" ? token.email : undefined,
    roleLabel: role,
    profileImageUrl: null as string | null,
  };

  return (
    <DashboardShell navItems={navItems} user={user}>
      {children}
    </DashboardShell>
  );
}
