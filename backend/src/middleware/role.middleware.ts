import { prisma } from "../lib/prisma";

/**
 * Check if user has one of the required global roles.
 * Throws an error with 403 status if check fails.
 */
export async function requireGlobalRole(
  userId: number,
  requiredRoles: string[]
): Promise<void> {
  const userRoles = await prisma.userGlobalRole.findMany({
    where: { userId },
    include: { globalRole: true },
  });

  const roleNames = userRoles.map((ur) => ur.globalRole.name);
  const hasRole = requiredRoles.some((role) => roleNames.includes(role));

  if (!hasRole) {
    throw new Error("FORBIDDEN");
  }
}
