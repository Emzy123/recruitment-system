import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? "10");

export async function hashPassword(password: string) {
  if (!password) throw new Error("Missing password");
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

