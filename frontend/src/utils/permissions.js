import { ROLE_COLORS } from './constants';

export function getRoleDisplayName(role) {
  const names = {
    super_admin: 'Super Admin',
    campus_admin: 'Campus Admin',
    it_support: 'IT Support',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa',
    asdos: 'Asisten Dosen',
    user: 'User',
  };
  return names[role] || role;
}

export function getRoleBadgeColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.user;
}

export function getPrimaryRole(user) {
  if (!user || !user.globalRoles) return 'user';
  const roles = user.globalRoles.map((r) => (typeof r === 'string' ? r : r.name));
  if (roles.includes('super_admin')) return 'super_admin';
  if (roles.includes('campus_admin')) return 'campus_admin';
  if (roles.includes('it_support')) return 'it_support';
  return 'user';
}

export function canManageUsers(user) {
  const role = getPrimaryRole(user);
  return role === 'super_admin' || role === 'campus_admin';
}

export function canCreateCourse(user) {
  const role = getPrimaryRole(user);
  return role === 'super_admin' || role === 'campus_admin';
}

export function canCreateAssignment(user, courseId) {
  if (!user) return false;
  const role = getPrimaryRole(user);
  if (role === 'super_admin' || role === 'campus_admin') return true;
  if (!user.courseMembers) return false;
  const membership = user.courseMembers.find(
    (m) => String(m.courseId) === String(courseId)
  );
  if (!membership) return false;
  const memberRole = typeof membership.role === 'string' ? membership.role : membership.role?.name;
  return memberRole === 'dosen' || memberRole === 'asdos';
}

export function getUserCourseRole(user, courseId) {
  if (!user || !user.courseMembers) return null;
  const membership = user.courseMembers.find(
    (m) => String(m.courseId) === String(courseId)
  );
  if (!membership) return null;
  return typeof membership.role === 'string' ? membership.role : membership.role?.name;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
