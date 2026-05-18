import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { verifyPassword } from "@/lib/utils/bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { encode } from "next-auth/jwt";

import { authRateLimit } from "@/lib/rate-limit";

function getIpFromReq(req: any) {
  return (
    req?.headers?.["x-forwarded-for"] ??
    req?.headers?.["x-real-ip"] ??
    req?.ip ??
    "unknown"
  );
}

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  throw new Error("Missing environment variable NEXTAUTH_SECRET");
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
          role: "candidate",
        };
      },
    }),
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

        // Apply distributed rate limit
        const { success } = await authRateLimit.limit(`login:${email}:${ip}`);
        if (!success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectToMongo();
        const email = user.email?.toLowerCase().trim();
        if (!email) return false;
        
        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          dbUser = await User.create({
            email,
            firstName: (user as any).firstName || (profile as any)?.given_name || "Google",
            lastName: (user as any).lastName || (profile as any)?.family_name || "User",
            role: "candidate",
            isActive: true,
            emailVerified: true,
          });
        }
        
        // Map DB fields to the user object so jwt callback gets them
        user.id = dbUser._id.toString();
        (user as any).role = dbUser.role;
        (user as any).firstName = dbUser.firstName;
        (user as any).lastName = dbUser.lastName;
      }
      return true;
    },
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

