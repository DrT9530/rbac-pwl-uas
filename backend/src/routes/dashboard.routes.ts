import { Elysia } from "elysia";
import { prisma } from "../lib/prisma";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .use(authMiddleware)
  // GET /dashboard/stats
  .get("/stats", async ({ userId, set }) => {
    try {
      const userIsAdmin = await isAdmin(userId);

      if (userIsAdmin) {
        // Admin stats: totals across the system
        const [totalUsers, totalCourses, totalAssignments, totalSubmissions] =
          await Promise.all([
            prisma.user.count(),
            prisma.course.count(),
            prisma.assignment.count(),
            prisma.submission.count(),
          ]);

        return {
          success: true,
          data: {
            role: "admin",
            totalUsers,
            totalCourses,
            totalAssignments,
            totalSubmissions,
          },
        };
      }

      // Regular user stats
      const [myCourses, myAssignments, mySubmissions] = await Promise.all([
        prisma.courseMember.count({ where: { userId } }),
        prisma.assignment.count({
          where: {
            course: {
              members: { some: { userId } },
            },
          },
        }),
        prisma.submission.count({ where: { studentId: userId } }),
      ]);

      return {
        success: true,
        data: {
          role: "user",
          myCourses,
          myAssignments,
          mySubmissions,
        },
      };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  });
