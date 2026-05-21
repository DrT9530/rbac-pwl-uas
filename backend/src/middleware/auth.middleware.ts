import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "../lib/prisma";

/**
 * Auth middleware plugin for Elysia.
 * Extracts Bearer token, verifies JWT, and attaches user data to context.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "lms-rbac-edlink-secret-key-2024",
    })
  )
  .derive({ as: "scoped" }, async ({ headers, jwt, set }): Promise<{
    userId: number;
    userEmail: string;
  }> => {
    const authorization = headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error("Authentication required");
    }

    const token = authorization.slice(7);

    try {
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        throw new Error("Invalid or expired token");
      }

      return {
        userId: Number(payload.sub),
        userEmail: payload.email as string,
      };
    } catch {
      set.status = 401;
      throw new Error("Invalid or expired token");
    }
  });

/**
 * Helper to check global roles inside route handlers.
 */
export async function getUserGlobalRoles(userId: number): Promise<string[]> {
  const userRoles = await prisma.userGlobalRole.findMany({
    where: { userId },
    include: { globalRole: true },
  });
  return userRoles.map((ur) => ur.globalRole.name);
}

/**
 * Check if user has any of the specified global roles.
 */
export async function hasGlobalRole(
  userId: number,
  requiredRoles: string[]
): Promise<boolean> {
  const userRoles = await getUserGlobalRoles(userId);
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Check if user is an admin (super_admin or campus_admin).
 */
export async function isAdmin(userId: number): Promise<boolean> {
  return hasGlobalRole(userId, ["super_admin", "campus_admin"]);
}
