import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/positions") ||
    pathname === "/about" ||
    pathname === "/how-it-works" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password")
  );
}

function requiredRoleForPath(
  pathname: string
): "candidate" | "committee" | "assessor" | "admin" | null {
  if (pathname.startsWith("/candidate/") || pathname === "/candidate") return "candidate";
  if (pathname.startsWith("/committee/") || pathname === "/committee") return "committee";
  if (pathname.startsWith("/assessor/") || pathname === "/assessor") return "assessor";
  if (pathname.startsWith("/admin/") || pathname === "/admin") return "admin";
  return null;
}

function roleDashboard(role?: string) {
  if (role === "admin") return "/admin";
  if (role === "committee") return "/committee";
  if (role === "assessor") return "/assessor";
  return "/candidate";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const requiredRole = requiredRoleForPath(pathname);
  if (!requiredRole) {
    // Route isn't protected by our RBAC rules yet.
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token.role !== requiredRole && token.role !== "admin") {
    return NextResponse.redirect(new URL(roleDashboard(token.role as string), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

