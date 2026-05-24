import { useMemo } from 'react';
import { useAuth } from './useAuth';

export function usePermission() {
  const { user } = useAuth();

  return useMemo(() => {
    const globalRoles = (user?.globalRoles || []).map((r) =>
      typeof r === 'string' ? r : r.name
    );
    const courseMembers = user?.courseMembers || [];

    const hasGlobalRole = (roleName) => globalRoles.includes(roleName);

    const isSuperAdmin = () => hasGlobalRole('super_admin');

    const isAdmin = () =>
      hasGlobalRole('super_admin') || hasGlobalRole('campus_admin');

    const isITSupport = () => hasGlobalRole('it_support');

    const hasCourseRole = (courseId, roleName) => {
      const membership = courseMembers.find(
        (m) => String(m.courseId) === String(courseId)
      );
      if (!membership) return false;
      const role =
        typeof membership.role === 'string'
          ? membership.role
          : membership.role?.name;
      return role === roleName;
    };

    const isCourseDosen = (courseId) => hasCourseRole(courseId, 'dosen');
    const isCourseMahasiswa = (courseId) => hasCourseRole(courseId, 'mahasiswa');
    const isCourseAsdos = (courseId) => hasCourseRole(courseId, 'asdos');

    return {
      hasGlobalRole,
      isAdmin,
      isSuperAdmin,
      isITSupport,
      hasCourseRole,
      isCourseDosen,
      isCourseMahasiswa,
      isCourseAsdos,
      globalRoles,
      courseMembers,
    };
  }, [user]);
}

export default usePermission;
