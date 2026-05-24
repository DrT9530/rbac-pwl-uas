import { Elysia, t } from "elysia";
import { prisma } from "../lib/prisma";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware";
import { requireCourseMember, requireCourseAccess } from "../middleware/course.middleware";

export const submissionRoutes = new Elysia()
  .use(authMiddleware)
  // POST /assignments/:id/submit — Submit assignment (mahasiswa in course)
  .post("/assignments/:id/submit", async ({ userId, params, body, set }) => {
    try {
      const assignmentId = parseInt(params.id);

      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        set.status = 404;
        return { success: false, message: "Assignment not found" };
      }

      // Must be mahasiswa in the assignment's course
      const member = await prisma.courseMember.findUnique({
        where: {
          userId_courseId: { userId, courseId: assignment.courseId },
        },
      });

      if (!member || member.role !== "mahasiswa") {
        set.status = 403;
        return { success: false, message: "Only mahasiswa can submit assignments" };
      }

      // Check if already submitted
      const existingSubmission = await prisma.submission.findUnique({
        where: {
          assignmentId_studentId: { assignmentId, studentId: userId },
        },
      });

      if (existingSubmission) {
        // Update existing submission
        const updated = await prisma.submission.update({
          where: { id: existingSubmission.id },
          data: {
            content: body.content ?? existingSubmission.content,
            fileUrl: body.fileUrl ?? existingSubmission.fileUrl,
            submittedAt: new Date(),
          },
          include: {
            student: { select: { id: true, name: true, email: true } },
            assignment: { select: { id: true, title: true } },
          },
        });

        return {
          success: true,
          data: updated,
          message: "Submission updated successfully",
        };
      }

      const submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: userId,
          content: body.content ?? null,
          fileUrl: body.fileUrl ?? null,
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
          assignment: { select: { id: true, title: true } },
        },
      });

      return {
        success: true,
        data: submission,
        message: "Submission created successfully",
      };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      content: t.Optional(t.String()),
      fileUrl: t.Optional(t.String()),
    }),
  })
  // GET /assignments/:id/submissions — View all submissions (dosen/asdos/admin)
  .get("/assignments/:id/submissions", async ({ userId, params, set }) => {
    try {
      const assignmentId = parseInt(params.id);

      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        set.status = 404;
        return { success: false, message: "Assignment not found" };
      }

      // Must be dosen/asdos in course, or admin
      try {
        await requireCourseMember(userId, assignment.courseId, ["dosen", "asdos"]);
      } catch {
        set.status = 403;
        return { success: false, message: "Access denied. Dosen, asdos, or admin only." };
      }

      const submissions = await prisma.submission.findMany({
        where: { assignmentId },
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { submittedAt: "desc" },
      });

      return {
        success: true,
        data: submissions.map((s) => ({
          id: s.id,
          student: s.student,
          content: s.content,
          fileUrl: s.fileUrl,
          grade: s.grade,
          feedback: s.feedback,
          submittedAt: s.submittedAt,
        })),
      };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })
  // GET /submissions/:id — View single submission detail
  .get("/submissions/:id", async ({ userId, params, set }) => {
    try {
      const submissionId = parseInt(params.id);

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          student: { select: { id: true, name: true, email: true } },
          assignment: {
            include: {
              course: { select: { id: true, title: true } },
              creator: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      if (!submission) {
        set.status = 404;
        return { success: false, message: "Submission not found" };
      }

      // Check access: student who submitted, dosen/asdos in course, or admin
      const userIsAdmin = await isAdmin(userId);
      if (!userIsAdmin && submission.studentId !== userId) {
        // Check if user is dosen/asdos in the course
        const member = await prisma.courseMember.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: submission.assignment.courseId,
            },
          },
        });

        if (!member || !["dosen", "asdos"].includes(member.role)) {
          set.status = 403;
          return { success: false, message: "Access denied" };
        }
      }

      return {
        success: true,
        data: {
          id: submission.id,
          student: submission.student,
          assignment: {
            id: submission.assignment.id,
            title: submission.assignment.title,
            course: submission.assignment.course,
            creator: submission.assignment.creator,
          },
          content: submission.content,
          fileUrl: submission.fileUrl,
          grade: submission.grade,
          feedback: submission.feedback,
          submittedAt: submission.submittedAt,
        },
      };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
  })
  // PUT /submissions/:id/grade — Grade a submission (dosen/asdos)
  .put("/submissions/:id/grade", async ({ userId, params, body, set }) => {
    try {
      const submissionId = parseInt(params.id);

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: { assignment: true },
      });

      if (!submission) {
        set.status = 404;
        return { success: false, message: "Submission not found" };
      }

      // Must be dosen/asdos in the course, or admin
      try {
        await requireCourseMember(userId, submission.assignment.courseId, ["dosen", "asdos"]);
      } catch {
        set.status = 403;
        return { success: false, message: "Access denied. Dosen, asdos, or admin only." };
      }

      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          grade: body.grade,
          feedback: body.feedback ?? null,
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
          assignment: { select: { id: true, title: true } },
        },
      });

      return {
        success: true,
        data: updated,
        message: "Submission graded successfully",
      };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      grade: t.Number(),
      feedback: t.Optional(t.String()),
    }),
  });
