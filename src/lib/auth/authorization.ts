import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/session";

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdminRole(roleKeys: string[]) {
  const session = await requireAdminSession();

  const hasRole = roleKeys.some((roleKey) => session.roleKeys.includes(roleKey));

  if (!hasRole) {
    redirect("/admin");
  }

  return session;
}
