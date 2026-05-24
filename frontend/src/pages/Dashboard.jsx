import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import api from '../api/axios';
import AdminDashboard from './admin/AdminDashboard';
import { formatDate, getPrimaryRole } from '../utils/permissions';

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin } = usePermission();

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

function UserDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const primaryRole = getPrimaryRole(user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.allSettled([
        api.get('/courses'),
        api.get('/assignments'),
      ]);
      if (coursesRes.status === 'fulfilled') {
        const data = coursesRes.value.data;
        setCourses(Array.isArray(data) ? data : data.data || []);
      }
      if (assignmentsRes.status === 'fulfilled') {
        const data = assignmentsRes.value.data;
        setAssignments(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Enrolled Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Assignments',
      value: assignments.length,
      icon: FileText,
      color: 'from-accent-500 to-accent-600',
      iconBg: 'bg-accent-500/10',
      iconColor: 'text-accent-500',
    },
    {
      label: 'Pending',
      value: assignments.filter((a) => !a.isSubmitted).length,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-white/60 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold mt-1">{user?.name || 'User'}</h2>
          <div className="mt-2">
            <Badge role={primaryRole} size="sm" />
          </div>
          <p className="text-white/50 text-sm mt-3">
            Here's what's happening with your courses today.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="animate-slide-up">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Courses grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
          <Link
            to="/courses"
            className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No courses yet</p>
            <Link
              to="/courses"
              className="text-accent-600 text-sm font-medium hover:underline mt-2 inline-block"
            >
              Browse courses
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary-50">
                      <BookOpen className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      {course.memberCount || course._count?.members || 0}
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {course.name || course.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {course.description || 'No description'}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent assignments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Assignments
        </h3>
        {loading ? (
          <Card>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : assignments.length === 0 ? (
          <Card className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No assignments yet</p>
          </Card>
        ) : (
          <Card padding={false}>
            <div className="divide-y divide-gray-50">
              {assignments.slice(0, 5).map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-accent-50">
                    <FileText className="w-4 h-4 text-accent-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {assignment.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Due: {formatDate(assignment.dueDate)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
