import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  FileText,
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
import { getUserCourseRole, canCreateCourse } from '../../utils/permissions';

export default function CourseList() {
  const { user } = useAuth();
  const { isAdmin } = usePermission();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setCourses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/courses', formData);
      showToast('Course created successfully');
      setCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchCourses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleJoinCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/join`);
      showToast('Joined course successfully');
      fetchCourses();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to join course',
        'error'
      );
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      (c.name || c.title || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (c.description || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const gradients = [
    'from-blue-500 to-blue-600',
    'from-accent-500 to-accent-600',
    'from-purple-500 to-purple-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-indigo-500 to-indigo-600',
  ];

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin() ? 'All Courses' : 'My Courses'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin()
              ? 'Manage all courses in the system'
              : 'View and manage your enrolled courses'}
          </p>
        </div>
        {canCreateCourse(user) && (
          <Button
            icon={Plus}
            onClick={() => {
              setFormData({ name: '', description: '' });
              setFormError('');
              setCreateModal(true);
            }}
          >
            Create Course
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="h-24 bg-gray-200" />
              <div className="p-5">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery
              ? 'Try a different search term'
              : 'Get started by creating your first course'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course, i) => {
            const courseRole = getUserCourseRole(user, course.id);
            const gradient = gradients[i % gradients.length];
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover group"
              >
                {/* Gradient header */}
                <div
                  className={`h-24 bg-gradient-to-r ${gradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <div className="absolute bottom-3 left-4">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 text-white/80 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    {course.memberCount || course._count?.members || 0}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <Link to={`/courses/${course.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-accent-600 transition-colors">
                      {course.name || course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {course.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FileText className="w-3.5 h-3.5" />
                      {course.assignmentCount ||
                        course._count?.assignments ||
                        0}{' '}
                      assignments
                    </div>
                    {courseRole ? (
                      <Badge role={courseRole} size="xs" />
                    ) : (
                      <button
                        onClick={() => handleJoinCourse(course.id)}
                        className="text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors"
                      >
                        Join →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Course"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button loading={formLoading} onClick={handleCreate}>
              Create Course
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {formError}
            </div>
          )}
          <Input
            label="Course Name"
            placeholder="e.g. Introduction to Computer Science"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Input
            label="Description"
            type="textarea"
            placeholder="Describe the course..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </form>
      </Modal>
    </div>
  );
}
