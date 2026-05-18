import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { getSessionSecret } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

const SESSION_COOKIE_NAME = "villawe_admin_session";
const SESSION_ISSUER = "villawe-admin";
const SESSION_AUDIENCE = siteConfig.domain;

export type AdminSession = {
  userId: string;
  email: string;
  fullName: string;
  roleKeys: string[];
  isAdmin: true;
};

function getSecretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createAdminSession(session: AdminSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSecretKey(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    const payload = verified.payload as Partial<AdminSession>;

    if (!payload.userId || !payload.email || !payload.fullName || !payload.isAdmin) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      roleKeys: payload.roleKeys || [],
      isAdmin: true as const,
    };
  } catch {
    return null;
  }
}
