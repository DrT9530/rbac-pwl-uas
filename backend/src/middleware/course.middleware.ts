import { prisma } from "../lib/prisma";
import { isAdmin } from "./auth.middleware";

/**
 * Check if user is a member of a course with one of the allowed roles.
 * Global admins (super_admin, campus_admin) bypass this check.
 * Returns the course member record if found, or null for admin bypass.
 */
export async function requireCourseMember(
  userId: number,
  courseId: number,
  allowedRoles?: string[]
): Promise<{ id: number; userId: number; courseId: number; role: string } | null> {
  // Admin bypass
  const userIsAdmin = await isAdmin(userId);
  if (userIsAdmin) {
    return null; // null signals admin bypass
  }

  const member = await prisma.courseMember.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  if (!member) {
    throw new Error("COURSE_FORBIDDEN");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
    throw new Error("COURSE_ROLE_FORBIDDEN");
  }

  return member;
}

/**
 * Check if user is a member of a course (any role) or is an admin.
 */
export async function requireCourseAccess(
  userId: number,
  courseId: number
): Promise<void> {
  const userIsAdmin = await isAdmin(userId);
  if (userIsAdmin) return;

  const member = await prisma.courseMember.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  if (!member) {
    throw new Error("COURSE_FORBIDDEN");
  }
}
