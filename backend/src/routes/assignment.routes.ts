import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware";
import { requireCourseMember, requireCourseAccess } from "../middleware/course.middleware";

export const assignmentRoutes = new Elysia()
  .use(authMiddleware)
  // GET /courses/:id/assignments — List assignments in a course
  .get("/courses/:id/assignments", async ({ userId, params, set }) => {
    try {
      const courseId = parseInt(params.id);

      await requireCourseAccess(userId, courseId);

      const assignments = await prisma.assignment.findMany({
        where: { courseId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: assignments.map((a) => ({
          id: a.id,
          courseId: a.courseId,
          title: a.title,
          description: a.description,
          dueDate: a.dueDate,
          creator: a.creator,
          submissionCount: a._count.submissions,
          createdAt: a.createdAt,
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
  })
  // POST /courses/:id/assignments — Create assignment
  .post("/courses/:id/assignments", async ({ userId, params, body, set }) => {
    try {
      const courseId = parseInt(params.id);

      // Must be dosen/asdos in course, or admin
      try {
        await requireCourseMember(userId, courseId, ["dosen", "asdos"]);
      } catch {
        set.status = 403;
        return { success: false, message: "Access denied. Dosen, asdos, or admin only." };
      }

      const { title, description, dueDate } = body;

      const assignment = await prisma.assignment.create({
        data: {
          courseId,
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          createdBy: userId,
        },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
      });

      return { success: true, data: assignment };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      title: t.String(),
      description: t.String(),
      dueDate: t.Optional(t.String()),
    }),
  })
  // GET /assignments/:id — Get assignment detail
  .get("/assignments/:id", async ({ userId, params, set }) => {
    try {
      const assignmentId = parseInt(params.id);

      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
          _count: { select: { submissions: true } },
        },
      });

      if (!assignment) {
        set.status = 404;
        return { success: false, message: "Assignment not found" };
      }

      // Check course access
      await requireCourseAccess(userId, assignment.courseId);

      // Check if current user has submitted (for mahasiswa view)
      const userSubmission = await prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: assignmentId,
            studentId: userId,
          },
        },
      });

      return {
        success: true,
        data: {
          id: assignment.id,
          courseId: assignment.courseId,
          course: assignment.course,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          creator: assignment.creator,
          submissionCount: assignment._count.submissions,
          createdAt: assignment.createdAt,
          mySubmission: userSubmission
            ? {
                id: userSubmission.id,
                content: userSubmission.content,
                fileUrl: userSubmission.fileUrl,
                grade: userSubmission.grade,
                feedback: userSubmission.feedback,
                submittedAt: userSubmission.submittedAt,
              }
            : null,
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
  // PUT /assignments/:id — Update assignment
  .put("/assignments/:id", async ({ userId, params, body, set }) => {
    try {
      const assignmentId = parseInt(params.id);

      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        set.status = 404;
        return { success: false, message: "Assignment not found" };
      }

      const userIsAdmin = await isAdmin(userId);
      if (!userIsAdmin && assignment.createdBy !== userId) {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }

      const updated = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.dueDate !== undefined && {
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
          }),
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
      dueDate: t.Optional(t.Union([t.String(), t.Null()])),
    }),
  })
  // DELETE /assignments/:id — Delete assignment
  .delete("/assignments/:id", async ({ userId, params, set }) => {
    try {
      const assignmentId = parseInt(params.id);

      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        set.status = 404;
        return { success: false, message: "Assignment not found" };
      }

      const userIsAdmin = await isAdmin(userId);
      if (!userIsAdmin && assignment.createdBy !== userId) {
        set.status = 403;
        return { success: false, message: "Access denied" };
      }

      await prisma.assignment.delete({ where: { id: assignmentId } });

      return { success: true, message: "Assignment deleted successfully" };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  });
