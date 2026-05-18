import { redirect } from "next/navigation";

import { getOwnerSession } from "@/lib/auth/owner-session";

export async function requireOwnerSession() {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/ev-sahibi/giris" as never);
  }

  if (session.ownerStatus === "SUSPENDED" || session.ownerStatus === "REJECTED") {
    redirect("/ev-sahibi/giris?error=Hesabınız şu anda panele erişemiyor." as never);
  }

  return session;
}
