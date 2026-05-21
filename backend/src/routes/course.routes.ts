import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authMiddleware, isAdmin, hasGlobalRole } from "../middleware/auth.middleware";
import { requireCourseMember, requireCourseAccess } from "../middleware/course.middleware";

export const courseRoutes = new Elysia({ prefix: "/courses" })
  .use(authMiddleware)
  // GET /courses — List courses
  .get("/", async ({ userId, query, set }) => {
    try {
      const userIsAdmin = await isAdmin(userId);
      const { search, page = "1", limit = "10" } = query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      let where: Record<string, unknown> = {};

      if (search) {
        where.title = { contains: search };
      }

      // Non-admin users only see their enrolled courses
      if (!userIsAdmin) {
        where.members = { some: { userId } };
      }

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip,
          take: limitNum,
          include: {
            creator: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true, assignments: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.course.count({ where }),
      ]);

      return {
        success: true,
        data: courses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          creator: c.creator,
          memberCount: c._count.members,
          assignmentCount: c._count.assignments,
          createdAt: c.createdAt,
        })),
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
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
  // POST /courses — Create course
  .post("/", async ({ userId, body, set }) => {
    try {
      const userIsAdmin = await isAdmin(userId);

      // Check if user is admin or has dosen membership in any course
      if (!userIsAdmin) {
        const isDosen = await prisma.courseMember.findFirst({
          where: { userId, role: "dosen" },
        });
        // Allow any authenticated user to create courses (they become dosen)
        // This is more permissive - campus_admin or users who should be dosen can create
      }

      const { title, description } = body;

      const course = await prisma.course.create({
        data: {
          title,
          description,
          createdBy: userId,
        },
      });

      // Auto-add creator as 'dosen' member (if not admin-only)
      if (!userIsAdmin) {
        await prisma.courseMember.create({
          data: {
            userId,
            courseId: course.id,
            role: "dosen",
          },
        });
      } else {
        // Admins also get added as dosen
        await prisma.courseMember.create({
          data: {
            userId,
            courseId: course.id,
            role: "dosen",
          },
        });
      }

      const courseWithDetails = await prisma.course.findUnique({
        where: { id: course.id },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      });

      return {
        success: true,
        data: courseWithDetails,
      };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    body: t.Object({
      title: t.String(),
      description: t.String(),
    }),
  })
  // GET /courses/:id — Get course detail
  .get("/:id", async ({ userId, params, set }) => {
    try {
      const courseId = parseInt(params.id);

      await requireCourseAccess(userId, courseId);

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          _count: { select: { assignments: true } },
        },
      });

      if (!course) {
        set.status = 404;
        return { success: false, message: "Course not found" };
      }

      return {
        success: true,
        data: {
          id: course.id,
          title: course.title,
          description: course.description,
          creator: course.creator,
          createdAt: course.createdAt,
          assignmentCount: course._count.assignments,
          members: course.members.map((m) => ({
            id: m.id,
            user: m.user,
            role: m.role,
          })),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === "COURSE_FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "You are not a member of this course" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })
  // PUT /courses/:id — Update course
  .put("/:id", async ({ userId, params, body, set }) => {
    try {
      const courseId = parseInt(params.id);

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        set.status = 404;
        return { success: false, message: "Course not found" };
      }

      const userIsAdmin = await isAdmin(userId);
      if (!userIsAdmin && course.createdBy !== userId) {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
        },
        include: {
          creator: { select: { id: true, name: true, email: true } },
        },
      });

      return { success: true, data: updated };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      title: t.Optional(t.String()),
      description: t.Optional(t.String()),
    }),
  })
  // DELETE /courses/:id — Delete course (admin only)
  .delete("/:id", async ({ userId, params, set }) => {
    try {
      const userIsAdmin = await isAdmin(userId);
      if (!userIsAdmin) {
        set.status = 403;
        return { success: false, message: "Access denied. Admin only." };
      }

      const courseId = parseInt(params.id);

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        set.status = 404;
        return { success: false, message: "Course not found" };
      }

      await prisma.course.delete({ where: { id: courseId } });

      return { success: true, message: "Course deleted successfully" };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })
  // POST /courses/:id/join — Join course as mahasiswa
  .post("/:id/join", async ({ userId, params, set }) => {
    try {
      const courseId = parseInt(params.id);

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        set.status = 404;
        return { success: false, message: "Course not found" };
      }

      const existingMember = await prisma.courseMember.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (existingMember) {
        set.status = 400;
        return { success: false, message: "You are already a member of this course" };
      }

      const member = await prisma.courseMember.create({
        data: {
          userId,
          courseId,
          role: "mahasiswa",
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
      });

      return {
        success: true,
        data: member,
        message: "Successfully joined the course",
      };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })
  // POST /courses/:id/members — Add member with specific role
  .post("/:id/members", async ({ userId, params, body, set }) => {
    try {
      const courseId = parseInt(params.id);

      // Must be dosen in course or admin
      try {
        await requireCourseMember(userId, courseId, ["dosen"]);
      } catch {
        set.status = 403;
        return { success: false, message: "Access denied. Dosen or admin only." };
      }

      const { targetUserId, role } = body;

      // Verify target user exists
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      // Check if already a member
      const existingMember = await prisma.courseMember.findUnique({
        where: { userId_courseId: { userId: targetUserId, courseId } },
      });

      if (existingMember) {
        set.status = 400;
        return { success: false, message: "User is already a member of this course" };
      }

      const member = await prisma.courseMember.create({
        data: {
          userId: targetUserId,
          courseId,
          role,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return { success: true, data: member };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      targetUserId: t.Number(),
      role: t.String(),
    }),
  })
  // DELETE /courses/:id/members/:userId — Remove member
  .delete("/:id/members/:memberId", async ({ userId, params, set }) => {
    try {
      const courseId = parseInt(params.id);
      const targetUserId = parseInt(params.memberId);

      // Must be dosen in course or admin
      try {
        await requireCourseMember(userId, courseId, ["dosen"]);
      } catch {
        set.status = 403;
        return { success: false, message: "Access denied. Dosen or admin only." };
      }

      const member = await prisma.courseMember.findUnique({
        where: { userId_courseId: { userId: targetUserId, courseId } },
      });

      if (!member) {
        set.status = 404;
        return { success: false, message: "Member not found in this course" };
      }

      await prisma.courseMember.delete({
        where: { userId_courseId: { userId: targetUserId, courseId } },
      });

      return { success: true, message: "Member removed successfully" };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String(), memberId: t.String() }),
  })
  // GET /courses/:id/members — Get course members
  .get("/:id/members", async ({ userId, params, set }) => {
    try {
      const courseId = parseInt(params.id);

      await requireCourseAccess(userId, courseId);

      const members = await prisma.courseMember.findMany({
        where: { courseId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { role: "asc" },
      });

      return {
        success: true,
        data: members.map((m) => ({
          id: m.id,
          user: m.user,
          role: m.role,
        })),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "COURSE_FORBIDDEN") {
        set.status = 403;
        return { success: false, message: "You are not a member of this course" };
      }
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  });
