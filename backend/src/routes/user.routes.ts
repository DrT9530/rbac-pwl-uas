import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password";
import { authMiddleware, hasGlobalRole } from "../middleware/auth.middleware";
import { requireGlobalRole } from "../middleware/role.middleware";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authMiddleware)
  // GET /users — List all users (admin only)
  .get("/", async ({ userId, query, set }) => {
    try {
      await requireGlobalRole(userId, ["super_admin", "campus_admin", "it_support"]);

      const { search, page = "1", limit = "10" } = query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const where = search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          include: {
            globalRoles: {
              include: { globalRole: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        success: true,
        data: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
          globalRoles: u.globalRoles.map((ur) => ur.globalRole.name),
        })),
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    query: t.Object({
      search: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  // POST /users — Create new user (admin only)
  .post("/", async ({ userId, body, set }) => {
    try {
      await requireGlobalRole(userId, ["super_admin", "campus_admin"]);

      const { name, email, password, globalRole } = body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        set.status = 400;
        return { success: false, message: "Email already in use" };
      }

      const hashedPassword = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Assign global role if provided
      if (globalRole) {
        const role = await prisma.globalRole.findUnique({ where: { name: globalRole } });
        if (role) {
          await prisma.userGlobalRole.create({
            data: { userId: newUser.id, globalRoleId: role.id },
          });
        }
      }

      const userWithRoles = await prisma.user.findUnique({
        where: { id: newUser.id },
        include: {
          globalRoles: { include: { globalRole: true } },
        },
      });

      return {
        success: true,
        data: {
          id: userWithRoles!.id,
          name: userWithRoles!.name,
          email: userWithRoles!.email,
          createdAt: userWithRoles!.createdAt,
          globalRoles: userWithRoles!.globalRoles.map((ur) => ur.globalRole.name),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
      globalRole: t.Optional(t.String()),
    }),
  })
  // GET /users/:id — Get user detail (admin only)
  .get("/:id", async ({ userId, params, set }) => {
    try {
      await requireGlobalRole(userId, ["super_admin", "campus_admin", "it_support"]);

      const user = await prisma.user.findUnique({
        where: { id: parseInt(params.id) },
        include: {
          globalRoles: { include: { globalRole: true } },
          courseMemberships: {
            include: { course: true },
          },
        },
      });

      if (!user) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      return {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          globalRoles: user.globalRoles.map((ur) => ur.globalRole.name),
          courseMemberships: user.courseMemberships.map((cm) => ({
            courseId: cm.courseId,
            courseTitle: cm.course.title,
            role: cm.role,
          })),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })
  // PUT /users/:id — Update user (admin only)
  .put("/:id", async ({ userId, params, body, set }) => {
    try {
      await requireGlobalRole(userId, ["super_admin", "campus_admin"]);

      const targetId = parseInt(params.id);
      const { name, email, globalRole } = body;

      const existingUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (!existingUser) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      // Check email uniqueness if changed
      if (email && email !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email } });
        if (emailTaken) {
          set.status = 400;
          return { success: false, message: "Email already in use" };
        }
      }

      await prisma.user.update({
        where: { id: targetId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });

      // Update global role if provided
      if (globalRole !== undefined) {
        // Remove existing global roles
        await prisma.userGlobalRole.deleteMany({ where: { userId: targetId } });

        if (globalRole) {
          const role = await prisma.globalRole.findUnique({ where: { name: globalRole } });
          if (role) {
            await prisma.userGlobalRole.create({
              data: { userId: targetId, globalRoleId: role.id },
            });
          }
        }
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: targetId },
        include: {
          globalRoles: { include: { globalRole: true } },
        },
      });

      return {
        success: true,
        data: {
          id: updatedUser!.id,
          name: updatedUser!.name,
          email: updatedUser!.email,
          createdAt: updatedUser!.createdAt,
          globalRoles: updatedUser!.globalRoles.map((ur) => ur.globalRole.name),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
      globalRole: t.Optional(t.Union([t.String(), t.Null()])),
    }),
  })
  // DELETE /users/:id — Delete user (super_admin only)
  .delete("/:id", async ({ userId, params, set }) => {
    try {
      await requireGlobalRole(userId, ["super_admin"]);

      const targetId = parseInt(params.id);

      if (targetId === userId) {
        set.status = 400;
        return { success: false, message: "Cannot delete your own account" };
      }

      const existingUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (!existingUser) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      await prisma.user.delete({ where: { id: targetId } });

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })
  // PUT /users/:id/reset-password — Reset password (admin/it_support)
  .put("/:id/reset-password", async ({ userId, params, body, set }) => {
    try {
      await requireGlobalRole(userId, ["super_admin", "campus_admin", "it_support"]);

      const targetId = parseInt(params.id);

      const existingUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (!existingUser) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      const hashedPassword = await hashPassword(body.newPassword);

      await prisma.user.update({
        where: { id: targetId },
        data: { password: hashedPassword },
      });

      return { success: true, message: "Password reset successfully" };
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      newPassword: t.String(),
    }),
  });
