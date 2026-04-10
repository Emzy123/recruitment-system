import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { verifyPassword } from "@/lib/utils/bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { encode } from "next-auth/jwt";

// Very small in-memory rate limiter for login attempts.
// Note: in production, replace with Redis or a proper rate-limit store.
type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();

function getIpFromReq(req: any) {
  return (
    req?.headers?.["x-forwarded-for"] ??
    req?.headers?.["x-real-ip"] ??
    req?.ip ??
    "unknown"
  );
}

function assertRateLimit(params: { key: string; windowMs: number; max: number }) {
  const { key, windowMs, max } = params;
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= max) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  attempts.set(key, { ...current, count: current.count + 1 });
}

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  throw new Error("Missing environment variable NEXTAUTH_SECRET");
}

// Spec says 5 attempts per minute for login; we enforce a narrow limit even if
// global rate limiting env vars are broader.
const loginSpecWindowMs = 60_000;
const loginSpecMax = 5;

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        const ip = getIpFromReq(req);

        if (!email || !password) return null;

        // Apply spec rate limit (5/min).
        assertRateLimit({
          key: `${email}:${ip}`,
          windowMs: loginSpecWindowMs,
          max: loginSpecMax,
        });

        await connectToMongo();

        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !user.isActive) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        // NextAuth will call jwt/session callbacks with this "user" object.
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id?: string;
          role?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
        };
        token.uid = u.id;
        token.role = u.role as typeof token.role;
        token.email = u.email;
        token.firstName = u.firstName;
        token.lastName = u.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid as string | undefined;
        (session.user as any).role = token.role as string | undefined;
        (session.user as any).email = token.email as string | undefined;
        (session.user as any).firstName = token.firstName as string | undefined;
        (session.user as any).lastName = token.lastName as string | undefined;
      }
      return session;
    },
  },
};

// Helper used by API routes to return a JWT-like token without calling NextAuth internals.
export async function issueAuthToken(params: {
  uid: string;
  role: "candidate" | "committee" | "assessor" | "admin";
  email: string;
}) {
  const { uid, role, email } = params;
  return encode({
    secret: nextAuthSecret!,
    token: { uid, role, email },
    maxAge: 60 * 60 * 24 * 7,
  });
}

