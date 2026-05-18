import {
  canUseDemoData,
  env,
  isDatabaseConfigured,
} from "@/lib/env";
import { getPrisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import type { AdminSession } from "@/lib/auth/session";

export async function authenticateAdmin(email: string, password: string) {
  if (isDatabaseConfigured()) {
    const prisma = getPrisma();

    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          adminProfile: true,
          userRoles: { include: { role: true } },
        },
      });

      if (user?.adminProfile && user.passwordHash) {
        const validPassword = await verifyPassword(password, user.passwordHash);

        if (validPassword) {
          const fullName = `${user.firstName} ${user.lastName}`.trim();

          const session: AdminSession = {
            userId: user.id,
            email: user.email,
            fullName,
            roleKeys: user.userRoles.map((item) => item.role.key),
            isAdmin: true,
          };

          return session;
        }
      }
    }
  }

  if (
    canUseDemoData() &&
    email === (env.ADMIN_BOOTSTRAP_EMAIL || "admin@villawe.local") &&
    password === (env.ADMIN_BOOTSTRAP_PASSWORD || "ChangeMe123!")
  ) {
    return {
      userId: "dev-admin",
      email,
      fullName: "Villawe Admin",
      roleKeys: ["super_admin", "content_admin"],
      isAdmin: true as const,
    };
  }

  return null;
}
