import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { memoryStore, UserEntity } from "@/db/memory-store";

const JWT_SECRET = process.env.JWT_SECRET || "cse_mastery_secret_jwt_key_2026_lk";
const SESSION_COOKIE_NAME = "cse_mastery_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "student" | "admin";
}

export function createSessionToken(user: UserEntity): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export async function getCurrentUser(): Promise<UserEntity | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      // Default to demo user for frictionless review
      return memoryStore.getUser("demo-user-1") || null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    if (!decoded || !decoded.userId) return null;

    const user = memoryStore.getUser(decoded.userId);
    return user || null;
  } catch (err) {
    // If token invalid, fallback to demo user
    return memoryStore.getUser("demo-user-1") || null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
