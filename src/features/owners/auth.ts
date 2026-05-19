import { getPrisma } from "@/lib/db/prisma";
import { canUseDemoData } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";
import type { OwnerSession } from "@/lib/auth/owner-session";

export async function authenticateOwner(email: string, password: string) {
  const prisma = getPrisma();

  if (prisma) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user?.passwordHash && user.status === "ACTIVE") {
      const ownerProfile = await prisma.owner.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (
        ownerProfile &&
        ownerProfile.isActive &&
        ownerProfile.status !== "SUSPENDED" &&
        ownerProfile.status !== "REJECTED"
      ) {
      const validPassword = await verifyPassword(password, user.passwordHash);

      if (validPassword) {
        const fullName = `${user.firstName} ${user.lastName}`.trim();

        const session: OwnerSession = {
          userId: user.id,
          ownerId: ownerProfile.id,
          email: user.email,
          fullName: fullName || ownerProfile.displayName,
          ownerStatus: ownerProfile.status,
          ownerType: ownerProfile.type,
          isOwner: true,
        };

        return session;
      }
      }
    }
  }

  if (canUseDemoData()) {
    return null;
  }

  return null;
}
