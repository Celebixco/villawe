import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { getSessionSecret } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

const SESSION_COOKIE_NAME = "villawe_owner_session";
const SESSION_ISSUER = "villawe-owner";
const SESSION_AUDIENCE = siteConfig.domain;

export type OwnerSession = {
  userId: string;
  ownerId: string;
  email: string;
  fullName: string;
  ownerStatus: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  ownerType: "INDIVIDUAL" | "COMPANY" | "AGENCY";
  isOwner: true;
};

function getSecretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createOwnerSession(session: OwnerSession) {
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

export async function destroyOwnerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getOwnerSession() {
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
    const payload = verified.payload as Partial<OwnerSession>;

    if (
      !payload.userId ||
      !payload.ownerId ||
      !payload.email ||
      !payload.fullName ||
      !payload.ownerStatus ||
      !payload.ownerType ||
      !payload.isOwner
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      ownerId: payload.ownerId,
      email: payload.email,
      fullName: payload.fullName,
      ownerStatus: payload.ownerStatus,
      ownerType: payload.ownerType,
      isOwner: true as const,
    };
  } catch {
    return null;
  }
}
