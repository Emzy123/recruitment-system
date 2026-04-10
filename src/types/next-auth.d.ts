import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "candidate" | "committee" | "assessor" | "admin";
      firstName?: string;
      lastName?: string;
      email?: string;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: "candidate" | "committee" | "assessor" | "admin";
    email?: string;
    firstName?: string;
    lastName?: string;
  }
}

