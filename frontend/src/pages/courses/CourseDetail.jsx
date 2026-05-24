import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Users,
  Plus,
  Calendar,
  ArrowLeft,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import api from '../../api/axios';
import { COURSE_ROLES } from '../../utils/constants';
import {
  formatDate,
  formatDateTime,
  getUserCourseRole,
  getInitials,
  canCreateAssignment,
} from '../../utils/permissions';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isAdmin } = usePermission();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [memberForm, setMemberForm] = useState({ userId: '', role: 'mahasiswa' });
  const [memberFormLoading, setMemberFormLoading] = useState(false);
  const [memberFormError, setMemberFormError] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  const courseRole = getUserCourseRole(user, id);
  const canCreate = canCreateAssignment(user, id);

  useEffect(() => {
    fetchCourse();
    fetchAssignments();
    fetchMembers();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data || res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/courses/${id}/assignments`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setAssignments(data);
    } catch {
      // silent
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/courses/${id}/members`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setMembers(data);
    } catch {
      // silent
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/courses/${id}/join`);
      showToast('Joined course successfully');
      fetchCourse();
      fetchMembers();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to join course',
        'error'
      );
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberFormLoading(true);
    setMemberFormError('');
    try {
      await api.post(`/courses/${id}/members`, memberForm);
      showToast('Member added successfully');
      setAddMemberModal(false);
      setMemberForm({ userId: '', role: 'mahasiswa' });
      fetchMembers();
    } catch (err) {
      setMemberFormError(
        err.response?.data?.message || 'Failed to add member'
      );
    } finally {
      setMemberFormLoading(false);
    }
  };

  const openAddMember = async () => {
    try {
      const res = await api.get('/users');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setAllUsers(data);
    } catch {
      // silent
    }
    setMemberFormError('');
    setAddMemberModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'members', label: 'Members', icon: Users },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="text-center py-16">
        <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Course not found
        </h3>
        <Link to="/courses" className="text-accent-600 text-sm font-medium">
          ← Back to courses
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-100 text-red-700'
              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courses
      </button>

      {/* Course header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{course.name || course.title}</h1>
              <p className="text-white/60 mt-2 max-w-2xl">
                {course.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {members.length} members
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  {assignments.length} assignments
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(course.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!courseRole && !isAdmin() && (
                <Button
                  onClick={handleJoin}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  Join Course
                </Button>
              )}
              {courseRole && <Badge role={courseRole} size="md" />}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">About this course</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description || 'No description available for this course.'}
            </p>
            {course.createdBy && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Created by</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center">
                    {getInitials(course.createdBy.name || 'U')}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {course.createdBy.name}
                  </p>
                </div>
              </div>
            )}
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Members</span>
                <span className="font-semibold text-gray-900">
                  {members.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Assignments</span>
                <span className="font-semibold text-gray-900">
                  {assignments.length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Assignments</h3>
            {canCreate && (
              <Link to={`/courses/${id}/assignments/create`}>
                <Button icon={Plus} size="sm">
                  Create Assignment
                </Button>
              </Link>
            )}
          </div>
          {assignments.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No assignments yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <Link key={a.id} to={`/assignments/${a.id}`}>
                  <Card hover className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-accent-50 flex-shrink-0">
                      <FileText className="w-5 h-5 text-accent-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {a.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Due: {formatDateTime(a.dueDate)}
                      </p>
                    </div>
                    {a.dueDate && new Date(a.dueDate) < new Date() && (
                      <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                        Past due
                      </span>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Members ({members.length})
            </h3>
            {(isAdmin() || courseRole === 'dosen') && (
              <Button icon={UserPlus} size="sm" onClick={openAddMember}>
                Add Member
              </Button>
            )}
          </div>
          {members.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No members yet</p>
            </Card>
          ) : (
            <Card padding={false}>
              <div className="divide-y divide-gray-50">
                {members.map((member) => {
                  const memberUser = member.user || member;
                  const memberRole =
                    typeof member.role === 'string'
                      ? member.role
                      : member.role?.name || 'mahasiswa';
                  return (
                    <div
                      key={member.id || memberUser.id}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {getInitials(memberUser.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {memberUser.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {memberUser.email}
                        </p>
                      </div>
                      <Badge role={memberRole} size="xs" />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add member modal */}
      <Modal
        isOpen={addMemberModal}
        onClose={() => setAddMemberModal(false)}
        title="Add Course Member"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setAddMemberModal(false)}
            >
              Cancel
            </Button>
            <Button loading={memberFormLoading} onClick={handleAddMember}>
              Add Member
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {memberFormError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {memberFormError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              User
            </label>
            <select
              value={memberForm.userId}
              onChange={(e) =>
                setMemberForm({ ...memberForm, userId: e.target.value })
              }
              className="input-field"
              required
            >
              <option value="">Select a user</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Course Role
            </label>
            <select
              value={memberForm.role}
              onChange={(e) =>
                setMemberForm({ ...memberForm, role: e.target.value })
              }
              className="input-field"
            >
              {COURSE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
