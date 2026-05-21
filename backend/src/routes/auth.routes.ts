import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { comparePassword } from "../utils/password";
import { authMiddleware, getUserGlobalRoles } from "../middleware/auth.middleware";

export const authRoutes = new Elysia({ prefix: "/auth" })
  // POST /auth/login
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const { email, password } = body;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            globalRoles: {
              include: { globalRole: true },
            },
            courseMemberships: {
              include: { course: true },
            },
          },
        });

        if (!user) {
          set.status = 401;
          return { success: false, message: "Invalid email or password" };
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          set.status = 401;
          return { success: false, message: "Invalid email or password" };
        }

        const token = await jwt.sign({
          sub: String(user.id),
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        });

        return {
          success: true,
          data: {
            token,
            user: {
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
          },
        };
      } catch (error) {
        set.status = 500;
        return { success: false, message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  // POST /auth/logout
  .post("/logout", () => {
    return { success: true, message: "Logged out successfully" };
  })
  // GET /auth/me — protected
  .use(authMiddleware)
  .get("/me", async ({ userId, set }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          globalRoles: {
            include: { globalRole: true },
          },
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
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  });
